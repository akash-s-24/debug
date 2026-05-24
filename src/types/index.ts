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
  socketId?: string;
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

// Socket event types
export interface ServerToClientEvents {
  'room:state': (room: Room) => void;
  'room:error': (message: string) => void;
  'room:user-joined': (user: User) => void;
  'room:user-left': (userId: string) => void;
  'battle:countdown': (seconds: number) => void;
  'battle:start': (startTime: number) => void;
  'battle:tick': (remaining: number) => void;
  'battle:pause': () => void;
  'battle:resume': (remaining: number) => void;
  'battle:end': (result: BattleResult) => void;
  'signal:offer': (data: { from: string; sdp: RTCSessionDescriptionInit }) => void;
  'signal:answer': (data: { from: string; sdp: RTCSessionDescriptionInit }) => void;
  'signal:ice': (data: { from: string; candidate: RTCIceCandidateInit }) => void;
  'chat:message': (message: ChatMessage) => void;
  'chat:reaction': (reaction: Reaction) => void;
  'analytics:update': (stats: CodingStats) => void;
  'stream:status': (status: StreamStatus) => void;
}

export interface ClientToServerEvents {
  'room:create': (config: RoomConfig, callback: (room: Room) => void) => void;
  'room:join': (
    data: { roomId: string; userName: string; role: UserRole; password?: string },
    callback: (room: Room | null, error?: string) => void,
  ) => void;
  'room:leave': (roomId: string) => void;
  'battle:start-countdown': (roomId: string) => void;
  'battle:pause': (roomId: string) => void;
  'battle:resume': (roomId: string) => void;
  'battle:end': (roomId: string) => void;
  'battle:reset-timer': (roomId: string, seconds: number) => void;
  'signal:offer': (data: { roomId: string; to: string; sdp: RTCSessionDescriptionInit }) => void;
  'signal:answer': (data: { roomId: string; to: string; sdp: RTCSessionDescriptionInit }) => void;
  'signal:ice': (data: { roomId: string; to: string; candidate: RTCIceCandidateInit }) => void;
  'chat:message': (data: { roomId: string; text: string }) => void;
  'chat:reaction': (data: { roomId: string; emoji: string }) => void;
  'analytics:update': (data: { roomId: string; stats: Partial<CodingStats> }) => void;
  'stream:status': (data: { roomId: string; status: Partial<StreamStatus> }) => void;
  'layout:change': (data: { roomId: string; layout: LayoutMode }) => void;
}
