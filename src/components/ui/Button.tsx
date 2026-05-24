'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  variant?: 'primary' | 'neon' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const sizeClasses: Record<string, string> = {
  sm: 'px-4 py-1.5 text-xs gap-1.5',
  md: 'px-6 py-2.5 text-sm gap-2',
  lg: 'px-8 py-3.5 text-base gap-2.5',
};

const variantClasses: Record<string, string> = {
  primary:
    'bg-gradient-to-r from-[#00F0FF] via-[#7B2FF7] to-[#FF006E] text-white font-bold shadow-[0_0_20px_rgba(0,240,255,0.3),0_0_40px_rgba(123,47,247,0.15)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5),0_0_60px_rgba(123,47,247,0.25)] border border-white/10',
  neon: 'bg-transparent text-[#00F0FF] border-2 border-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.2),inset_0_0_10px_rgba(0,240,255,0.05)] hover:shadow-[0_0_20px_rgba(0,240,255,0.4),inset_0_0_20px_rgba(0,240,255,0.1)] hover:bg-[#00F0FF]/10',
  ghost:
    'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20',
  danger:
    'bg-gradient-to-r from-[#FF006E] to-[#ff3333] text-white font-bold shadow-[0_0_20px_rgba(255,0,110,0.3)] hover:shadow-[0_0_30px_rgba(255,0,110,0.5)] border border-white/10',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  className = '',
  icon,
  loading = false,
  type = 'button',
}: ButtonProps) {
  const neonClipPath =
    variant === 'neon'
      ? { clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }
      : {};

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`
        relative inline-flex items-center justify-center
        uppercase tracking-wider font-semibold
        rounded-md cursor-pointer select-none
        transition-all duration-300 ease-out
        disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      style={neonClipPath}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {icon && !loading && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
}

export default Button;
