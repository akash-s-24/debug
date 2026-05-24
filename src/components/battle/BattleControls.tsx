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
    <Card variant="glass" className="w-full mt-4 p-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {status === 'waiting' || status === 'ready' || status === 'finished' ? (
          <Button variant="primary" onClick={onStartBattle}>
            {status === 'finished' ? 'RESTART BATTLE' : 'START BATTLE'}
          </Button>
        ) : (
          <Button variant="danger" onClick={onEndBattle}>
            END BATTLE
          </Button>
        )}

        {status === 'battle' && (
          <Button variant="ghost" onClick={onPauseBattle}>
            PAUSE
          </Button>
        )}
        
        {status === 'paused' && (
          <Button variant="neon" onClick={onStartBattle}>
            RESUME
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-text-secondary text-sm font-display uppercase">Layout:</label>
        <select 
          value={selectedLayout} 
          onChange={handleLayoutChange}
          className="bg-abyss border border-slate-dark text-text-primary px-3 py-1.5 rounded focus:outline-none focus:border-neon-cyan font-mono text-sm"
        >
          <option value="side-by-side">Side by Side</option>
          <option value="focus-left">Focus Left</option>
          <option value="focus-right">Focus Right</option>
          <option value="vertical">Vertical</option>
        </select>
      </div>
    </Card>
  );
}
