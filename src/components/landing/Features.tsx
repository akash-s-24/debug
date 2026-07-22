'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Card } from '@/components/ui/Card';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: '🎯',
    title: 'Real-time Battles',
    description:
      'Compete head-to-head in live coding duels with real-time screen sharing and instant feedback.',
  },
  {
    icon: '📺',
    title: 'Live Streaming',
    description:
      'Watch battles unfold in a cinematic split-screen arena with audience interaction and reactions.',
  },
  {
    icon: '🤖',
    title: 'AI Analytics',
    description:
      'Advanced AI tracks coding speed, patterns, errors, and momentum to score performance in real-time.',
  },
  {
    icon: '⚡',
    title: 'Ultra Low Latency',
    description:
      'WebRTC-powered streaming with sub-100ms latency. Every keystroke is captured instantly.',
  },
  {
    icon: '🏆',
    title: 'Tournaments',
    description:
      'Join bracket-style tournaments, climb leaderboards, and earn rankings across multiple languages.',
  },
  {
    icon: '🔒',
    title: 'Secure Sandboxing',
    description:
      'All code runs in isolated sandboxed environments. No cheating, no shortcuts, pure skill.',
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export function Features() {
  return (
    <section className="relative py-24 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Section header */}
      <div className="flex flex-col items-center justify-center gap-4 mb-16 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-display font-medium text-text-primary tracking-tight"
        >
          Everything you need to compete.
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-text-secondary max-w-2xl text-lg"
        >
          Built for performance, scalability, and ultra-low latency. 
        </motion.p>
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
              className="h-full p-6 bg-slate-900 border border-slate-dark hover:border-slate-muted transition-colors duration-300"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
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
