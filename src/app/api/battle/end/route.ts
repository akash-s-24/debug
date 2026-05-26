import { getRoom, saveRoom } from '@/lib/redis';
import { triggerRoomEvent } from '@/lib/pusher-server';
import type { BattleResult } from '@/types';

export async function POST(req: Request) {
  try {
    const { roomId, clientId } = (await req.json()) as {
      roomId: string;
      clientId: string;
    };

    if (!roomId || !clientId) {
      return Response.json(
        { error: 'Missing roomId or clientId' },
        { status: 400 },
      );
    }

    const room = await getRoom(roomId);
    if (!room) {
      return Response.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.host.clientId !== clientId) {
      return Response.json(
        { error: 'Only the host can end the battle' },
        { status: 403 },
      );
    }

    room.status = 'finished';
    room.battleEndedAt = Date.now();

    // If battle was paused when ended, accumulate remaining pause time
    if (room.pausedAt) {
      room.totalPausedMs = (room.totalPausedMs ?? 0) + (room.battleEndedAt - room.pausedAt);
      room.pausedAt = undefined;
    }

    // Calculate net battle duration in seconds
    const duration = room.battleStartedAt
      ? (room.battleEndedAt - room.battleStartedAt - (room.totalPausedMs ?? 0)) / 1000
      : 0;

    const result: BattleResult = {
      contestants: room.contestants.map((u) => ({
        userId: u.id,
        userName: u.name,
        score: 0,
        stats: {
          userId: u.id,
          typingSpeed: 0,
          errorCount: 0,
          compileCount: 0,
          linesWritten: 0,
          idleTime: 0,
          lastActivity: Date.now(),
          streak: 0,
          momentum: 'low',
        },
      })),
      duration,
      highlights: [],
    };

    await saveRoom(room);
    await triggerRoomEvent(room.id, 'room-updated', room);
    await triggerRoomEvent(room.id, 'battle-ended', result);

    return Response.json({ room, result }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/battle/end]', error);
    return Response.json(
      { error: 'Failed to end battle' },
      { status: 500 },
    );
  }
}
