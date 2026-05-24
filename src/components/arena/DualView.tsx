'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, CodingStats, LayoutMode } from '@/types';
import { StreamPanel } from '../battle/StreamPanel';

interface DualViewProps {
  stream1: MediaStream | null;
  stream2: MediaStream | null;
  user1: User;
  user2: User;
  stats1: CodingStats | null;
  stats2: CodingStats | null;
  layout: LayoutMode;
  challenge: string;
}

export function DualView({
  stream1,
  stream2,
  user1,
  user2,
  stats1,
  stats2,
  layout,
  challenge,
}: DualViewProps) {
  
  const getLayoutClasses = () => {
    switch (layout) {
      case 'side-by-side':
        return 'grid-cols-1 md:grid-cols-2';
      case 'focus-left':
        return 'grid-cols-[70%_30%]';
      case 'focus-right':
        return 'grid-cols-[30%_70%]';
      case 'vertical':
        return 'grid-cols-1 grid-rows-2';
      case 'quad':
        return 'grid-cols-2 grid-rows-2'; // simplified handling for now
      default:
        return 'grid-cols-1 md:grid-cols-2';
    }
  };

  return (
    <div className="relative w-full h-full flex-grow overflow-hidden bg-void">
      <div className={`w-full h-full grid ${getLayoutClasses()} gap-1 p-1`}>
        <motion.div layout transition={{ type: 'spring', damping: 25, stiffness: 120 }} className="relative h-full">
          <StreamPanel 
            stream={stream1} 
            userName={user1.name} 
            isLocal={false} 
            isActive={stats1?.momentum === 'high' || stats1?.momentum === 'extreme'} 
            color="cyan" 
            stats={stats1} 
          />
        </motion.div>
        
        <motion.div layout transition={{ type: 'spring', damping: 25, stiffness: 120 }} className="relative h-full">
          <StreamPanel 
            stream={stream2} 
            userName={user2.name} 
            isLocal={false} 
            isActive={stats2?.momentum === 'high' || stats2?.momentum === 'extreme'} 
            color="magenta" 
            stats={stats2} 
          />
        </motion.div>
      </div>

      {/* VS Badge / Divider Overlay */}
      {layout === 'side-by-side' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col items-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-void border-2 border-slate-dark flex items-center justify-center relative overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.8)]">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20" />
            <span className="font-display font-black text-2xl italic text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-magenta">VS</span>
          </div>
        </div>
      )}
    </div>
  );
}
