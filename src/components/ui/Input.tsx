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
          className={`w-full bg-[#10131B] border border-white/[0.12] rounded px-4 py-3 font-mono text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#38BDF8] shadow-none ${
            error
              ? 'border-danger-red focus:border-danger-red'
              : ''
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
