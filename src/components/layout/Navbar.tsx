'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

const navLinks = [
  { label: 'Arena', href: '#arena' },
  { label: 'Features', href: '#features' },
  { label: 'Leaderboard', href: '#leaderboard' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="bg-black/40 backdrop-blur-lg border-b border-white/5">
        {/* Gradient bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-[#00F0FF]/40 via-[#7B2FF7]/20 to-[#FF006E]/40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 group">
              <span className="text-2xl">⚔️</span>
              <span
                className="text-xl font-black uppercase tracking-wider text-white group-hover:text-[#00F0FF] transition-colors duration-300"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  textShadow: '0 0 15px rgba(0,240,255,0.3)',
                }}
              >
                Debug Duel
              </span>
            </a>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-white/50 hover:text-white uppercase tracking-wider font-medium transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}

              {/* Connection indicator */}
              <div className="flex items-center gap-2 text-xs text-white/40 mr-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#00FF88] opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00FF88]" />
                </span>
                ONLINE
              </div>

              <Button variant="ghost" size="sm">
                Join
              </Button>
              <Button variant="primary" size="sm">
                Create Battle
              </Button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <motion.span
                className="block w-6 h-0.5 bg-white/70"
                animate={mobileOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              />
              <motion.span
                className="block w-6 h-0.5 bg-white/70"
                animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              />
              <motion.span
                className="block w-6 h-0.5 bg-white/70"
                animate={mobileOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-black/80 backdrop-blur-xl border-b border-white/5 overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-white/60 hover:text-white uppercase tracking-wider font-medium py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex gap-3 mt-2">
                <Button variant="ghost" size="sm" className="flex-1">
                  Join
                </Button>
                <Button variant="primary" size="sm" className="flex-1">
                  Create Battle
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Navbar;
