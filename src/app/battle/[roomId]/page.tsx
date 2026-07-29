'use client';

import React, { useEffect, useState, useCallback, use, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChallengeBar } from '@/components/battle/ChallengeBar';
import { EditorPanel } from '@/components/battle/EditorPanel';
import { HintEngine } from '@/components/battle/HintEngine';
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
import { LayoutMode, UserRole, CodingStats } from '@/types';

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

  // AI Battle Mode State
  const [aiErrors, setAiErrors] = useState<any[]>([]);
  const [monacoMarkers, setMonacoMarkers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const aiModeInitialized = useRef(false);
  const playerIndex = room?.contestants.findIndex(c => c.id === myUserId);
  const playerLetter = playerIndex === 0 ? 'A' : playerIndex === 1 ? 'B' : null;

  useEffect(() => {
    if (room && !initialCodeLoaded.current) {
      if (room.config.initialCode) {
        setLocalCode(room.config.initialCode);
      }
      initialCodeLoaded.current = true;
    }
  }, [room]);

  useEffect(() => {
    if (room?.status === 'battle' && playerLetter && !aiModeInitialized.current) {
      aiModeInitialized.current = true;
      fetch('/api/ai-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, player: playerLetter })
      })
      .then(r => r.json())
      .then(data => {
        if (data.code) {
          setLocalCode(data.code);
          onCodeChange(data.code);
        }
        if (data.errors) setAiErrors(data.errors);
      })
      .catch(console.error);
    }
  }, [room?.status, playerLetter, roomId, onCodeChange]);

  const handleShowHint = useCallback((marker: any) => {
    setMonacoMarkers(prev => [...prev, marker]);
  }, []);

  const handleAISubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/battle/submit-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, player: playerLetter, submittedCode: localCode })
      });
      const data = await res.json();
      if (data.isFullyFixed) {
        alert('All bugs fixed! You win!');
      } else {
        alert(`You fixed ${data.fixedCount} out of ${data.total} bugs.`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const lastBroadcastRef = useRef<number>(0);
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local code & stats to server
  useEffect(() => {
    if (role === 'contestant' && room?.status === 'battle') {
      const now = Date.now();
      const timeSinceLast = now - lastBroadcastRef.current;

      // 1. Throttle Client-Side Broadcasts (max 5 per second) to strictly avoid Pusher rate limits
      const doBroadcast = () => {
        lastBroadcastRef.current = Date.now();
        broadcastClientEvent('client-stats-updated', localStats);
        broadcastClientEvent('client-code-updated', { userId: myUserId, code: localCode });
      };

      if (timeSinceLast >= 200) {
        doBroadcast();
      } else {
        if (throttleTimerRef.current) clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = setTimeout(doBroadcast, 200 - timeSinceLast);
      }

      // 2. Persistent Server Sync (for late joiners and DB persistence)
      // Debounce the fetch calls to avoid Vercel rate limits
      const fetchTimer = setTimeout(() => {
        updateStats(localStats);
        fetch('/api/battle/code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: room.id, clientId, code: localCode }),
        }).catch(err => console.error('Failed to sync code:', err));
      }, 1000); // 1 second debounce for fetch

      return () => clearTimeout(fetchTimer);
    }
  }, [localCode, localStats, role, room?.status, room?.id, clientId, updateStats, broadcastClientEvent]);

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setLocalCode(value);
      onCodeChange(value);
    }
  };

  const handleTerminalSync = useCallback((updates: Partial<Pick<CodingStats, 'terminalOutput' | 'terminalInput' | 'showTerminal' | 'activeTab' | 'terminalIsError'>>) => {
    handleTerminalChange(updates);
    // Explicit bypass to ensure terminal UI is perfectly synced immediately without waiting for React batching
    broadcastClientEvent('client-terminal-updated', { userId: myUserId, ...updates });
  }, [handleTerminalChange, broadcastClientEvent, myUserId]);

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
      <div className="relative min-h-screen bg-background">
        <div className="min-h-screen flex flex-col items-center justify-center relative z-10">
          <div className="text-error font-code-md text-code-md tracking-[0.2em] mb-4">CONNECTION ERROR</div>
          <div className="text-on-surface font-mono mb-8">{roomError}</div>
          <Button variant="primary" size="lg" onClick={() => router.push('/')}>Return to Arena</Button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="relative min-h-screen bg-background">
        <div className="min-h-screen flex items-center justify-center relative z-10">
          <div className="text-primary animate-pulse font-code-md text-code-md tracking-[0.5em]">CONNECTING...</div>
        </div>
      </div>
    );
  }

  const isHost = room.host.clientId === clientId;
  
  if (isHost) {
    // ── HOST DASHBOARD ──────────────────────────────────────────────────
    return (
      <div className="relative min-h-screen bg-background">
        <div className="relative z-10 h-full">
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
        </div>
      </div>
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
    <div className="relative min-h-screen bg-background">
      <div className="relative z-10 h-full">
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
              {layout === 'side-by-side' && user2 && myUser.role !== 'contestant' ? (
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
                  hideCode2={false} // Contestants do not render this DualView anymore
                  onCodeChange1={user1?.id === myUser.id ? handleCodeChange : undefined}
                  onValidate1={user1?.id === myUser.id ? handleValidation : undefined}
                  onTerminalChange1={user1?.id === myUser.id ? handleTerminalSync : undefined}
                />
              ) : (
                <div className="flex-1 relative h-full w-full p-2">
                  {myUser.role === 'contestant' && room.status !== 'battle' ? (
                    <div className="w-full h-full flex items-center justify-center bg-void border border-border-subtle shadow-inner p-8 text-center hud-bracket">
                      <div>
                        <div className="text-4xl mb-4 text-brand-primary animate-pulse">[ 🔒 ]</div>
                        <h3 className="font-display tracking-tight text-3xl text-text-primary mb-2">Battle Not Started</h3>
                        <p className="font-mono text-[11px] text-text-secondary uppercase tracking-widest">Code is locked until the host starts the battle.</p>
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
                      markers={monacoMarkers}
                      onChange={user1?.id === myUser.id ? handleCodeChange : undefined}
                      onValidation={user1?.id === myUser.id ? handleValidation : undefined}
                      onTerminalChange={user1?.id === myUser.id ? handleTerminalSync : undefined}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Sidebar - Hidden on mobile to prioritize code editors */}
            <div className="hidden lg:flex w-80 flex-col gap-2 flex-shrink-0 h-full overflow-hidden">
              {stats1 && user1?.id === myUser.id && (
                <div className="flex-shrink-0">
                  <LiveStats stats={stats1} color="cyan" compact />
                </div>
              )}
              
              <div className="flex-1 min-h-0 bg-void border border-border-subtle shadow-md p-6 flex flex-col items-center text-center hud-bracket overflow-y-auto">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="font-display text-2xl tracking-tight text-text-primary mb-2">Battle Arena</h3>
                <p className="text-text-secondary text-xs font-mono mb-4 before:content-['//'] before:mr-2 before:text-text-muted">Focus on the code. Outperform your opponent.</p>
                
                {myUser.role === 'contestant' && room.status === 'battle' && (
                  <div className="w-full flex flex-col gap-2">
                    <Button 
                      variant="primary" 
                      className="w-full uppercase font-bold tracking-widest"
                      onClick={handleAISubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'VALIDATING...' : 'SUBMIT SOLUTION'}
                    </Button>
                    {aiErrors.length > 0 && (
                      <HintEngine errors={aiErrors} onShowHint={handleShowHint} onApplyPenalty={() => {}} />
                    )}
                  </div>
                )}

                <div className="w-full bg-abyss p-4 border border-border-subtle mt-auto relative overflow-hidden shadow-inner mt-6">
                  <div className="scanline-overlay"></div>
                  <div className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-2 relative z-10">Room Code</div>
                  <div className="text-2xl font-mono text-brand-primary tracking-widest relative z-10">{room.code}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
