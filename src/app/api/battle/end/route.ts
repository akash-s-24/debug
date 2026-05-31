import { getRoom, saveRoom } from '@/lib/redis';
import { triggerRoomEvent } from '@/lib/pusher-server';
import { analyzeCodeErrors } from '@/lib/ai';
import type { BattleResult, CodingStats } from '@/types';

export async function POST(req: Request) {
  try {
    const { roomId, clientId, codes, finalStats } = (await req.json()) as {
      roomId: string;
      clientId: string;
      codes?: Record<string, string>;
      finalStats?: Record<string, CodingStats>;
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

    // Run AI Analysis for each contestant concurrently
    const initialErrors = room.config.initialErrors || 0;
    const evaluatedContestants = await Promise.all(
      room.contestants.map(async (u) => {
        const code = codes?.[u.id] || '';
        let errorCount = 0;
        
        if (code.trim()) {
          errorCount = await analyzeCodeErrors(code, room.config.language);
        } else {
          errorCount = initialErrors; // If no code, all initial errors remain
        }

        const errorsSolved = Math.max(0, initialErrors - errorCount);
        
        // Use provided stats or defaults
        const stats: CodingStats = finalStats?.[u.id] || {
          userId: u.id,
          typingSpeed: 0,
          errorCount: 0,
          compileCount: 0,
          linesWritten: 0,
          idleTime: 0,
          lastActivity: Date.now(),
          streak: 0,
          momentum: 'low',
          initialErrors,
          errorsSolved: 0,
        };

        // Override with AI evaluated metrics
        stats.initialErrors = initialErrors;
        stats.errorCount = errorCount;
        stats.errorsSolved = errorsSolved;

        // Broadcast the final validated stats to all clients before ending battle
        await triggerRoomEvent(room.id, 'stats-updated', stats);

        return {
          userId: u.id,
          userName: u.name,
          score: 50 + (errorsSolved * 10), // Example score based on errors solved
          stats,
        };
      })
    );

    const result: BattleResult = {
      contestants: evaluatedContestants,
      duration,
      highlights: [],
    };

    // Give points to all contestants who finished the battle
    const { updateUserScore } = await import('@/lib/redis');
    for (const c of room.contestants) {
      await updateUserScore(c.id, c.name, 50, true, room.config.language);
    }

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
