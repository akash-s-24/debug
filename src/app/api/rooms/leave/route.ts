import { getRoom, saveRoom } from '@/lib/redis';
import { triggerRoomEvent } from '@/lib/pusher-server';
import { findUserByClientId } from '@/lib/utils';

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

    const user = findUserByClientId(room, clientId);
    if (!user) {
      return Response.json({ error: 'User not in room' }, { status: 404 });
    }

    // Host leaving ends the room
    if (room.host.clientId === clientId) {
      room.status = 'finished';
    }

    // Remove from contestants and viewers
    room.contestants = room.contestants.filter((u) => u.clientId !== clientId);
    room.viewers = room.viewers.filter((u) => u.clientId !== clientId);

    // If fewer than 2 contestants and room is still active, drop to waiting
    if (
      room.contestants.length < 2 &&
      room.status !== 'finished'
    ) {
      room.status = 'waiting';
    }

    await saveRoom(room);

    await triggerRoomEvent(room.id, 'room-updated', room);
    await triggerRoomEvent(room.id, 'user-left', user);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/rooms/leave]', error);
    return Response.json({ error: 'Failed to leave room' }, { status: 500 });
  }
}
