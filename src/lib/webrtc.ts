'use client';

import { ICE_SERVERS } from '@/lib/constants';

/**
 * Create a new RTCPeerConnection with configured ICE servers.
 */
export function createPeerConnection(
  config?: Partial<RTCConfiguration>,
): RTCPeerConnection {
  const rtcConfig: RTCConfiguration = {
    iceServers: ICE_SERVERS,
    iceCandidatePoolSize: 10,
    ...config,
  };

  return new RTCPeerConnection(rtcConfig);
}

/**
 * Create an SDP offer and set it as local description.
 */
export async function createOffer(
  pc: RTCPeerConnection,
): Promise<RTCSessionDescriptionInit> {
  const offer = await pc.createOffer({
    offerToReceiveAudio: false,
    offerToReceiveVideo: true,
  });
  await pc.setLocalDescription(offer);
  return offer;
}

/**
 * Accept an SDP offer, set remote description, create and set answer.
 */
export async function createAnswer(
  pc: RTCPeerConnection,
  offer: RTCSessionDescriptionInit,
): Promise<RTCSessionDescriptionInit> {
  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  return answer;
}

/**
 * Safely add an ICE candidate to the peer connection.
 * Silently ignores errors from candidates arriving before remote description is set.
 */
export async function addIceCandidate(
  pc: RTCPeerConnection,
  candidate: RTCIceCandidateInit,
): Promise<void> {
  try {
    if (pc.remoteDescription) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  } catch (err) {
    // Non-fatal: candidates can arrive before remote description
    console.warn('[WebRTC] Failed to add ICE candidate:', err);
  }
}

/**
 * Get recommended display media constraints for screen sharing.
 */
export function getMediaConstraints(): DisplayMediaStreamOptions {
  return {
    video: {
      width: { ideal: 1920, max: 1920 },
      height: { ideal: 1080, max: 1080 },
      frameRate: { ideal: 30, max: 30 },
    },
    audio: false,
  };
}

/**
 * Set adaptive bitrate on an RTCRtpSender for video.
 * Adjusts maxBitrate based on quality level.
 */
export async function setAdaptiveBitrate(
  sender: RTCRtpSender,
  quality: 'low' | 'medium' | 'high',
): Promise<void> {
  const bitrateMap: Record<string, number> = {
    low: 500_000,     // 500 Kbps
    medium: 1_500_000, // 1.5 Mbps
    high: 4_000_000,   // 4 Mbps
  };

  const params = sender.getParameters();
  if (!params.encodings || params.encodings.length === 0) {
    params.encodings = [{}];
  }

  params.encodings[0].maxBitrate = bitrateMap[quality];

  await sender.setParameters(params);
}

/**
 * Get the connection state summary for a peer connection.
 */
export function getConnectionState(pc: RTCPeerConnection): {
  iceState: RTCIceConnectionState;
  connectionState: RTCPeerConnectionState;
  signalingState: RTCSignalingState;
  isConnected: boolean;
} {
  return {
    iceState: pc.iceConnectionState,
    connectionState: pc.connectionState,
    signalingState: pc.signalingState,
    isConnected:
      pc.connectionState === 'connected' ||
      pc.iceConnectionState === 'connected',
  };
}
