'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface RemoteStreamEntry {
  stream: MediaStream;
  userName: string;
}

interface ScreenSharePanelProps {
  challengeTitle: string;
  challengeDescription?: string;
  language: string;
  isSharing: boolean;
  localStream: MediaStream | null;
  remoteStreams: Map<string, RemoteStreamEntry>;
  onStartSharing: () => void;
  onStopSharing: () => void;
  timeRemaining: number;
  formatTime: (s?: number) => string;
  isRunning: boolean;
  isBattleStarted: boolean;
}

function VideoPlayer({
  stream,
  label,
  isSelf = false,
  className = '',
}: {
  stream: MediaStream;
  label: string;
  isSelf?: boolean;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video && stream) {
      video.srcObject = stream;
    }
    return () => {
      if (video) {
        video.srcObject = null;
      }
    };
  }, [stream]);

  return (
    <div className={`relative bg-void border border-border-subtle rounded-lg overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isSelf}
        className="w-full h-full object-contain bg-black"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-mono text-xs text-white/90 uppercase tracking-wider">
            {label}
            {isSelf && ' (You)'}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ScreenSharePanel({
  challengeTitle,
  challengeDescription,
  language,
  isSharing,
  localStream,
  remoteStreams,
  onStartSharing,
  onStopSharing,
  timeRemaining,
  formatTime,
  isRunning,
  isBattleStarted,
}: ScreenSharePanelProps) {
  const isMobile = typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);

  return (
    <div className="flex-1 flex flex-col gap-4 p-4 min-h-0 overflow-y-auto">
      {/* Challenge Briefing Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-void border border-border-subtle rounded-lg p-6 hud-bracket relative overflow-hidden"
      >
        <div className="scanline-overlay opacity-20 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-brand-primary text-2xl">assignment</span>
            <h2 className="font-display text-2xl md:text-3xl text-text-primary tracking-tight">
              {challengeTitle}
            </h2>
          </div>
          {challengeDescription && (
            <div className="bg-abyss border border-border-subtle rounded p-4 mb-4">
              <p className="font-mono text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
                {challengeDescription}
              </p>
            </div>
          )}
          <div className="flex items-center gap-4 text-xs font-mono text-text-muted uppercase tracking-widest">
            <span className="bg-brand-primary/10 text-brand-primary px-2 py-1 rounded border border-brand-primary/20">
              {language}
            </span>
            <span className="bg-surface px-2 py-1 rounded border border-border-subtle">
              Screen Share Mode
            </span>
          </div>
        </div>
      </motion.div>

      {/* Screen Share Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-void border border-border-subtle rounded-lg p-6 hud-bracket"
      >
        {isMobile ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-warn-amber text-5xl mb-4 block">devices</span>
            <h3 className="font-display text-xl text-text-primary mb-2">Desktop Required</h3>
            <p className="font-mono text-xs text-text-secondary">
              Screen sharing requires a desktop browser. Please join from a computer.
            </p>
          </div>
        ) : !isBattleStarted ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4 text-brand-primary animate-pulse">[ 🔒 ]</div>
            <h3 className="font-display text-2xl text-text-primary tracking-tight mb-2">
              Waiting for Battle
            </h3>
            <p className="font-mono text-xs text-text-secondary uppercase tracking-widest">
              The host will start the battle. Get your IDE ready.
            </p>
          </div>
        ) : isSharing ? (
          <div className="flex flex-col items-center gap-4">
            {/* Status badge */}
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-full">
              <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="font-mono text-sm text-green-400 uppercase tracking-widest font-bold">
                Sharing Your Screen
              </span>
            </div>

            {/* Self preview */}
            {localStream && (
              <VideoPlayer
                stream={localStream}
                label="Your Screen"
                isSelf
                className="w-full max-w-2xl aspect-video"
              />
            )}

            <Button
              variant="secondary"
              onClick={onStopSharing}
              className="uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-[16px] mr-2">stop_screen_share</span>
              Stop Sharing
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 py-4">
            <span className="material-symbols-outlined text-6xl text-brand-primary">
              screen_share
            </span>
            <div className="text-center">
              <h3 className="font-display text-2xl text-text-primary tracking-tight mb-2">
                Share Your Screen
              </h3>
              <p className="font-mono text-xs text-text-secondary max-w-md mx-auto">
                Open VS Code, PyCharm, or any IDE on your machine, then click below to share your screen. 
                Your screen will be visible to the host and other participants.
              </p>
            </div>

            {/* Pulsing share button */}
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(59,130,246,0.2)',
                  '0 0 40px rgba(59,130,246,0.4)',
                  '0 0 20px rgba(59,130,246,0.2)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-lg"
            >
              <Button
                size="lg"
                onClick={onStartSharing}
                className="uppercase tracking-widest text-lg px-10 py-4"
              >
                <span className="material-symbols-outlined text-[20px] mr-2">screen_share</span>
                Share Your Screen
              </Button>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Remote Streams Grid */}
      {remoteStreams.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3 px-1">
            Other Participants ({remoteStreams.size})
          </h3>
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: remoteStreams.size === 1
                ? '1fr'
                : remoteStreams.size <= 4
                  ? 'repeat(2, 1fr)'
                  : 'repeat(auto-fit, minmax(300px, 1fr))',
            }}
          >
            {Array.from(remoteStreams.entries()).map(([peerId, { stream, userName }]) => (
              <VideoPlayer
                key={peerId}
                stream={stream}
                label={userName}
                className="aspect-video"
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
