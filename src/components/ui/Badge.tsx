'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface BadgeProps {
  text: string;
  variant?: 'language' | 'status' | 'score';
  color?: 'cyan' | 'magenta' | 'green' | 'yellow' | 'red';
  pulse?: boolean;
  icon?: string;
  className?: string;
}

const colorMap: Record<string, { text: string; border: string; bg: string; glow: string }> = {
  cyan: {
    text: 'text-[#00F0FF]',
    border: 'border-[#00F0FF]/40',
    bg: 'bg-[#00F0FF]/10',
    glow: '0 0 10px rgba(0,240,255,0.3)',
  },
  magenta: {
    text: 'text-[#FF006E]',
    border: 'border-[#FF006E]/40',
    bg: 'bg-[#FF006E]/10',
    glow: '0 0 10px rgba(255,0,110,0.3)',
  },
  green: {
    text: 'text-[#00FF88]',
    border: 'border-[#00FF88]/40',
    bg: 'bg-[#00FF88]/10',
    glow: '0 0 10px rgba(0,255,136,0.3)',
  },
  yellow: {
    text: 'text-[#EEFF00]',
    border: 'border-[#EEFF00]/40',
    bg: 'bg-[#EEFF00]/10',
    glow: '0 0 10px rgba(238,255,0,0.3)',
  },
  red: {
    text: 'text-[#ff3333]',
    border: 'border-[#ff3333]/40',
    bg: 'bg-[#ff3333]/10',
    glow: '0 0 10px rgba(255,51,51,0.3)',
  },
};

export function Badge({
  text,
  variant = 'language',
  color = 'cyan',
  pulse = false,
  icon,
  className = '',
}: BadgeProps) {
  const c = colorMap[color];

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1 rounded-full
        text-xs font-bold uppercase tracking-wider
        border backdrop-blur-sm
        ${c.text} ${c.border} ${c.bg}
        ${variant === 'score' ? 'font-mono' : ''}
        ${className}
      `}
      style={{ boxShadow: c.glow }}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
            style={{ backgroundColor: color === 'cyan' ? '#00F0FF' : color === 'magenta' ? '#FF006E' : color === 'green' ? '#00FF88' : color === 'yellow' ? '#EEFF00' : '#ff3333' }}
          />
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ backgroundColor: color === 'cyan' ? '#00F0FF' : color === 'magenta' ? '#FF006E' : color === 'green' ? '#00FF88' : color === 'yellow' ? '#EEFF00' : '#ff3333' }}
          />
        </span>
      )}
      {icon && <span>{icon}</span>}
      {text}
    </motion.span>
  );
}

export default Badge;
