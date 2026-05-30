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
import { Button } from '@/components/ui/Button';
import { usePusher } from '@/hooks/usePusher';
import { useRoom } from '@/hooks/useRoom';
import { useCodeStats } from '@/hooks/useCodeStats';
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

  const { pusher, isConnected } = usePusher();
  const { room, stats: remoteStats, codes: remoteCodes, joinRoom, leaveRoom, updateStats, error: roomError } = useRoom(pusher);
  const { timeRemaining, isRunning, isPaused } = useTimer(room);

  const clientId = typeof window !== 'undefined' ? getClientId() : '';
  
  // Local code and stats tracking
  const myUserId = room?.contestants.find(c => c.clientId === clientId)?.id || room?.host.id || 'temp';
  const { stats: localStats, handleCodeChange: onCodeChange, handleValidation } = useCodeStats(myUserId);
  const [localCode, setLocalCode] = useState('// Enter your code here...');

  const [layout, setLayout] = useState<LayoutMode>('side-by-side');
  const [showIntro, setShowIntro] = useState(false);

  const handleExit = useCallback(() => {
    leaveRoom();
    router.push('/');
  }, [leaveRoom, router]);

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
      // Broadcast Stats
      updateStats(localStats);
      
      // Broadcast Code
      fetch('/api/battle/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, clientId, code: localCode }),
      }).catch(err => console.error('Failed to sync code:', err));
    }
  }, [localCode, localStats, role, room?.status, room?.id, clientId, updateStats]);

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

  const handleHostAction = useCallback(async (action: 'start' | 'pause' | 'resume' | 'end') => {
    const endpoints: Record<string, string> = {
      start: '/api/battle/start',
      pause: '/api/battle/pause',
      resume: '/api/battle/resume',
      end: '/api/battle/end',
    };

    try {
      await fetch(endpoints[action], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, clientId }),
      });
    } catch (err) {
      console.error(`[Battle] Failed to ${action}:`, err);
    }
  }, [roomId, clientId]);

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

  // ── PARTICIPANT ARENA ───────────────────────────────────────────────
  const myUser = room.contestants.find(c => c.clientId === clientId) || room.viewers.find(v => v.clientId === clientId) || { id: 'temp', name: name, role: 'viewer' as const, clientId };
  const otherUser = room.contestants.find(c => c.id !== myUser.id);
  
  const myStats = myUser.role === 'contestant' ? localStats : remoteStats.get(myUser.id);
  const otherStats = otherUser ? remoteStats.get(otherUser.id) : undefined;
  
  const myCode = myUser.role === 'contestant' ? localCode : remoteCodes.get(myUser.id) || '// Waiting for code...';
  const otherCode = otherUser ? remoteCodes.get(otherUser.id) || '// Waiting for code...' : '// Waiting for code...';

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
          isHost={false}
        />

        <div className="flex flex-1 overflow-hidden p-2 gap-2">
          {/* Main Battle Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {layout === 'side-by-side' && otherUser ? (
              <DualView
                code1={myCode}
                code2={otherCode}
                user1={myUser as any}
                user2={otherUser}
                stats1={myStats || null}
                stats2={otherStats || null}
                layout={layout}
                challenge={room.config.challenge}
                isLocalUser1={myUser.role === 'contestant'}
                isLocalUser2={false}
                onCodeChange1={myUser.role === 'contestant' ? handleCodeChange : undefined}
                onValidate1={myUser.role === 'contestant' ? handleValidation : undefined}
              />
            ) : (
              <div className="flex-1 relative h-full w-full p-2">
                <EditorPanel
                  code={myUser.role === 'viewer' && otherUser ? otherCode : myCode}
                  userName={myUser.role === 'viewer' && otherUser ? otherUser.name : myUser.name}
                  isLocal={myUser.role === 'contestant'}
                  isActive={myStats?.momentum === 'high' || myStats?.momentum === 'extreme'}
                  color="cyan"
                  stats={myUser.role === 'viewer' && otherStats ? otherStats : myStats || null}
                  onChange={myUser.role === 'contestant' ? handleCodeChange : undefined}
                  onValidation={myUser.role === 'contestant' ? handleValidation : undefined}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80 flex flex-col gap-2 flex-shrink-0 h-full overflow-hidden">
            {myStats && myUser.role === 'contestant' && (
              <div className="flex-shrink-0">
                <LiveStats stats={myStats} color="cyan" compact />
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
