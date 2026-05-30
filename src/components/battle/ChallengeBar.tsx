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
  onExit?: () => void;
  isHost?: boolean;
}

export function ChallengeBar({
  title,
  description,
  language,
  duelType,
  timeRemaining,
  isRunning,
  isPaused,
  onExit,
  isHost = false,
}: ChallengeBarProps) {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className="w-full bg-surface/80 backdrop-blur-md border-b border-slate-dark px-4 py-3 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md z-10"
    >
      <div className="flex flex-col gap-1 w-full md:w-auto items-center md:items-start text-center md:text-left">
        <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 md:gap-3">
          <h2 className="text-lg md:text-xl font-display font-bold text-text-primary tracking-wide">{title}</h2>
          <Badge text={language} color="cyan" variant="language" />
          <Badge text={duelType.replace('-', ' ')} color="magenta" variant="status" />
        </div>
        {description && (
          <p className="text-text-secondary text-xs md:text-sm truncate max-w-[280px] sm:max-w-md md:max-w-2xl">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end">
        <div className="flex flex-col items-start md:items-end">
          <span className="text-[10px] md:text-xs text-text-muted font-display uppercase tracking-widest mb-1">Time Remaining</span>
          <Timer timeRemaining={timeRemaining} isRunning={isRunning} isPaused={isPaused} size="md" />
        </div>
        
        {onExit && (
          <button 
            onClick={onExit}
            className="px-3 py-1.5 md:px-4 md:py-2 border border-neon-red/50 text-neon-red bg-neon-red/10 hover:bg-neon-red hover:text-white rounded-md font-display tracking-widest uppercase transition-colors text-xs md:text-sm whitespace-nowrap"
          >
            {isHost ? 'Disband Room' : 'Exit Arena'}
          </button>
        )}
      </div>
    </motion.div>
  );
}
