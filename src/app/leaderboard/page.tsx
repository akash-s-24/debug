'use client';

import { Navbar } from '@/components/layout/Navbar';
import { motion } from 'framer-motion';

const mockLeaderboard = [
  { rank: 1, name: 'Neo', points: 12450, wins: 342, language: 'TypeScript' },
  { rank: 2, name: 'Trinity', points: 11200, wins: 298, language: 'Python' },
  { rank: 3, name: 'Morpheus', points: 10850, wins: 275, language: 'Go' },
  { rank: 4, name: 'Smith', points: 9500, wins: 210, language: 'Rust' },
  { rank: 5, name: 'Cypher', points: 8900, wins: 180, language: 'JavaScript' },
  { rank: 6, name: 'Switch', points: 8200, wins: 154, language: 'C++' },
  { rank: 7, name: 'Apoc', points: 7600, wins: 142, language: 'Java' },
  { rank: 8, name: 'Mouse', points: 7100, wins: 120, language: 'PHP' },
];

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-void flex flex-col relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-cyan/5 rounded-full blur-[120px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 pt-32 pb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="px-4 py-1.5 rounded-full glass neon-border-violet text-xs font-mono text-neon-violet tracking-wider uppercase mb-6 inline-block">
            Global Rankings
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-4">
            ARENA <span className="text-neon-cyan text-glow-cyan">LEADERBOARD</span>
          </h1>
          <p className="font-body text-text-secondary">
            The most ruthless debuggers and fastest coders in the duel arena.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-strong rounded-2xl border border-white/10 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/40">
                  <th className="py-4 px-6 font-mono text-text-muted text-xs uppercase tracking-widest w-20 text-center">Rank</th>
                  <th className="py-4 px-6 font-mono text-text-muted text-xs uppercase tracking-widest">Hacker</th>
                  <th className="py-4 px-6 font-mono text-text-muted text-xs uppercase tracking-widest">Main Lang</th>
                  <th className="py-4 px-6 font-mono text-text-muted text-xs uppercase tracking-widest text-right">Wins</th>
                  <th className="py-4 px-6 font-mono text-text-muted text-xs uppercase tracking-widest text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {mockLeaderboard.map((user, i) => (
                  <motion.tr
                    key={user.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i + 0.3 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  >
                    <td className="py-4 px-6 text-center">
                      {user.rank === 1 ? <span className="text-2xl">🥇</span> : 
                       user.rank === 2 ? <span className="text-2xl">🥈</span> : 
                       user.rank === 3 ? <span className="text-2xl">🥉</span> : 
                       <span className="font-mono text-text-muted font-bold">{user.rank}</span>}
                    </td>
                    <td className="py-4 px-6 font-display font-bold text-lg text-white group-hover:text-neon-cyan transition-colors">
                      {user.name}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded bg-white/5 text-xs font-mono text-text-secondary border border-white/10">
                        {user.language}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-text-secondary">
                      {user.wins}
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-neon-cyan">
                      {user.points.toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
