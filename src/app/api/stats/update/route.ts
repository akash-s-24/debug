import { getRoom } from '@/lib/redis';
import { triggerRoomEvent } from '@/lib/pusher-server';
import { findUserByClientId } from '@/lib/utils';
import type { CodingStats } from '@/types';

export async function POST(req: Request) {
  try {
    const { roomId, clientId, stats: partialStats } = (await req.json()) as {
      roomId: string;
      clientId: string;
      stats: Partial<CodingStats>;
    };

    if (!roomId || !clientId) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const room = await getRoom(roomId);
    if (!room) {
      return Response.json({ error: 'Room not found' }, { status: 404 });
    }

    const user = findUserByClientId(room, clientId);
    if (!user) {
      return Response.json({ error: 'User not in room' }, { status: 404 });
    }

    const stats: CodingStats = {
      userId: user.id,
      typingSpeed: 0,
      errorCount: 0,
      compileCount: 0,
      linesWritten: 0,
      idleTime: 0,
      lastActivity: Date.now(),
      streak: 0,
      momentum: 'low',
      ...partialStats,
    };

    await triggerRoomEvent(room.id, 'stats-updated', stats);

    return Response.json({ stats }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/stats/update]', error);
    return Response.json(
      { error: 'Failed to update stats' },
      { status: 500 },
    );
  }
}
