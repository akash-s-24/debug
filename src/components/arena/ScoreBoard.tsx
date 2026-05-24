'use client';

import React from 'react';
import { User, CodingStats } from '@/types';
import { Card } from '../ui/Card';

interface ScoreBoardProps {
  contestants: { user: User; stats: CodingStats; score: number }[];
  showDetails?: boolean;
}

export function ScoreBoard({ contestants, showDetails = true }: ScoreBoardProps) {
  if (contestants.length < 2) return null;

  const [p1, p2] = contestants;
  const isP1Leading = p1.score >= p2.score;

  return (
    <Card variant="glass" className="w-full flex flex-col p-4">
      <h3 className="text-center font-display uppercase text-text-secondary text-xs tracking-widest mb-4">Live Score</h3>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col items-start">
          <span className="text-neon-cyan font-bold text-lg">{p1.user.name}</span>
          <span className="text-3xl font-display font-black text-white">{p1.score}</span>
        </div>
        
        <div className="text-text-muted font-display italic text-sm">VS</div>
        
        <div className="flex flex-col items-end">
          <span className="text-neon-magenta font-bold text-lg">{p2.user.name}</span>
          <span className="text-3xl font-display font-black text-white">{p2.score}</span>
        </div>
      </div>

      {showDetails && (
        <div className="flex flex-col gap-3 text-xs font-mono">
          <StatComparison label="Speed (CPM)" val1={p1.stats.typingSpeed} val2={p2.stats.typingSpeed} />
          <StatComparison label="Errors" val1={p1.stats.errorCount} val2={p2.stats.errorCount} lowerIsBetter />
          <StatComparison label="Compiles" val1={p1.stats.compileCount} val2={p2.stats.compileCount} />
        </div>
      )}
    </Card>
  );
}

function StatComparison({ label, val1, val2, lowerIsBetter = false }: { label: string, val1: number, val2: number, lowerIsBetter?: boolean }) {
  const max = Math.max(val1, val2, 1);
  let p1Wins = val1 > val2;
  if (lowerIsBetter) p1Wins = val1 < val2;
  
  const w1 = `${(val1 / max) * 100}%`;
  const w2 = `${(val2 / max) * 100}%`;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-text-muted uppercase text-[10px]">
        <span>{val1}</span>
        <span>{label}</span>
        <span>{val2}</span>
      </div>
      <div className="flex gap-1 h-1.5 w-full">
        <div className="flex-1 bg-surface rounded-l-full flex justify-end overflow-hidden">
          <div className="h-full bg-neon-cyan" style={{ width: w1 }} />
        </div>
        <div className="flex-1 bg-surface rounded-r-full flex justify-start overflow-hidden">
          <div className="h-full bg-neon-magenta" style={{ width: w2 }} />
        </div>
      </div>
    </div>
  );
}
