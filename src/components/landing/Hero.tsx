'use client';

import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { ParticleField } from './ParticleField';
import { Button } from '@/components/ui/Button';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

function GlitchTitle() {
  return (
    <div className="relative select-none">
      <h1
        className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-white"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        <span className="relative inline-block">
          {/* Glitch layers */}
          <span
            className="absolute inset-0 text-[#00F0FF] animate-pulse"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
              transform: 'translate(-2px, -1px)',
              opacity: 0.7,
            }}
            aria-hidden="true"
          >
            DEBUG DUEL
          </span>
          <span
            className="absolute inset-0 text-[#FF006E] animate-pulse"
            style={{
              clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)',
              transform: 'translate(2px, 1px)',
              opacity: 0.7,
              animationDelay: '0.1s',
            }}
            aria-hidden="true"
          >
            DEBUG DUEL
          </span>
          DEBUG DUEL
        </span>
        <br />
        <span
          className="bg-gradient-to-r from-[#00F0FF] via-[#7B2FF7] to-[#FF006E] bg-clip-text text-transparent"
        >
          ARENA
        </span>
      </h1>
    </div>
  );
}

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <span className="text-white/60 text-lg sm:text-xl font-light">
      {displayed}
      <span className="inline-block w-0.5 h-5 bg-[#00F0FF] ml-1 animate-pulse" />
    </span>
  );
}

function CountUpStat({ value, label }: { value: string; label: string }) {
  const numericPart = parseInt(value.replace(/\D/g, ''));
  const suffix = value.replace(/[0-9]/g, '');
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * numericPart);
      setCount(start);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [numericPart]);

  return (
    <div className="text-center px-4 sm:px-8">
      <div
        className="text-2xl sm:text-3xl font-black text-white font-mono"
        style={{ textShadow: '0 0 15px rgba(0,240,255,0.4)' }}
      >
        {count}
        {suffix}
      </div>
      <div className="text-xs text-white/40 uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}

function FloatingCodeCard({ code, position }: { code: string; position: string }) {
  return (
    <motion.div
      className={`absolute ${position} hidden lg:block`}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-4 text-xs font-mono text-[#00F0FF]/60 max-w-[200px] shadow-[0_0_20px_rgba(0,240,255,0.05)]">
        <pre className="whitespace-pre-wrap">{code}</pre>
      </div>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <ParticleField />

      {/* Floating code decorations */}
      <FloatingCodeCard
        position="top-32 left-8 xl:left-24"
        code={`fn solve(n: i32) {\n  let mut dp = vec!;\n  for i in 0..n {\n    dp[i] = dp[i-1];\n  }\n}`}
      />
      <FloatingCodeCard
        position="top-48 right-8 xl:right-24"
        code={`async function\n  debug(code) {\n  const ast =\n    parse(code);\n  return fix(ast);\n}`}
      />
      <FloatingCodeCard
        position="bottom-40 left-16 xl:left-32"
        code={`class Arena:\n  def battle(self):\n    while True:\n      self.round()`}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <GlitchTitle />
        </motion.div>

        <motion.div variants={itemVariants} className="mt-6">
          <TypewriterText text="The Ultimate Live Coding Battle Platform" />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center gap-4 mt-10"
        >
          <Button variant="primary" size="lg" icon="⚔️">
            Create Battle
          </Button>
          <Button variant="neon" size="lg" icon="🏟️">
            Join Arena
          </Button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center mt-16 divide-x divide-white/10"
        >
          <CountUpStat value="500+" label="Battles" />
          <CountUpStat value="10K+" label="Coders" />
          <CountUpStat value="50+" label="Languages" />
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080810] to-transparent z-10" />
    </section>
  );
}

export default Hero;
