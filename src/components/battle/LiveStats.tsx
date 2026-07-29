'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CodingStats } from '@/types';

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
    <div className={`flex flex-col ${compact ? 'items-center' : 'items-start'} p-2 bg-abyss shadow-inner border border-border-subtle hover:border-border transition-colors`}>
      <div className="flex items-center gap-1.5 text-text-muted text-[10px] md:text-[11px] font-mono uppercase tracking-widest mb-1">
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

export const LiveStats = React.memo(function LiveStats({ stats, color, compact = false }: LiveStatsProps) {
  const isCyan = color === 'cyan';
  const textClass = isCyan ? 'text-brand-primary' : 'text-brand-secondary';
  
  const getMomentumColor = (momentum: string) => {
    switch (momentum) {
      case 'low': return 'bg-border-subtle';
      case 'medium': return 'bg-warn-amber';
      case 'high': return 'bg-brand-accent';
      case 'extreme': return isCyan ? 'bg-brand-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-brand-secondary shadow-[0_0_10px_rgba(99,102,241,0.5)]';
      default: return 'bg-border-subtle';
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
    <div className="w-full flex flex-col gap-3 p-4 bg-void shadow-md hud-bracket border border-border-subtle">
      {!compact && <h3 className="text-xl font-display text-text-primary border-b border-border-subtle pb-2 tracking-tight">Live Performance</h3>}
      
      <div className={`grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-2'}`}>
        <StatItem label="Speed (CPM)" value={stats.typingSpeed} icon="⚡" compact={compact} textClass={textClass} />
        <StatItem label="Errors" value={stats.errorCount} icon="🐛" compact={compact} textClass={textClass} />
        <StatItem label="Compiles" value={stats.compileCount} icon="🔨" compact={compact} textClass={textClass} />
        <StatItem label="Streak" value={stats.streak} icon="🔥" compact={compact} textClass={textClass} />
      </div>

      <div className="mt-2">
        <div className="flex justify-between items-center mb-1 text-xs font-mono uppercase text-text-muted tracking-widest">
          <span>Momentum</span>
          <span className={textClass}>{stats.momentum}</span>
        </div>
        <div className="h-1.5 w-full bg-abyss rounded-full overflow-hidden border border-border-subtle">
          <motion.div 
            className={`h-full ${getMomentumColor(stats.momentum)}`}
            initial={{ width: 0 }}
            animate={{ width: getMomentumWidth(stats.momentum) }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
  );
});
