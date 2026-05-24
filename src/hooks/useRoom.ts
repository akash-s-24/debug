'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { TypedSocket } from '@/lib/socket';
import type {
  Room,
  ChatMessage,
  Reaction,
  CodingStats,
  UserRole,
} from '@/types';
import { REACTION_DURATION_MS } from '@/lib/constants';

interface UseRoomReturn {
  room: Room | null;
  messages: ChatMessage[];
  reactions: Reaction[];
  stats: Map<string, CodingStats>;
  joinRoom: (
    roomId: string,
    userName: string,
    role: UserRole,
    password?: string,
  ) => Promise<Room | null>;
  leaveRoom: () => void;
  sendMessage: (text: string) => void;
  sendReaction: (emoji: string) => void;
  updateStats: (stats: Partial<CodingStats>) => void;
  error: string | null;
}

export function useRoom(socket: TypedSocket | null): UseRoomReturn {
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [stats, setStats] = useState<Map<string, CodingStats>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const roomIdRef = useRef<string | null>(null);
  const reactionTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  // Listen for room events
  useEffect(() => {
    if (!socket) return;

    const onRoomState = (roomState: Room) => {
      setRoom(roomState);
      roomIdRef.current = roomState.id;
      setError(null);
    };

    const onRoomError = (message: string) => {
      setError(message);
    };

    const onUserJoined = () => {
      // Room state will be broadcast separately; this is for notifications
    };

    const onUserLeft = () => {
      // Room state will be broadcast separately
    };

    const onChatMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    };

    const onReaction = (reaction: Reaction) => {
      setReactions((prev) => [...prev, reaction]);

      // Auto-remove reaction after duration
      const timer = setTimeout(() => {
        setReactions((prev) =>
          prev.filter((r) => r.timestamp !== reaction.timestamp || r.userId !== reaction.userId),
        );
        reactionTimers.current.delete(reaction.timestamp);
      }, REACTION_DURATION_MS);

      reactionTimers.current.set(reaction.timestamp, timer);
    };

    const onAnalyticsUpdate = (codingStats: CodingStats) => {
      setStats((prev) => {
        const next = new Map(prev);
        next.set(codingStats.userId, codingStats);
        return next;
      });
    };

    socket.on('room:state', onRoomState);
    socket.on('room:error', onRoomError);
    socket.on('room:user-joined', onUserJoined);
    socket.on('room:user-left', onUserLeft);
    socket.on('chat:message', onChatMessage);
    socket.on('chat:reaction', onReaction);
    socket.on('analytics:update', onAnalyticsUpdate);

    return () => {
      socket.off('room:state', onRoomState);
      socket.off('room:error', onRoomError);
      socket.off('room:user-joined', onUserJoined);
      socket.off('room:user-left', onUserLeft);
      socket.off('chat:message', onChatMessage);
      socket.off('chat:reaction', onReaction);
      socket.off('analytics:update', onAnalyticsUpdate);
    };
  }, [socket]);

  // Cleanup reaction timers on unmount
  useEffect(() => {
    return () => {
      reactionTimers.current.forEach((timer) => clearTimeout(timer));
      reactionTimers.current.clear();
    };
  }, []);

  const joinRoom = useCallback(
    async (
      roomId: string,
      userName: string,
      role: UserRole,
      password?: string,
    ): Promise<Room | null> => {
      if (!socket) {
        setError('Socket not connected');
        return null;
      }

      return new Promise((resolve) => {
        socket.emit(
          'room:join',
          { roomId, userName, role, password },
          (joinedRoom, joinError) => {
            if (joinError || !joinedRoom) {
              setError(joinError ?? 'Failed to join room');
              resolve(null);
            } else {
              setRoom(joinedRoom);
              roomIdRef.current = joinedRoom.id;
              setMessages([]);
              setReactions([]);
              setError(null);
              resolve(joinedRoom);
            }
          },
        );
      });
    },
    [socket],
  );

  const leaveRoom = useCallback(() => {
    if (socket && roomIdRef.current) {
      socket.emit('room:leave', roomIdRef.current);
    }
    setRoom(null);
    setMessages([]);
    setReactions([]);
    setStats(new Map());
    setError(null);
    roomIdRef.current = null;
  }, [socket]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!socket || !roomIdRef.current) return;
      socket.emit('chat:message', { roomId: roomIdRef.current, text });
    },
    [socket],
  );

  const sendReaction = useCallback(
    (emoji: string) => {
      if (!socket || !roomIdRef.current) return;
      socket.emit('chat:reaction', { roomId: roomIdRef.current, emoji });
    },
    [socket],
  );

  const updateStats = useCallback(
    (partialStats: Partial<CodingStats>) => {
      if (!socket || !roomIdRef.current) return;
      socket.emit('analytics:update', {
        roomId: roomIdRef.current,
        stats: partialStats,
      });
    },
    [socket],
  );

  return {
    room,
    messages,
    reactions,
    stats,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendReaction,
    updateStats,
    error,
  };
}
