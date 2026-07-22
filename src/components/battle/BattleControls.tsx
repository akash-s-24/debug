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
          <Button 
            variant="primary"
            onClick={onStartBattle}
          >
            {status === 'finished' ? 'RESTART_BATTLE' : 'START_BATTLE'}
          </Button>
        ) : (
          <Button 
            variant="danger"
            onClick={onEndBattle}
          >
            END_BATTLE
          </Button>
        )}

        {status === 'battle' && (
          <Button 
            variant="secondary"
            onClick={onPauseBattle}
          >
            PAUSE_BATTLE
          </Button>
        )}
        
        {status === 'paused' && (
          <Button 
            variant="primary"
            onClick={onStartBattle}
          >
            RESUME_BATTLE
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <label className="text-text-muted text-xs font-mono uppercase tracking-widest">Layout:</label>
        <select 
          value={selectedLayout} 
          onChange={handleLayoutChange}
          className="bg-abyss border border-border-subtle text-text-primary px-3 py-1.5 rounded focus:outline-none focus:border-neon-cyan font-mono text-xs transition-colors appearance-none"
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
