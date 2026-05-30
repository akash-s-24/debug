'use client';

import React, { useState } from 'react';
import { Room, CodingStats, LayoutMode } from '@/types';
import { BattleControls } from './BattleControls';
import { DualView } from '../arena/DualView';
import { StreamPanel } from './StreamPanel';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

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

  const [showManagePlayers, setShowManagePlayers] = useState(false);
  const [kickLoading, setKickLoading] = useState<string | null>(null);

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

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-black/20 p-4 gap-4">
      {/* Top Bar: Room Info & Controls */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 gap-4">
        <div className="w-full xl:w-auto">
          <h2 className="text-lg md:text-xl font-display text-neon-cyan tracking-widest uppercase text-glow-cyan">Host Dashboard</h2>
          <div className="flex flex-wrap gap-2 md:gap-4 mt-2">
            <div className="text-text-secondary text-sm flex items-center gap-2">
              Room Code: <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">{room.code}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCopyCode} className="text-xs text-neon-violet hover:text-white transition-colors bg-neon-violet/10 px-2 py-1 rounded border border-neon-violet/30">
                Copy Code
              </button>
              <button onClick={handleCopyLink} className="text-xs text-neon-magenta hover:text-white transition-colors bg-neon-magenta/10 px-2 py-1 rounded border border-neon-magenta/30">
                Copy Invite Link
              </button>
              <button onClick={() => setShowManagePlayers(true)} className="text-xs text-neon-cyan hover:text-white transition-colors bg-neon-cyan/10 px-2 py-1 rounded border border-neon-cyan/30">
                Manage Players
              </button>
            </div>
          </div>
        </div>

        <div className="w-full xl:w-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center border-t border-white/10 xl:border-none pt-4 xl:pt-0">
          <div className="text-left sm:text-center shrink-0">
            <div className="text-[10px] text-text-secondary uppercase tracking-widest mb-1">Status</div>
            <div className="text-white font-mono uppercase text-sm bg-black/50 px-3 py-1 rounded-full border border-white/10">
              {room.status === 'battle' ? (isPaused ? 'Paused' : 'Live') : room.status}
            </div>
          </div>
          
          <div className="hidden sm:block h-8 w-px bg-white/10 mx-2" />

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
      {/* Manage Players Modal */}
      <Modal isOpen={showManagePlayers} onClose={() => setShowManagePlayers(false)} title="Manage Players">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {room.contestants.filter(u => u.id !== room.host.id).length === 0 && room.viewers.length === 0 ? (
            <p className="text-text-secondary text-center py-4">No other players in the room.</p>
          ) : (
            <>
              {room.contestants.filter(u => u.id !== room.host.id).length > 0 && (
                <div>
                  <h3 className="text-xs font-display uppercase tracking-widest text-text-muted mb-2 border-b border-white/10 pb-1">Contestants</h3>
                  <div className="space-y-2">
                    {room.contestants.filter(u => u.id !== room.host.id).map(user => (
                      <div key={user.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5">
                        <div>
                          <span className="text-white font-medium">{user.name}</span>
                          <span className="text-xs text-text-muted ml-2 font-mono">[{user.clientId}]</span>
                        </div>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => user.clientId && handleKick(user.clientId)}
                          disabled={kickLoading === user.clientId}
                        >
                          {kickLoading === user.clientId ? 'KICKING...' : 'KICK'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {room.viewers.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-display uppercase tracking-widest text-text-muted mb-2 border-b border-white/10 pb-1">Viewers</h3>
                  <div className="space-y-2">
                    {room.viewers.map(user => (
                      <div key={user.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5">
                        <div>
                          <span className="text-white font-medium">{user.name}</span>
                          <span className="text-xs text-text-muted ml-2 font-mono">[{user.clientId}]</span>
                        </div>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => user.clientId && handleKick(user.clientId)}
                          disabled={kickLoading === user.clientId}
                        >
                          {kickLoading === user.clientId ? 'KICKING...' : 'KICK'}
                        </Button>
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
