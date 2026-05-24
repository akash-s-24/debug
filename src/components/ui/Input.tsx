'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  icon?: React.ReactNode;
  error?: string;
  className?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
}

export function Input({
  label,
  placeholder = '',
  value,
  onChange,
  type = 'text',
  icon,
  error,
  className = '',
  name,
  disabled = false,
  required = false,
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = value !== undefined && value !== '';

  return (
    <div className={`relative w-full ${className}`}>
      {/* Input container */}
      <div
        className="relative"
        style={{
          clipPath:
            'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)',
        }}
      >
        <div
          className={`
            flex items-center gap-3
            bg-[#0a0a18] border rounded-md
            transition-all duration-300
            ${
              error
                ? 'border-[#ff3333] shadow-[0_0_15px_rgba(255,51,51,0.2)]'
                : focused
                  ? 'border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2),0_0_30px_rgba(0,240,255,0.05)]'
                  : 'border-white/10 hover:border-white/20'
            }
          `}
        >
          {icon && (
            <span
              className={`pl-4 text-lg transition-colors duration-300 ${
                focused ? 'text-[#00F0FF]' : 'text-white/30'
              }`}
            >
              {icon}
            </span>
          )}
          <div className="relative flex-1">
            {/* Floating label */}
            {label && (
              <motion.label
                className={`
                  absolute left-0 pointer-events-none
                  transition-colors duration-300 font-medium
                  ${
                    error
                      ? 'text-[#ff3333]'
                      : focused
                        ? 'text-[#00F0FF]'
                        : 'text-white/40'
                  }
                `}
                animate={{
                  top: focused || hasValue ? '4px' : '50%',
                  fontSize: focused || hasValue ? '10px' : '14px',
                  y: focused || hasValue ? 0 : '-50%',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                {label}
              </motion.label>
            )}
            <input
              type={type}
              name={name}
              value={value}
              onChange={onChange}
              placeholder={focused ? placeholder : ''}
              disabled={disabled}
              required={required}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className={`
                w-full bg-transparent outline-none
                text-white text-sm font-medium
                px-0 disabled:opacity-40 disabled:cursor-not-allowed
                ${label ? 'pt-5 pb-2' : 'py-3'}
                ${!icon ? 'pl-4' : ''}
                pr-4
              `}
            />
          </div>
        </div>
      </div>
      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs text-[#ff3333] font-medium pl-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

export default Input;
