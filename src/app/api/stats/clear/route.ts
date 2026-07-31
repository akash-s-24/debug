import { NextResponse } from 'next/server';
import { clearLeaderboard } from '@/lib/redis';
import { revalidatePath } from 'next/cache';

export async function POST() {
  try {
    await clearLeaderboard();
    // Force the Next.js cache to purge the leaderboard page
    revalidatePath('/leaderboard');
    return NextResponse.json({ success: true, message: 'Leaderboard cleared and cache purged.' });
  } catch (error) {
    console.error('Failed to clear leaderboard:', error);
    return NextResponse.json({ success: false, error: 'Failed to clear leaderboard' }, { status: 500 });
  }
}
