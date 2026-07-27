import { NextResponse } from 'next/server';
import { getRoom } from '@/lib/redis';
import { ErrorGenerator } from '@/lib/error-generator';
import { cleanChallenges } from '@/lib/code-snippets';
import { triggerRoomEvent } from '@/lib/pusher-server';

export async function POST(req: Request) {
  try {
    const { roomId, player, submittedCode } = await req.json();
    const room = await getRoom(roomId);
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    const challenge = cleanChallenges.find(c => c.id === room.config.challenge) || cleanChallenges[0];
    const seed = roomId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    
    // Re-generate to get the expected errors
    const { errors } = ErrorGenerator.injectErrors(challenge.code, player as 'A'|'B', seed);

    let fixedCount = 0;
    const resolutions = errors.map(err => {
      // Validate by checking if the original clean snippet is restored
      const cleanSnippet = err.originalNodeSnippet || '';
      const brokenSnippet = err.brokenNodeSnippet || '';
      
      const isFixed = submittedCode.includes(cleanSnippet) && !submittedCode.includes(brokenSnippet);
      if (isFixed) fixedCount++;
      return { id: err.id, isFixed };
    });

    const isFullyFixed = fixedCount === errors.length;

    // Trigger an event so the Host Dashboard knows
    await triggerRoomEvent(roomId, 'player-submitted', { player, fixedCount, total: errors.length, isFullyFixed });

    return NextResponse.json({ resolutions, fixedCount, total: errors.length, isFullyFixed }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
