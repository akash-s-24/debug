'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Background } from '@/components/layout/Background';
import { DualView } from '@/components/arena/DualView';
import { ArenaOverlay } from '@/components/arena/ArenaOverlay';
import { ScoreBoard } from '@/components/arena/ScoreBoard';

import { BattleIntro } from '@/components/battle/BattleIntro';
import { Button } from '@/components/ui/Button';
import { usePusher } from '@/hooks/usePusher';
import { useRoom } from '@/hooks/useRoom';
import { useTimer } from '@/hooks/useTimer';
import { getClientId } from '@/lib/client-id';
import { LayoutMode } from '@/types';

export default function ArenaPage({ params }: { params: Promise<{ roomId: string }> }) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.roomId;
  const router = useRouter();
  
  const { pusher, isConnected } = usePusher();
  const { room, stats, codes, joinRoom, error: roomError } = useRoom(pusher);
  const { timeRemaining, isRunning, isPaused } = useTimer(room);

  const [layout, setLayout] = useState<LayoutMode>('side-by-side');
  const [showIntro, setShowIntro] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Default hide sidebar on small screens
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
      setShowSidebar(false);
    }
  }, []);

  useEffect(() => {
    if (isConnected && pusher) {
      // Generate a random viewer name
      const randomId = Math.floor(Math.random() * 10000);
      joinRoom(roomId, `Viewer_${randomId}`, 'viewer');
    }
  }, [isConnected, pusher, roomId, joinRoom]);

  // Handle status transitions
  useEffect(() => {
    if (room?.status === 'countdown') {
      queueMicrotask(() => setShowIntro(true));
    }
  }, [room?.status]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (roomError) {
    return (
      <Background>
        <div className="min-h-screen flex items-center justify-center flex-col gap-4">
          <div className="text-neon-red font-display text-2xl tracking-[0.2em]">CONNECTION ERROR</div>
          <div className="text-white font-mono mb-4">{roomError}</div>
          <Button variant="ghost" onClick={() => router.push('/')}>Return to Arena</Button>
        </div>
      </Background>
    );
  }

  if (!room) {
    return (
      <Background>
        <div className="min-h-screen flex items-center justify-center flex-col gap-4">
          <div className="text-neon-cyan animate-pulse font-display text-xl tracking-[0.5em]">TUNING INTO ARENA...</div>
          <div className="text-text-muted font-mono">Connecting to room {roomId}</div>
        </div>
      </Background>
    );
  }

  const c1 = room.contestants[0];
  const c2 = room.contestants[1];
  const stats1 = c1 ? stats.get(c1.id) : null;
  const stats2 = c2 ? stats.get(c2.id) : null;
  
  const code1 = c1 ? codes.get(c1.id) || room.config.initialCode || '// Waiting for code...' : '// Waiting for code...';
  const code2 = c2 ? codes.get(c2.id) || room.config.initialCode || '// Waiting for code...' : '// Waiting for code...';

  return (
    <div className="bg-void text-white h-screen w-screen overflow-hidden flex font-body selection:bg-neon-cyan/30">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(8,8,16,0)_0%,rgba(8,8,16,1)_100%)] pointer-events-none" />

      {showIntro && c1 && c2 && (
        <BattleIntro
          contestant1={c1}
          contestant2={c2}
          challenge={room.config.challenge}
          onComplete={() => setShowIntro(false)}
        />
      )}

      {/* Main Arena Area */}
      <div className={`relative flex flex-col transition-all duration-300 ${showSidebar ? 'w-full xl:w-[calc(100%-350px)]' : 'w-full'}`}>
        {/* Top Controls Overlay (Only visible on hover or when not fullscreen) */}
        <div className="absolute top-0 left-0 w-full z-30 flex flex-wrap justify-between p-2 sm:p-4 opacity-0 hover:opacity-100 transition-opacity gap-2">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>Exit Arena</Button>
            <select 
              value={layout} 
              onChange={(e) => setLayout(e.target.value as LayoutMode)}
              className="bg-black/50 backdrop-blur border border-white/10 text-white px-3 py-1 rounded text-sm font-mono focus:outline-none focus:border-neon-cyan"
            >
              <option value="side-by-side">Side by Side</option>
              <option value="focus-left">Focus P1</option>
              <option value="focus-right">Focus P2</option>
              <option value="vertical">Vertical</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowSidebar(!showSidebar)}>
              {showSidebar ? 'Hide Panel' : 'Show Panel'}
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="hidden sm:flex">
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </Button>
          </div>
        </div>

        {c1 && c2 ? (
          <div className="relative w-full h-full p-2 pb-0">
            <DualView
              code1={code1}
              code2={code2}
              user1={c1}
              user2={c2}
              stats1={stats1 || null}
              stats2={stats2 || null}
              layout={layout}
              challenge={room.config.challenge}
              language={room.config.language}
            />
            <ArenaOverlay 
              room={room} 
              stats1={stats1 || null} 
              stats2={stats2 || null}
              timeRemaining={timeRemaining}
              isRunning={isRunning}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center z-10 flex-col px-4 text-center">
            <h2 className="text-xl sm:text-3xl font-display text-text-primary tracking-widest mb-4">WAITING FOR CONTESTANTS</h2>
            <p className="text-text-secondary font-mono text-sm sm:text-base">Arena requires two challengers to begin.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:gap-8">
              <div className="w-full sm:w-64 h-24 sm:h-40 border border-dashed border-white/20 rounded flex items-center justify-center bg-white/5 p-4">
                {c1 ? <span className="text-neon-cyan font-bold truncate">{c1.name} (Ready)</span> : <span className="text-text-muted">Player 1 Empty</span>}
              </div>
              <div className="w-full sm:w-64 h-24 sm:h-40 border border-dashed border-white/20 rounded flex items-center justify-center bg-white/5 p-4">
                {c2 ? <span className="text-neon-magenta font-bold truncate">{c2.name} (Ready)</span> : <span className="text-text-muted">Player 2 Empty</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Side Panel */}
      {showSidebar && (
        <div className="absolute right-0 xl:relative w-[300px] sm:w-[350px] flex-shrink-0 h-full border-l border-white/10 bg-black/80 xl:bg-black/40 backdrop-blur-xl flex flex-col z-40 xl:z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] xl:shadow-none">
          <div className="p-4 border-b border-white/10 shrink-0">
            <div className="text-center font-display uppercase tracking-widest text-glow-cyan text-neon-cyan mb-2">DEBUG DUEL ARENA</div>
            <div className="text-xs text-text-muted text-center font-mono uppercase tracking-wider">Live Spectator Mode</div>
          </div>
          
          {c1 && c2 && stats1 && stats2 && (
            <div className="p-4 shrink-0">
              <ScoreBoard 
                contestants={[
                  { user: c1, stats: stats1, score: 0 },
                  { user: c2, stats: stats2, score: 0 }
                ]} 
              />
            </div>
          )}

          <div className="flex-1 min-h-0 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg p-4 m-4 flex flex-col justify-center items-center text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-display text-text-primary tracking-widest mb-2">BATTLE ARENA</h3>
            <p className="text-text-secondary text-sm font-body">Focus on the code. Live chat is disabled for this arena.</p>
          </div>
        </div>
      )}
    </div>
  );
}
