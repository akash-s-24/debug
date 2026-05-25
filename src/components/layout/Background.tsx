'use client';

import React from 'react';

interface BackgroundProps {
  children: React.ReactNode;
}

export function Background({ children }: BackgroundProps) {
  return (
    <div className="relative min-h-screen bg-[#080810] text-white overflow-x-hidden">
      {/* Animated gradient overlay */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(0,240,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(123,47,247,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(255,0,110,0.05) 0%, transparent 50%)',
          animation: 'bgShift 20s ease-in-out infinite alternate',
        }}
      />

      {/* Scanline effect */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
          backgroundSize: '100% 4px',
        }}
      />

      {/* Grid pattern */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Inject keyframes */}
      <style>{`
        @keyframes bgShift {
          0% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(5%, -3%) scale(1.05);
          }
          66% {
            transform: translate(-3%, 5%) scale(0.98);
          }
          100% {
            transform: translate(2%, -2%) scale(1.02);
          }
        }
      `}</style>
    </div>
  );
}

export default Background;
