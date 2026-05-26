'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Room } from '@/types';

interface UseTimerReturn {
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  formatTime: (seconds?: number) => string;
}

export function useTimer(room: Room | null): UseTimerReturn {
  const [now, setNow] = useState(() => Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Compute derived timer state from the room object
  const timerSeconds = room?.config.timerSeconds ?? 0;
  const battleStartedAt = room?.battleStartedAt ?? 0;
  const pausedAt = room?.pausedAt ?? 0;
  const totalPausedMs = room?.totalPausedMs ?? 0;

  const isRunning = room?.status === 'battle' && !room.pausedAt;
  const isPaused = room?.status === 'paused' || (room?.status === 'battle' && !!room.pausedAt);

  let timeRemaining = timerSeconds;

  if (room && battleStartedAt) {
    if (pausedAt) {
      // Paused — freeze at the moment we paused
      const elapsed = Math.floor((pausedAt - battleStartedAt - totalPausedMs) / 1000);
      timeRemaining = Math.max(0, timerSeconds - elapsed);
    } else if (room.status === 'battle') {
      // Running — compute from current time
      const elapsed = Math.floor((now - battleStartedAt - totalPausedMs) / 1000);
      timeRemaining = Math.max(0, timerSeconds - elapsed);
    } else if (room.status === 'finished') {
      timeRemaining = 0;
    }
  }

  // Tick interval for re-rendering the countdown
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setNow(Date.now());
      }, 1000);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

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
