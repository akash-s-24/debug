'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type PusherClient from 'pusher-js';
import type { Channel, PresenceChannel } from 'pusher-js';
import type {
  Room,
  CodingStats,
  BattleResult,
  UserRole,
  User,
} from '@/types';
import { getClientId } from '@/lib/client-id';
import { setUserInfo } from '@/lib/pusher-client';

interface UseRoomReturn {
  room: Room | null;
  stats: Map<string, CodingStats>;
  battleResult: BattleResult | null;
  joinRoom: (
    roomId: string,
    userName: string,
    role: UserRole,
    password?: string,
  ) => Promise<Room | null>;
  leaveRoom: () => void;
  updateStats: (stats: Partial<CodingStats>) => void;
  error: string | null;
}

export function useRoom(pusher: PusherClient | null): UseRoomReturn {
  const [room, setRoom] = useState<Room | null>(null);
  const [stats, setStats] = useState<Map<string, CodingStats>>(new Map());
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subscribedRoomId, setSubscribedRoomId] = useState<string | null>(null);

  const roomIdRef = useRef<string | null>(null);

  // ── Pusher channel subscription ──────────────────────────────────────
  useEffect(() => {
    if (!pusher || !subscribedRoomId) return;

    const channelName = `presence-room-${subscribedRoomId}`;
    const channel = pusher.subscribe(channelName) as PresenceChannel;

    const onRoomUpdated = (data: Room) => {
      setRoom(data);
      setError(null);
    };

    const onUserJoined = (_user: User) => {
      // Room state is broadcast via room-updated
    };

    const onUserLeft = (_data: { userId: string }) => {
      // Room state is broadcast via room-updated
    };

    const onStatsUpdated = (codingStats: CodingStats) => {
      setStats((prev) => {
        const next = new Map(prev);
        next.set(codingStats.userId, codingStats);
        return next;
      });
    };

    const onBattleEnded = (result: BattleResult) => {
      setBattleResult(result);
    };

    channel.bind('room-updated', onRoomUpdated);
    channel.bind('user-joined', onUserJoined);
    channel.bind('user-left', onUserLeft);
    channel.bind('stats-updated', onStatsUpdated);
    channel.bind('battle-ended', onBattleEnded);

    // Presence events — when a member drops unexpectedly
    channel.bind('pusher:member_removed', (_member: { id: string }) => {
      // The server triggers room-updated on leave; this is a safety net
    });

    return () => {
      channel.unbind('room-updated', onRoomUpdated);
      channel.unbind('user-joined', onUserJoined);
      channel.unbind('user-left', onUserLeft);
      channel.unbind('stats-updated', onStatsUpdated);
      channel.unbind('battle-ended', onBattleEnded);
      channel.unbind('pusher:member_removed');
      pusher.unsubscribe(channelName);
    };
  }, [pusher, subscribedRoomId]);

  // ── Actions ──────────────────────────────────────────────────────────

  const joinRoom = useCallback(
    async (
      roomId: string,
      userName: string,
      role: UserRole,
      password?: string,
    ): Promise<Room | null> => {
      const clientId = getClientId();

      try {
        // Set user info for Pusher presence auth before subscribing
        setUserInfo({ clientId, userName });

        const res = await fetch('/api/rooms/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, userName, role, clientId, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to join room');
          return null;
        }

        const joinedRoom: Room = data.room;
        setRoom(joinedRoom);
        roomIdRef.current = joinedRoom.id;
        setBattleResult(null);
        setError(null);

        // Trigger Pusher channel subscription
        setSubscribedRoomId(joinedRoom.id);

        return joinedRoom;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to join room';
        setError(message);
        return null;
      }
    },
    [],
  );

  const leaveRoom = useCallback(async () => {
    const clientId = getClientId();

    if (roomIdRef.current) {
      try {
        await fetch('/api/rooms/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: roomIdRef.current, clientId }),
        });
      } catch {
        // Best-effort leave; Pusher presence will handle cleanup
      }
    }

    setSubscribedRoomId(null);
    setRoom(null);
    setStats(new Map());
    setBattleResult(null);
    setError(null);
    roomIdRef.current = null;
  }, []);

  const updateStats = useCallback((partialStats: Partial<CodingStats>) => {
    if (!roomIdRef.current) return;
    const clientId = getClientId();

    fetch('/api/stats/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: roomIdRef.current,
        clientId,
        stats: partialStats,
      }),
    }).catch((err) => {
      console.error('[useRoom] Failed to update stats:', err);
    });
  }, []);

  return {
    room,
    stats,
    battleResult,
    joinRoom,
    leaveRoom,
    updateStats,
    error,
  };
}
