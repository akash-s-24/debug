'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DuelType } from '@/types';
import { Badge } from '../ui/Badge';
import { Timer } from '../ui/Timer';

interface ChallengeBarProps {
  title: string;
  description?: string;
  language: string;
  duelType: DuelType;
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
}

export function ChallengeBar({
  title,
  description,
  language,
  duelType,
  timeRemaining,
  isRunning,
  isPaused,
}: ChallengeBarProps) {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className="w-full bg-surface/80 backdrop-blur-md border-b border-slate-dark px-6 py-3 flex items-center justify-between shadow-md z-10"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-display font-bold text-text-primary tracking-wide">{title}</h2>
          <Badge text={language} color="cyan" variant="language" />
          <Badge text={duelType.replace('-', ' ')} color="magenta" variant="status" />
        </div>
        {description && (
          <p className="text-text-secondary text-sm truncate max-w-2xl">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-xs text-text-muted font-display uppercase tracking-widest mb-1">Time Remaining</span>
          <Timer timeRemaining={timeRemaining} isRunning={isRunning} isPaused={isPaused} size="md" />
        </div>
      </div>
    </motion.div>
  );
}
