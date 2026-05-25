'use client';

import React from 'react';
import { Room, CodingStats } from '@/types';
import { Timer } from '../ui/Timer';

interface ArenaOverlayProps {
  room: Room;
  stats1: CodingStats | null;
  stats2: CodingStats | null;
  timeRemaining: number;
  isRunning: boolean;
}

export function ArenaOverlay({ room, stats1, stats2, timeRemaining, isRunning }: ArenaOverlayProps) {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4">
      {/* Top Bar */}
      <div className="w-full flex justify-between items-start">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 px-6 py-3 rounded-br-2xl [clip-path:polygon(0_0,100%_0,100%_calc(100%-15px),calc(100%-15px)_100%,0_100%)] pointer-events-auto shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <div className="text-neon-cyan font-mono text-xs mb-1 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-red animate-pulse" /> LIVE
            <span className="text-text-muted ml-2">{room.config.duelType.replace('-', ' ')}</span>
          </div>
          <h1 className="text-white font-display text-2xl tracking-wide">{room.config.challenge}</h1>
        </div>

        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-8 py-4 rounded-bl-2xl [clip-path:polygon(0_0,100%_0,100%_100%,15px_100%,0_calc(100%-15px))] pointer-events-auto">
          <Timer timeRemaining={timeRemaining} isRunning={isRunning} isPaused={room.status === 'paused'} size="lg" />
        </div>
      </div>

      {/* Bottom Bar (Optional if stats are handled in StreamPanels) */}
      <div className="w-full flex justify-center">
        {/* We can put a unified stats bar here or keep it inside StreamPanels */}
      </div>
    </div>
  );
}
