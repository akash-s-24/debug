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
            
            <h1 className="font-display text-5xl md:text-[76px] leading-[0.95] tracking-[-0.03em] font-normal text-text-primary mb-8 text-balance">
              The Ultimate Arena for<br />
              <em className="italic text-neon-cyan">Competitive Debugging.</em>
              <span className="inline-block w-[0.4em] h-[0.8em] bg-neon-cyan ml-1 mb-[-0.06em] animate-pulse"></span>
            </h1>
            
            <p className="font-mono text-[15px] leading-[1.7] text-text-secondary max-w-[520px] mb-9 relative pl-6 before:content-['//'] before:absolute before:left-0 before:text-text-muted">
              Take on live coding challenges, solve real-world bugs under pressure, and prove your skills in a modern developer arena.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/create">
                <Button variant="primary" size="lg">START_BATTLE</Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:text-neon-cyan"
                onClick={() => setShowJoinModal(true)}
              >
                JOIN_BATTLE
              </Button>
            </div>
          </div>

          {/* Right: Terminal Mock */}
          <div className="bg-abyss border border-border-subtle rounded-md overflow-hidden shadow-[0_0_60px_rgba(255,184,74,0.06)]">
            <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[rgba(255,184,74,0.06)] border-b border-[rgba(255,184,74,0.18)] text-[11px] text-text-muted tracking-wide font-mono">
              <div className="flex gap-[5px] mr-3">
                <i className="w-2 h-2 rounded-full bg-danger-red"></i>
                <i className="w-2 h-2 rounded-full bg-neon-cyan"></i>
                <i className="w-2 h-2 rounded-full bg-neon-green"></i>
              </div>
              ~/terminal-7/duel-arena — 80×24 — bash
            </div>
            <div className="p-4 text-xs leading-[1.65] text-text-secondary font-mono min-h-[380px]">
              <div><span className="text-text-muted"># Duel Arena boot sequence — June 2026</span></div>
              <div><span className="text-neon-green before:content-['$'] before:mr-2"></span>./bin/init --mode=battle</div>
              <div><span className="text-neon-green">→ ok</span> · loaded <span className="text-neon-green">webrtc/v0.7.2</span></div>
              <div><span className="text-neon-green">→ ok</span> · loaded <span className="text-neon-green">arena/deterministic</span></div>
              <div><span className="text-neon-green">→ ok</span> · loaded <span className="text-neon-green">metrics/honest</span></div>
              <div><span className="text-text-muted"># 3 modules online · 1.2s cold start</span></div>
              <br />
              <div><span className="text-neon-green before:content-['$'] before:mr-2"></span>arena --list --status=active</div>
              <div>  · <span className="text-neon-green">[0028]</span> phase-consistent debugging head</div>
              <div>  · <span className="text-neon-green">[0029]</span> deterministic tool-use under noise</div>
              <div>  · <span className="text-neon-green">[0030]</span> the dishonesty of leaderboards</div>
              <div>  · <span className="text-danger-red">[0031]</span> open — waiting for opponent...</div>
              <br />
              <div><span className="text-neon-green before:content-['$'] before:mr-2"></span><span className="inline-block w-[0.5em] h-[0.9em] bg-neon-cyan animate-pulse align-baseline"></span></div>
            </div>
          </div>
        </section>

        {/* How it Works / Steps */}
        <section className="max-w-[1440px] mx-auto px-6 pb-20 border-b border-border-subtle mb-20">
          <div className="text-[11px] tracking-[0.18em] uppercase text-text-muted mb-6 flex items-center gap-3 before:content-['╋'] before:text-neon-cyan font-mono">
            // Engagement Protocols
          </div>
          <h2 className="font-display text-[40px] md:text-[72px] leading-[0.95] tracking-[-0.025em] text-text-primary mb-12 max-w-[900px] text-balance">
            Three steps to enter the <em>Arena.</em> Prove your worth in real-time.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-border-subtle border border-border-subtle">
            
            <div className="bg-void p-7 relative transition-colors duration-300 hover:bg-abyss group">
              <div className="text-[10px] tracking-[0.18em] text-text-muted mb-3.5 flex justify-between font-mono">
                <span>// STEP 01</span><b className="text-neon-cyan font-normal">init</b>
              </div>
              <h3 className="font-display text-2xl tracking-[-0.01em] text-text-primary mb-2">
                Configure <em>Loadout</em>
              </h3>
              <p className="text-[13px] leading-[1.55] text-text-secondary mb-4 font-mono">
                Host a room, select a coding challenge, and configure the battle rules (language, timer, audience). Generate a secure 6-character room code to invite your opponent.
              </p>
              <div className="flex justify-between pt-3 border-t border-border-subtle text-[11px] text-text-muted tracking-[0.04em] font-mono">
                <span>Phase</span><b className="text-neon-green font-normal">Setup</b>
              </div>
            </div>

            <div className="bg-void p-7 relative transition-colors duration-300 hover:bg-abyss group">
              <div className="text-[10px] tracking-[0.18em] text-text-muted mb-3.5 flex justify-between font-mono">
                <span>// STEP 02</span><b className="text-neon-cyan font-normal">sync</b>
              </div>
              <h3 className="font-display text-2xl tracking-[-0.01em] text-text-primary mb-2">
                Connect <em>Terminals</em>
              </h3>
              <p className="text-[13px] leading-[1.55] text-text-secondary mb-4 font-mono">
                Join as a contestant or spectator. Our Pusher + Redis architecture securely locks you into a low-latency socket room. Wait for the countdown sequence to conclude.
              </p>
              <div className="flex justify-between pt-3 border-t border-border-subtle text-[11px] text-text-muted tracking-[0.04em] font-mono">
                <span>Phase</span><b className="text-neon-green font-normal">Connect</b>
              </div>
            </div>

            <div className="bg-void p-7 relative transition-colors duration-300 hover:bg-abyss group">
              <div className="text-[10px] tracking-[0.18em] text-text-muted mb-3.5 flex justify-between font-mono">
                <span>// STEP 03</span><b className="text-neon-cyan font-normal">exec</b>
              </div>
              <h3 className="font-display text-2xl tracking-[-0.01em] text-text-primary mb-2">
                Execute <em>Battle</em>
              </h3>
              <p className="text-[13px] leading-[1.55] text-text-secondary mb-4 font-mono">
                Code against the clock. Every keystroke is broadcasted live to spectators while deterministic algorithms instantly evaluate your typing speed, error count, and momentum.
              </p>
              <div className="flex justify-between pt-3 border-t border-border-subtle text-[11px] text-text-muted tracking-[0.04em] font-mono">
                <span>Phase</span><b className="text-neon-green font-normal">Combat</b>
              </div>
            </div>

          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 text-center border-b border-border-subtle mb-10">
          <h2 className="font-display text-[40px] md:text-[88px] leading-[0.95] tracking-[-0.03em] text-text-primary mb-6 text-balance">
            We're waiting for <em>one challenger.</em>
          </h2>
          <p className="font-mono text-[15px] text-text-secondary max-w-[560px] mx-auto mb-8 leading-[1.7] relative pl-6 before:content-['//'] before:absolute before:left-0 before:text-text-muted">
            An applied engineer in deterministic systems. Strong typing. Stronger judgment. Quiet enough to share a virtual duel for a long time.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/create">
              <Button variant="primary" size="lg">START_BATTLE --ROLE=HOST</Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:text-neon-cyan"
              onClick={() => setShowJoinModal(true)}
            >
              JOIN_BATTLE
            </Button>
          </div>
        </section>

      </main>
      
      <Footer />

      {/* Join Battle Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-void border border-border-subtle shadow-[0_0_60px_rgba(255,184,74,0.06)] w-full max-w-md p-6 relative hud-bracket">
            <button 
              onClick={() => setShowJoinModal(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <h2 className="font-display text-3xl mb-2 tracking-tight text-text-primary">Join Battle</h2>
            <p className="text-text-secondary text-xs font-mono mb-6">Enter a room code to jump into the arena.</p>

            <form onSubmit={handleJoin} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-mono text-text-muted uppercase tracking-widest mb-2">Room Code</label>
                <Input 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="e.g. A1B2C3"
                  required
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-text-muted uppercase tracking-widest mb-2">Your Name</label>
                <Input 
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="Hacker Name"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-text-muted uppercase tracking-widest mb-2">Role</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setJoinRole('contestant')}
                    className={`flex-1 py-2 font-mono text-xs uppercase tracking-widest border transition-colors ${
                      joinRole === 'contestant' 
                        ? 'bg-neon-cyan text-void border-neon-cyan' 
                        : 'bg-transparent text-text-secondary border-border-subtle hover:border-text-secondary'
                    }`}
                  >
                    Contestant
                  </button>
                  <button
                    type="button"
                    onClick={() => setJoinRole('spectator')}
                    className={`flex-1 py-2 font-mono text-xs uppercase tracking-widest border transition-colors ${
                      joinRole === 'spectator' 
                        ? 'bg-neon-cyan text-void border-neon-cyan' 
                        : 'bg-transparent text-text-secondary border-border-subtle hover:border-text-secondary'
                    }`}
                  >
                    Spectator
                  </button>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowJoinModal(false)}>
                  CANCEL
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
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
