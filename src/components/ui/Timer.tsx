'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimerProps {
  timeRemaining: number;
  isRunning: boolean;
  isPaused?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onEnd?: () => void;
}

const sizeStyles: Record<string, { fontSize: string; gap: string; colonSize: string }> = {
  sm: { fontSize: 'text-2xl', gap: 'gap-1', colonSize: 'text-xl' },
  md: { fontSize: 'text-5xl', gap: 'gap-2', colonSize: 'text-4xl' },
  lg: { fontSize: 'text-7xl', gap: 'gap-3', colonSize: 'text-6xl' },
};

function AnimatedDigit({ digit, color }: { digit: string; color: string }) {
  return (
    <div className="relative overflow-hidden" style={{ width: '0.7em', height: '1.15em' }}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={digit}
          initial={{ y: -40, opacity: 0, filter: 'blur(4px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: 40, opacity: 0, filter: 'blur(4px)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="absolute inset-0 flex items-center justify-center font-mono font-bold"
          style={{ color }}
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export function Timer({
  timeRemaining,
  isRunning,
  isPaused = false,
  size = 'md',
  onEnd,
}: TimerProps) {
  const onEndRef = useRef(onEnd);

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    if (timeRemaining <= 0) {
      onEndRef.current?.();
    }

    if (timeRemaining === 60 && isRunning && !isPaused) {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const playBeep = (delay: number) => {
            setTimeout(() => {
              const ctx = new AudioContext();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880, ctx.currentTime);
              gain.gain.setValueAtTime(0, ctx.currentTime);
              gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
              gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.6);
            }, delay);
          };
          playBeep(0);
          playBeep(500);
          playBeep(1000);
        }
      } catch(e) {}
    }
  }, [timeRemaining, isRunning, isPaused]);

  const time = timeRemaining;

  const minutes = Math.floor(Math.max(0, time) / 60);
  const seconds = Math.max(0, time) % 60;
  const m1 = String(Math.floor(minutes / 10));
  const m2 = String(minutes % 10);
  const s1 = String(Math.floor(seconds / 10));
  const s2 = String(seconds % 10);

  const isUrgent = time <= 10;
  const isWarning = time <= 60 && time > 10;

  const color = isUrgent ? '#f87171' : isWarning ? '#fbbf24' : '#38bdf8';
  const { fontSize, gap, colonSize } = sizeStyles[size];

  return (
    <motion.div
      className={`inline-flex items-center ${gap} font-mono select-none ${fontSize}`}
      animate={
        isUrgent
          ? {
              scale: [1, 1.03, 1],
              opacity: [1, 0.7, 1],
            }
          : {}
      }
      transition={
        isUrgent
          ? {
              duration: 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : {}
      }
    >
      <AnimatedDigit digit={m1} color={color} />
      <AnimatedDigit digit={m2} color={color} />
      <motion.span
        className={`${colonSize} font-bold font-mono`}
        style={{ color }}
        animate={isRunning && !isPaused ? { opacity: [1, 0.3, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      >
        :
      </motion.span>
      <AnimatedDigit digit={s1} color={color} />
      <AnimatedDigit digit={s2} color={color} />
    </motion.div>
  );
}

export default Timer;
