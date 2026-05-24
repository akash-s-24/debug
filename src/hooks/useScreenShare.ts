'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getMediaConstraints } from '@/lib/webrtc';

interface UseScreenShareReturn {
  startSharing: () => Promise<void>;
  stopSharing: () => void;
  localStream: MediaStream | null;
  isSharing: boolean;
  error: string | null;
}

export function useScreenShare(): UseScreenShareReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopSharing = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    setLocalStream(null);
    setIsSharing(false);
    setError(null);
  }, []);

  const startSharing = useCallback(async () => {
    try {
      setError(null);

      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints = getMediaConstraints();
      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);

      streamRef.current = stream;
      setLocalStream(stream);
      setIsSharing(true);

      // Detect when the user stops sharing via browser UI
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.addEventListener('ended', () => {
          stopSharing();
        });
      }
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Screen sharing permission denied'
          : err instanceof Error
            ? err.message
            : 'Failed to start screen sharing';

      setError(message);
      setIsSharing(false);
      setLocalStream(null);
      streamRef.current = null;
    }
  }, [stopSharing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return {
    startSharing,
    stopSharing,
    localStream,
    isSharing,
    error,
  };
}
