import type { Room, User } from '@/types';

/**
 * Generate a unique ID using timestamp + random string.
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Generate a 6-character room code (A-Z, 0-9).
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Find a user by clientId across host, contestants, and viewers.
 */
export function findUserByClientId(room: Room, clientId: string): User | null {
  if (room.host.clientId === clientId) return room.host;
  const contestant = room.contestants.find((u) => u.clientId === clientId);
  if (contestant) return contestant;
  const viewer = room.viewers.find((u) => u.clientId === clientId);
  if (viewer) return viewer;
  return null;
}
