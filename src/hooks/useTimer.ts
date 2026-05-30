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
  const timerSeconds = room?.config?.timerSeconds || 900; // fallback to 15m
  const battleStartedAt = room?.battleStartedAt ?? 0;
  const pausedAt = room?.pausedAt ?? 0;
  const totalPausedMs = room?.totalPausedMs ?? 0;

  const isRunning = room?.status === 'battle' && !room.pausedAt;
  const isPaused = room?.status === 'paused' || (room?.status === 'battle' && !!room.pausedAt);

  // Robust client-side time tracking to prevent server-client clock skew
  const [localStartedAt, setLocalStartedAt] = useState<number | null>(null);

  useEffect(() => {
    if (room?.status === 'battle' && !localStartedAt && battleStartedAt) {
      // If we just transitioned to battle, capture the local time.
      // Or if we join mid-battle, compute a local start time based on elapsed server time
      // to avoid jumping if the server clock is skewed.
      const serverElapsed = Math.max(0, Date.now() - battleStartedAt);
      setLocalStartedAt(Date.now() - serverElapsed);
    } else if (room?.status !== 'battle' && room?.status !== 'paused') {
      setLocalStartedAt(null);
    }
  }, [room?.status, battleStartedAt, localStartedAt]);

  let timeRemaining = timerSeconds;

  if (room && battleStartedAt) {
    // Prefer localStartedAt to eliminate clock skew, fallback to battleStartedAt
    const effectiveStartedAt = localStartedAt || battleStartedAt;

    if (pausedAt) {
      // Paused — freeze at the moment we paused
      const elapsed = Math.floor((pausedAt - battleStartedAt - totalPausedMs) / 1000);
      timeRemaining = Math.min(timerSeconds, Math.max(0, timerSeconds - elapsed));
    } else if (room.status === 'battle') {
      // Running — compute from current time using effective start time
      const elapsed = Math.floor(Math.max(0, now - effectiveStartedAt - totalPausedMs) / 1000);
      timeRemaining = Math.min(timerSeconds, Math.max(0, timerSeconds - elapsed));
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
