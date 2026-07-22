import { Redis } from '@upstash/redis';
import type { Room } from '@/types';

const isFake = process.env.UPSTASH_REDIS_REST_URL?.includes('fake-upstash');

const redis = isFake ? null : new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Mock stores for local development when Upstash is not configured
const mockRooms = new Map<string, Room>();
const mockCodes = new Map<string, string>();
const mockUsers = new Map<string, Record<string, string | number>>();
const mockPoints = new Map<string, number>();

const ROOM_TTL = 24 * 60 * 60; // 24 hours in seconds

export async function getRoom(roomIdOrCode: string): Promise<Room | null> {
  if (isFake) {
    let room = mockRooms.get(roomIdOrCode);
    if (room) return room;
    const actualId = mockCodes.get(roomIdOrCode.toUpperCase());
    if (actualId) return mockRooms.get(actualId) || null;
    return null;
  }

  const room = await redis!.get<Room>(`room:${roomIdOrCode}`);
  if (room) return room;

  const actualId = await redis!.get<string>(`code:${roomIdOrCode.toUpperCase()}`);
  if (actualId) {
    return redis!.get<Room>(`room:${actualId}`);
  }

  return null;
}

export async function saveRoom(room: Room): Promise<void> {
  if (isFake) {
    mockRooms.set(room.id, room);
    mockCodes.set(room.code, room.id);
    return;
  }

  const pipeline = redis!.pipeline();
  pipeline.set(`room:${room.id}`, room, { ex: ROOM_TTL });
  pipeline.set(`code:${room.code}`, room.id, { ex: ROOM_TTL });
  await pipeline.exec();
}

export async function deleteRoom(roomId: string): Promise<void> {
  const room = await getRoom(roomId);
  if (room) {
    if (isFake) {
      mockRooms.delete(room.id);
      mockCodes.delete(room.code);
      return;
    }
    const pipeline = redis!.pipeline();
    pipeline.del(`room:${room.id}`);
    pipeline.del(`code:${room.code}`);
    await pipeline.exec();
  }
}

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  points: number;
  wins: number;
  language: string;
}

export async function updateUserScore(userId: string, name: string, points: number, isWin: boolean, language: string = 'TypeScript') {
  if (isFake) {
    if (!mockUsers.has(userId)) mockUsers.set(userId, {});
    const user = mockUsers.get(userId)!;
    if (!user.name) user.name = name;
    if (!user.language) user.language = language;
    if (isWin) user.wins = Number(user.wins || 0) + 1;
    mockPoints.set(userId, (mockPoints.get(userId) || 0) + points);
    return;
  }

  const userKey = `user:${userId}`;
  await redis!.hsetnx(userKey, 'name', name);
  await redis!.hsetnx(userKey, 'language', language);
  
  if (isWin) {
    await redis!.hincrby(userKey, 'wins', 1);
  }
  await redis!.zincrby('leaderboard:points', points, userId);
}

export async function getTopPlayers(limit: number = 50): Promise<LeaderboardUser[]> {
  if (isFake) {
    const entries = Array.from(mockPoints.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit);
    return entries.map(([userId, points], index) => {
      const user = mockUsers.get(userId) || {};
      return {
        id: userId,
        rank: index + 1,
        name: (user.name as string) || 'Unknown Hacker',
        points: points,
        wins: Number(user.wins || 0),
        language: (user.language as string) || 'TypeScript'
      };
    });
  }

  const topData = await redis!.zrange('leaderboard:points', 0, limit - 1, { rev: true, withScores: true }) as (string | number)[];
  const players: LeaderboardUser[] = [];
  for (let i = 0; i < topData.length; i += 2) {
    const userId = topData[i] as string;
    const points = topData[i + 1] as number;
    const userDetails = await redis!.hgetall(`user:${userId}`) as Record<string, string | number> | null;
    
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

export { redis };
