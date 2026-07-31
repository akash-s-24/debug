'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export function Navbar() {
  const [time, setTime] = useState<string>('--:--:--');

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const z = (n: number) => String(n).padStart(2, '0');
      setTime(`${z(d.getUTCHours())}:${z(d.getUTCMinutes())}:${z(d.getUTCSeconds())}Z`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 grid grid-cols-[auto_1fr_auto] items-center px-6 py-3 bg-[#0A0A0B]/95 backdrop-blur border-b border-white/[0.08] text-xs tracking-wider">
        <Link href="/" className="font-mono font-bold text-base tracking-widest flex items-center gap-2 text-emerald-400">
          <div className="w-2.5 h-2.5 bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse rounded-sm" />
          DEBUG_DUEL_ARENA
        </Link>
        
        <div className="hidden md:flex gap-6 justify-self-center text-slate-200 font-mono">
          <Link className="hover:text-emerald-400 hover:underline decoration-emerald-400 underline-offset-4 transition-all before:content-['['] before:text-slate-500 after:content-[']'] after:text-slate-500" href="/">arena</Link>
          <Link className="hover:text-emerald-400 hover:underline decoration-emerald-400 underline-offset-4 transition-all before:content-['['] before:text-slate-500 after:content-[']'] after:text-slate-500" href="/leaderboard">leaderboard</Link>
          <Link className="hover:text-emerald-400 hover:underline decoration-emerald-400 underline-offset-4 transition-all before:content-['['] before:text-slate-500 after:content-[']'] after:text-slate-500" href="/create">create_battle</Link>
          <Link className="hover:text-emerald-400 hover:underline decoration-emerald-400 underline-offset-4 transition-all before:content-['['] before:text-slate-500 after:content-[']'] after:text-slate-500" href="/about">about</Link>
        </div>

        <div className="text-slate-500 text-[11px] font-mono">
          SYS · <b className="text-emerald-400 font-normal">{time}</b>
        </div>
      </nav>
      
      <div className="fixed top-[48px] left-0 right-0 z-40 flex justify-between items-center px-6 py-1.5 text-[10px] tracking-[0.08em] uppercase text-slate-500 border-b border-white/[0.05] bg-[#0A0A0B]/95 backdrop-blur font-mono">
        <span>BUILD: <b className="text-emerald-400 font-normal">0.7.2-rc4</b></span>
        <span>UPTIME: <b className="text-emerald-400 font-normal">71d 04h 22m</b></span>
        <span>NODE: <b className="text-emerald-400 font-normal">SF-04 · NOMINAL</b></span>
        <span>LOAD: <b className="text-amber-400 font-normal">38%</b></span>
        <span className="flex items-center gap-1">CTRL: <b className="text-sky-400 font-normal animate-pulse">OPEN INTAKE WAVE 03</b></span>
      </div>
    </>
  );
}

export default Navbar;
