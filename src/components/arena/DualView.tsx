'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, CodingStats, LayoutMode } from '@/types';
import { EditorPanel } from '../battle/EditorPanel';

interface DualViewProps {
  code1: string;
  code2: string;
  user1: User;
  user2: User;
  stats1: CodingStats | null;
  stats2: CodingStats | null;
  layout: LayoutMode;
  challenge: string;
  isLocalUser1?: boolean;
  isLocalUser2?: boolean;
  onCodeChange1?: (val: string | undefined) => void;
  onCodeChange2?: (val: string | undefined) => void;
  onValidate1?: (markers: any[]) => void;
  onValidate2?: (markers: any[]) => void;
}

export function DualView({
  code1,
  code2,
  user1,
  user2,
  stats1,
  stats2,
  layout,
  challenge,
  isLocalUser1 = false,
  isLocalUser2 = false,
  onCodeChange1,
  onCodeChange2,
  onValidate1,
  onValidate2
}: DualViewProps) {
  
  const getLayoutClasses = () => {
    switch (layout) {
      case 'side-by-side':
        return 'grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1';
      case 'focus-left':
        return 'grid-cols-1 md:grid-cols-[70%_30%] grid-rows-2 md:grid-rows-1';
      case 'focus-right':
        return 'grid-cols-1 md:grid-cols-[30%_70%] grid-rows-2 md:grid-rows-1';
      case 'vertical':
        return 'grid-cols-1 grid-rows-2';
      case 'quad':
        return 'grid-cols-1 md:grid-cols-2 grid-rows-2'; // simplified handling for now
      default:
        return 'grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1';
    }
  };

  return (
    <div className="relative w-full h-full flex-grow overflow-hidden bg-void">
      <div className={`w-full h-full grid ${getLayoutClasses()} gap-1 p-1`}>
        <motion.div layout transition={{ type: 'spring', damping: 25, stiffness: 120 }} className="relative h-full">
          <EditorPanel 
            code={code1}
            userName={user1.name} 
            isLocal={isLocalUser1} 
            isActive={stats1?.momentum === 'high' || stats1?.momentum === 'extreme'} 
            color="cyan" 
            stats={stats1}
            onChange={onCodeChange1}
            onValidation={onValidate1}
          />
        </motion.div>
        
        <motion.div layout transition={{ type: 'spring', damping: 25, stiffness: 120 }} className="relative h-full">
          <EditorPanel 
            code={code2}
            userName={user2.name} 
            isLocal={isLocalUser2} 
            isActive={stats2?.momentum === 'high' || stats2?.momentum === 'extreme'} 
            color="magenta" 
            stats={stats2}
            onChange={onCodeChange2}
            onValidation={onValidate2}
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
