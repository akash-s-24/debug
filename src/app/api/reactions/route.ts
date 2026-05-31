import { triggerRoomEvent } from '@/lib/pusher-server';
import { getRoom } from '@/lib/redis';

export async function POST(req: Request) {
  try {
    const { roomId, emoji, clientId, userName } = await req.json();

    if (!roomId || !emoji || !clientId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const room = await getRoom(roomId);
    if (!room) {
      return Response.json({ error: 'Room not found' }, { status: 404 });
    }

    const reaction = {
      id: Math.random().toString(36).substring(7),
      emoji,
      userId: clientId,
      userName: userName || 'Anonymous',
      timestamp: Date.now(),
    };

    await triggerRoomEvent(roomId, 'chat-reaction', reaction);

    return Response.json({ success: true, reaction });
  } catch (error) {
    console.error('[POST /api/reactions]', error);
    return Response.json({ error: 'Failed to send reaction' }, { status: 500 });
  }
}
