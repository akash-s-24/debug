'use client';

import { useCallback } from 'react';

export function useSoundEffects() {
  const playStart = useCallback(() => {
    const audio = new Audio('/sounds/start.wav');
    audio.volume = 0.8;
    audio.play().catch(e => console.log('Audio play failed:', e));
  }, []);

  const playWarning = useCallback(() => {
    const audio = new Audio('/sounds/warning.wav');
    audio.volume = 0.6;
    audio.play().catch(e => console.log('Audio play failed:', e));
  }, []);

  const playAlarm = useCallback(() => {
    const audio = new Audio('/sounds/alarm.wav');
    audio.volume = 0.5;
    // Loop the alarm 3 times by playing it sequentially or just let it play its 2s duration
    audio.play().catch(e => console.log('Audio play failed:', e));
  }, []);

  return { playStart, playWarning, playAlarm };
}
