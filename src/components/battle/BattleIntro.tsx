'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@/types';

interface BattleIntroProps {
  contestant1: User;
  contestant2: User;
  challenge: string;
  onComplete: () => void;
}

export function BattleIntro({ contestant1, contestant2, challenge, onComplete }: BattleIntroProps) {
  const [stage, setStage] = useState<number>(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Stage 0: Loading text (0-1s)
    // Stage 1: Player cards slide in (1-2.5s)
    // Stage 2: VS appears (2.5-3.5s)
    // Stage 3: Countdown 3 (3.5-4.5s)
    // Stage 4: Countdown 2 (4.5-5.5s)
    // Stage 5: Countdown 1 (5.5-6.5s)
    // Stage 6: FIGHT (6.5-8s)
    
    const timers = [
      setTimeout(() => setStage(1), 1000),
      setTimeout(() => setStage(2), 2500),
      setTimeout(() => setStage(3), 3500),
      setTimeout(() => setStage(4), 4500),
      setTimeout(() => setStage(5), 5500),
      setTimeout(() => setStage(6), 6500),
      setTimeout(() => {
        onCompleteRef.current();
      }, 8000)
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void overflow-hidden">
      {/* Background Particle Effects */}
      <div className="absolute inset-0 opacity-30 scanline-overlay pointer-events-none" />
      
      <AnimatePresence mode="wait">
        {stage === 0 && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-text-primary font-heading tracking-[0.5em] text-2xl uppercase"
          >
            INITIALIZING ARENA...
          </motion.div>
        )}

        {stage >= 1 && stage < 6 && (
          <div key="vs-screen" className="relative w-full h-full flex items-center justify-center">
            {/* Player 1 */}
            <motion.div
              initial={{ x: '-100vw', skewX: -10 }}
              animate={{ x: '-15vw', skewX: 0 }}
              className="absolute text-right"
            >
              <div className="text-brand-primary font-heading font-bold text-5xl md:text-6xl uppercase tracking-wider drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                {contestant1.name}
              </div>
              <div className="text-text-primary mt-2 font-mono text-xl bg-brand-primary/20 px-4 py-1 inline-block [clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,0_100%)] border border-brand-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                CHALLENGER ONE
              </div>
            </motion.div>

            {/* Player 2 */}
            <motion.div
              initial={{ x: '100vw', skewX: 10 }}
              animate={{ x: '15vw', skewX: 0 }}
              className="absolute text-left"
            >
              <div className="text-brand-secondary font-heading font-bold text-5xl md:text-6xl uppercase tracking-wider drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                {contestant2.name}
              </div>
              <div className="text-text-primary mt-2 font-mono text-xl bg-brand-secondary/20 px-4 py-1 inline-block [clip-path:polygon(10px_0,100%_0,100%_100%,0_100%,0_10px)] border border-brand-secondary/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                CHALLENGER TWO
              </div>
            </motion.div>

            {/* VS Symbol */}
            {stage >= 2 && (
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute z-10 text-8xl md:text-9xl font-heading font-black text-text-primary italic drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]"
              >
                VS
              </motion.div>
            )}

            {/* Challenge Info */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-20 text-center w-full px-4"
            >
              <div className="text-text-muted font-mono tracking-widest text-sm mb-2 uppercase">Current Challenge</div>
              <div className="text-text-primary font-heading text-2xl md:text-3xl tracking-wide max-w-3xl mx-auto">{challenge}</div>
            </motion.div>
          </div>
        )}

        {/* Countdown */}
        {stage >= 3 && stage <= 5 && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-void/80 backdrop-blur-sm">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={`count-${stage}`}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-[8rem] md:text-[10rem] font-heading font-black text-warn-amber drop-shadow-[0_0_50px_rgba(255,184,77,0.6)]"
              >
                {6 - stage}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* FIGHT! */}
        {stage === 6 && (
          <motion.div
            key="fight"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-center justify-center z-30 bg-brand-primary"
          >
            <div className="text-[8rem] md:text-[12rem] font-heading font-black text-void tracking-tighter italic">
              CODE!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
