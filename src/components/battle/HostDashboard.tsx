'use client';

import React, { useState } from 'react';
import { Room, CodingStats, LayoutMode } from '@/types';
import { BattleControls } from './BattleControls';
import { DualView } from '../arena/DualView';
import { EditorPanel } from './EditorPanel';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface HostDashboardProps {
  room: Room;
  stats: Map<string, CodingStats>;
  remoteCodes: Map<string, string>;
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  onAction: (action: 'start' | 'pause' | 'resume' | 'end') => void;
}

export function HostDashboard({
  room,
  stats,
  remoteCodes,
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
    <div className="flex-1 flex flex-col min-h-0 p-4 gap-4 bg-transparent">
      {/* Top Bar: Room Info & Controls */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between bg-void border border-border-subtle rounded-sm shadow-md p-4 gap-4 hud-bracket">
        <div className="w-full xl:w-auto">
          <h2 className="text-2xl font-display text-text-primary tracking-tight">Host Dashboard</h2>
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
          <div className="flex-1 flex flex-col items-center justify-center bg-void border border-border-subtle shadow-inner p-8 hud-bracket">
            <div className="font-mono text-[11px] text-warn-amber mb-4 animate-pulse uppercase tracking-widest">
              [ Awaiting Connection ]
            </div>
            <h3 className="text-3xl font-display text-text-primary tracking-tight">Arena is open.</h3>
            <p className="text-text-secondary mt-2 font-mono text-xs before:content-['//'] before:mr-2 before:text-text-muted">Share the room code or invite link above to get started.</p>
          </div>
        ) : contestants.length === 2 ? (
          <DualView
            code1={remoteCodes.get(contestants[0].id) || '// Waiting for code...'}
            code2={remoteCodes.get(contestants[1].id) || '// Waiting for code...'}
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
              const code = remoteCodes.get(user.id) || '// Waiting for code...';
              const userStats = stats.get(user.id);
              return (
                <div key={user.id} className="relative h-full">
                  <EditorPanel
                    code={code}
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
            <p className="text-text-secondary font-mono text-center py-4">No other players in the room.</p>
          ) : (
            <>
              {room.contestants.filter(u => u.id !== room.host.id).length > 0 && (
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-text-muted mb-2 border-b border-border-subtle pb-1">Contestants</h3>
                  <div className="space-y-2">
                    {room.contestants.filter(u => u.id !== room.host.id).map(user => (
                      <div key={user.id} className="flex items-center justify-between bg-surface p-3 rounded border border-border-subtle">
                        <div>
                          <span className="text-text-primary font-mono">{user.name}</span>
                          <span className="text-xs text-text-muted ml-2 font-mono">[{user.clientId}]</span>
                        </div>
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
              
              {room.viewers.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-text-muted mb-2 border-b border-border-subtle pb-1">Viewers</h3>
                  <div className="space-y-2">
                    {room.viewers.map(user => (
                      <div key={user.id} className="flex items-center justify-between bg-surface p-3 rounded border border-border-subtle">
                        <div>
                          <span className="text-text-primary font-mono">{user.name}</span>
                          <span className="text-xs text-text-muted ml-2 font-mono">[{user.clientId}]</span>
                        </div>
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
