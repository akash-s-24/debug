'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePusher } from './usePusher';
import { PresenceChannel } from 'pusher-js';
import { getClientId } from '@/lib/client-id';

export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
  timestamp: number;
}

export function useReactions(roomId?: string) {
  const { pusher } = usePusher();
  const [reactions, setReactions] = useState<Reaction[]>([]);

  useEffect(() => {
    if (!pusher || !roomId) return;

    const channelName = `presence-room-${roomId}`;
    // If the channel is already subscribed by useRoom, this returns the existing channel.
    // If not, it subscribes. We assume useRoom has already subscribed us.
    const channel = pusher.channel(channelName) as PresenceChannel || pusher.subscribe(channelName);

    const onReaction = (reaction: Reaction) => {
      setReactions((prev) => [...prev, reaction]);
      // Cleanup old reactions to avoid memory leak
      setTimeout(() => {
        setReactions((current) => current.filter((r) => r.id !== reaction.id));
      }, 5000);
    };

    channel.bind('chat-reaction', onReaction);

    return () => {
      channel.unbind('chat-reaction', onReaction);
    };
  }, [pusher, roomId]);

  const sendReaction = useCallback(
    async (emoji: string, userName: string) => {
      if (!roomId) return;
      const clientId = getClientId();

      // Optimistic UI update
      const tempId = Math.random().toString(36).substring(7);
      const reaction: Reaction = { id: tempId, emoji, userId: clientId, userName, timestamp: Date.now() };
      setReactions((prev) => [...prev, reaction]);
      
      setTimeout(() => {
        setReactions((current) => current.filter((r) => r.id !== reaction.id));
      }, 5000);

      try {
        await fetch('/api/reactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, emoji, clientId, userName }),
        });
      } catch (err) {
        console.error('Failed to send reaction:', err);
      }
    },
    [roomId]
  );

  return { reactions, sendReaction };
}
