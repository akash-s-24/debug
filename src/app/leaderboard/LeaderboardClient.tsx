'use client';

import { motion } from 'framer-motion';
import { LeaderboardUser } from '@/lib/redis';

interface Props {
  initialPlayers: LeaderboardUser[];
}

export function LeaderboardClient({ initialPlayers }: Props) {
  const players = initialPlayers.length > 0 ? initialPlayers : [
    { id: '1', rank: 1, name: 'Neo (Mock)', points: 12450, wins: 342, language: 'TypeScript' },
    { id: '2', rank: 2, name: 'Trinity (Mock)', points: 11200, wins: 298, language: 'Python' },
    { id: '3', rank: 3, name: 'Morpheus (Mock)', points: 10850, wins: 275, language: 'Go' },
  ];

  return (
    <>
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
              {players.map((user, i) => (
                <motion.tr
                  key={user.id}
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
    </>
  );
}
