'use client';

import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, fullWidth = false, className = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="text-xs font-mono uppercase text-text-muted tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full bg-void border border-border-subtle rounded px-4 py-3 font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-cyan ${
            error
              ? 'border-danger-red focus:border-danger-red focus:shadow-[0_0_15px_rgba(255,77,94,0.15)]'
              : 'focus:shadow-[0_0_15px_rgba(34,233,225,0.15)]'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs font-mono text-danger-red">{error}</p>}
        {hint && !error && <p className="text-xs font-mono text-text-muted">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
