import { createServer } from 'http';
import next from 'next';
import { Server, Socket } from 'socket.io';
import type {
  Room,
  RoomConfig,
  User,
  UserRole,
  ChatMessage,
  Reaction,
  CodingStats,
  StreamStatus,
  BattleResult,
  RoomStatus,
  LayoutMode,
  ServerToClientEvents,
  ClientToServerEvents,
} from './src/types/index.js';

// ─── Configuration ───────────────────────────────────────────────────────────

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME ?? 'localhost';
const port = parseInt(process.env.PORT ?? '3000', 10);

const COUNTDOWN_SECONDS = 5;
const ROOM_CODE_LENGTH = 6;
const ROOM_CLEANUP_INTERVAL_MS = 60_000;
const ROOM_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── In-Memory State ─────────────────────────────────────────────────────────

interface ServerRoom extends Room {
  timerInterval: ReturnType<typeof setInterval> | null;
  timerRemaining: number;
  countdownInterval: ReturnType<typeof setInterval> | null;
  deleteTimeout?: ReturnType<typeof setTimeout> | null;
}

const rooms = new Map<string, ServerRoom>();
const socketToRoom = new Map<string, string>();
const socketToUser = new Map<string, User>();

// ─── Utility Functions ───────────────────────────────────────────────────────

function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function toClientRoom(serverRoom: ServerRoom): Room {
  return {
    id: serverRoom.id,
    code: serverRoom.code,
    config: serverRoom.config,
    status: serverRoom.status,
    host: serverRoom.host,
    contestants: serverRoom.contestants,
    viewers: serverRoom.viewers,
    createdAt: serverRoom.createdAt,
    battleStartedAt: serverRoom.battleStartedAt,
    battleEndedAt: serverRoom.battleEndedAt,
  };
}

function broadcastRoomState(io: Server, room: ServerRoom): void {
  io.to(room.id).emit('room:state', toClientRoom(room));
}

function clearBattleTimers(room: ServerRoom): void {
  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = null;
  }
  if (room.countdownInterval) {
    clearInterval(room.countdownInterval);
    room.countdownInterval = null;
  }
}

