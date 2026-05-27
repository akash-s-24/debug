'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import type { CodingStats } from '@/types';

interface StreamPanelProps {
  stream: MediaStream | null;
  userName: string;
  isLocal?: boolean;
  isActive?: boolean;
  color?: 'cyan' | 'magenta';
  stats?: CodingStats | null;
}

const colorValues = {
  cyan: {
    hex: '#00F0FF',
    shadow: '0 0 15px rgba(0,240,255,0.2), 0 0 30px rgba(0,240,255,0.1)',
    shadowActive: '0 0 20px rgba(0,240,255,0.35), 0 0 40px rgba(0,240,255,0.15)',
    border: 'border-[#00F0FF]/20',
    borderActive: 'border-[#00F0FF]/50',
  },
  magenta: {
    hex: '#FF006E',
    shadow: '0 0 15px rgba(255,0,110,0.2), 0 0 30px rgba(255,0,110,0.1)',
    shadowActive: '0 0 20px rgba(255,0,110,0.35), 0 0 40px rgba(255,0,110,0.15)',
    border: 'border-[#FF006E]/20',
    borderActive: 'border-[#FF006E]/50',
  },
};

function CornerBrackets({ color }: { color: string }) {
  const style = { borderColor: color };
  return (
    <>
      <span className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 pointer-events-none z-10" style={style} />
      <span className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 pointer-events-none z-10" style={style} />
      <span className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 pointer-events-none z-10" style={style} />
      <span className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 pointer-events-none z-10" style={style} />
    </>
  );
}

export const StreamPanel = React.memo(function StreamPanel({
  stream,
  userName,
  isLocal = false,
  isActive = false,
  color = 'cyan',
  stats = null,
}: StreamPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const c = colorValues[color];

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const getMomentumWidth = (m?: string) => {
    switch (m) {
      case 'low': return '25%';
      case 'medium': return '50%';
      case 'high': return '75%';
      case 'extreme': return '100%';
      default: return '0%';
    }
  };

  return (
    <motion.div
      className={`
        relative w-full h-full min-h-[200px] overflow-hidden rounded-xl
        bg-[#0a0a15] border
        ${isActive ? c.borderActive : c.border}
        transition-all duration-500
      `}
      style={{
        boxShadow: isActive ? c.shadowActive : c.shadow,
      }}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <CornerBrackets color={c.hex} />

      {/* Video element */}
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <motion.div
            className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center text-2xl"
            style={{ borderColor: c.hex + '40' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            📺
          </motion.div>
          <p className="text-white/30 text-sm font-medium">
            Waiting for screen share...
          </p>
        </div>
      )}

      {/* LIVE badge */}
      {stream && (
        <div className="absolute top-4 left-4 z-20">
          <Badge text="LIVE" color="red" pulse variant="status" />
        </div>
      )}

      {/* Name plate */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 px-4 py-3 flex items-center justify-between"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: c.hex, boxShadow: `0 0 8px ${c.hex}` }}
          />
          <span className="text-sm font-bold text-white uppercase tracking-wider">
            {userName}
          </span>
          {isLocal && (
            <span className="text-[10px] text-white/30 uppercase">(you)</span>
          )}
        </div>
      </div>

      {/* Momentum bar */}
      {stats && (
        <div className="absolute bottom-0 left-0 right-0 h-1 z-30 bg-black/50">
          <motion.div
            className="h-full"
            style={{
              background: `linear-gradient(90deg, ${c.hex}, ${color === 'cyan' ? '#00FF88' : '#FF006E'})`,
            }}
            animate={{ width: getMomentumWidth(stats.momentum) }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          />
        </div>
      )}
    </motion.div>
  );
});

export default StreamPanel;
