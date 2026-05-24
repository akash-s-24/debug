import type { DuelType, RoomConfig } from '@/types';

// WebRTC ICE servers for NAT traversal
export const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

// Supported programming languages
export const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', extension: '.js' },
  { value: 'typescript', label: 'TypeScript', extension: '.ts' },
  { value: 'python', label: 'Python', extension: '.py' },
  { value: 'rust', label: 'Rust', extension: '.rs' },
  { value: 'go', label: 'Go', extension: '.go' },
  { value: 'cpp', label: 'C++', extension: '.cpp' },
  { value: 'java', label: 'Java', extension: '.java' },
  { value: 'csharp', label: 'C#', extension: '.cs' },
  { value: 'ruby', label: 'Ruby', extension: '.rb' },
  { value: 'swift', label: 'Swift', extension: '.swift' },
] as const;

// Duel type definitions
export const DUEL_TYPES: {
  value: DuelType;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: 'debug-battle',
    label: 'Debug Battle',
    description: 'Find and fix bugs faster than your opponent',
    icon: '🐛',
  },
  {
    value: 'code-sprint',
    label: 'Code Sprint',
    description: 'Race to implement a feature from scratch',
    icon: '⚡',
  },
  {
    value: 'hackathon',
    label: 'Hackathon',
    description: 'Build something amazing in a limited time',
    icon: '🚀',
  },
  {
    value: 'interview',
    label: 'Interview',
    description: 'Practice technical interviews live',
    icon: '🎯',
  },
  {
    value: 'freestyle',
    label: 'Freestyle',
    description: 'Open-ended coding session, no rules',
    icon: '🎨',
  },
];

// Timer presets in seconds
export const TIMER_PRESETS = [
  { value: 300, label: '5 min', shortLabel: '5m' },
  { value: 600, label: '10 min', shortLabel: '10m' },
  { value: 900, label: '15 min', shortLabel: '15m' },
  { value: 1800, label: '30 min', shortLabel: '30m' },
  { value: 3600, label: '60 min', shortLabel: '60m' },
] as const;

// Reaction emojis for live audience
export const EMOJIS = ['🔥', '⚡', '💀', '🎯', '💡', '🚀', '👏', '😱', '🏆', '❌'] as const;

// Default room configuration
export const DEFAULT_ROOM_CONFIG: RoomConfig = {
  roomName: 'Untitled Duel',
  hostName: 'Host',
  challenge: '',
  challengeDescription: '',
  timerSeconds: 900, // 15 minutes
  language: 'typescript',
  duelType: 'debug-battle',
  maxContestants: 2,
  allowAudience: true,
};

// Arena color theme
export const ARENA_COLORS = {
  // Primary neon accents
  neonCyan: '#00f0ff',
  neonMagenta: '#ff00e5',
  neonGreen: '#39ff14',
  neonOrange: '#ff6600',
  neonYellow: '#ffe600',

  // Background layers
  bgDeep: '#0a0a0f',
  bgPanel: '#12121a',
  bgSurface: '#1a1a2e',
  bgElevated: '#222240',

  // Status colors
  statusReady: '#39ff14',
  statusWarning: '#ffe600',
  statusDanger: '#ff3333',
  statusInfo: '#00f0ff',

  // Player colors
  playerOne: '#00f0ff',
  playerTwo: '#ff00e5',

  // Text
  textPrimary: '#f0f0f0',
  textSecondary: '#8888aa',
  textMuted: '#555570',
} as const;

// Countdown seconds before battle starts
export const COUNTDOWN_SECONDS = 5;

// Max chat message length
export const MAX_CHAT_LENGTH = 500;

// Reaction display duration in ms
export const REACTION_DURATION_MS = 3000;

// Room code format
export const ROOM_CODE_PREFIX = 'DUEL';
export const ROOM_CODE_LENGTH = 6;
