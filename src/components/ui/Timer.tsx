'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  }, [timeRemaining]);

  const time = timeRemaining;

  const minutes = Math.floor(Math.max(0, time) / 60);
  const seconds = Math.max(0, time) % 60;
  const m1 = String(Math.floor(minutes / 10));
  const m2 = String(minutes % 10);
  const s1 = String(Math.floor(seconds / 10));
  const s2 = String(seconds % 10);

  const isUrgent = time <= 10;
  const isWarning = time <= 60 && time > 10;

  const color = isUrgent ? '#ff3333' : isWarning ? '#EEFF00' : '#ffffff';
  const { fontSize, gap, colonSize } = sizeStyles[size];

  const glowStyle: React.CSSProperties = isUrgent
    ? {
        textShadow: `0 0 20px rgba(255,51,51,0.8), 0 0 40px rgba(255,51,51,0.4), 0 0 80px rgba(255,51,51,0.2)`,
      }
    : isWarning
      ? {
          textShadow: `0 0 15px rgba(238,255,0,0.5), 0 0 30px rgba(238,255,0,0.2)`,
        }
      : {
          textShadow: `0 0 10px rgba(0,240,255,0.3)`,
        };

  return (
    <motion.div
      className={`inline-flex items-center ${gap} font-mono select-none ${fontSize}`}
      style={glowStyle}
      animate={
        isUrgent
          ? {
              scale: [1, 1.05, 1],
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
