import Pusher from 'pusher';

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

/**
 * Trigger an event on a room's presence channel.
 */
export async function triggerRoomEvent(
  roomId: string,
  event: string,
  data: unknown,
): Promise<void> {
  await pusherServer.trigger(`presence-room-${roomId}`, event, data);
}
