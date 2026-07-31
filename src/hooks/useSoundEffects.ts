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
    audio.play().catch(e => console.log('Audio play failed:', e));
  }, []);

  const playStop = useCallback(() => {
    // 1. Play alarm sound at high volume
    const audio = new Audio('/sounds/alarm.wav');
    audio.volume = 0.9;
    audio.play().catch(e => console.log('Audio play failed:', e));

    // 2. Speech synthesis: say "Stop" with a deep, authoritative voice
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Small delay so the alarm beep is heard first
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance('Stop');
        utterance.rate = 0.8;
        utterance.pitch = 0.6;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
      }, 500);
    }
  }, []);

  return { playStart, playWarning, playAlarm, playStop };
}
