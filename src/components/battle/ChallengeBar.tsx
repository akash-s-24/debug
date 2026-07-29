'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DuelType } from '@/types';
import { Timer } from '../ui/Timer';
import { useReactions } from '@/hooks/useReactions';

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
  roomId?: string;
  userName?: string;
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
  roomId,
  userName,
}: ChallengeBarProps) {
  const { sendReaction } = useReactions(roomId);
  const [copied, setCopied] = useState(false);

  const copyRoomCode = () => {
    if (roomId) {
      // Assuming roomId or a passed prop is the code, 
      // but in the old code it was passed via battle page or it used roomId.
      // Wait, in page.tsx, room.code is used. We might need to pass roomCode.
      // For now, if roomId is all we have, we'll copy it. 
      // Actually we'll just emit an event or copy window.location.
      navigator.clipboard.writeText(window.location.pathname.split('/').pop() || roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className="w-full bg-void border-b border-border-subtle px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4 z-10 hud-bracket shadow-lg"
    >
      {/* Left: Challenge Info */}
      <div className="flex flex-col gap-1 w-full md:w-1/3 items-center md:items-start text-center md:text-left">
        <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
          <h2 className="text-2xl font-display text-text-primary tracking-tight">{title}</h2>
          <span className="font-mono text-[10px] tracking-widest bg-transparent text-brand-primary px-2 py-0.5 border border-border-subtle">{language}</span>
          <span className="font-mono text-[10px] tracking-widest bg-transparent text-brand-secondary px-2 py-0.5 border border-border-subtle">{duelType.replace('-', ' ')}</span>
        </div>
        {description && (
          <p className="text-text-secondary font-mono text-xs leading-tight truncate w-full max-w-sm before:content-['//'] before:mr-2 before:text-text-muted">{description}</p>
        )}
      </div>

      {/* Center: Timer */}
      <div className="w-full md:w-1/3 flex flex-col items-center justify-center">
        <span className="text-[10px] text-text-muted font-mono uppercase tracking-widest mb-1">Time Remaining</span>
        <Timer timeRemaining={timeRemaining} isRunning={isRunning} isPaused={isPaused} size="md" />
      </div>

      {/* Right: Actions & Code */}
      <div className="flex items-center gap-6 w-full md:w-1/3 justify-between md:justify-end">
        {roomId && (
          <div className="flex items-center gap-2 bg-abyss border border-border-subtle px-3 py-1 shadow-inner">
            <span className="font-mono text-[10px] text-text-muted uppercase">ID:</span>
            <span className="font-mono text-sm text-text-primary font-bold tracking-widest">{roomId.substring(0, 6).toUpperCase()}</span>
            <button 
              onClick={copyRoomCode}
              className="ml-2 text-text-muted hover:text-brand-primary transition-colors"
              title="Copy Room Link"
            >
              <span className="material-symbols-outlined text-[16px]">{copied ? 'check' : 'content_copy'}</span>
            </button>
          </div>
        )}

        {roomId && (
          <div className="flex gap-2">
            {['🔥', '🤯', '💀'].map(emoji => (
              <button 
                key={emoji}
                onClick={() => sendReaction(emoji, userName || 'Anonymous')}
                className="text-lg hover:-translate-y-1 transition-transform bg-surface w-8 h-8 rounded flex items-center justify-center border border-border-subtle hover:border-brand-primary hover:shadow-[0_0_10px_rgba(59,130,246,0.2)]"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {onExit && (
          <button 
            onClick={onExit}
            className="font-mono text-[11px] uppercase tracking-widest text-text-muted hover:text-danger-red hover:bg-abyss px-4 py-2 border border-transparent hover:border-danger-red/30 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span className="hidden xl:inline">{isHost ? 'Disband' : 'Exit'}</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
