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
  const [isTie, setIsTie] = useState(false);
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
      let winners: User[] = [];

      contestants.forEach(c => {
        const cStats = stats.get(c.id);
        if (cStats) {
          // Primary: Errors Solved (1000 pts)
          // Secondary: Fewest Errors Remaining (-100 pts)
          // Tertiary: Typing speed (1 pt)
          const score = (cStats.errorsSolved * 1000) - (cStats.errorCount * 100) + cStats.typingSpeed;
          
          if (score > bestScore) {
            bestScore = score;
            winners = [c];
          } else if (score === bestScore) {
            winners.push(c);
          }
        }
      });
      
      if (winners.length > 1) {
        setIsTie(true);
        setWinner(winners[0]); // Display the first one, or we could handle showing both
      } else if (winners.length === 1) {
        setWinner(winners[0]);
      }
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
          {isTie ? 'TIEBREAKER' : 'Victory'}
        </h2>
        
        <p className="text-text-secondary font-mono mb-6 uppercase text-sm tracking-wider">
          {isTie ? 'Multiple players had identical bug fixes' : 'The duel has concluded'}
        </p>

        {winner && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
            <h3 className="text-white font-display font-bold text-3xl mb-4">
              {isTie ? 'Tied Players' : winner.name}
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center">
                <BugAntIcon className="w-6 h-6 text-neon-cyan mb-2" />
                <span className="text-2xl font-mono text-white font-bold">{stats.get(winner.id)?.initialErrors || 0}</span>
                <span className="text-[10px] text-text-muted uppercase text-center">Total Errors<br/>(Initial)</span>
              </div>
              <div className="flex flex-col items-center">
                <BoltIcon className="w-6 h-6 text-neon-magenta mb-2" />
                <span className="text-2xl font-mono text-white font-bold">{stats.get(winner.id)?.errorsSolved || 0}</span>
                <span className="text-[10px] text-text-muted uppercase text-center">Errors<br/>Solved</span>
              </div>
              <div className="flex flex-col items-center">
                <CodeBracketIcon className="w-6 h-6 text-neon-violet mb-2" />
                <span className="text-2xl font-mono text-white font-bold">{stats.get(winner.id)?.linesWritten || 0}</span>
                <span className="text-[10px] text-text-muted uppercase text-center">Lines of<br/>Code</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-center items-center gap-2 text-text-muted text-xs font-mono uppercase">
              <BugAntIcon className="w-4 h-4 text-neon-red" />
              Errors Remaining: <span className="text-white font-bold">{stats.get(winner.id)?.errorCount || 0}</span>
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
