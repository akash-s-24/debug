import { saveRoom } from '@/lib/redis';
import { generateId, generateRoomCode } from '@/lib/utils';
import { analyzeCodeErrors } from '@/lib/ai';
import type { Room, RoomConfig, User } from '@/types';

export async function POST(req: Request) {
  try {
    const { config, clientId } = (await req.json()) as {
      config: RoomConfig;
      clientId: string;
    };

    if (!config || !clientId) {
      return Response.json(
        { error: 'Missing config or clientId' },
        { status: 400 },
      );
    }

    const host: User = {
      id: generateId(),
      name: config.hostName,
      role: 'host',
      clientId,
    };

    // AI Analysis for initial errors
    let initialErrors = 0;
    if (config.initialCode) {
      initialErrors = await analyzeCodeErrors(config.initialCode, config.language);
      if (initialErrors === -1) {
        return Response.json(
          { error: 'AI Error Analysis Failed. Please check your GEMINI_API_KEY in Vercel/Local Env and restart the server.' },
          { status: 500 }
        );
      }
    }
    config.initialErrors = initialErrors;

    const room: Room = {
      id: generateId(),
      code: generateRoomCode(),
      config,
      status: 'waiting',
      host,
      contestants: [],
      viewers: [],
      createdAt: Date.now(),
      totalPausedMs: 0,
    };

    await saveRoom(room);

    return Response.json({ room }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/rooms/create]', error);
    return Response.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
