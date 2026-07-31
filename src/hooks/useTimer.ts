'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Room } from '@/types';

interface UseTimerReturn {
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  formatTime: (seconds?: number) => string;
}

export function useTimer(room: Room | null): UseTimerReturn {
  const timerSeconds = room?.config?.timerSeconds || 900;
  const battleStartedAt = room?.battleStartedAt ?? 0;
  const pausedAt = room?.pausedAt ?? 0;
  const totalPausedMs = room?.totalPausedMs ?? 0;

  const isRunning = room?.status === 'battle' && !room?.pausedAt;
  const isPaused = room?.status === 'paused' || (room?.status === 'battle' && !!room?.pausedAt);

  const [currentNow, setCurrentNow] = useState<number | null>(null);

  // Force re-render every second if running
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentNow(Date.now());
    if (isRunning) {
      const interval = setInterval(() => {
        setCurrentNow(Date.now());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  let timeRemaining = timerSeconds;

  if (room && battleStartedAt) {
    if (pausedAt) {
      // Paused — freeze at the moment we paused
      const elapsed = Math.floor((pausedAt - battleStartedAt - totalPausedMs) / 1000);
      timeRemaining = Math.min(timerSeconds, Math.max(0, timerSeconds - elapsed));
    } else if (room.status === 'battle') {
      // Running — compute from current time using safe currentNow
      const safeNow = currentNow ?? battleStartedAt;
      const elapsed = Math.floor(Math.max(0, safeNow - battleStartedAt - totalPausedMs) / 1000);
      timeRemaining = Math.min(timerSeconds, Math.max(0, timerSeconds - elapsed));
    } else if (room.status === 'finished') {
      timeRemaining = 0;
    }
  }

  const formatTime = useCallback(
    (seconds?: number): string => {
      const total = seconds ?? timeRemaining;
      const mins = Math.floor(Math.max(0, total) / 60);
      const secs = Math.max(0, total) % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    [timeRemaining],
  );

  return {
    timeRemaining,
    isRunning,
    isPaused,
    formatTime,
  };
}
