'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Button } from '@/components/ui/Button';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Hero() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden bg-void flex flex-col items-center">
      
      {/* Background Glows (Subtle) */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#38BDF8]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] left-[20%] w-[500px] h-[400px] bg-[#8B5CF6]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[15%] w-[400px] h-[400px] bg-[#EC4899]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-8 inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-sm text-gray-300 backdrop-blur-md shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-neon-cyan mr-2"></span>
          Arena Engine 2.0 is now live <span className="ml-2 text-gray-500">→</span>
        </motion.div>

        <motion.div variants={itemVariants} className="max-w-4xl">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-medium tracking-tighter text-[#F8FAFC] leading-[1.1]">
            Code faster.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#8B5CF6] to-[#EC4899] italic font-normal">Competitive Debugging.</span>
          </h1>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8 max-w-2xl">
          <p className="text-lg sm:text-xl text-slate-400 leading-relaxed font-light">
            Debug Duel Arena is the ultimate live coding battle platform. Compete head-to-head in real-time, stream your battles, and prove your skills in a secure sandboxed environment.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center gap-4 mt-10"
        >
          <Button variant="primary" size="lg" className="w-full sm:w-auto px-8 h-12">
            START_BATTLE
          </Button>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 h-12 border border-[#38BDF8] text-[#38BDF8] hover:bg-[#38BDF8]/10 font-mono font-bold tracking-wider bg-transparent shadow-none">
            JOIN_BATTLE
          </Button>
        </motion.div>

        {/* Terminal/boot-sequence block */}
        <motion.div 
          variants={itemVariants} 
          className="mt-16 w-full relative max-w-4xl mx-auto"
        >
          <div className="w-full rounded-xl border border-[#1E293B] bg-[#10131B] shadow-2xl overflow-hidden font-mono text-left shadow-emerald-950/20">
            {/* Terminal Header */}
            <div className="h-10 border-b border-[#1E293B] flex items-center justify-between px-4 bg-black/40 text-xs">
              <div className="flex gap-2 items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-slate-500">arena-boot-sequence.sh</span>
              </div>
              <div className="text-slate-600 text-[11px]">SYS_EXEC · v2.0</div>
            </div>
            
            {/* Terminal Body */}
            <div className="p-6 text-xs sm:text-sm space-y-2.5 leading-relaxed overflow-x-auto">
              <div className="flex items-center gap-2">
                <span className="text-[#10B981]">ok ·</span>
                <span className="text-slate-400">Initializing sandboxed Docker container...</span>
                <span className="text-[#38BDF8] ml-auto font-semibold">[mod_docker_v2]</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#10B981]">ok ·</span>
                <span className="text-slate-400">Loading Babel AST Error Injector & Hint Engine...</span>
                <span className="text-[#38BDF8] ml-auto font-semibold">[mod_ast_mutator]</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#10B981]">ok ·</span>
                <span className="text-slate-400">Pusher presence-room signaling established (2ms latency)...</span>
                <span className="text-[#38BDF8] ml-auto font-semibold">[mod_pusher_ws]</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#10B981]">ok ·</span>
                <span className="text-slate-400">Upstash Redis session state synchronized...</span>
                <span className="text-[#38BDF8] ml-auto font-semibold">[mod_redis_store]</span>
              </div>
              <div className="pt-2 border-t border-[#1E293B]/60 flex items-center gap-2">
                <span className="text-[#F59E0B] font-bold">open —</span>
                <span className="text-[#F59E0B] animate-pulse">waiting for opponent in room #DEV-779...</span>
                <span className="text-slate-500 ml-auto text-xs">[STATUS: READY]</span>
              </div>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}

export default Hero;

