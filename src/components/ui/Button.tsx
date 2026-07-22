'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', loading = false, fullWidth = false, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-heading uppercase transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer relative rounded-DEFAULT';

    const variants: Record<string, string> = {
      primary: 'border border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-void hover:shadow-[0_0_24px_rgba(255,184,74,0.4)] before:content-["$"] before:mr-2 before:text-inherit',
      secondary: 'bg-transparent text-text-secondary border border-border-subtle hover:border-text-primary hover:text-text-primary hover:bg-abyss',
      ghost: 'bg-transparent text-text-muted hover:text-neon-cyan hover:bg-neon-cyan/5',
      danger: 'border border-danger-red text-danger-red hover:bg-danger-red hover:text-void hover:shadow-[0_0_24px_rgba(255,82,82,0.4)] before:content-["!"] before:mr-2 before:text-inherit',
    };

    const sizes: Record<string, string> = {
      sm: 'text-xs px-4 py-2 gap-1.5',
      md: 'text-[13px] px-6 py-3 gap-2 tracking-[0.06em]',
      lg: 'text-sm px-8 py-4 gap-2.5 tracking-[0.06em]',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        disabled={disabled || loading}
        {...(props as any)}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
