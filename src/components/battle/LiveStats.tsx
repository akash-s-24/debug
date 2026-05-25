'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CodingStats } from '@/types';
import { Card } from '../ui/Card';

interface LiveStatsProps {
  stats: CodingStats;
  color: 'cyan' | 'magenta';
  compact?: boolean;
}

interface StatItemProps {
  label: string;
  value: number;
  icon: string;
  compact: boolean;
  textClass: string;
}

function StatItem({ label, value, icon, compact, textClass }: StatItemProps) {
  return (
    <div className={`flex flex-col ${compact ? 'items-center' : 'items-start'} p-2 bg-black/20 rounded border border-white/5`}>
      <div className="flex items-center gap-1.5 text-text-secondary text-xs font-display uppercase tracking-wider mb-1">
        <span>{icon}</span> {!compact && <span>{label}</span>}
      </div>
      <div className={`font-mono text-xl font-bold ${textClass}`}>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="inline-block"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function LiveStats({ stats, color, compact = false }: LiveStatsProps) {
  const isCyan = color === 'cyan';
  const textClass = isCyan ? 'text-neon-cyan' : 'text-neon-magenta';
  
  const getMomentumColor = (momentum: string) => {
    switch (momentum) {
      case 'low': return 'bg-text-muted';
      case 'medium': return 'bg-neon-yellow';
      case 'high': return 'bg-neon-green';
      case 'extreme': return isCyan ? 'bg-neon-cyan' : 'bg-neon-magenta';
      default: return 'bg-text-muted';
    }
  };

  const getMomentumWidth = (momentum: string) => {
    switch (momentum) {
      case 'low': return '25%';
      case 'medium': return '50%';
      case 'high': return '75%';
      case 'extreme': return '100%';
      default: return '10%';
    }
  };

  return (
    <Card variant="solid" className="w-full flex flex-col gap-3 p-3">
      {!compact && <h3 className="text-sm font-display uppercase text-text-primary border-b border-slate-dark pb-2">Live Performance</h3>}
      
      <div className={`grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-2'}`}>
        <StatItem label="Speed (CPM)" value={stats.typingSpeed} icon="⚡" compact={compact} textClass={textClass} />
        <StatItem label="Errors" value={stats.errorCount} icon="🐛" compact={compact} textClass={textClass} />
        <StatItem label="Compiles" value={stats.compileCount} icon="🔨" compact={compact} textClass={textClass} />
        <StatItem label="Streak" value={stats.streak} icon="🔥" compact={compact} textClass={textClass} />
      </div>

      <div className="mt-2">
        <div className="flex justify-between items-center mb-1 text-xs font-display uppercase text-text-secondary">
          <span>Momentum</span>
          <span className={textClass}>{stats.momentum}</span>
        </div>
        <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
          <motion.div 
            className={`h-full ${getMomentumColor(stats.momentum)} shadow-[0_0_8px_currentColor]`}
            initial={{ width: 0 }}
            animate={{ width: getMomentumWidth(stats.momentum) }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </Card>
  );
}
