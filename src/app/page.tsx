'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LandingPage() {
  const router = useRouter();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinRole, setJoinRole] = useState<'contestant' | 'spectator'>('contestant');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode || !joinName) return;
    router.push(`/battle/${joinCode.toUpperCase()}?role=${joinRole}&name=${encodeURIComponent(joinName)}`);
  };

  return (
    <>
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        
        {/* Hero Section */}
        <section className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-12 items-start border-b border-border-subtle pb-16 mb-16">
          
          {/* Left: Text & CTA */}
          <div className="pt-6">
            <div className="font-mono text-[11px] text-text-muted whitespace-pre-wrap leading-tight mb-6 hidden md:block">
{`    ████████╗ ███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗     /////
    ╚══██╔══╝ ██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║     ▓▓▓▓
       ██║    █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║     ░░░░
       ██║    ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║       7
       ██║    ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗`}
            </div>
            
            <h1 className="font-display text-5xl md:text-[76px] leading-[0.95] tracking-[-0.03em] font-normal text-slate-100 mb-8 text-balance">
              <span className="block text-xl md:text-3xl text-[#3b82f6] font-bold tracking-wider uppercase mb-4 text-shadow-sm">Debug Duel Arena</span>
              The Ultimate Arena for<br />
              <em className="italic text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-pink-500">Competitive Debugging.</em>
              <span className="inline-block w-[0.4em] h-[0.8em] bg-emerald-400 ml-1 mb-[-0.06em] animate-pulse"></span>
            </h1>
            
            <p className="font-mono text-[15px] leading-[1.7] text-slate-300 max-w-[520px] mb-9 relative pl-6 before:content-['//'] before:absolute before:left-0 before:text-slate-500">
              Take on live coding challenges, solve real-world bugs under pressure, and prove your skills in a modern developer arena.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/create">
                <Button variant="primary" size="lg">START_BATTLE</Button>
              </Link>
              <Button 
                variant="secondary" 
                size="lg" 
                className="border border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10 font-mono font-bold tracking-wider bg-transparent transition-all duration-300 hover:-translate-y-1 shadow-none"
                onClick={() => setShowJoinModal(true)}
              >
                JOIN_BATTLE
              </Button>
            </div>
          </div>

          {/* Right: Terminal Mock */}
          <div className="bg-[#121214] border border-[#121214] rounded-md overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.08)] font-mono">
            <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-black/40 border-b border-[#121214] text-[11px] text-slate-500 tracking-wide">
              <div className="flex gap-[5px] mr-3">
                <i className="w-2 h-2 rounded-full bg-red-500"></i>
                <i className="w-2 h-2 rounded-full bg-amber-500"></i>
                <i className="w-2 h-2 rounded-full bg-emerald-500"></i>
              </div>
              ~/terminal-7/duel-arena — 80×24 — bash
            </div>
            <div className="p-4 text-xs leading-[1.65] text-slate-300 min-h-[380px]">
              <div><span className="text-slate-500"># Duel Arena boot sequence — June 2026</span></div>
              <div><span className="text-emerald-400 before:content-['$'] before:mr-2"></span>./bin/init --mode=battle</div>
              <div><span className="text-emerald-400">→ ok</span> · loaded <span className="text-sky-400">[webrtc/v0.7.2]</span></div>
              <div><span className="text-emerald-400">→ ok</span> · loaded <span className="text-sky-400">[arena/deterministic]</span></div>
              <div><span className="text-emerald-400">→ ok</span> · loaded <span className="text-sky-400">[metrics/honest]</span></div>
              <div><span className="text-slate-500"># 3 modules online · 1.2s cold start</span></div>
              <br />
              <div><span className="text-emerald-400 before:content-['$'] before:mr-2"></span>arena --list --status=active</div>
              <div>  · <span className="text-emerald-400">[0028]</span> phase-consistent debugging head <span className="text-sky-400">[active]</span></div>
              <div>  · <span className="text-emerald-400">[0029]</span> deterministic tool-use under noise <span className="text-sky-400">[active]</span></div>
              <div>  · <span className="text-emerald-400">[0030]</span> the dishonesty of leaderboards <span className="text-sky-400">[active]</span></div>
              <div>  · <span className="text-amber-400 animate-pulse">[0031] open — waiting for opponent...</span></div>
              <br />
              <div><span className="text-emerald-400 before:content-['$'] before:mr-2"></span><span className="inline-block w-[0.5em] h-[0.9em] bg-emerald-400 animate-pulse align-baseline"></span></div>
            </div>
          </div>
        </section>

        {/* How it Works / Steps */}
        <section className="max-w-[1440px] mx-auto px-6 pb-20 border-b border-white/[0.08] mb-20">
          <div className="text-[11px] tracking-[0.18em] uppercase text-slate-500 mb-6 flex items-center gap-3 before:content-['╋'] before:text-emerald-400 font-mono">
            // Engagement Protocols
          </div>
          <h2 className="font-display text-[40px] md:text-[72px] leading-[0.95] tracking-[-0.025em] text-slate-100 mb-12 max-w-[900px] text-balance">
            Three steps to enter the <em className="italic text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-pink-500 font-normal">Arena.</em> Prove your worth in real-time.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-[#121214] p-7 rounded-xl border border-white/[0.08] relative transition-all duration-300 hover:border-sky-400/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] group">
              <div className="text-[10px] tracking-[0.18em] text-slate-500 mb-3.5 flex justify-between font-mono">
                <span>// STEP 01</span><b className="text-[#3b82f6] font-bold">[init]</b>
              </div>
              <h3 className="font-display text-2xl tracking-[-0.01em] text-slate-100 mb-2">
                Configure <em className="italic text-[#3b82f6] font-normal">Loadout</em>
              </h3>
              <p className="text-[13px] leading-[1.55] text-slate-400 mb-4 font-mono">
                Host a room, select a coding challenge, and configure the battle rules (language, timer, audience). Generate a secure 6-character room code to invite your opponent.
              </p>
              <div className="flex justify-between pt-3 border-t border-white/[0.08] text-[11px] text-slate-500 tracking-[0.04em] font-mono">
                <span>Phase</span><b className="text-[#3b82f6] font-normal">Setup</b>
              </div>
            </div>

            <div className="bg-[#121214] p-7 rounded-xl border border-white/[0.08] relative transition-all duration-300 hover:border-pink-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] group">
              <div className="text-[10px] tracking-[0.18em] text-slate-500 mb-3.5 flex justify-between font-mono">
                <span>// STEP 02</span><b className="text-[#0d9488] font-bold">[sync]</b>
              </div>
              <h3 className="font-display text-2xl tracking-[-0.01em] text-slate-100 mb-2">
                Connect <em className="italic text-[#0d9488] font-normal">Terminals</em>
              </h3>
              <p className="text-[13px] leading-[1.55] text-slate-400 mb-4 font-mono">
                Join as a contestant or spectator. Our Pusher + Redis architecture securely locks you into a low-latency socket room. Wait for the countdown sequence to conclude.
              </p>
              <div className="flex justify-between pt-3 border-t border-white/[0.08] text-[11px] text-slate-500 tracking-[0.04em] font-mono">
                <span>Phase</span><b className="text-[#0d9488] font-normal">Connect</b>
              </div>
            </div>

            <div className="bg-[#121214] p-7 rounded-xl border border-white/[0.08] relative transition-all duration-300 hover:border-amber-400/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] group">
              <div className="text-[10px] tracking-[0.18em] text-slate-500 mb-3.5 flex justify-between font-mono">
                <span>// STEP 03</span><b className="text-[#F59E0B] font-bold">[exec]</b>
              </div>
              <h3 className="font-display text-2xl tracking-[-0.01em] text-slate-100 mb-2">
                Execute <em className="italic text-[#F59E0B] font-normal">Battle</em>
              </h3>
              <p className="text-[13px] leading-[1.55] text-slate-400 mb-4 font-mono">
                Code against the clock. Every keystroke is broadcasted live to spectators while deterministic algorithms instantly evaluate your typing speed, error count, and momentum.
              </p>
              <div className="flex justify-between pt-3 border-t border-white/[0.08] text-[11px] text-slate-500 tracking-[0.04em] font-mono">
                <span>Phase</span><b className="text-[#F59E0B] font-normal">Combat</b>
              </div>
            </div>

          </div>
        </section>

        {/* CTA */}
        <section className="relative py-24 px-6 text-center border-b border-white/[0.08] mb-10 overflow-hidden bg-[#0A0A0B]">
          {/* Radial gradient glow of Blue + Magenta at low opacity behind Void Black */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-[#3b82f6]/15 to-[#0d9488]/15 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="font-display text-[40px] md:text-[88px] leading-[0.95] tracking-[-0.03em] text-slate-100 mb-6 text-balance">
              We're waiting for <em className="italic text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-pink-500 font-normal">one challenger.</em>
            </h2>
            <p className="font-mono text-[15px] text-slate-400 max-w-[560px] mx-auto mb-8 leading-[1.7] relative pl-6 before:content-['//'] before:absolute before:left-0 before:text-slate-600">
              An applied engineer in deterministic systems. Strong typing. Stronger judgment. Quiet enough to share a virtual duel for a long time.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/create">
                <Button variant="primary" size="lg">START_BATTLE --ROLE=HOST</Button>
              </Link>
              <Button 
                variant="secondary" 
                size="lg" 
                className="border border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10 font-mono font-bold tracking-wider bg-transparent transition-all duration-300 hover:-translate-y-1 shadow-none"
                onClick={() => setShowJoinModal(true)}
              >
                JOIN_BATTLE
              </Button>
            </div>
          </div>
        </section>

      </main>
      
      <Footer />

      {/* Join Battle Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121214] border border-white/[0.08] shadow-[0_0_60px_rgba(59,130,246,0.15)] w-full max-w-md p-6 relative hud-bracket rounded-xl">
            <button 
              onClick={() => setShowJoinModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <h2 className="font-display text-3xl mb-2 tracking-tight text-slate-100">Join Battle</h2>
            <p className="text-slate-400 text-xs font-mono mb-6">Enter a room code to jump into the arena.</p>

            <form onSubmit={handleJoin} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-2">Room Code</label>
                <Input 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="e.g. A1B2C3"
                  required
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-2">Your Name</label>
                <Input 
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="Hacker Name"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-2">Role</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setJoinRole('contestant')}
                    className={`flex-1 py-2 font-mono text-xs uppercase tracking-widest border transition-colors ${
                      joinRole === 'contestant' 
                        ? 'bg-[#3b82f6] text-black font-bold border-[#3b82f6]' 
                        : 'bg-transparent text-slate-400 border-white/[0.08] hover:border-slate-400'
                    }`}
                  >
                    Contestant
                  </button>
                  <button
                    type="button"
                    onClick={() => setJoinRole('spectator')}
                    className={`flex-1 py-2 font-mono text-xs uppercase tracking-widest border transition-colors ${
                      joinRole === 'spectator' 
                        ? 'bg-[#3b82f6] text-black font-bold border-[#3b82f6]' 
                        : 'bg-transparent text-slate-400 border-white/[0.08] hover:border-slate-400'
                    }`}
                  >
                    Spectator
                  </button>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button type="button" variant="ghost" className="flex-1 text-slate-400 hover:text-white" onClick={() => setShowJoinModal(false)}>
                  CANCEL
                </Button>
                <Button type="submit" variant="primary" className="flex-1 font-bold">
                  JOIN_ROOM
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
