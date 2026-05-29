'use client';

import React, { useState } from 'react';
import { Room, CodingStats, LayoutMode } from '@/types';
import { BattleControls } from './BattleControls';
import { DualView } from '../arena/DualView';
import { StreamPanel } from './StreamPanel';
import { Button } from '../ui/Button';

interface HostDashboardProps {
  room: Room;
  stats: Map<string, CodingStats>;
  remoteStreams: Map<string, MediaStream>;
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  onAction: (action: 'start' | 'pause' | 'resume' | 'end') => void;
}

export function HostDashboard({
  room,
  stats,
  remoteStreams,
  timeRemaining,
  isRunning,
  isPaused,
  onAction
}: HostDashboardProps) {
  const [layout, setLayout] = useState<LayoutMode>('side-by-side');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/battle/${room.code}?role=contestant`;
    navigator.clipboard.writeText(url);
  };

  // Up to 4 contestants supported visually for now
  const contestants = room.contestants;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-black/20 p-4 gap-4">
      {/* Top Bar: Room Info & Controls */}
      <div className="flex items-center justify-between bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
        <div>
          <h2 className="text-xl font-display text-neon-cyan tracking-widest uppercase text-glow-cyan">Host Dashboard</h2>
          <div className="flex gap-4 mt-2">
            <div className="text-text-secondary text-sm">
              Room Code: <span className="text-white font-mono">{room.code}</span>
            </div>
            <button onClick={handleCopyCode} className="text-xs text-neon-violet hover:text-white transition-colors">
              [Copy Code]
            </button>
            <button onClick={handleCopyLink} className="text-xs text-neon-magenta hover:text-white transition-colors">
              [Copy Invite Link]
            </button>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="text-center">
            <div className="text-xs text-text-secondary uppercase tracking-widest mb-1">Status</div>
            <div className="text-white font-mono uppercase">
              {room.status === 'battle' ? (isPaused ? 'Paused' : 'Live') : room.status}
            </div>
          </div>
          
          <div className="h-8 w-px bg-white/10 mx-2" />

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

      {/* Contestants Grid */}
      <div className="flex-1 min-h-0 flex flex-col gap-4">
        {contestants.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white/5 backdrop-blur border border-white/10 rounded-xl p-8">
            <div className="text-4xl mb-4 animate-bounce">⏳</div>
            <h3 className="text-xl font-display text-text-primary tracking-widest">Waiting for contestants...</h3>
            <p className="text-text-secondary mt-2">Share the room code or invite link above to get started.</p>
          </div>
        ) : contestants.length === 2 ? (
          <DualView
            stream1={contestants[0].clientId ? remoteStreams.get(contestants[0].clientId) || null : null}
            stream2={contestants[1].clientId ? remoteStreams.get(contestants[1].clientId) || null : null}
            user1={contestants[0]}
            user2={contestants[1]}
            stats1={stats.get(contestants[0].id) || null}
            stats2={stats.get(contestants[1].id) || null}
            layout={layout}
            challenge={room.config.challenge}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full w-full">
            {contestants.map((user) => {
              const stream = user.clientId ? remoteStreams.get(user.clientId) : undefined;
              const userStats = stats.get(user.id);
              return (
                <div key={user.id} className="relative bg-black border border-white/10 rounded-xl overflow-hidden flex flex-col">
                  <StreamPanel
                    stream={stream || null}
                    userName={user.name}
                    isLocal={false}
                    isActive={userStats?.momentum === 'high' || userStats?.momentum === 'extreme'}
                    color="magenta"
                    stats={userStats || null}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
