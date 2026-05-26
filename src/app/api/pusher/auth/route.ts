import { pusherServer } from '@/lib/pusher-server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { socket_id, channel_name, client_id, user_name } = body as {
      socket_id: string;
      channel_name: string;
      client_id: string;
      user_name: string;
    };

    if (!socket_id || !channel_name || !client_id || !user_name) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const authResponse = pusherServer.authorizeChannel(socket_id, channel_name, {
      user_id: client_id,
      user_info: { name: user_name },
    });

    return Response.json(authResponse, { status: 200 });
  } catch (error) {
    console.error('[POST /api/pusher/auth]', error);
    return Response.json(
      { error: 'Failed to authorize channel' },
      { status: 500 },
    );
  }
}
