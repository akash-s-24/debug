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

export { redis };
