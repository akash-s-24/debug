'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full mt-auto bg-[#070709] border-t border-white/[0.08] grid grid-cols-1 md:grid-cols-4 gap-8 px-8 py-16 max-w-[1440px] mx-auto">
      <div className="col-span-1 md:col-span-1 flex flex-col justify-between">
        <div className="text-slate-100 font-black font-display text-2xl tracking-tighter mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          DEBUG_ARENA
        </div>
        <div className="font-mono text-xs text-slate-500 uppercase flex items-center gap-2">
          © {new Date().getFullYear()} DEBUG_ARENA // <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> SYSTEM_OPERATIONAL
        </div>
      </div>
      
      <div className="col-span-1 md:col-span-3 flex flex-wrap gap-8 md:justify-end items-end">
        <Link className="font-mono text-sm text-slate-500 hover:text-emerald-400 transition-colors uppercase" href="/#features">
          Features
        </Link>
        <Link className="font-mono text-sm text-slate-500 hover:text-emerald-400 transition-colors uppercase" href="/#how-it-works">
          How It Works
        </Link>
        <Link className="font-mono text-sm text-slate-500 hover:text-emerald-400 transition-colors uppercase" href="/create">
          Create
        </Link>
        <Link className="font-mono text-sm text-slate-500 hover:text-emerald-400 transition-colors uppercase" href="/">
          Join
        </Link>
        <a 
          className="font-mono text-sm text-slate-500 hover:text-emerald-400 transition-colors uppercase" 
          href="https://github.com/akash-s-24"
          target="_blank"
          rel="noopener noreferrer"
        >
          Report Issue
        </a>
      </div>
    </footer>
  );
}

export default Footer;
