import { getRoom, saveRoom } from '@/lib/redis';
import { triggerRoomEvent } from '@/lib/pusher-server';
import { generateId, findUserByClientId } from '@/lib/utils';
import type { User, UserRole } from '@/types';

export async function POST(req: Request) {
  try {
    const { roomId, userName, role, clientId, password } = (await req.json()) as {
      roomId: string;
      userName: string;
      role: UserRole;
      clientId: string;
      password?: string;
    };

    if (!roomId || !userName || !role || !clientId) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const room = await getRoom(roomId);
    if (!room) {
      return Response.json({ error: 'Room not found' }, { status: 404 });
    }

    // Password check
    if (room.config.password && room.config.password !== password) {
      return Response.json({ error: 'Invalid password' }, { status: 400 });
    }

    // Check for reconnection — user with same clientId already in room
    const existingUser = findUserByClientId(room, clientId);
    if (existingUser) {
      return Response.json({ room }, { status: 200 });
    }

    // Role-specific validation
    if (role === 'contestant' || role === 'host') {
      if (room.contestants.length >= room.config.maxContestants) {
        return Response.json(
          { error: 'Room is full — max contestants reached' },
          { status: 400 },
        );
      }
    }

    if (role === 'viewer' && !room.config.allowAudience) {
      return Response.json(
        { error: 'This room does not allow audience' },
        { status: 400 },
      );
    }

    const newUser: User = {
      id: generateId(),
      name: userName,
      role,
      clientId,
    };

    if (role === 'viewer') {
      room.viewers.push(newUser);
    } else {
      room.contestants.push(newUser);
    }

    // Auto-ready when we have at least 2 contestants
    if (room.contestants.length >= 2 && room.status === 'waiting') {
      room.status = 'ready';
    }

    await saveRoom(room);

    await triggerRoomEvent(room.id, 'room-updated', room);
    await triggerRoomEvent(room.id, 'user-joined', newUser);

    return Response.json({ room }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/rooms/join]', error);
    return Response.json({ error: 'Failed to join room' }, { status: 500 });
  }
}
