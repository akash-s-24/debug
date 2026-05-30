import { useState, useCallback, useRef, useEffect } from 'react';
import { CodingStats } from '@/types';

export function useCodeStats(userId: string) {
  const [stats, setStats] = useState<CodingStats>({
    userId,
    typingSpeed: 0,
    errorCount: 0,
    compileCount: 0,
    linesWritten: 0,
    idleTime: 0,
    lastActivity: Date.now(),
    streak: 0,
    momentum: 'low',
  });

  const keystrokesRef = useRef<number[]>([]);
  
  // Calculate CPM (Characters Per Minute) using a sliding window of the last 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const fifteenSecondsAgo = now - 15000;
      
      // Filter out old keystrokes
      keystrokesRef.current = keystrokesRef.current.filter(time => time > fifteenSecondsAgo);
      
      const keystrokeCount = keystrokesRef.current.length;
      // Extrapolate 15 seconds to 60 seconds (multiply by 4)
      const cpm = keystrokeCount * 4;

      setStats(prev => {
        let momentum: CodingStats['momentum'] = 'low';
        if (cpm > 200 && prev.errorCount === 0) momentum = 'extreme';
        else if (cpm > 100) momentum = 'high';
        else if (cpm > 30) momentum = 'medium';

        return {
          ...prev,
          typingSpeed: cpm,
          momentum,
          idleTime: cpm === 0 ? prev.idleTime + 1 : 0,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleKeyPress = useCallback(() => {
    keystrokesRef.current.push(Date.now());
    setStats(prev => ({
      ...prev,
      lastActivity: Date.now(),
    }));
  }, []);

  const handleCodeChange = useCallback((value: string | undefined) => {
    handleKeyPress();
    if (value) {
      const lines = value.split('\n').length;
      setStats(prev => ({
        ...prev,
        linesWritten: lines,
      }));
    }
  }, [handleKeyPress]);

  const handleValidation = useCallback((markers: any[]) => {
    const errorCount = markers.filter(m => m.severity >= 8).length; // 8 is monaco.MarkerSeverity.Error
    setStats(prev => ({
      ...prev,
      errorCount,
    }));
  }, []);

  return {
    stats,
    handleCodeChange,
    handleValidation,
  };
}
