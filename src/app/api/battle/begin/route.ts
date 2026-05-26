import { getRoom, saveRoom } from '@/lib/redis';
import { triggerRoomEvent } from '@/lib/pusher-server';

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
        { error: 'Only the host can begin the battle' },
        { status: 403 },
      );
    }

    room.status = 'battle';
    room.battleStartedAt = Date.now();
    room.totalPausedMs = 0;

    await saveRoom(room);
    await triggerRoomEvent(room.id, 'room-updated', room);

    return Response.json({ room }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/battle/begin]', error);
    return Response.json(
      { error: 'Failed to begin battle' },
      { status: 500 },
    );
  }
}
