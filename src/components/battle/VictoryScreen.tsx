'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, CodingStats } from '@/types';
import { TrophyIcon, CodeBracketIcon, BoltIcon, BugAntIcon } from '@heroicons/react/24/outline';

interface VictoryScreenProps {
  contestants: User[];
  stats: Map<string, CodingStats>;
  onClose: () => void;
}

export function VictoryScreen({ contestants, stats, onClose }: VictoryScreenProps) {
  const [winner, setWinner] = useState<User | null>(null);
  const [particles, setParticles] = useState<{ id: number; x: number; color: string; delay: number; size: number }[]>([]);

  useEffect(() => {
    // Generate Confetti Particles
    const newParticles = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ['#00F0FF', '#FF003C', '#EEFF00', '#7B2FF7'][Math.floor(Math.random() * 4)],
      delay: Math.random() * 2,
      size: Math.random() * 10 + 5,
    }));
    setParticles(newParticles);

    // Calculate Winner
    if (contestants.length > 0) {
      let bestScore = -Infinity;
      let currentWinner = contestants[0];

      contestants.forEach(c => {
        const cStats = stats.get(c.id);
        if (cStats) {
          // Simple heuristic: speed + lines - errors
          const score = (cStats.typingSpeed * 2) + (cStats.linesWritten * 10) - (cStats.errorCount * 50);
          if (score > bestScore) {
            bestScore = score;
            currentWinner = c;
          }
        }
      });
      setWinner(currentWinner);
    }
  }, [contestants, stats]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-hidden">
      {/* Confetti */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -50, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ 
            y: '100vh', 
            x: `${p.x + (Math.random() * 20 - 10)}vw`,
            rotate: 360,
            opacity: 0 
          }}
          transition={{ duration: 3 + Math.random() * 2, delay: p.delay, ease: 'linear', repeat: Infinity }}
          className="absolute top-0 rounded-sm"
          style={{ 
            backgroundColor: p.color, 
            width: p.size, 
            height: p.size,
            boxShadow: `0 0 10px ${p.color}`
          }}
        />
      ))}

      {/* Winner Card */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="relative bg-black/90 border-2 border-neon-yellow shadow-[0_0_50px_rgba(238,255,0,0.3)] rounded-2xl p-8 max-w-lg w-full text-center z-10"
      >
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <div className="w-24 h-24 bg-black border-4 border-neon-yellow rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(238,255,0,0.5)]">
            <TrophyIcon className="w-12 h-12 text-neon-yellow" />
          </div>
        </div>

        <h2 className="mt-12 text-neon-yellow font-display font-black text-4xl uppercase tracking-widest text-glow-yellow mb-2">
          Victory
        </h2>
        
        <p className="text-text-secondary font-mono mb-6 uppercase text-sm tracking-wider">
          The duel has concluded
        </p>

        {winner && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
            <h3 className="text-white font-display font-bold text-3xl mb-4">{winner.name}</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center">
                <BoltIcon className="w-6 h-6 text-neon-cyan mb-2" />
                <span className="text-2xl font-mono text-white font-bold">{stats.get(winner.id)?.typingSpeed || 0}</span>
                <span className="text-[10px] text-text-muted uppercase">CPM</span>
              </div>
              <div className="flex flex-col items-center">
                <BugAntIcon className="w-6 h-6 text-neon-magenta mb-2" />
                <span className="text-2xl font-mono text-white font-bold">{stats.get(winner.id)?.errorCount || 0}</span>
                <span className="text-[10px] text-text-muted uppercase">Errors</span>
              </div>
              <div className="flex flex-col items-center">
                <CodeBracketIcon className="w-6 h-6 text-neon-violet mb-2" />
                <span className="text-2xl font-mono text-white font-bold">{stats.get(winner.id)?.linesWritten || 0}</span>
                <span className="text-[10px] text-text-muted uppercase">Lines</span>
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={onClose}
          className="bg-neon-yellow hover:bg-white text-black font-display font-bold uppercase tracking-widest px-8 py-3 rounded transition-colors"
        >
          Return to Lobby
        </button>
      </motion.div>
    </div>
  );
}
