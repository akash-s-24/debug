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

interface UseWebRTCReturn {
  /** Call this to broadcast a local stream to a specific peer */
  addStream: (peerId: string, stream: MediaStream) => void;
  /** Call this to tear down a peer connection */
  removeStream: (peerId: string) => void;
  /** Reactive map of remote streams keyed by clientId — updates trigger re-renders */
  remoteStreams: Map<string, MediaStream>;
}

/**
 * Manages WebRTC peer connections for screen sharing.
 * 
 * IMPORTANT: `channelRoomId` must be the actual room ID used in the Pusher
 * channel name (`presence-room-{id}`), NOT the URL slug / room code.
 */
export function useWebRTC(
  pusher: PusherClient | null,
  channelRoomId: string | null,
): UseWebRTCReturn {
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<PresenceChannel | null>(null);
  const iceCandidateQueue = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  // ★ KEY FIX: remoteStreams is React STATE so changes trigger re-renders
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());

  const myClientId = typeof window !== 'undefined' ? getClientId() : '';
  // Store in a ref so callbacks always have the latest value
  const roomIdRef = useRef(channelRoomId);
  roomIdRef.current = channelRoomId;

  // ── Helper: send signaling data via the server API route ─────────────
  const sendSignal = useCallback((event: string, data: unknown) => {
    const rid = roomIdRef.current;
    if (!rid) {
      console.warn('[WebRTC] sendSignal skipped — no roomId');
      return;
    }
    console.log(`[WebRTC] Sending signal: ${event}`, data);
    fetch('/api/webrtc/signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: rid, event, data }),
    }).catch((err) => console.error('[WebRTC] Signal send failed:', err));
  }, []);

  // ── Helper: flush queued ICE candidates after remote description is set
  const flushIceCandidates = useCallback(async (peerId: string, pc: RTCPeerConnection) => {
    const queued = iceCandidateQueue.current.get(peerId);
    if (queued && queued.length > 0) {
      console.log(`[WebRTC] Flushing ${queued.length} buffered ICE candidates for ${peerId}`);
      for (const candidate of queued) {
        await addIceCandidate(pc, candidate);
      }
      iceCandidateQueue.current.delete(peerId);
    }
  }, []);

  // ── Create / get a peer connection for a given peer ──────────────────
  const getOrCreatePC = useCallback(
    (peerId: string, forceNew = false): RTCPeerConnection => {
      if (!forceNew) {
        const existing = peerConnections.current.get(peerId);
        if (existing && existing.connectionState !== 'closed' && existing.connectionState !== 'failed') {
          return existing;
        }
      }

      // Close existing if any
      const old = peerConnections.current.get(peerId);
      if (old) {
        old.close();
      }

      console.log(`[WebRTC] Creating new PeerConnection for peer: ${peerId}`);
      const pc = createPeerConnection();
      peerConnections.current.set(peerId, pc);

      // Add local tracks if we have a local stream (participant sharing)
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
        console.log(`[WebRTC] Added ${localStreamRef.current.getTracks().length} local tracks to PC for ${peerId}`);
      }

      // ★ KEY FIX: ontrack updates React state, triggering re-render
      pc.ontrack = (event) => {
        console.log(`[WebRTC] ★ ontrack fired from peer: ${peerId}, streams: ${event.streams.length}`);
        const [stream] = event.streams;
        if (stream) {
          console.log(`[WebRTC] ★ Received remote stream from ${peerId}: ${stream.id}, tracks: ${stream.getTracks().length}`);
          setRemoteStreams((prev) => {
            const next = new Map(prev);
            next.set(peerId, stream);
            return next;
          });

          // Also listen for the stream ending
          stream.onremovetrack = () => {
            console.log(`[WebRTC] Remote stream track removed from ${peerId}`);
            if (stream.getTracks().length === 0) {
              setRemoteStreams((prev) => {
                const next = new Map(prev);
                next.delete(peerId);
                return next;
              });
            }
          };
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal('server-signal-ice', {
            from: myClientId,
            to: peerId,
            candidate: event.candidate.toJSON(),
          });
        }
      };

      // Track connection state
      pc.onconnectionstatechange = () => {
        console.log(`[WebRTC] Connection state for ${peerId}: ${pc.connectionState}`);
        if (pc.connectionState === 'failed') {
          console.warn(`[WebRTC] Connection to ${peerId} failed, restarting ICE`);
          pc.restartIce();
        }
        if (pc.connectionState === 'closed') {
          peerConnections.current.delete(peerId);
          setRemoteStreams((prev) => {
            const next = new Map(prev);
            next.delete(peerId);
            return next;
          });
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log(`[WebRTC] ICE state for ${peerId}: ${pc.iceConnectionState}`);
      };

      return pc;
    },
    [myClientId, sendSignal],
  );

  // ── Handle incoming signaling events ─────────────────────────────────
  useEffect(() => {
    if (!pusher || !channelRoomId) return;

    const channelName = `presence-room-${channelRoomId}`;
    const channel = pusher.channel(channelName) as PresenceChannel | undefined;

    if (!channel) {
      console.warn(`[WebRTC] Channel ${channelName} not found — signaling won't work`);
      return;
    }
    channelRef.current = channel;
    console.log(`[WebRTC] Binding signaling events on channel: ${channelName}`);

    const handleOffer = async (data: {
      from: string;
      to: string;
      sdp: RTCSessionDescriptionInit;
    }) => {
      if (data.to !== myClientId) return;
      console.log(`[WebRTC] ◀ Received OFFER from ${data.from}`);

      const pc = getOrCreatePC(data.from, true);
      const answer = await createAnswer(pc, data.sdp);

      // Flush any ICE candidates that arrived before the remote description
      await flushIceCandidates(data.from, pc);

      console.log(`[WebRTC] ▶ Sending ANSWER to ${data.from}`);
      sendSignal('server-signal-answer', {
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
      console.log(`[WebRTC] ◀ Received ANSWER from ${data.from}`);

      const pc = peerConnections.current.get(data.from);
      if (pc && pc.signalingState === 'have-local-offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        console.log(`[WebRTC] Remote description set for ${data.from}`);

        // Flush any ICE candidates that arrived before the answer
        await flushIceCandidates(data.from, pc);
      } else {
        console.warn(`[WebRTC] Ignoring answer from ${data.from} — PC state: ${pc?.signalingState}`);
      }
    };

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
        // ★ KEY FIX: Buffer ICE candidates that arrive before remote description
        console.log(`[WebRTC] Buffering ICE candidate from ${data.from} (no remote description yet)`);
        if (!iceCandidateQueue.current.has(data.from)) {
          iceCandidateQueue.current.set(data.from, []);
        }
        iceCandidateQueue.current.get(data.from)!.push(data.candidate);
      }
    };

    channel.bind('server-signal-offer', handleOffer);
    channel.bind('server-signal-answer', handleAnswer);
    channel.bind('server-signal-ice', handleIce);

    return () => {
      channel.unbind('server-signal-offer', handleOffer);
      channel.unbind('server-signal-answer', handleAnswer);
      channel.unbind('server-signal-ice', handleIce);
      channelRef.current = null;
    };
  }, [pusher, channelRoomId, myClientId, getOrCreatePC, sendSignal, flushIceCandidates]);

  // Cleanup all peer connections on unmount
  useEffect(() => {
    return () => {
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
      iceCandidateQueue.current.clear();
    };
  }, []);

  // ── Public API ───────────────────────────────────────────────────────

  const addStream = useCallback(
    (peerId: string, stream: MediaStream) => {
      console.log(`[WebRTC] ▶ addStream called for peer: ${peerId}, tracks: ${stream.getTracks().length}`);
      localStreamRef.current = stream;
      const pc = getOrCreatePC(peerId, true);

      stream.getTracks().forEach((track) => {
        const senders = pc.getSenders();
        const existing = senders.find((s) => s.track?.id === track.id);
        if (!existing) {
          pc.addTrack(track, stream);
          console.log(`[WebRTC] Added track ${track.kind} to PC for ${peerId}`);
        }
      });

      // Create and send offer
      createOffer(pc).then((offer) => {
        console.log(`[WebRTC] ▶ Sending OFFER to ${peerId}`);
        sendSignal('server-signal-offer', {
          from: myClientId,
          to: peerId,
          sdp: offer,
        });
      }).catch((err) => console.error('[WebRTC] Failed to create offer:', err));
    },
    [myClientId, getOrCreatePC, sendSignal],
  );

  const removeStream = useCallback((peerId: string) => {
    console.log(`[WebRTC] removeStream called for peer: ${peerId}`);
    const pc = peerConnections.current.get(peerId);
    if (pc) {
      pc.close();
      peerConnections.current.delete(peerId);
      setRemoteStreams((prev) => {
        const next = new Map(prev);
        next.delete(peerId);
        return next;
      });
    }
  }, []);

  return {
    addStream,
    removeStream,
    remoteStreams,
  };
}
