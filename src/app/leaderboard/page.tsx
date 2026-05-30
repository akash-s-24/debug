import { Navbar } from '@/components/layout/Navbar';
import { getTopPlayers } from '@/lib/redis';
import { LeaderboardClient } from './LeaderboardClient';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function LeaderboardPage() {
  const topPlayers = await getTopPlayers(100);

  return (
    <div className="min-h-screen bg-void flex flex-col relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-cyan/5 rounded-full blur-[120px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 pt-32 pb-16 relative z-10">
        <LeaderboardClient initialPlayers={topPlayers} />
      </main>
    </div>
  );
}
