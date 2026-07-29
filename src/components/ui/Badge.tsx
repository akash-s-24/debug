'use client';

import React from 'react';

interface BadgeProps {
  text: string;
  color?: 'accent' | 'success' | 'danger' | 'warning' | 'neutral' | 'cyan' | 'magenta' | 'primary';
  variant?: string; // legacy prop — ignored
}

const colorMap: Record<string, string> = {
  primary: 'bg-transparent text-brand-primary border-border-subtle hover:border-brand-primary',
  accent: 'bg-transparent text-brand-primary border-border-subtle hover:border-brand-primary',
  success: 'bg-transparent text-brand-accent border-border-subtle hover:border-brand-accent',
  danger: 'bg-transparent text-danger-red border-border-subtle hover:border-danger-red',
  warning: 'bg-transparent text-warn-amber border-border-subtle hover:border-warn-amber',
  neutral: 'bg-transparent text-text-muted border-border-subtle hover:border-text-secondary',
  cyan: 'bg-transparent text-brand-primary border-border-subtle',
  magenta: 'bg-transparent text-danger-red border-border-subtle',
};

export function Badge({ text, color = 'neutral' }: BadgeProps) {
  const classes = colorMap[color] || colorMap.neutral;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono tracking-[0.1em] border transition-colors ${classes}`}>
      {text}
    </span>
  );
}
