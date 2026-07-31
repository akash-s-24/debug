'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type PusherClient from 'pusher-js';
import type { PresenceChannel } from 'pusher-js';
import {
  createPeerConnection,
  createOffer,
  createAnswer,
  addIceCandidate,
  getMediaConstraints,
  applyScreenContentHint,
  configureForLowLatency,
} from '@/lib/webrtc';

interface RemoteStreamEntry {
  stream: MediaStream;
  userName: string;
}

interface UseScreenShareReturn {
  isSharing: boolean;
  localStream: MediaStream | null;
  remoteStreams: Map<string, RemoteStreamEntry>;
  startSharing: () => Promise<void>;
  stopSharing: () => void;
  freezeAllStreams: () => void;
}

/**
 * Hook that manages WebRTC screen sharing for the Debug Duel Arena.
 *
 * Each participant captures their screen via getDisplayMedia() and creates
 * a direct P2P RTCPeerConnection to every other participant + the host.
 * Signaling (offer/answer/ICE) is relayed through Pusher client events.
 */
export function useScreenShare(
  pusher: PusherClient | null,
  roomId: string | null,
  myClientId: string,
  myUserName: string,
): UseScreenShareReturn {
  const [isSharing, setIsSharing] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, RemoteStreamEntry>>(new Map());

  // Refs to avoid stale closures in event handlers
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const isSharingRef = useRef(false);
  const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  // ── Cleanup helpers ──────────────────────────────────────────────────

  const closePeerConnection = useCallback((peerId: string) => {
    const pc = peerConnections.current.get(peerId);
    if (pc) {
      pc.close();
      peerConnections.current.delete(peerId);
    }
    setRemoteStreams((prev) => {
      const next = new Map(prev);
      next.delete(peerId);
      return next;
    });
  }, []);

  const closeAllConnections = useCallback(() => {
    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();
    pendingCandidates.current.clear();
    setRemoteStreams(new Map());
  }, []);

  // ── Create a peer connection to a specific remote peer ───────────────

  const createConnectionToPeer = useCallback(
    (peerId: string, peerName: string, channel: PresenceChannel) => {
      if (peerConnections.current.has(peerId)) return peerConnections.current.get(peerId)!;

      const pc = createPeerConnection();

      // When we receive a remote track, store it
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteStream) {
          setRemoteStreams((prev) => {
            const next = new Map(prev);
            next.set(peerId, { stream: remoteStream, userName: peerName });
            return next;
          });
        }
      };

      // Forward ICE candidates via Pusher
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          try {
            channel.trigger('client-webrtc-ice', {
              from: myClientId,
              to: peerId,
              candidate: event.candidate.toJSON(),
            });
          } catch {
            // Channel may not be subscribed yet
          }
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          closePeerConnection(peerId);
        }
      };

      peerConnections.current.set(peerId, pc);
      return pc;
    },
    [myClientId, closePeerConnection],
  );

  // ── Add local stream tracks to a peer connection ─────────────────────

  const addLocalStreamToPeer = useCallback(
    async (pc: RTCPeerConnection) => {
      const stream = localStreamRef.current;
      if (!stream) return;

      for (const track of stream.getTracks()) {
        const sender = pc.addTrack(track, stream);
        // Apply low-latency tuning to every video sender
        if (track.kind === 'video') {
          try {
            await configureForLowLatency(sender);
          } catch {
            // Some browsers may not support all encoding params
          }
        }
      }
    },
    [],
  );

  // ── Start sharing ────────────────────────────────────────────────────

  const startSharing = useCallback(async () => {
    if (isSharingRef.current) return;

    try {
      const constraints = getMediaConstraints();
      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);

      // Apply content hint for sharp text rendering
      for (const track of stream.getVideoTracks()) {
        applyScreenContentHint(track);

        // When user stops sharing via browser UI
        track.onended = () => {
          setIsSharing(false);
          isSharingRef.current = false;
          localStreamRef.current = null;
          setLocalStream(null);
          closeAllConnections();
        };
      }

      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsSharing(true);
      isSharingRef.current = true;

      // Connect to all existing peers in the channel
      if (pusher && roomId) {
        const channelName = `presence-room-${roomId}`;
        const channel = pusher.channel(channelName) as PresenceChannel | undefined;
        if (channel?.members) {
          channel.members.each((member: { id: string; info?: { userName?: string } }) => {
            if (member.id === myClientId) return;
            const peerName = member.info?.userName || 'Peer';
            const pc = createConnectionToPeer(member.id, peerName, channel);
            addLocalStreamToPeer(pc).then(async () => {
              try {
                const offer = await createOffer(pc);
                channel.trigger('client-webrtc-offer', {
                  from: myClientId,
                  to: member.id,
                  fromName: myUserName,
                  offer,
                });
              } catch (err) {
                console.error('[ScreenShare] Failed to create offer:', err);
              }
            });
          });
        }
      }
    } catch (err) {
      console.error('[ScreenShare] Failed to start screen share:', err);
    }
  }, [pusher, roomId, myClientId, myUserName, createConnectionToPeer, addLocalStreamToPeer, closeAllConnections]);

  // ── Stop sharing ─────────────────────────────────────────────────────

  const stopSharing = useCallback(() => {
    const stream = localStreamRef.current;
    if (stream) {
      for (const track of stream.getTracks()) {
        track.stop();
      }
    }
    localStreamRef.current = null;
    setLocalStream(null);
    setIsSharing(false);
    isSharingRef.current = false;
    closeAllConnections();
  }, [closeAllConnections]);

  // ── Freeze all streams (timer expired) ───────────────────────────────

  const freezeAllStreams = useCallback(() => {
    // Stop sending new frames by disabling all video tracks
    const stream = localStreamRef.current;
    if (stream) {
      for (const track of stream.getVideoTracks()) {
        track.enabled = false; // Freezes on last frame for receivers
      }
    }
  }, []);

  // ── Pusher signaling event handlers ──────────────────────────────────

  useEffect(() => {
    if (!pusher || !roomId) return;

    const channelName = `presence-room-${roomId}`;
    const channel = pusher.channel(channelName) as PresenceChannel | undefined;
    if (!channel) return;

    // Handle incoming WebRTC offers
    const handleOffer = async (data: {
      from: string;
      to: string;
      fromName: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      if (data.to !== myClientId) return;

      const pc = createConnectionToPeer(data.from, data.fromName, channel);

      // If we have a local stream, add our tracks
      if (localStreamRef.current) {
        await addLocalStreamToPeer(pc);
      }

      try {
        const answer = await createAnswer(pc, data.offer);
        channel.trigger('client-webrtc-answer', {
          from: myClientId,
          to: data.from,
          fromName: myUserName,
          answer,
        });

        // Flush any pending ICE candidates
        const pending = pendingCandidates.current.get(data.from) || [];
        for (const candidate of pending) {
          await addIceCandidate(pc, candidate);
        }
        pendingCandidates.current.delete(data.from);
      } catch (err) {
        console.error('[ScreenShare] Failed to handle offer:', err);
      }
    };

    // Handle incoming WebRTC answers
    const handleAnswer = async (data: {
      from: string;
      to: string;
      fromName: string;
      answer: RTCSessionDescriptionInit;
    }) => {
      if (data.to !== myClientId) return;

      const pc = peerConnections.current.get(data.from);
      if (!pc) return;

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));

        // Update peer name in remote streams if we already have their stream
        setRemoteStreams((prev) => {
          const existing = prev.get(data.from);
          if (existing && data.fromName) {
            const next = new Map(prev);
            next.set(data.from, { ...existing, userName: data.fromName });
            return next;
          }
          return prev;
        });

        // Flush pending ICE candidates
        const pending = pendingCandidates.current.get(data.from) || [];
        for (const candidate of pending) {
          await addIceCandidate(pc, candidate);
        }
        pendingCandidates.current.delete(data.from);
      } catch (err) {
        console.error('[ScreenShare] Failed to handle answer:', err);
      }
    };

    // Handle incoming ICE candidates
    const handleIce = async (data: {
      from: string;
      to: string;
      candidate: RTCIceCandidateInit;
    }) => {
      if (data.to !== myClientId) return;

      const pc = peerConnections.current.get(data.from);
      if (pc && pc.remoteDescription) {
        await addIceCandidate(pc, data.candidate);
      } else {
        // Queue candidates until remote description is set
        const pending = pendingCandidates.current.get(data.from) || [];
        pending.push(data.candidate);
        pendingCandidates.current.set(data.from, pending);
      }
    };

    // When a new member joins, if we're sharing, connect to them
    const handleMemberAdded = (member: { id: string; info?: { userName?: string } }) => {
      if (member.id === myClientId) return;
      if (!isSharingRef.current || !localStreamRef.current) return;

      const peerName = member.info?.userName || 'Peer';
      const pc = createConnectionToPeer(member.id, peerName, channel);
      addLocalStreamToPeer(pc).then(async () => {
        try {
          const offer = await createOffer(pc);
          channel.trigger('client-webrtc-offer', {
            from: myClientId,
            to: member.id,
            fromName: myUserName,
            offer,
          });
        } catch (err) {
          console.error('[ScreenShare] Failed to offer to new member:', err);
        }
      });
    };

    // When a member leaves, clean up their connection
    const handleMemberRemoved = (member: { id: string }) => {
      closePeerConnection(member.id);
    };

    channel.bind('client-webrtc-offer', handleOffer);
    channel.bind('client-webrtc-answer', handleAnswer);
    channel.bind('client-webrtc-ice', handleIce);
    channel.bind('pusher:member_added', handleMemberAdded);
    channel.bind('pusher:member_removed', handleMemberRemoved);

    return () => {
      channel.unbind('client-webrtc-offer', handleOffer);
      channel.unbind('client-webrtc-answer', handleAnswer);
      channel.unbind('client-webrtc-ice', handleIce);
      // Note: member_added/removed unbinding is handled by useRoom cleanup
    };
  }, [
    pusher,
    roomId,
    myClientId,
    myUserName,
    createConnectionToPeer,
    addLocalStreamToPeer,
    closePeerConnection,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const stream = localStreamRef.current;
      if (stream) {
        for (const track of stream.getTracks()) {
          track.stop();
        }
      }
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
    };
  }, []);

  return {
    isSharing,
    localStream,
    remoteStreams,
    startSharing,
    stopSharing,
    freezeAllStreams,
  };
}
