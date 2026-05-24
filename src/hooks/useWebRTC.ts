'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { TypedSocket } from '@/lib/socket';
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
  socket: TypedSocket | null,
  roomId: string | null,
): UseWebRTCReturn {
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreams = useRef<Map<string, MediaStream>>(new Map());
  const localStream = useRef<MediaStream | null>(null);
  const [connectionStates, setConnectionStates] = useState<Map<string, PeerState>>(
    new Map(),
  );

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

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socket && roomId) {
          socket.emit('signal:ice', {
            roomId,
            to: peerId,
            candidate: event.candidate.toJSON(),
          });
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
    [socket, roomId, updatePeerState],
  );

  // Handle incoming signaling events
  useEffect(() => {
    if (!socket || !roomId) return;

    const handleOffer = async (data: {
      from: string;
      sdp: RTCSessionDescriptionInit;
    }) => {
      const pc = setupPeerConnection(data.from);
      const answer = await createAnswer(pc, data.sdp);
      socket.emit('signal:answer', {
        roomId,
        to: data.from,
        sdp: answer,
      });
    };

    const handleAnswer = async (data: {
      from: string;
      sdp: RTCSessionDescriptionInit;
    }) => {
      const pc = peerConnections.current.get(data.from);
      if (pc && pc.signalingState === 'have-local-offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      }
    };

    const handleIce = async (data: {
      from: string;
      candidate: RTCIceCandidateInit;
    }) => {
      const pc = peerConnections.current.get(data.from);
      if (pc) {
        await addIceCandidate(pc, data.candidate);
      }
    };

    socket.on('signal:offer', handleOffer);
    socket.on('signal:answer', handleAnswer);
    socket.on('signal:ice', handleIce);

    return () => {
      socket.off('signal:offer', handleOffer);
      socket.off('signal:answer', handleAnswer);
      socket.off('signal:ice', handleIce);
    };
  }, [socket, roomId, setupPeerConnection]);

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

      // Create and send offer
      if (socket && roomId) {
        createOffer(pc).then((offer) => {
          socket.emit('signal:offer', {
            roomId,
            to: peerId,
            sdp: offer,
          });
        });
      }
    },
    [socket, roomId, setupPeerConnection],
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
