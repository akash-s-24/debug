'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Full-screen overlay that blocks all interaction when the timer hits zero.
 * Displays a prominent "TIME'S UP — STOP" message with a pulsing red border.
 */
export function TimerExpiredOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ pointerEvents: 'all' }}
    >
      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Pulsing red border */}
      <motion.div
        className="absolute inset-0 border-[6px] border-red-500"
        animate={{
          borderColor: ['#ef4444', '#7f1d1d', '#ef4444'],
          boxShadow: [
            'inset 0 0 60px rgba(239,68,68,0.3)',
            'inset 0 0 120px rgba(239,68,68,0.1)',
            'inset 0 0 60px rgba(239,68,68,0.3)',
          ],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8">
        {/* Timer icon */}
        <motion.div
          className="text-7xl mb-6"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          ⏱️
        </motion.div>

        {/* Main title */}
        <motion.h1
          className="font-display text-6xl md:text-8xl tracking-tight text-white mb-4"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
        >
          TIME&apos;S UP
        </motion.h1>

        {/* STOP text */}
        <motion.div
          className="text-5xl md:text-7xl font-display font-black tracking-[0.3em] text-red-500"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 10, delay: 0.3 }}
        >
          STOP
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="mt-8 font-mono text-sm text-white/60 uppercase tracking-[0.2em]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Put down your keyboards. The battle has ended.
        </motion.p>

        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div
            className="w-full h-full"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
