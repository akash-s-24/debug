'use client';

import PusherClient from 'pusher-js';

let pusherInstance: PusherClient | null = null;

// User info for presence channel authentication
let _userInfo = { clientId: '', userName: 'Anonymous' };

/**
 * Set the current user's identity. Must be called before subscribing
 * to presence channels (i.e., before joining a room).
 */
export function setUserInfo(info: { clientId: string; userName: string }) {
  _userInfo = info;
}

/**
 * Get or create the singleton Pusher client.
 */
export function getPusherClient(): PusherClient {
  if (!pusherInstance) {
    pusherInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      channelAuthorization: {
        customHandler: async ({ socketId, channelName }, callback) => {
          try {
            const res = await fetch('/api/pusher/auth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                socket_id: socketId,
                channel_name: channelName,
                client_id: _userInfo.clientId,
                user_name: _userInfo.userName,
              }),
            });
            const data = await res.json();
            if (res.ok) {
              callback(null, data);
            } else {
              callback(new Error(data.error || 'Pusher auth failed'), null);
            }
          } catch (err) {
            callback(err as Error, null);
          }
        },
      },
    });
  }
  return pusherInstance;
}

/**
 * Disconnect the Pusher client.
 */
export function disconnectPusher() {
  if (pusherInstance) {
    pusherInstance.disconnect();
    pusherInstance = null;
  }
}
