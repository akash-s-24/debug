'use client';

import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@/types';

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: TypedSocket | null = null;

export const getConfiguredSocketUrl = (): string | undefined => {
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
  return socketUrl || undefined;
};

export const getSocket = (): TypedSocket => {
  if (!socket) {
    const socketUrl = getConfiguredSocketUrl();
    socket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    }) as TypedSocket;
  }
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const isSocketConnected = (): boolean => {
  return socket?.connected ?? false;
};
