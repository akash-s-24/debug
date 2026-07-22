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
        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 bg-abyss border border-border-subtle text-[11px] uppercase tracking-widest font-mono text-neon-cyan shadow-inner">
          [ Global Rankings ]
        </div>
        <h1 className="text-4xl md:text-5xl font-display text-text-primary tracking-tight mb-4">
          Arena Leaderboard
        </h1>
        <p className="text-text-secondary font-mono text-sm before:content-['//'] before:mr-2 before:text-text-muted">
          The most ruthless debuggers and fastest coders in the duel arena.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-void border border-border-subtle shadow-md hud-bracket p-1"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-abyss">
                <th className="py-4 px-6 text-[10px] font-mono text-text-muted uppercase tracking-widest w-20 text-center">Rank</th>
                <th className="py-4 px-6 text-[10px] font-mono text-text-muted uppercase tracking-widest">Hacker</th>
                <th className="py-4 px-6 text-[10px] font-mono text-text-muted uppercase tracking-widest">Main Lang</th>
                <th className="py-4 px-6 text-[10px] font-mono text-text-muted uppercase tracking-widest text-right">Wins</th>
                <th className="py-4 px-6 text-[10px] font-mono text-text-muted uppercase tracking-widest text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {players.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i + 0.2 }}
                  className="hover:bg-abyss transition-colors group"
                >
                  <td className="py-4 px-6 text-center">
                    <span className={`text-sm font-mono tracking-widest ${user.rank <= 3 ? 'text-neon-magenta' : 'text-text-secondary'}`}>
                      #{user.rank}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm font-mono text-text-primary group-hover:text-neon-cyan transition-colors">
                    {user.name}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 bg-transparent font-mono tracking-widest text-[10px] text-text-secondary border border-border-subtle">
                      {user.language}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right text-sm font-mono text-text-secondary">
                    {user.wins}
                  </td>
                  <td className="py-4 px-6 text-right text-sm font-mono font-bold text-neon-cyan">
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
