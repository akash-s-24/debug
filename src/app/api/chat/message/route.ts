import { getRoom } from '@/lib/redis';
import { triggerRoomEvent } from '@/lib/pusher-server';
import { generateId, findUserByClientId } from '@/lib/utils';
import type { ChatMessage } from '@/types';

export async function POST(req: Request) {
  try {
    const { roomId, clientId, text } = (await req.json()) as {
      roomId: string;
      clientId: string;
      text: string;
    };

    if (!roomId || !clientId || !text) {
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

    const message: ChatMessage = {
      id: generateId(),
      userId: user.id,
      userName: user.name,
      text: text.slice(0, 500),
      timestamp: Date.now(),
      type: 'message',
    };

    await triggerRoomEvent(room.id, 'chat-message', message);

    return Response.json({ message }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/chat/message]', error);
    return Response.json(
      { error: 'Failed to send message' },
      { status: 500 },
    );
  }
}
