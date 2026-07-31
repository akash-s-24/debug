import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'About | Debug Duel Arena',
  description: 'Learn more about Debug Duel Arena, the premier platform for live coding battles, screen share duels, and competitive programming challenges.',
};

export default function AboutPage() {
  return (
    <div className="flex-1 flex flex-col items-center p-8 overflow-y-auto">
      <div className="w-full max-w-4xl space-y-12">
        <header className="text-center space-y-4">
          <h1 className="font-display text-5xl md:text-6xl text-brand-primary tracking-tighter">
            ABOUT DEBUG DUEL ARENA
          </h1>
          <p className="font-mono text-text-secondary text-sm md:text-base uppercase tracking-widest max-w-2xl mx-auto">
            The ultimate esports-style live coding battle platform.
          </p>
        </header>

        <article className="prose prose-invert prose-brand max-w-none space-y-8 text-text-primary">
          <section className="bg-void border border-border-subtle p-8 shadow-md hud-bracket relative">
            <div className="scanline-overlay"></div>
            <h2 className="font-display text-3xl text-brand-secondary mb-4 tracking-tight relative z-10">
              What is Debug Duel Arena?
            </h2>
            <p className="font-body text-lg leading-relaxed relative z-10">
              <strong>Debug Duel Arena</strong> is the definitive platform for competitive programming, where developers face off in real-time coding battles. Whether you're debugging legacy code under pressure or competing in code golf challenges, our arena provides the perfect environment to prove your skills.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-surface border border-border-subtle p-8 shadow-sm">
              <div className="text-brand-primary text-4xl mb-4 material-symbols-outlined">terminal</div>
              <h3 className="font-display text-2xl mb-3">Live Coding Battles</h3>
              <p className="text-text-secondary">
                Host or join a live coding battle with your friends or colleagues. Complete challenges utilizing our built-in ultra-fast Monaco editor environment, complete with standard input/output testing and instant execution.
              </p>
            </section>

            <section className="bg-surface border border-border-subtle p-8 shadow-sm">
              <div className="text-brand-secondary text-4xl mb-4 material-symbols-outlined">screen_share</div>
              <h3 className="font-display text-2xl mb-3">Screen Share Duels</h3>
              <p className="text-text-secondary">
                Prefer your own IDE? Debug Duel Arena features a custom low-latency WebRTC screen share mode. Hosts can spectate multiple contestants in real-time from their dashboard, bringing an esports broadcasting feel to your programming duels.
              </p>
            </section>
          </div>

          <section className="bg-void border border-border-subtle p-8 shadow-md">
            <h2 className="font-display text-3xl text-brand-primary mb-4 tracking-tight">
              Ready to enter the arena?
            </h2>
            <p className="font-body text-lg text-text-secondary mb-8">
              No sign-up required to start a battle. Generate a room code and invite your opponent today.
            </p>
            <div className="flex gap-4">
              <Link href="/create" className="bg-brand-primary text-void px-6 py-3 font-bold uppercase tracking-widest hover:bg-brand-secondary transition-colors text-center">
                HOST A BATTLE
              </Link>
              <Link href="/" className="bg-transparent border border-brand-primary text-brand-primary px-6 py-3 font-bold uppercase tracking-widest hover:bg-brand-primary/10 transition-colors text-center">
                JOIN A BATTLE
              </Link>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
