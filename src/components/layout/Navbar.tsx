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
      <nav className="fixed top-0 left-0 right-0 z-50 grid grid-cols-[auto_1fr_auto] items-center px-6 py-3 bg-void/90 backdrop-blur border-b border-border-subtle text-xs tracking-wider">
        <Link href="/" className="font-mono font-bold text-base tracking-widest flex items-center gap-2 text-text-primary">
          <div className="w-2.5 h-2.5 bg-neon-green shadow-[0_0_12px_rgba(82,255,138,1)] animate-pulse rounded-sm" />
          DEBUG_DUEL_ARENA
        </Link>
        
        <div className="hidden md:flex gap-6 justify-self-center text-text-muted font-mono">
          <Link className="hover:text-neon-cyan transition-colors before:content-['['] after:content-[']']" href="/">arena</Link>
          <Link className="hover:text-neon-cyan transition-colors before:content-['['] after:content-[']']" href="/leaderboard">leaderboard</Link>
          <Link className="hover:text-neon-cyan transition-colors before:content-['['] after:content-[']']" href="/create">create_battle</Link>
        </div>

        <div className="text-text-muted text-[11px] font-mono">
          SYS · <b className="text-neon-cyan font-normal">{time}</b>
        </div>
      </nav>
      
      <div className="fixed top-[48px] left-0 right-0 z-40 flex justify-between items-center px-6 py-1.5 text-[10px] tracking-[0.08em] uppercase text-text-muted border-b border-[rgba(255,184,74,0.12)] bg-void/90 backdrop-blur font-mono">
        <span>BUILD: <b className="text-neon-green font-normal">0.7.2-rc4</b></span>
        <span>UPTIME: <b className="text-neon-green font-normal">71d 04h 22m</b></span>
        <span>NODE: <b className="text-neon-green font-normal">SF-04 · NOMINAL</b></span>
        <span>LOAD: <b className="text-neon-green font-normal">38%</b></span>
        <span className="flex items-center gap-1">CTRL: <b className="text-danger-red font-normal animate-pulse">OPEN INTAKE WAVE 03</b></span>
      </div>
    </>
  );
}

export default Navbar;
