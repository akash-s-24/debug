'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type PusherClient from 'pusher-js';
import type { PresenceChannel } from 'pusher-js';
import { getClientId } from '@/lib/client-id';
import {
  createPeerConnection,
  createOffer,
  createAnswer,
  addIceCandidate,
} from '@/lib/webrtc';

interface PeerState {
  connectionState: RTCPeerConnectionState;
  iceState: RTCIceConnectionState;
}

interface UseWebRTCReturn {
  addStream: (peerId: string, stream: MediaStream) => void;
  removeStream: (peerId: string) => void;
  getRemoteStreams: () => Map<string, MediaStream>;
  connectionStates: Map<string, PeerState>;
}

export function useWebRTC(
  pusher: PusherClient | null,
  roomId: string | null,
): UseWebRTCReturn {
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreams = useRef<Map<string, MediaStream>>(new Map());
  const localStream = useRef<MediaStream | null>(null);
  const channelRef = useRef<PresenceChannel | null>(null);
  const [connectionStates, setConnectionStates] = useState<Map<string, PeerState>>(
    new Map(),
  );

  const myClientId = typeof window !== 'undefined' ? getClientId() : '';

  const updatePeerState = useCallback((peerId: string, pc: RTCPeerConnection) => {
    setConnectionStates((prev) => {
      const next = new Map(prev);
      next.set(peerId, {
        connectionState: pc.connectionState,
        iceState: pc.iceConnectionState,
      });
      return next;
    });
  }, []);

  const getChannel = useCallback((): PresenceChannel | null => {
    if (channelRef.current) return channelRef.current;
    if (!pusher || !roomId) return null;

    const channelName = `presence-room-${roomId}`;
    const existing = pusher.channel(channelName);
    if (existing) {
      channelRef.current = existing as PresenceChannel;
      return channelRef.current;
    }
    return null;
  }, [pusher, roomId]);

  const setupPeerConnection = useCallback(
    (peerId: string): RTCPeerConnection => {
      // Close existing connection if any
      const existing = peerConnections.current.get(peerId);
      if (existing) {
        existing.close();
      }

      const pc = createPeerConnection();
      peerConnections.current.set(peerId, pc);

      // Add local tracks if available
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStream.current!);
        });
      }

      // Handle remote tracks
      pc.ontrack = (event) => {
        const [stream] = event.streams;
        if (stream) {
          remoteStreams.current.set(peerId, stream);
        }
      };

      // Handle ICE candidates — send via Pusher client event
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const channel = getChannel();
          if (channel) {
            channel.trigger('client-signal-ice', {
              from: myClientId,
              to: peerId,
              candidate: event.candidate.toJSON(),
            });
          }
        }
      };

      // Track connection state changes
      pc.onconnectionstatechange = () => {
        updatePeerState(peerId, pc);

        if (pc.connectionState === 'failed') {
          console.warn(`[WebRTC] Connection to ${peerId} failed, attempting restart`);
          pc.restartIce();
        }

        if (pc.connectionState === 'closed') {
          peerConnections.current.delete(peerId);
          remoteStreams.current.delete(peerId);
          setConnectionStates((prev) => {
            const next = new Map(prev);
            next.delete(peerId);
            return next;
          });
        }
      };

      pc.oniceconnectionstatechange = () => {
        updatePeerState(peerId, pc);
      };

      return pc;
    },
    [myClientId, updatePeerState, getChannel],
  );

  // Handle incoming signaling events via Pusher client events
  useEffect(() => {
    if (!pusher || !roomId) return;

    const channelName = `presence-room-${roomId}`;
    const channel = pusher.channel(channelName) as PresenceChannel | undefined;

    if (!channel) return;
    channelRef.current = channel;

    const handleOffer = async (data: {
      from: string;
      to: string;
      sdp: RTCSessionDescriptionInit;
    }) => {
      if (data.to !== myClientId) return;
      const pc = setupPeerConnection(data.from);
      const answer = await createAnswer(pc, data.sdp);
      channel.trigger('client-signal-answer', {
        from: myClientId,
        to: data.from,
        sdp: answer,
      });
    };

    const handleAnswer = async (data: {
      from: string;
      to: string;
      sdp: RTCSessionDescriptionInit;
    }) => {
      if (data.to !== myClientId) return;
      const pc = peerConnections.current.get(data.from);
      if (pc && pc.signalingState === 'have-local-offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      }
    };

    const handleIce = async (data: {
      from: string;
      to: string;
      candidate: RTCIceCandidateInit;
    }) => {
      if (data.to !== myClientId) return;
      const pc = peerConnections.current.get(data.from);
      if (pc) {
        await addIceCandidate(pc, data.candidate);
      }
    };

    channel.bind('client-signal-offer', handleOffer);
    channel.bind('client-signal-answer', handleAnswer);
    channel.bind('client-signal-ice', handleIce);

    return () => {
      channel.unbind('client-signal-offer', handleOffer);
      channel.unbind('client-signal-answer', handleAnswer);
      channel.unbind('client-signal-ice', handleIce);
      channelRef.current = null;
    };
  }, [pusher, roomId, myClientId, setupPeerConnection]);

  // Cleanup all peer connections on unmount
  useEffect(() => {
    return () => {
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
      remoteStreams.current.clear();
    };
  }, []);

  const addStream = useCallback(
    (peerId: string, stream: MediaStream) => {
      localStream.current = stream;
      const pc = setupPeerConnection(peerId);

      stream.getTracks().forEach((track) => {
        // Avoid duplicate tracks
        const senders = pc.getSenders();
        const existing = senders.find((s) => s.track?.id === track.id);
        if (!existing) {
          pc.addTrack(track, stream);
        }
      });

      // Create and send offer via Pusher client event
      const channel = getChannel();
      if (channel) {
        createOffer(pc).then((offer) => {
          channel.trigger('client-signal-offer', {
            from: myClientId,
            to: peerId,
            sdp: offer,
          });
        });
      }
    },
    [myClientId, setupPeerConnection, getChannel],
  );

  const removeStream = useCallback((peerId: string) => {
    const pc = peerConnections.current.get(peerId);
    if (pc) {
      pc.close();
      peerConnections.current.delete(peerId);
      remoteStreams.current.delete(peerId);
      setConnectionStates((prev) => {
        const next = new Map(prev);
        next.delete(peerId);
        return next;
      });
    }
  }, []);

  const getRemoteStreams = useCallback(() => {
    return new Map(remoteStreams.current);
  }, []);

  return {
    addStream,
    removeStream,
    getRemoteStreams,
    connectionStates,
  };
}
