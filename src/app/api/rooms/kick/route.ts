import { getRoom, saveRoom } from '@/lib/redis';
import { triggerRoomEvent } from '@/lib/pusher-server';
import { findUserByClientId } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const { roomId, hostClientId, targetClientId } = (await req.json()) as {
      roomId: string;
      hostClientId: string;
      targetClientId: string;
    };

    if (!roomId || !hostClientId || !targetClientId) {
      return Response.json(
        { error: 'Missing roomId, hostClientId, or targetClientId' },
        { status: 400 },
      );
    }

    const room = await getRoom(roomId);
    if (!room) {
      return Response.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.host.clientId !== hostClientId) {
      return Response.json({ error: 'Unauthorized: Only the host can kick players' }, { status: 403 });
    }

    const targetUser = findUserByClientId(room, targetClientId);
    if (!targetUser) {
      return Response.json({ error: 'Target user not in room' }, { status: 404 });
    }

    if (targetUser.clientId === room.host.clientId) {
      return Response.json({ error: 'Cannot kick the host' }, { status: 400 });
    }

    // Remove from contestants and viewers
    room.contestants = room.contestants.filter((u) => u.clientId !== targetClientId);
    room.viewers = room.viewers.filter((u) => u.clientId !== targetClientId);

    // If fewer than 2 contestants and room is still active, drop to waiting
    if (
      room.contestants.length < 2 &&
      room.status !== 'finished'
    ) {
      room.status = 'waiting';
    }

    await saveRoom(room);

    await triggerRoomEvent(room.id, 'room-updated', room);
    await triggerRoomEvent(room.id, 'user-kicked', { clientId: targetClientId });

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/rooms/kick]', error);
    return Response.json({ error: 'Failed to kick user' }, { status: 500 });
  }
}
