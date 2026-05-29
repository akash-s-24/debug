import { triggerRoomEvent } from '@/lib/pusher-server';

export async function POST(req: Request) {
  try {
    const { roomId, event, data } = await req.json();

    if (!roomId || !event || !data) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Event can be 'server-signal-offer', 'server-signal-answer', 'server-signal-ice'
    await triggerRoomEvent(roomId, event, data);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/webrtc/signal]', error);
    return Response.json({ error: 'Failed to signal' }, { status: 500 });
  }
}
