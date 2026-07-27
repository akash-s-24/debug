import { NextResponse } from 'next/server';
import { getRoom } from '@/lib/redis';
import { cleanChallenges, getRandomChallenge } from '@/lib/code-snippets';
import { ErrorGenerator } from '@/lib/error-generator';

export async function POST(req: Request) {
  try {
    const { roomId, player } = await req.json();
    if (!roomId || !player) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const room = await getRoom(roomId);
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    const challenge = cleanChallenges.find(c => c.id === room.config.challenge) || cleanChallenges[0];
    
    // Seed is sum of char codes of room id to be deterministic
    const seed = roomId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    
    const { code: brokenCode, errors } = ErrorGenerator.injectErrors(challenge.code, player as 'A'|'B', seed);

    return NextResponse.json({ code: brokenCode, errors }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate errors' }, { status: 500 });
  }
}
