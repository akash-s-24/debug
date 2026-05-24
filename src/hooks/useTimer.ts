'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { TypedSocket } from '@/lib/socket';

interface UseTimerReturn {
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  startTimer: (seconds?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: (seconds: number) => void;
  formatTime: (seconds?: number) => string;
}

export function useTimer(
  socket: TypedSocket | null,
  initialSeconds: number = 900,
): UseTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startLocalTimer = useCallback(() => {
    clearTimerInterval();
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearTimerInterval();
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimerInterval]);

  const startTimer = useCallback(
    (seconds?: number) => {
      if (seconds !== undefined) {
        setTimeRemaining(seconds);
      }
      setIsRunning(true);
      setIsPaused(false);
      startLocalTimer();
    },
    [startLocalTimer],
  );

  const pauseTimer = useCallback(() => {
    clearTimerInterval();
    setIsPaused(true);
    setIsRunning(false);
  }, [clearTimerInterval]);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
    setIsRunning(true);
    startLocalTimer();
  }, [startLocalTimer]);

  const resetTimer = useCallback(
    (seconds: number) => {
      clearTimerInterval();
      setTimeRemaining(seconds);
      setIsRunning(false);
      setIsPaused(false);
    },
    [clearTimerInterval],
  );

  const formatTime = useCallback(
    (seconds?: number): string => {
      const total = seconds ?? timeRemaining;
      const mins = Math.floor(Math.max(0, total) / 60);
      const secs = Math.max(0, total) % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    [timeRemaining],
  );

  // Sync with server-sent timer events
  useEffect(() => {
    if (!socket) return;

    const onTick = (remaining: number) => {
      setTimeRemaining(remaining);
    };

    const onBattleStart = (_startTime: number) => {
      setIsRunning(true);
      setIsPaused(false);
      startLocalTimer();
    };

    const onCountdown = (seconds: number) => {
      setTimeRemaining(seconds);
    };

    const onPause = () => {
      clearTimerInterval();
      setIsPaused(true);
      setIsRunning(false);
    };

    const onResume = (remaining: number) => {
      setTimeRemaining(remaining);
      setIsPaused(false);
      setIsRunning(true);
      startLocalTimer();
    };

    const onEnd = () => {
      clearTimerInterval();
      setTimeRemaining(0);
      setIsRunning(false);
      setIsPaused(false);
    };

    socket.on('battle:tick', onTick);
    socket.on('battle:start', onBattleStart);
    socket.on('battle:countdown', onCountdown);
    socket.on('battle:pause', onPause);
    socket.on('battle:resume', onResume);
    socket.on('battle:end', onEnd);

    return () => {
      socket.off('battle:tick', onTick);
      socket.off('battle:start', onBattleStart);
      socket.off('battle:countdown', onCountdown);
      socket.off('battle:pause', onPause);
      socket.off('battle:resume', onResume);
      socket.off('battle:end', onEnd);
    };
  }, [socket, clearTimerInterval, startLocalTimer]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      clearTimerInterval();
    };
  }, [clearTimerInterval]);

  return {
    timeRemaining,
    isRunning,
    isPaused,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    formatTime,
  };
}
