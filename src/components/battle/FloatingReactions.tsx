'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reaction } from '@/hooks/useReactions';

interface FloatingReactionsProps {
  reactions: Reaction[];
}

// Simple deterministic hash to get 0-1 from string
const getSeededRandom = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  return (Math.abs(h) % 1000) / 1000;
};

export function FloatingReactions({ reactions }: FloatingReactionsProps) {
  return (
    <div className="pointer-events-none fixed bottom-24 right-8 w-32 h-[50vh] z-50 overflow-hidden">
      <AnimatePresence>
        {reactions.map((reaction) => {
          const rand1 = getSeededRandom(reaction.id + '1');
          const rand2 = getSeededRandom(reaction.id + '2');
          const rand3 = getSeededRandom(reaction.id + '3');
          
          return (
            <motion.div
              key={reaction.id}
              initial={{ opacity: 0, y: 50, scale: 0.5, x: 0 }}
              animate={{ 
                opacity: [0, 1, 1, 0], 
                y: -500, 
                scale: [0.5, 1.5, 1], 
                x: [0, (rand1 - 0.5) * 50, (rand2 - 0.5) * 50] 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, ease: 'easeOut' }}
              className="absolute bottom-0 text-4xl"
              style={{ left: `${rand3 * 50}%` }}
            >
              {reaction.emoji}
            {/* Optional: Add small username below emoji */}
            <div className="text-[8px] font-mono text-white/50 text-center whitespace-nowrap -ml-2">
              {reaction.userName}
            </div>
          </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
