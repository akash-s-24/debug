'use client';

import React from 'react';

interface BackgroundProps {
  children: React.ReactNode;
}

export function Background({ children }: BackgroundProps) {
  return (
    <div className="relative min-h-screen bg-bg text-text overflow-x-hidden dot-grid">
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default Background;
