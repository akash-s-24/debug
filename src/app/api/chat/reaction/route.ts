import { getRoom } from '@/lib/redis';
import { triggerRoomEvent } from '@/lib/pusher-server';
import { findUserByClientId } from '@/lib/utils';
import type { Reaction } from '@/types';

export async function POST(req: Request) {
  try {
    const { roomId, clientId, emoji } = (await req.json()) as {
      roomId: string;
      clientId: string;
      emoji: string;
    };

    if (!roomId || !clientId || !emoji) {
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

    const reaction: Reaction = {
      emoji,
      userId: user.id,
      userName: user.name,
      timestamp: Date.now(),
    };

    await triggerRoomEvent(room.id, 'chat-reaction', reaction);

    return Response.json({ reaction }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/chat/reaction]', error);
    return Response.json(
      { error: 'Failed to send reaction' },
      { status: 500 },
    );
  }
}
