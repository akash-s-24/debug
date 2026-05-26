'use client';

import { useEffect, useState } from 'react';
import PusherClient from 'pusher-js';
import { getPusherClient } from '@/lib/pusher-client';

interface UsePusherReturn {
  pusher: PusherClient | null;
  isConnected: boolean;
  connectionError: string | null;
}

export function usePusher(): UsePusherReturn {
  const [pusher, setPusher] = useState<PusherClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const client = getPusherClient();
    queueMicrotask(() => setPusher(client));

    const onConnected = () => {
      setIsConnected(true);
      setConnectionError(null);
    };

    const onDisconnected = () => {
      setIsConnected(false);
    };

    const onError = (err: unknown) => {
      setIsConnected(false);
      const message =
        err instanceof Error
          ? err.message
          : 'Pusher connection error. Check NEXT_PUBLIC_PUSHER_KEY.';
      setConnectionError(message);
    };

    const onConnecting = () => {
      setConnectionError('Connecting to realtime server...');
    };

    client.connection.bind('connected', onConnected);
    client.connection.bind('disconnected', onDisconnected);
    client.connection.bind('error', onError);
    client.connection.bind('connecting', onConnecting);

    // Sync initial state if already connected
    if (client.connection.state === 'connected') {
      queueMicrotask(onConnected);
    }

    return () => {
      client.connection.unbind('connected', onConnected);
      client.connection.unbind('disconnected', onDisconnected);
      client.connection.unbind('error', onError);
      client.connection.unbind('connecting', onConnecting);
      // Do NOT disconnect — singleton is shared across components
    };
  }, []);

  return {
    pusher,
    isConnected,
    connectionError,
  };
}
