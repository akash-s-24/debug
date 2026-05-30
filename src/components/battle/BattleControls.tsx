'use client';

import React, { useState } from 'react';
import { RoomStatus, LayoutMode } from '@/types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface BattleControlsProps {
  roomId: string;
  isHost: boolean;
  status: RoomStatus;
  onStartBattle: () => void;
  onPauseBattle: () => void;
  onEndBattle: () => void;
  onChangeLayout: (layout: LayoutMode) => void;
}

export function BattleControls({
  roomId,
  isHost,
  status,
  onStartBattle,
  onPauseBattle,
  onEndBattle,
  onChangeLayout,
}: BattleControlsProps) {
  const [selectedLayout, setSelectedLayout] = useState<LayoutMode>('side-by-side');

  if (!isHost) return null;

  const handleLayoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLayout = e.target.value as LayoutMode;
    setSelectedLayout(newLayout);
    onChangeLayout(newLayout);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full">
      <div className="flex flex-wrap items-center gap-2">
        {status === 'waiting' || status === 'ready' || status === 'finished' ? (
          <Button variant="primary" size="sm" onClick={onStartBattle}>
            {status === 'finished' ? 'RESTART BATTLE' : 'START BATTLE'}
          </Button>
        ) : (
          <Button variant="danger" size="sm" onClick={onEndBattle}>
            END BATTLE
          </Button>
        )}

        {status === 'battle' && (
          <Button variant="ghost" size="sm" onClick={onPauseBattle}>
            PAUSE
          </Button>
        )}
        
        {status === 'paused' && (
          <Button variant="neon" size="sm" onClick={onStartBattle}>
            RESUME
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 ml-4">
        <label className="text-text-secondary text-xs font-display uppercase tracking-widest">Layout:</label>
        <select 
          value={selectedLayout} 
          onChange={handleLayoutChange}
          className="bg-black/40 border border-white/10 text-white px-2 py-1 rounded focus:outline-none focus:border-neon-cyan font-mono text-sm"
        >
          <option value="side-by-side">Side by Side</option>
          <option value="focus-left">Focus Left</option>
          <option value="focus-right">Focus Right</option>
          <option value="vertical">Vertical</option>
        </select>
      </div>
    </div>
  );
}