// ─── Server Setup ────────────────────────────────────────────────────────────

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handler(req, res);
  });

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: dev ? '*' : undefined,
      methods: ['GET', 'POST'],
    },
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  // ─── Socket Connection Handler ──────────────────────────────────────────

  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // ── Room: Create ──────────────────────────────────────────────────────

    socket.on('room:create', (config: RoomConfig, callback) => {
      try {
        let roomCode = generateRoomCode();
        while (rooms.has(roomCode)) {
          roomCode = generateRoomCode();
        }
        const roomId = roomCode;

        const host: User = {
          id: generateId(),
          name: config.hostName,
          role: 'host',
          socketId: socket.id,
        };

        const serverRoom: ServerRoom = {
          id: roomId,
          code: roomCode,
          config,
          status: 'waiting',
          host,
          contestants: [],
          viewers: [],
          createdAt: Date.now(),
          timerInterval: null,
          timerRemaining: config.timerSeconds,
          countdownInterval: null,
        };

        rooms.set(roomId, serverRoom);
        socketToRoom.set(socket.id, roomId);
        socketToUser.set(socket.id, host);

        socket.join(roomId);

        console.log(`[Room] Created: ${roomCode} (${roomId}) by ${host.name}`);
        callback(toClientRoom(serverRoom));
      } catch (err) {
        console.error('[Room] Create error:', err);
        socket.emit('room:error', 'Failed to create room');
      }
    });

    // ── Room: Join ────────────────────────────────────────────────────────

    socket.on('room:join', (data, callback) => {
      try {
        // Find room by ID or code
        let room: ServerRoom | undefined;
        room = rooms.get(data.roomId);
        if (!room) {
          // Try to find by code
          for (const [, r] of rooms) {
            if (r.code === data.roomId || r.code === data.roomId.toUpperCase()) {
              room = r;
              break;
            }
          }
        }

        if (!room) {
          callback(null, 'Room not found');
          return;
        }

        // Check password
        if (room.config.password && room.config.password !== data.password) {
          callback(null, 'Incorrect password');
          return;
        }

        // Check contestant limit
        if (
          data.role === 'contestant' &&
          room.contestants.length >= room.config.maxContestants
        ) {
          callback(null, 'Room is full');
          return;
        }

        // Check if audience is allowed
        if (data.role === 'viewer' && !room.config.allowAudience) {
          callback(null, 'Audience is not allowed in this room');
          return;
        }

        const user: User = {
          id: generateId(),
          name: data.userName,
          role: data.role,
          socketId: socket.id,
        };

        if (data.role === 'contestant') {
          room.contestants.push(user);
        } else if (data.role === 'viewer' || data.role === 'judge') {
          room.viewers.push(user);
        } else if (data.role === 'host') {
          if (room.deleteTimeout) {
            clearTimeout(room.deleteTimeout);
            room.deleteTimeout = null;
          }
          room.host.socketId = socket.id;
          room.host.name = data.userName;
          // Use the original host ID to preserve stats if needed
          user.id = room.host.id;
        }

        socketToRoom.set(socket.id, room.id);
        socketToUser.set(socket.id, user);

        socket.join(room.id);

        // Notify others
        socket.to(room.id).emit('room:user-joined', user);

        // Send system message
        const joinMsg: ChatMessage = {
          id: generateId(),
          userId: 'system',
          userName: 'System',
          text: `${user.name} joined as ${user.role}`,
          timestamp: Date.now(),
          type: 'system',
        };
        io.to(room.id).emit('chat:message', joinMsg);

        // Update room status if ready
        if (room.status === 'waiting' && room.contestants.length >= 2) {
          room.status = 'ready';
        }

        broadcastRoomState(io, room);
        callback(toClientRoom(room));

        console.log(`[Room] ${user.name} joined ${room.code} as ${user.role}`);
      } catch (err) {
        console.error('[Room] Join error:', err);
        callback(null, 'Failed to join room');
      }
    });

    // ── Room: Leave ───────────────────────────────────────────────────────

    socket.on('room:leave', (roomId: string) => {
      handleLeaveRoom(socket, io, roomId);
    });

    // ── Battle: Start Countdown ───────────────────────────────────────────

    socket.on('battle:start-countdown', (roomId: string) => {
      const room = rooms.get(roomId);
      const user = socketToUser.get(socket.id);

      if (!room || !user) return;
      if (user.role !== 'host') {
        socket.emit('room:error', 'Only the host can start the battle');
        return;
      }
      if (room.status !== 'ready' && room.status !== 'waiting') {
        socket.emit('room:error', 'Battle cannot be started in current state');
        return;
      }

      room.status = 'countdown';
      let countdown = COUNTDOWN_SECONDS;

      io.to(roomId).emit('battle:countdown', countdown);
      broadcastRoomState(io, room);

      room.countdownInterval = setInterval(() => {
        countdown--;
        io.to(roomId).emit('battle:countdown', countdown);

        if (countdown <= 0) {
          if (room.countdownInterval) {
            clearInterval(room.countdownInterval);
            room.countdownInterval = null;
          }

          // Start battle
          room.status = 'battle';
          room.battleStartedAt = Date.now();
          room.timerRemaining = room.config.timerSeconds;

          io.to(roomId).emit('battle:start', room.battleStartedAt);
          broadcastRoomState(io, room);

          // Start tick timer
          room.timerInterval = setInterval(() => {
            room.timerRemaining--;
            io.to(roomId).emit('battle:tick', room.timerRemaining);

            if (room.timerRemaining <= 0) {
              endBattle(io, room);
            }
          }, 1000);

          // System message
          const startMsg: ChatMessage = {
            id: generateId(),
            userId: 'system',
            userName: 'System',
            text: '🏁 Battle has begun! Good luck!',
            timestamp: Date.now(),
            type: 'announcement',
          };
          io.to(roomId).emit('chat:message', startMsg);

          console.log(`[Battle] Started in room ${room.code}`);
        }
      }, 1000);
    });

    // ── Battle: Pause ─────────────────────────────────────────────────────

    socket.on('battle:pause', (roomId: string) => {
      const room = rooms.get(roomId);
      const user = socketToUser.get(socket.id);

      if (!room || !user || user.role !== 'host') return;
      if (room.status !== 'battle') return;

      clearBattleTimers(room);
      room.status = 'paused';

      io.to(roomId).emit('battle:pause');
      broadcastRoomState(io, room);

      console.log(`[Battle] Paused in room ${room.code}`);
    });

    // ── Battle: Resume ────────────────────────────────────────────────────

    socket.on('battle:resume', (roomId: string) => {
      const room = rooms.get(roomId);
      const user = socketToUser.get(socket.id);

      if (!room || !user || user.role !== 'host') return;
      if (room.status !== 'paused') return;

      room.status = 'battle';

      io.to(roomId).emit('battle:resume', room.timerRemaining);
      broadcastRoomState(io, room);

      // Resume tick timer
      room.timerInterval = setInterval(() => {
        room.timerRemaining--;
        io.to(roomId).emit('battle:tick', room.timerRemaining);

        if (room.timerRemaining <= 0) {
          endBattle(io, room);
        }
      }, 1000);

      console.log(`[Battle] Resumed in room ${room.code}`);
    });

    // ── Battle: End (manual) ──────────────────────────────────────────────

    socket.on('battle:end', (roomId: string) => {
      const room = rooms.get(roomId);
      const user = socketToUser.get(socket.id);

      if (!room || !user || user.role !== 'host') return;
      if (room.status !== 'battle' && room.status !== 'paused') return;

      endBattle(io, room);
    });

    // ── Battle: Reset Timer ───────────────────────────────────────────────

    socket.on('battle:reset-timer', (roomId: string, seconds: number) => {
      const room = rooms.get(roomId);
      const user = socketToUser.get(socket.id);

      if (!room || !user || user.role !== 'host') return;

      room.timerRemaining = seconds;
      room.config.timerSeconds = seconds;

      broadcastRoomState(io, room);
    });

    // ── WebRTC Signaling ──────────────────────────────────────────────────

    socket.on('signal:offer', (data) => {
      const targetSocket = findSocketByUserId(data.to);
      if (targetSocket) {
        const user = socketToUser.get(socket.id);
        io.to(targetSocket).emit('signal:offer', {
          from: user?.id ?? socket.id,
          sdp: data.sdp,
        });
      }
    });

    socket.on('signal:answer', (data) => {
      const targetSocket = findSocketByUserId(data.to);
      if (targetSocket) {
        const user = socketToUser.get(socket.id);
        io.to(targetSocket).emit('signal:answer', {
          from: user?.id ?? socket.id,
          sdp: data.sdp,
        });
      }
    });

    socket.on('signal:ice', (data) => {
      const targetSocket = findSocketByUserId(data.to);
      if (targetSocket) {
        const user = socketToUser.get(socket.id);
        io.to(targetSocket).emit('signal:ice', {
          from: user?.id ?? socket.id,
          candidate: data.candidate,
        });
      }
    });

    // ── Chat ──────────────────────────────────────────────────────────────

    socket.on('chat:message', (data) => {
      const user = socketToUser.get(socket.id);
      if (!user) return;

      const message: ChatMessage = {
        id: generateId(),
        userId: user.id,
        userName: user.name,
        text: data.text.slice(0, 500), // Enforce max length
        timestamp: Date.now(),
        type: 'message',
      };

      io.to(data.roomId).emit('chat:message', message);
    });

    socket.on('chat:reaction', (data) => {
      const user = socketToUser.get(socket.id);
      if (!user) return;

      const reaction: Reaction = {
        emoji: data.emoji,
        userId: user.id,
        userName: user.name,
        timestamp: Date.now(),
      };

      io.to(data.roomId).emit('chat:reaction', reaction);
    });

    // ── Analytics ─────────────────────────────────────────────────────────

    socket.on('analytics:update', (data) => {
      const user = socketToUser.get(socket.id);
      if (!user) return;

      const fullStats: CodingStats = {
        userId: user.id,
        typingSpeed: 0,
        errorCount: 0,
        compileCount: 0,
        linesWritten: 0,
        idleTime: 0,
        lastActivity: Date.now(),
        streak: 0,
        momentum: 'low',
        ...data.stats,
      };

      io.to(data.roomId).emit('analytics:update', fullStats);
    });

    // ── Stream Status ─────────────────────────────────────────────────────

    socket.on('stream:status', (data) => {
      const user = socketToUser.get(socket.id);
      if (!user) return;

      const status: StreamStatus = {
        userId: user.id,
        isSharing: false,
        quality: 'medium',
        fps: 30,
        connected: true,
        ...data.status,
      };

      io.to(data.roomId).emit('stream:status', status);
    });

    // ── Layout Change ─────────────────────────────────────────────────────

    socket.on('layout:change', (data) => {
      const room = rooms.get(data.roomId);
      if (room) {
        broadcastRoomState(io, room);
      }
    });

    // ── Disconnect ────────────────────────────────────────────────────────

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Disconnected: ${socket.id} (${reason})`);
      const roomId = socketToRoom.get(socket.id);
      if (roomId) {
        handleLeaveRoom(socket, io, roomId);
      }
    });
  });

  // ─── Helper: Handle Leave Room ──────────────────────────────────────────

  function handleLeaveRoom(
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    roomId: string,
  ): void {
    const room = rooms.get(roomId);
    const user = socketToUser.get(socket.id);

    if (!room || !user) {
      socketToRoom.delete(socket.id);
      socketToUser.delete(socket.id);
      return;
    }

    // Remove user from room
    room.contestants = room.contestants.filter((c) => c.socketId !== socket.id);
    room.viewers = room.viewers.filter((v) => v.socketId !== socket.id);

    socket.leave(roomId);
    socketToRoom.delete(socket.id);
    socketToUser.delete(socket.id);

    // Notify remaining users
    io.to(roomId).emit('room:user-left', user.id);

    const leaveMsg: ChatMessage = {
      id: generateId(),
      userId: 'system',
      userName: 'System',
      text: `${user.name} left the room`,
      timestamp: Date.now(),
      type: 'system',
    };
    io.to(roomId).emit('chat:message', leaveMsg);

    // If host left, end the room
    if (user.role === 'host') {
      clearBattleTimers(room);

      const endMsg: ChatMessage = {
        id: generateId(),
        userId: 'system',
        userName: 'System',
        text: '⚠️ The host has left. Room is closing.',
        timestamp: Date.now(),
        type: 'announcement',
      };
      io.to(roomId).emit('chat:message', endMsg);

      if (room.status === 'battle' || room.status === 'paused') {
        endBattle(io, room);
      }

      // Give clients a moment to react, then delete room if host doesn't return
      room.deleteTimeout = setTimeout(() => {
        rooms.delete(roomId);
        console.log(`[Room] Deleted ${room.code} (host left)`);
      }, 15000);
    } else {
      // Update room status
      if (room.contestants.length < 2 && room.status === 'ready') {
        room.status = 'waiting';
      }
      broadcastRoomState(io, room);
    }

    console.log(`[Room] ${user.name} left ${room.code}`);
  }

  // ─── Helper: End Battle ─────────────────────────────────────────────────

  function endBattle(
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    room: ServerRoom,
  ): void {
    clearBattleTimers(room);
    room.status = 'finished';
    room.battleEndedAt = Date.now();

    const duration = room.battleStartedAt
      ? Math.floor((room.battleEndedAt - room.battleStartedAt) / 1000)
      : 0;

    const result: BattleResult = {
      contestants: room.contestants.map((c) => ({
        userId: c.id,
        userName: c.name,
        score: 0,
        stats: {
          userId: c.id,
          typingSpeed: 0,
          errorCount: 0,
          compileCount: 0,
          linesWritten: 0,
          idleTime: 0,
          lastActivity: Date.now(),
          streak: 0,
          momentum: 'low' as const,
        },
      })),
      duration,
      highlights: [],
    };

    io.to(room.id).emit('battle:end', result);

    const endMsg: ChatMessage = {
      id: generateId(),
      userId: 'system',
      userName: 'System',
      text: `🏆 Battle ended! Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`,
      timestamp: Date.now(),
      type: 'announcement',
    };
    io.to(room.id).emit('chat:message', endMsg);

    broadcastRoomState(io, room);
    console.log(`[Battle] Ended in room ${room.code} (${duration}s)`);
  }

  // ─── Helper: Find Socket by User ID ─────────────────────────────────────

  function findSocketByUserId(userId: string): string | undefined {
    for (const [socketId, user] of socketToUser) {
      if (user.id === userId) {
        return socketId;
      }
    }
    return undefined;
  }

  // ─── Periodic Cleanup of Stale Rooms ────────────────────────────────────

  setInterval(() => {
    const now = Date.now();
    for (const [roomId, room] of rooms) {
      if (now - room.createdAt > ROOM_MAX_AGE_MS) {
        clearBattleTimers(room);
        rooms.delete(roomId);
        console.log(`[Cleanup] Removed stale room ${room.code}`);
      }
    }
  }, ROOM_CLEANUP_INTERVAL_MS);

  // ─── Start Server ──────────────────────────────────────────────────────

  httpServer.listen(port, () => {
    console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║        ⚔️  DEBUG DUEL ARENA SERVER  ⚔️            ║
║                                                  ║
║   Status:  🟢 Running                            ║
║   URL:     http://${hostname}:${port}                  ║
║   Mode:    ${dev ? '🔧 Development' : '🚀 Production '}                      ║
║                                                  ║
╚══════════════════════════════════════════════════╝
    `);
  });
});
