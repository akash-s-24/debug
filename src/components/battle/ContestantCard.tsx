'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, CodingStats } from '@/types';

interface ContestantCardProps {
  user: User;
  color: 'cyan' | 'magenta';
  stats: CodingStats;
  isActive: boolean;
  score: number;
}

export function ContestantCard({ user, color, stats, isActive, score }: ContestantCardProps) {
  const isCyan = color === 'cyan';
  const glowClass = isCyan ? 'shadow-[0_0_15px_rgba(0,240,255,0.5)]' : 'shadow-[0_0_15px_rgba(255,0,110,0.5)]';
  const borderClass = isCyan ? 'border-neon-cyan' : 'border-neon-magenta';
  const textClass = isCyan ? 'text-neon-cyan' : 'text-neon-magenta';

  return (
    <div className={`relative flex items-center gap-4 bg-abyss p-3 pr-6 border ${borderClass} ${isActive ? glowClass : ''} transition-all duration-300 [clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,0_100%)]`}>
      <div className={`relative w-12 h-12 rounded-full border-2 ${borderClass} flex items-center justify-center overflow-hidden bg-surface`}>
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          <span className={`text-xl font-bold ${textClass}`}>{user.name.charAt(0).toUpperCase()}</span>
        )}
        {isActive && (
          <motion.div
            className={`absolute inset-0 border-2 ${borderClass} rounded-full`}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-lg text-text-primary tracking-wide">{user.name}</span>
          <span className={`text-xs font-mono px-1.5 py-0.5 rounded bg-surface border ${borderClass} ${textClass}`}>
            {score} PT
          </span>
        </div>
        
        <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary font-mono">
          <div className="flex items-center gap-1" title="Typing Speed">
            <span>⌨️</span> <span>{stats.typingSpeed} cpm</span>
          </div>
          <div className="flex items-center gap-1" title="Errors">
            <span>🐛</span> <span>{stats.errorCount}</span>
          </div>
        </div>
      </div>
      
      {isActive && (
        <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-transparent via-current to-transparent opacity-50" style={{ color: isCyan ? '#00f0ff' : '#ff006e' }} />
      )}
    </div>
  );
}
