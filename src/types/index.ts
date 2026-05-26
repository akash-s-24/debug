// Room types
export type RoomStatus = 'waiting' | 'ready' | 'countdown' | 'battle' | 'paused' | 'finished';
export type UserRole = 'host' | 'contestant' | 'viewer' | 'judge';
export type DuelType = 'debug-battle' | 'code-sprint' | 'hackathon' | 'interview' | 'freestyle';
export type LayoutMode = 'side-by-side' | 'focus-left' | 'focus-right' | 'vertical' | 'quad';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  role: UserRole;
  clientId?: string;
}

export interface RoomConfig {
  roomName: string;
  hostName: string;
  challenge: string;
  challengeDescription?: string;
  timerSeconds: number;
  language: string;
  duelType: DuelType;
  maxContestants: number;
  allowAudience: boolean;
  password?: string;
}

export interface Room {
  id: string;
  code: string;
  config: RoomConfig;
  status: RoomStatus;
  host: User;
  contestants: User[];
  viewers: User[];
  createdAt: number;
  battleStartedAt?: number;
  battleEndedAt?: number;
  // Timer state for client-side computation
  pausedAt?: number;
  totalPausedMs?: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
  type: 'message' | 'system' | 'announcement';
}

export interface Reaction {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: number;
}

export interface CodingStats {
  userId: string;
  typingSpeed: number;
  errorCount: number;
  compileCount: number;
  linesWritten: number;
  idleTime: number;
  lastActivity: number;
  streak: number;
  momentum: 'low' | 'medium' | 'high' | 'extreme';
}

export interface StreamStatus {
  userId: string;
  isSharing: boolean;
  quality: 'low' | 'medium' | 'high';
  fps: number;
  connected: boolean;
}

export interface BattleResult {
  winner?: string;
  contestants: {
    userId: string;
    userName: string;
    score: number;
    stats: CodingStats;
  }[];
  duration: number;
  highlights: string[];
}
