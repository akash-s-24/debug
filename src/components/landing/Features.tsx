'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Card } from '@/components/ui/Card';

interface Feature {
  icon: string;
  title: string;
  description: string;
  neonColor: 'cyan' | 'magenta' | 'violet';
}

const features: Feature[] = [
  {
    icon: '🎯',
    title: 'Real-time Battles',
    description:
      'Compete head-to-head in live coding duels with real-time screen sharing and instant feedback.',
    neonColor: 'cyan',
  },
  {
    icon: '📺',
    title: 'Live Streaming',
    description:
      'Watch battles unfold in a cinematic split-screen arena with audience interaction and reactions.',
    neonColor: 'magenta',
  },
  {
    icon: '🤖',
    title: 'AI Analytics',
    description:
      'Advanced AI tracks coding speed, patterns, errors, and momentum to score performance in real-time.',
    neonColor: 'violet',
  },
  {
    icon: '⚡',
    title: 'Ultra Low Latency',
    description:
      'WebRTC-powered streaming with sub-100ms latency. Every keystroke is captured instantly.',
    neonColor: 'cyan',
  },
  {
    icon: '🏆',
    title: 'Tournaments',
    description:
      'Join bracket-style tournaments, climb leaderboards, and earn rankings across multiple languages.',
    neonColor: 'magenta',
  },
  {
    icon: '🔒',
    title: 'Secure Sandboxing',
    description:
      'All code runs in isolated sandboxed environments. No cheating, no shortcuts, pure skill.',
    neonColor: 'violet',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

export function Features() {
  return (
    <section className="relative py-24 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Section header */}
      <div className="flex items-center justify-center gap-4 mb-16">
        <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-transparent to-[#00F0FF]/40" />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-black uppercase tracking-widest text-white text-center"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            textShadow: '0 0 20px rgba(0,240,255,0.3)',
          }}
        >
          Features
        </motion.h2>
        <div className="h-px flex-1 max-w-[100px] bg-gradient-to-l from-transparent to-[#FF006E]/40" />
      </div>

      {/* Feature grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {features.map((feature) => (
          <motion.div key={feature.title} variants={cardVariants}>
            <Card
              variant="neon"
              neonColor={feature.neonColor}
              hover
              className="h-full"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default Features;
