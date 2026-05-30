import { getRoom } from '@/lib/redis';
import { triggerRoomEvent } from '@/lib/pusher-server';
import { findUserByClientId } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const { roomId, clientId, code } = (await req.json()) as {
      roomId: string;
      clientId: string;
      code: string;
    };

    if (!roomId || !clientId || typeof code !== 'string') {
      return Response.json(
        { error: 'Missing roomId, clientId, or code' },
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

    // Only contestants can broadcast code
    const isContestant = room.contestants.some(c => c.clientId === clientId);
    if (!isContestant) {
      return Response.json({ error: 'Only contestants can write code' }, { status: 403 });
    }

    // Broadcast the code update to all clients in the room (including viewers and host)
    await triggerRoomEvent(room.id, 'code-updated', {
      userId: user.id,
      code,
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/battle/code]', error);
    return Response.json({ error: 'Failed to sync code' }, { status: 500 });
  }
}
