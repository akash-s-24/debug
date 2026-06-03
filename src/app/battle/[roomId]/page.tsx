'use client';

import React, { useEffect, useState, useCallback, use, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Background } from '@/components/layout/Background';
import { ChallengeBar } from '@/components/battle/ChallengeBar';
import { EditorPanel } from '@/components/battle/EditorPanel';
import { HostDashboard } from '@/components/battle/HostDashboard';
import { LiveStats } from '@/components/battle/LiveStats';
import { DualView } from '@/components/arena/DualView';
import { BattleIntro } from '@/components/battle/BattleIntro';
import { FloatingReactions } from '@/components/battle/FloatingReactions';
import { Button } from '@/components/ui/Button';
import { usePusher } from '@/hooks/usePusher';
import { useRoom } from '@/hooks/useRoom';
import { useCodeStats } from '@/hooks/useCodeStats';
import { useReactions } from '@/hooks/useReactions';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useTimer } from '@/hooks/useTimer';
import { getClientId } from '@/lib/client-id';
import { LayoutMode, UserRole } from '@/types';

export default function BattlePage({ params }: { params: Promise<{ roomId: string }> }) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.roomId;
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams.get('role') as UserRole) || 'contestant';
  const name = searchParams.get('name') || 'Anonymous';
  const clientId = typeof window !== 'undefined' ? getClientId() : '';

  const { pusher, isConnected } = usePusher();
  const { room, stats: remoteStats, codes: remoteCodes, joinRoom, leaveRoom, updateStats, broadcastClientEvent, error: roomError } = useRoom(pusher);
  const { reactions } = useReactions(roomId);
  const { timeRemaining, isRunning, isPaused } = useTimer(room);
  const { playStart, playWarning, playAlarm } = useSoundEffects();
  
  // Local code and stats tracking
  const myUserId = room?.contestants.find(c => c.clientId === clientId)?.id || room?.host.id || 'temp';
  const { stats: localStats, handleCodeChange: onCodeChange, handleValidation, handleTerminalChange } = useCodeStats(myUserId);
  const [localCode, setLocalCode] = useState('// Enter your code here...');
  const initialCodeLoaded = useRef(false);

  useEffect(() => {
    if (room && !initialCodeLoaded.current) {
      if (room.config.initialCode) {
        setLocalCode(room.config.initialCode);
      }
      initialCodeLoaded.current = true;
    }
  }, [room]);

  const [layout, setLayout] = useState<LayoutMode>('side-by-side');
  const [showIntro, setShowIntro] = useState(false);

  const handleExit = useCallback(() => {
    leaveRoom();
    router.push('/');
  }, [leaveRoom, router]);

  useEffect(() => {
    if (!room) return;
    if (room.status === 'battle' && !isPaused) {
      playStart();
    }
  }, [room?.status, isPaused, playStart]);

  // Handle warning sound
  useEffect(() => {
    if (timeRemaining === 60 && isRunning && !isPaused) {
      playWarning();
    }
  }, [timeRemaining, isRunning, isPaused, playWarning]);

  const handleHostAction = useCallback(async (action: 'start' | 'pause' | 'resume' | 'end') => {
    const endpoints: Record<string, string> = {
      start: '/api/battle/start',
      pause: '/api/battle/pause',
      resume: '/api/battle/resume',
      end: '/api/battle/end',
    };

    try {
      const body: any = { roomId, clientId };
      
      if (action === 'end') {
        body.codes = Object.fromEntries(remoteCodes.entries());
        
        // Merge local stats if host is also a contestant
        const allStats = new Map(remoteStats);
        if (myUserId !== 'temp' && localStats) {
          allStats.set(myUserId, localStats);
        }
        body.finalStats = Object.fromEntries(allStats.entries());
      }

      await fetch(endpoints[action], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (err) {
      console.error(`[Battle] Failed to ${action}:`, err);
    }
  }, [roomId, clientId, remoteCodes, remoteStats, myUserId, localStats]);

  // Handle timer hitting zero
  useEffect(() => {
    if (timeRemaining === 0 && isRunning && !isPaused && room?.status === 'battle') {
      playAlarm();
    }
  }, [timeRemaining, isRunning, isPaused, room?.status, playAlarm]);

  useEffect(() => {
    if (isConnected && pusher) {
      joinRoom(roomId, name, role);
    }
  }, [isConnected, pusher, roomId, name, role, joinRoom]);

  // Handle status transitions
  useEffect(() => {
    if (room?.status === 'countdown') {
      if (room.contestants.length >= 2) {
        queueMicrotask(() => setShowIntro(true));
      } else {
        const isHost = room?.host.clientId === clientId;
        if (isHost) {
          fetch('/api/battle/begin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, clientId }),
          }).catch(console.error);
        }
      }
    }
  }, [room?.status, room?.host.clientId, clientId, roomId, room?.contestants.length, role, router]);

  // Sync local code & stats to server
  useEffect(() => {
    if (role === 'contestant' && room?.status === 'battle') {
      // 1. Instant Client-Side Broadcast (feels like Screen Sharing)
      broadcastClientEvent('client-stats-updated', localStats);
      broadcastClientEvent('client-code-updated', { clientId, code: localCode });

      // 2. Persistent Server Sync (for late joiners and DB persistence)
      // Debounce the fetch calls to avoid Vercel rate limits and lag
      const timer = setTimeout(() => {
        updateStats(localStats);
        fetch('/api/battle/code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: room.id, clientId, code: localCode }),
        }).catch(err => console.error('Failed to sync code:', err));
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [localCode, localStats, role, room?.status, room?.id, clientId, updateStats, broadcastClientEvent]);

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setLocalCode(value);
      onCodeChange(value);
    }
  };

  const handleIntroComplete = useCallback(async () => {
    setShowIntro(false);
    const isHost = room?.host.clientId === clientId;
    if (isHost) {
      try {
        await fetch('/api/battle/begin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, clientId }),
        });
      } catch (err) {
        console.error('[Battle] Failed to begin battle:', err);
      }
    }
  }, [room?.host.clientId, clientId, roomId]);


  if (roomError) {
    return (
      <Background>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="text-neon-red font-display text-2xl tracking-[0.2em] mb-4">CONNECTION ERROR</div>
          <div className="text-white font-mono mb-8">{roomError}</div>
          <Button variant="neon" size="lg" onClick={() => router.push('/')}>Return to Arena</Button>
        </div>
      </Background>
    );
  }

  if (!room) {
    return (
      <Background>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-neon-cyan animate-pulse font-display text-xl tracking-[0.5em]">CONNECTING...</div>
        </div>
      </Background>
    );
  }

  const isHost = room.host.clientId === clientId;
  
  if (isHost) {
    // ── HOST DASHBOARD ──────────────────────────────────────────────────
    return (
      <Background>
        {showIntro && room.contestants.length >= 2 && (
          <BattleIntro
            contestant1={room.contestants[0]}
            contestant2={room.contestants[1]}
            challenge={room.config.challenge}
            onComplete={handleIntroComplete}
          />
        )}
        <div className="flex flex-col h-screen overflow-hidden">
          <ChallengeBar 
            title={room.config.challenge}
            description={room.config.challengeDescription}
            language={room.config.language}
            duelType={room.config.duelType}
            timeRemaining={timeRemaining}
            isRunning={isRunning}
            isPaused={isPaused}
            onExit={handleExit}
            isHost={true}
          />
          <HostDashboard 
            room={room}
            stats={remoteStats}
            remoteCodes={remoteCodes}
            timeRemaining={timeRemaining}
            isRunning={isRunning}
            isPaused={isPaused}
            onAction={handleHostAction}
          />
        </div>
      </Background>
    );
  }

  // ── PARTICIPANT ARENA (Contestants & Viewers) ──────────────────────
  const myUser = room.contestants.find(c => c.clientId === clientId) || room.viewers.find(v => v.clientId === clientId) || { id: 'temp', name: name, role: 'viewer' as const, clientId };
  
  // For contestants, user1 is themselves and user2 is the opponent.
  // For viewers, user1 is contestants[0] and user2 is contestants[1].
  const user1 = myUser.role === 'contestant' ? myUser : room.contestants[0];
  const user2 = myUser.role === 'contestant' 
    ? room.contestants.find(c => c.id !== myUser.id) 
    : room.contestants[1];
  
  const stats1 = user1 ? (user1.id === myUser.id ? localStats : remoteStats.get(user1.id)) : undefined;
  const stats2 = user2 ? remoteStats.get(user2.id) : undefined;
  
  const allStats = new Map(remoteStats);
  if (myUser.role === 'contestant' && room.status !== 'finished') {
    allStats.set(myUser.id, localStats);
  }
  
  const code1 = user1 ? (user1.id === myUser.id ? localCode : remoteCodes.get(user1.id) || room?.config.initialCode || '// Waiting for code...') : '// Waiting for code...';
  const code2 = user2 ? (remoteCodes.get(user2.id) || room?.config.initialCode || '// Waiting for code...') : '// Waiting for code...';

  return (
    <Background>
      {showIntro && room.contestants.length >= 2 && (
        <BattleIntro
          contestant1={room.contestants[0]}
          contestant2={room.contestants[1]}
          challenge={room.config.challenge}
          onComplete={handleIntroComplete}
        />
      )}

      <FloatingReactions reactions={reactions} />
      
      <div className="flex flex-col h-screen overflow-hidden">
        <ChallengeBar 
          title={room.config.challenge}
          description={room.config.challengeDescription}
          language={room.config.language}
          duelType={room.config.duelType}
          timeRemaining={timeRemaining}
          isRunning={isRunning}
          isPaused={isPaused}
          onExit={handleExit}
          isHost={false}
          roomId={room.id}
          userName={myUser.name}
        />

        <div className="flex flex-1 overflow-hidden p-2 gap-2">
          {/* Main Battle Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {layout === 'side-by-side' && user2 ? (
              <DualView
                code1={code1}
                code2={code2}
                user1={user1}
                user2={user2}
                stats1={stats1 || null}
                stats2={stats2 || null}
                layout={layout}
                challenge={room.config.challenge}
                language={room.config.language}
                isLocalUser1={user1?.id === myUser.id}
                isLocalUser2={false}
                hideCode1={user1?.id === myUser.id && room.status !== 'battle'}
                hideCode2={myUser.role === 'contestant'} // Contestants can't see opponent's code
                onCodeChange1={user1?.id === myUser.id ? handleCodeChange : undefined}
                onValidate1={user1?.id === myUser.id ? handleValidation : undefined}
                onTerminalChange1={user1?.id === myUser.id ? handleTerminalChange : undefined}
              />
            ) : (
              <div className="flex-1 relative h-full w-full p-2">
                {myUser.role === 'contestant' && room.status !== 'battle' ? (
                  <div className="w-full h-full flex items-center justify-center bg-black/80 rounded-xl border border-white/10 p-8 text-center">
                    <div>
                      <div className="text-4xl mb-4">🔒</div>
                      <h3 className="text-xl font-display tracking-widest text-text-primary uppercase mb-2">Battle Not Started</h3>
                      <p className="text-sm font-mono text-text-secondary">Code is locked until the host starts the battle.</p>
                    </div>
                  </div>
                ) : (
                  <EditorPanel
                    code={code1}
                    language={room.config.language}
                    userName={user1?.name || 'Player'}
                    isLocal={user1?.id === myUser.id}
                    isActive={stats1?.momentum === 'high' || stats1?.momentum === 'extreme'}
                    color="cyan"
                    stats={stats1 || null}
                    onChange={user1?.id === myUser.id ? handleCodeChange : undefined}
                    onValidation={user1?.id === myUser.id ? handleValidation : undefined}
                    onTerminalChange={user1?.id === myUser.id ? handleTerminalChange : undefined}
                  />
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80 flex flex-col gap-2 flex-shrink-0 h-full overflow-hidden">
            {stats1 && user1?.id === myUser.id && (
              <div className="flex-shrink-0">
                <LiveStats stats={stats1} color="cyan" compact />
              </div>
            )}
            
            <div className="flex-1 min-h-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 flex flex-col items-center text-center">
              <div className="text-4xl mb-6">🏆</div>
              <h3 className="text-2xl font-display text-text-primary tracking-widest mb-4">BATTLE ARENA</h3>
              <p className="text-text-secondary text-sm font-body mb-8">Focus on the code. Outperform your opponent.</p>
              
              <div className="w-full bg-black/40 rounded-lg p-4 border border-white/5 mt-auto">
                <div className="text-xs text-text-muted uppercase tracking-widest mb-2">Room Code</div>
                <div className="text-xl font-mono text-white tracking-widest">{room.code}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
}
