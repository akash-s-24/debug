'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Room, CodingStats } from '@/types';
import { BattleControls } from './BattleControls';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface RemoteStreamEntry {
  stream: MediaStream;
  userName: string;
}

interface ScreenShareHostViewProps {
  room: Room;
  remoteStreams: Map<string, RemoteStreamEntry>;
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  onAction: (action: 'start' | 'pause' | 'resume' | 'end') => void;
}

function HostVideoTile({
  stream,
  userName,
  className = '',
}: {
  stream: MediaStream;
  userName: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative bg-void border border-border-subtle rounded-lg overflow-hidden group transition-all duration-200 hover:border-brand-primary/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] ${className}`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-contain bg-black"
      />

      {/* Top-right controls (visible on hover) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <button
          onClick={toggleFullscreen}
          className="bg-black/60 backdrop-blur text-white p-1.5 rounded border border-white/10 hover:bg-black/80 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          <span className="material-symbols-outlined text-[16px]">
            {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
          </span>
        </button>
      </div>

      {/* Bottom label bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
            <span className="font-mono text-xs text-white/90 uppercase tracking-wider font-bold">
              {userName}
            </span>
          </div>
          <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">Live</span>
        </div>
      </div>
    </div>
  );
}

export function ScreenShareHostView({
  room,
  remoteStreams,
  timeRemaining,
  isRunning,
  isPaused,
  onAction,
}: ScreenShareHostViewProps) {
  const [layout, setLayout] = useState<'side-by-side' | 'focus-left' | 'focus-right' | 'vertical' | 'quad'>('side-by-side');
  const [showManagePlayers, setShowManagePlayers] = useState(false);
  const [kickLoading, setKickLoading] = useState<string | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/battle/${room.code}?role=contestant`;
    navigator.clipboard.writeText(url);
  };

  const handleKick = async (targetClientId: string) => {
    setKickLoading(targetClientId);
    try {
      await fetch('/api/rooms/kick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, hostClientId: room.host.clientId, targetClientId }),
      });
    } catch (err) {
      console.error('Failed to kick player:', err);
    } finally {
      setKickLoading(null);
    }
  };

  // Grid layout calculation
  const streamCount = remoteStreams.size;
  const gridCols =
    streamCount === 0
      ? '1fr'
      : streamCount === 1
        ? '1fr'
        : streamCount === 2
          ? 'repeat(2, 1fr)'
          : streamCount <= 4
            ? 'repeat(2, 1fr)'
            : 'repeat(auto-fit, minmax(400px, 1fr))';

  return (
    <div className="flex-1 flex flex-col min-h-0 p-4 gap-4 bg-transparent">
      {/* Top Bar: Room Info & Controls */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between bg-void border border-border-subtle rounded-sm shadow-md p-4 gap-4 hud-bracket">
        <div className="w-full xl:w-auto">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-brand-primary">screen_share</span>
            <h2 className="text-2xl font-display text-text-primary tracking-tight">Host Dashboard</h2>
            <span className="text-[10px] bg-brand-secondary/10 text-brand-secondary px-2 py-0.5 rounded border border-brand-secondary/30 font-mono uppercase tracking-widest">
              Screen Share
            </span>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-4 mt-2">
            <div className="text-text-secondary text-sm flex items-center gap-2 font-mono">
              Room Code: <span className="text-brand-accent font-mono bg-brand-accent/5 px-2 py-0.5 border border-brand-accent/20">{room.code}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCopyCode} className="text-[11px] uppercase tracking-widest font-mono text-text-muted hover:text-brand-primary transition-colors bg-abyss hover:bg-brand-primary/10 px-2 py-1 border border-border-subtle hover:border-brand-primary">
                COPY_CODE
              </button>
              <button onClick={handleCopyLink} className="text-[11px] uppercase tracking-widest font-mono text-text-muted hover:text-brand-primary transition-colors bg-abyss hover:bg-brand-primary/10 px-2 py-1 border border-border-subtle hover:border-brand-primary">
                COPY_LINK
              </button>
              <button onClick={() => setShowManagePlayers(true)} className="text-[11px] uppercase tracking-widest font-mono text-text-muted hover:text-brand-primary transition-colors bg-abyss hover:bg-brand-primary/10 px-2 py-1 border border-border-subtle hover:border-brand-primary">
                MANAGE
              </button>
            </div>
          </div>
        </div>

        <div className="w-full xl:w-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center border-t border-border-subtle xl:border-none pt-4 xl:pt-0">
          <div className="text-left sm:text-center shrink-0">
            <div className="text-[10px] text-text-muted font-mono uppercase tracking-widest mb-1">Status</div>
            <div className="text-brand-secondary font-mono uppercase text-xs tracking-widest bg-transparent px-3 py-1 border border-border-subtle">
              {room.status === 'battle' ? (isPaused ? 'Paused' : 'Live') : room.status}
            </div>
          </div>
          
          <div className="hidden sm:block h-8 w-px bg-border-subtle mx-2" />

          <div className="text-left sm:text-center shrink-0">
            <div className="text-[10px] text-text-muted font-mono uppercase tracking-widest mb-1">Streams</div>
            <div className="text-brand-primary font-mono text-xs tracking-widest bg-transparent px-3 py-1 border border-border-subtle">
              {streamCount} / {room.contestants.length}
            </div>
          </div>

          <div className="hidden sm:block h-8 w-px bg-border-subtle mx-2" />

          <div className="w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            <BattleControls
              roomId={room.id}
              isHost={true}
              status={room.status}
              onStartBattle={() => onAction(room.status === 'paused' ? 'resume' : 'start')}
              onPauseBattle={() => onAction('pause')}
              onEndBattle={() => onAction('end')}
              onChangeLayout={setLayout}
            />
          </div>
        </div>
      </div>

      {/* Challenge Description (collapsible) */}
      {room.config.challengeDescription && (
        <div className="bg-void border border-border-subtle rounded-sm p-4 hud-bracket">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-brand-primary text-[18px]">assignment</span>
            <h3 className="font-display text-lg text-text-primary tracking-tight">{room.config.challenge}</h3>
          </div>
          <p className="font-mono text-xs text-text-secondary whitespace-pre-wrap">{room.config.challengeDescription}</p>
        </div>
      )}

      {/* Participant Screens Grid */}
      <div className="flex-1 min-h-0">
        {streamCount === 0 ? (
          <div className="h-full flex flex-col items-center justify-center bg-void border border-border-subtle shadow-inner p-8 hud-bracket">
            <div className="font-mono text-[11px] text-warn-amber mb-4 animate-pulse uppercase tracking-widest">
              [ Awaiting Screen Shares ]
            </div>
            <span className="material-symbols-outlined text-5xl text-text-muted mb-4">screen_share</span>
            <h3 className="text-3xl font-display text-text-primary tracking-tight">No Screens Shared Yet</h3>
            <p className="text-text-secondary mt-2 font-mono text-xs before:content-['//'] before:mr-2 before:text-text-muted">
              {room.status === 'battle'
                ? 'Participants need to click "Share Screen" to begin streaming.'
                : 'Start the battle first, then participants can share their screens.'}
            </p>
          </div>
        ) : (
          <div
            className="grid gap-3 h-full"
            style={{ gridTemplateColumns: gridCols }}
          >
            {Array.from(remoteStreams.entries()).map(([peerId, { stream, userName }]) => (
              <HostVideoTile
                key={peerId}
                stream={stream}
                userName={userName}
                className="min-h-[200px]"
              />
            ))}
          </div>
        )}
      </div>

      {/* Manage Players Modal */}
      <Modal isOpen={showManagePlayers} onClose={() => setShowManagePlayers(false)} title="Manage Players">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {room.contestants.filter(u => u.id !== room.host.id).length === 0 && room.viewers.length === 0 ? (
            <p className="text-text-secondary font-mono text-center py-4">No other players in the room.</p>
          ) : (
            <>
              {room.contestants.filter(u => u.id !== room.host.id).length > 0 && (
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-text-muted mb-2 border-b border-border-subtle pb-1">Contestants</h3>
                  <div className="space-y-2">
                    {room.contestants.filter(u => u.id !== room.host.id).map(user => {
                      const hasStream = user.clientId ? remoteStreams.has(user.clientId) : false;
                      return (
                        <div key={user.id} className="flex items-center justify-between bg-surface p-3 rounded border border-border-subtle">
                          <div className="flex items-center gap-3">
                            <span className={`w-2.5 h-2.5 rounded-full ${hasStream ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                            <div>
                              <span className="text-text-primary font-mono">{user.name}</span>
                              <span className="text-[10px] text-text-muted ml-2 font-mono">
                                {hasStream ? 'Sharing' : 'Not Sharing'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => user.clientId && handleKick(user.clientId)}
                            disabled={kickLoading === user.clientId}
                            className="px-3 py-1 bg-danger-red/10 text-danger-red border border-danger-red/30 rounded font-heading text-sm uppercase hover:bg-danger-red hover:text-void transition-colors disabled:opacity-50"
                          >
                            {kickLoading === user.clientId ? 'KICKING...' : 'KICK'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {room.viewers.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-text-muted mb-2 border-b border-border-subtle pb-1">Viewers</h3>
                  <div className="space-y-2">
                    {room.viewers.map(user => (
                      <div key={user.id} className="flex items-center justify-between bg-surface p-3 rounded border border-border-subtle">
                        <span className="text-text-primary font-mono">{user.name}</span>
                        <button
                          onClick={() => user.clientId && handleKick(user.clientId)}
                          disabled={kickLoading === user.clientId}
                          className="px-3 py-1 bg-danger-red/10 text-danger-red border border-danger-red/30 rounded font-heading text-sm uppercase hover:bg-danger-red hover:text-void transition-colors disabled:opacity-50"
                        >
                          {kickLoading === user.clientId ? 'KICKING...' : 'KICK'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
