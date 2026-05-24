'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { getSocket, disconnectSocket, type TypedSocket } from '@/lib/socket';

interface UseSocketReturn {
  socket: TypedSocket | null;
  isConnected: boolean;
  connectionError: string | null;
}

export function useSocket(): UseSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<TypedSocket | null>(null);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

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
      setConnectionError(err.message || 'Connection failed');
    };

    const onReconnectAttempt = (attempt: number) => {
      setConnectionError(`Reconnecting... (attempt ${attempt})`);
    };

    const onReconnectFailed = () => {
      setConnectionError('Failed to reconnect after maximum attempts');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.io.on('reconnect_attempt', onReconnectAttempt);
    socket.io.on('reconnect_failed', onReconnectFailed);

    // Check if already connected
    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.io.off('reconnect_attempt', onReconnectAttempt);
      socket.io.off('reconnect_failed', onReconnectFailed);
      disconnectSocket();
      socketRef.current = null;
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
  };
}
