'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'solid' | 'neon';
  neonColor?: 'cyan' | 'magenta' | 'violet';
  hover?: boolean;
  onClick?: () => void;
}

const neonColorMap = {
  cyan: {
    border: 'border-[#00F0FF]/30',
    shadow: '0 0 15px rgba(0,240,255,0.15), 0 0 30px rgba(0,240,255,0.05)',
    shadowHover: '0 0 25px rgba(0,240,255,0.3), 0 0 50px rgba(0,240,255,0.1)',
    bracket: '#00F0FF',
  },
  magenta: {
    border: 'border-[#FF006E]/30',
    shadow: '0 0 15px rgba(255,0,110,0.15), 0 0 30px rgba(255,0,110,0.05)',
    shadowHover: '0 0 25px rgba(255,0,110,0.3), 0 0 50px rgba(255,0,110,0.1)',
    bracket: '#FF006E',
  },
  violet: {
    border: 'border-[#7B2FF7]/30',
    shadow: '0 0 15px rgba(123,47,247,0.15), 0 0 30px rgba(123,47,247,0.05)',
    shadowHover: '0 0 25px rgba(123,47,247,0.3), 0 0 50px rgba(123,47,247,0.1)',
    bracket: '#7B2FF7',
  },
};

function CornerBrackets({ color }: { color: string }) {
  const style = { borderColor: color };
  return (
    <>
      {/* Top-left */}
      <span
        className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 pointer-events-none opacity-60"
        style={style}
      />
      {/* Top-right */}
      <span
        className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 pointer-events-none opacity-60"
        style={style}
      />
      {/* Bottom-left */}
      <span
        className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 pointer-events-none opacity-60"
        style={style}
      />
      {/* Bottom-right */}
      <span
        className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 pointer-events-none opacity-60"
        style={style}
      />
    </>
  );
}

export function Card({
  children,
  className = '',
  variant = 'glass',
  neonColor = 'cyan',
  hover = false,
  onClick,
}: CardProps) {
  const colors = neonColorMap[neonColor];

  const variantBase = {
    glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
    solid: 'bg-[#0d0d1a] border border-[#1e1e3a]',
    neon: `bg-white/5 backdrop-blur-xl border ${colors.border}`,
  };

  return (
    <motion.div
      onClick={onClick}
      whileHover={
        hover
          ? { scale: 1.02, y: -4 }
          : undefined
      }
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`
        relative rounded-xl p-6 overflow-hidden
        transition-shadow duration-500 ease-out
        ${variantBase[variant]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        boxShadow: variant === 'neon' ? colors.shadow : 'none',
      }}
      onMouseEnter={(e) => {
        if (hover || variant === 'neon') {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            colors.shadowHover;
        }
      }}
      onMouseLeave={(e) => {
        if (hover || variant === 'neon') {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            variant === 'neon' ? colors.shadow : 'none';
        }
      }}
    >
      {variant === 'neon' && <CornerBrackets color={colors.bracket} />}
      {hover && variant !== 'neon' && <CornerBrackets color={colors.bracket} />}
      {children}
    </motion.div>
  );
}

export default Card;
