'use client';

import { useEffect, useState } from 'react';
import { getSocket, disconnectSocket, type TypedSocket } from '@/lib/socket';

interface UseSocketReturn {
  socket: TypedSocket | null;
  isConnected: boolean;
  connectionError: string | null;
}

export function useSocket(): UseSocketReturn {
  const [socket, setSocket] = useState<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const socketInstance = getSocket();
    queueMicrotask(() => setSocket(socketInstance));

    const onConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
    };

    const onDisconnect = (reason: string) => {
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        setConnectionError('Server disconnected');
      }
    };

    const onConnectError = (err: Error) => {
      setIsConnected(false);
      setConnectionError(
        err.message || 'Realtime server is unavailable. Check NEXT_PUBLIC_SOCKET_URL.',
      );
    };

    const onReconnectAttempt = (attempt: number) => {
      setConnectionError(`Reconnecting... (attempt ${attempt})`);
    };

    const onReconnectFailed = () => {
      setConnectionError('Failed to reconnect after maximum attempts');
    };

    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);
    socketInstance.on('connect_error', onConnectError);
    socketInstance.io.on('reconnect_attempt', onReconnectAttempt);
    socketInstance.io.on('reconnect_failed', onReconnectFailed);

    if (socketInstance.connected) {
      queueMicrotask(onConnect);
    }

    return () => {
      socketInstance.off('connect', onConnect);
      socketInstance.off('disconnect', onDisconnect);
      socketInstance.off('connect_error', onConnectError);
      socketInstance.io.off('reconnect_attempt', onReconnectAttempt);
      socketInstance.io.off('reconnect_failed', onReconnectFailed);
      disconnectSocket();
      queueMicrotask(() => setSocket(null));
    };
  }, []);

  return {
    socket,
    isConnected,
    connectionError,
  };
}
