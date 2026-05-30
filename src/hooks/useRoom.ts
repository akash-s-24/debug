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
  codes: Map<string, string>;
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
  const [codes, setCodes] = useState<Map<string, string>>(new Map());
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subscribedRoomId, setSubscribedRoomId] = useState<string | null>(null);

  const roomIdRef = useRef<string | null>(null);
  const roomRef = useRef<Room | null>(null);

  // Keep roomRef synced with the latest room state without triggering dependency arrays
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  // ── Tab Close Cleanup ────────────────────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (roomIdRef.current) {
        const payload = JSON.stringify({ roomId: roomIdRef.current, clientId: getClientId() });
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/rooms/leave', blob);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

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

    const onRoomClosed = () => {
      // Host explicitly closed the room, exit
      window.location.href = '/';
    };

    const onUserKicked = (data: { clientId: string }) => {
      if (data.clientId === getClientId()) {
        window.location.href = '/';
      }
    };

    const onCodeUpdated = (data: { userId: string; code: string }) => {
      setCodes((prev) => {
        const next = new Map(prev);
        next.set(data.userId, data.code);
        return next;
      });
    };

    channel.bind('room-updated', onRoomUpdated);
    channel.bind('user-joined', onUserJoined);
    channel.bind('user-left', onUserLeft);
    channel.bind('stats-updated', onStatsUpdated);
    channel.bind('battle-ended', onBattleEnded);
    channel.bind('room-closed', onRoomClosed);
    channel.bind('user-kicked', onUserKicked);
    channel.bind('code-updated', onCodeUpdated);

    // Presence events — when a member drops unexpectedly (e.g. closes tab)
    // IMPORTANT: Use a delay to avoid the Pusher disconnect/reconnect race.
    // When a user refreshes or navigates in, Pusher fires member_removed then
    // member_added in quick succession. We must NOT kick them during that window.
    const pendingRemovals = new Map<string, ReturnType<typeof setTimeout>>();

    channel.bind('pusher:member_added', (member: { id: string }) => {
      // Cancel any pending removal for this member — they reconnected
      const timer = pendingRemovals.get(member.id);
      if (timer) {
        console.log(`[useRoom] member_added cancelled pending removal for ${member.id}`);
        clearTimeout(timer);
        pendingRemovals.delete(member.id);
      }
    });

    channel.bind('pusher:member_removed', (member: { id: string }) => {
      const droppedClientId = member.id;
      console.log(`[useRoom] member_removed: ${droppedClientId} — waiting 3s before cleanup`);

      const timer = setTimeout(() => {
        pendingRemovals.delete(droppedClientId);
        
        // Double-check they're not in the current channel members before acting
        const members = (channel as PresenceChannel).members;
        if (members && members.get(droppedClientId)) {
          console.log(`[useRoom] ${droppedClientId} is still in channel members — aborting removal`);
          return;
        }

        console.log(`[useRoom] Confirmed removal of ${droppedClientId} after 3s`);

        // Optimistically remove them from the UI
        setRoom((prev) => {
          if (!prev) return prev;
          
          if (prev.host.clientId === droppedClientId) {
            // The host disconnected! Everyone should exit.
            window.location.href = '/';
            return null;
          }

          const next = { ...prev };
          next.contestants = next.contestants.filter((u) => u.clientId !== droppedClientId);
          next.viewers = next.viewers.filter((u) => u.clientId !== droppedClientId);

          if (next.contestants.length < 2 && next.status !== 'finished') {
            next.status = 'waiting';
          }
          return next;
        });

        // If we are the Host, tell the server to clean up Redis
        const currentRoom = roomRef.current;
        const myClientId = getClientId();
        
        if (currentRoom && currentRoom.host.clientId === myClientId) {
          fetch('/api/rooms/leave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId: currentRoom.id, clientId: droppedClientId }),
          }).catch((err) => console.error('[useRoom] Host cleanup failed:', err));
        }
      }, 5000);

      pendingRemovals.set(droppedClientId, timer);
    });

    return () => {
      // Clear any pending removal timers
      pendingRemovals.forEach((timer) => clearTimeout(timer));
      pendingRemovals.clear();
      
      channel.unbind('room-updated', onRoomUpdated);
      channel.unbind('user-joined', onUserJoined);
      channel.unbind('user-left', onUserLeft);
      channel.unbind('stats-updated', onStatsUpdated);
      channel.unbind('battle-ended', onBattleEnded);
      channel.unbind('pusher:member_added');
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
    codes,
    battleResult,
    joinRoom,
    leaveRoom,
    updateStats,
    error,
  };
}
