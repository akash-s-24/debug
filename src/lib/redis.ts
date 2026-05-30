import { Redis } from '@upstash/redis';
import type { Room } from '@/types';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ROOM_TTL = 24 * 60 * 60; // 24 hours in seconds

/**
 * Get a room by its ID or room code.
 */
export async function getRoom(roomIdOrCode: string): Promise<Room | null> {
  // Try direct ID lookup
  const room = await redis.get<Room>(`room:${roomIdOrCode}`);
  if (room) return room;

  // Try code lookup
  const actualId = await redis.get<string>(`code:${roomIdOrCode.toUpperCase()}`);
  if (actualId) {
    return redis.get<Room>(`room:${actualId}`);
  }

  return null;
}

/**
 * Save a room to Redis (creates or updates). Also updates the code→ID index.
 */
export async function saveRoom(room: Room): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.set(`room:${room.id}`, room, { ex: ROOM_TTL });
  pipeline.set(`code:${room.code}`, room.id, { ex: ROOM_TTL });
  await pipeline.exec();
}

/**
 * Delete a room and its code index from Redis.
 */
export async function deleteRoom(roomId: string): Promise<void> {
  const room = await getRoom(roomId);
  if (room) {
    const pipeline = redis.pipeline();
    pipeline.del(`room:${room.id}`);
    pipeline.del(`code:${room.code}`);
    await pipeline.exec();
  }
}

// ── Leaderboard Functions ─────────────────────────────────────────────

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  points: number;
  wins: number;
  language: string;
}

/**
 * Update a user's score in the leaderboard.
 */
export async function updateUserScore(userId: string, name: string, points: number, isWin: boolean, language: string = 'TypeScript') {
  const userKey = `user:${userId}`;
  
  // Set name and language if they don't exist
  await redis.hsetnx(userKey, 'name', name);
  await redis.hsetnx(userKey, 'language', language);
  
  if (isWin) {
    await redis.hincrby(userKey, 'wins', 1);
  }
  
  // Update points in sorted set
  await redis.zincrby('leaderboard:points', points, userId);
}

/**
 * Get top players for the leaderboard.
 */
export async function getTopPlayers(limit: number = 50): Promise<LeaderboardUser[]> {
  // Get top users from sorted set
  const topData = await redis.zrange('leaderboard:points', 0, limit - 1, { rev: true, withScores: true }) as (string | number)[];
  
  const players: LeaderboardUser[] = [];
  for (let i = 0; i < topData.length; i += 2) {
    const userId = topData[i] as string;
    const points = topData[i + 1] as number;
    const userDetails = await redis.hgetall(userKey(userId)) as Record<string, string | number> | null;
    
    players.push({
      id: userId,
      rank: Math.floor(i / 2) + 1,
      name: (userDetails?.name as string) || 'Unknown Hacker',
      points: Number(points),
      wins: Number(userDetails?.wins || 0),
      language: (userDetails?.language as string) || 'TypeScript'
    });
  }
  
  return players;
}

function userKey(userId: string) {
  return `user:${userId}`;
}

export { redis };
