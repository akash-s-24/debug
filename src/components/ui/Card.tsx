'use client';

import React, { forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ glass = false, hover = false, className = '', children, ...props }, ref) => {
    const base = 'rounded transition-all duration-300';
    const style = glass
      ? 'glass-surface border border-border-subtle hud-bracket'
      : 'bg-abyss border border-border-subtle';
    const hoverStyle = hover ? 'hover:-translate-y-1 hover:border-text-muted hover:shadow-[0_0_20px_rgba(255,184,74,0.1)]' : '';

    return (
      <div
        ref={ref}
        className={`${base} ${style} ${hoverStyle} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
