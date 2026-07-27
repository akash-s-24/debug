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
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#0C447C]/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] left-[20%] w-[500px] h-[400px] bg-[#185FA5]/20 rounded-full blur-[100px] pointer-events-none" />

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
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-medium tracking-tighter text-white leading-[1.1]">
            Code faster.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#85B7EB] via-[#E6F1FB] to-[#378ADD]">Battle smarter.</span>
          </h1>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8 max-w-2xl">
          <p className="text-lg sm:text-xl text-gray-400 leading-relaxed font-light">
            Debug Duel Arena is the ultimate live coding battle platform. Compete head-to-head in real-time, stream your battles, and prove your skills in a secure sandboxed environment.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center gap-4 mt-10"
        >
          <Button variant="primary" size="lg" className="w-full sm:w-auto px-8 h-12 shadow-[0_0_20px_rgba(55,138,221,0.35)]">
            Create a Battle
          </Button>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 h-12 border-white/10 hover:bg-white/5">
            Join the Arena
          </Button>
        </motion.div>

        {/* Dashboard/Product Mockup Preview (Linear Style) */}
        <motion.div 
          variants={itemVariants} 
          className="mt-20 w-full relative perspective-[2000px]"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent z-20 top-1/2" />
          
          <motion.div 
            initial={{ rotateX: 20, y: 50, opacity: 0 }}
            animate={{ rotateX: 0, y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="w-full rounded-2xl border border-white/[0.08] bg-abyss shadow-2xl overflow-hidden shadow-sky-900/20"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Mockup Header */}
            <div className="h-10 border-b border-white/[0.05] flex items-center px-4 gap-2 bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="mx-auto bg-black/40 rounded px-4 py-1 text-xs text-gray-500 font-mono">
                arena.debugduel.com/battle/dev-123
              </div>
            </div>
            
            {/* Mockup Body (Split View like the actual app) */}
            <div className="flex h-[400px] sm:h-[600px] bg-void">
              {/* Left Panel - Code Editor Mock */}
              <div className="flex-1 border-r border-white/[0.05] p-4 font-mono text-sm">
                <div className="flex text-gray-500 mb-4 gap-4 text-xs">
                  <span className="text-gray-300">main.ts</span>
                  <span>utils.ts</span>
                </div>
                <div className="text-purple-400">export function <span className="text-blue-400">calculateScore</span><span className="text-gray-300">(</span></div>
                <div className="pl-4 text-gray-300">timeMs: <span className="text-yellow-300">number</span>,</div>
                <div className="pl-4 text-gray-300">complexity: <span className="text-yellow-300">number</span></div>
                <div className="text-gray-300">) {'{'}</div>
                <div className="pl-4 text-gray-500">{'// Linear scoring algorithm'}</div>
                <div className="pl-4 text-purple-400">const <span className="text-blue-200">baseScore</span> = <span className="text-orange-400">10000</span>;</div>
                <div className="pl-4 text-purple-400">return <span className="text-blue-200">baseScore</span> - (timeMs * complexity);</div>
                <div className="text-gray-300">{'}'}</div>
                
                {/* Simulated cursor */}
                <div className="inline-block w-2 h-4 bg-purple-500 animate-pulse mt-2" />
              </div>

              {/* Right Panel - Stats Mock */}
              <div className="w-1/3 hidden md:flex flex-col p-4 gap-4 bg-black/20">
                <div className="rounded-lg border border-white/[0.05] p-4 bg-white/[0.02]">
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Opponent</div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                    <div>
                      <div className="text-sm text-gray-200">Alex Hacker</div>
                      <div className="text-xs text-red-400">3 Errors • 120 WPM</div>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border border-white/[0.05] p-4 bg-white/[0.02] flex-1">
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">Live Execution</div>
                  <div className="font-mono text-xs text-green-400 leading-relaxed">
                    {'>'} Compiling...<br/>
                    {'>'} Build successful (42ms)<br/>
                    {'>'} Running test suite...<br/>
                    {'>'} ✓ Test 1 passed<br/>
                    {'>'} ✓ Test 2 passed<br/>
                    {'>'} ✓ Test 3 passed<br/>
                    <br/>
                    <span className="text-blue-400">All tests passing. Ready to submit.</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

      </motion.div>
    </section>
  );
}

export default Hero;

