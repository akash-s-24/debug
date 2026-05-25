'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Background } from '@/components/layout/Background';
import { ChallengeBar } from '@/components/battle/ChallengeBar';
import { BattleControls } from '@/components/battle/BattleControls';
import { StreamPanel } from '@/components/battle/StreamPanel';

import { LiveStats } from '@/components/battle/LiveStats';
import { DualView } from '@/components/arena/DualView';
import { BattleIntro } from '@/components/battle/BattleIntro';
import { Button } from '@/components/ui/Button';
import { useSocket } from '@/hooks/useSocket';
import { useRoom } from '@/hooks/useRoom';
import { useScreenShare } from '@/hooks/useScreenShare';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useTimer } from '@/hooks/useTimer';
import { LayoutMode, UserRole } from '@/types';

export default function BattlePage({ params }: { params: Promise<{ roomId: string }> }) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.roomId;
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams.get('role') as UserRole) || 'contestant';
  const name = searchParams.get('name') || 'Anonymous';

  const { socket, isConnected } = useSocket();
  const { room, messages, reactions, stats, joinRoom, sendMessage, sendReaction, updateStats, error: roomError } = useRoom(socket);
  const { startSharing, stopSharing, localStream, isSharing, error: shareError } = useScreenShare();
  const { connectionStates, getRemoteStreams } = useWebRTC(socket, roomId);
  const { timeRemaining, isRunning, isPaused, startTimer, pauseTimer, resetTimer } = useTimer(socket, room?.config.timerSeconds || 900);

  const [layout, setLayout] = useState<LayoutMode>('side-by-side');
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    if (isConnected && socket) {
      joinRoom(roomId, name, role);
    }
  }, [isConnected, socket, roomId, name, role, joinRoom]);

  useEffect(() => {
    if (room?.status === 'countdown' && !isRunning) {
      queueMicrotask(() => setShowIntro(true));
    } else if (room?.status === 'battle' && !isRunning && !isPaused) {
      startTimer();
    } else if (room?.status === 'paused' && isRunning) {
      pauseTimer();
    }
  }, [room?.status, isRunning, isPaused, startTimer, pauseTimer]);

  useEffect(() => {
    // Simulate some stats if sharing
    if (isSharing && room?.status === 'battle') {
      const interval = setInterval(() => {
        updateStats({
          typingSpeed: Math.floor(Math.random() * 150) + 200,
          momentum: Math.random() > 0.7 ? 'extreme' : Math.random() > 0.4 ? 'high' : 'medium',
          streak: Math.floor(Math.random() * 10),
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isSharing, room?.status, updateStats]);

  const handleStartShare = async () => {
    await startSharing();
    if (socket) {
      socket.emit('stream:status', { roomId, status: { isSharing: true, connected: true, quality: 'high', fps: 30 } });
    }
  };

  const handleStopShare = () => {
    stopSharing();
    if (socket) {
      socket.emit('stream:status', { roomId, status: { isSharing: false, connected: false, quality: 'low', fps: 0 } });
    }
  };

  const handleHostAction = (action: 'start' | 'pause' | 'resume' | 'end') => {
    if (!socket) return;
    switch (action) {
      case 'start':
        if (room?.status === 'finished') {
          socket.emit('battle:reset-timer', roomId, room.config.timerSeconds);
        }
        socket.emit('battle:start-countdown', roomId);
        break;
      case 'pause':
        socket.emit('battle:pause', roomId);
        break;
      case 'resume':
        socket.emit('battle:resume', roomId);
        break;
      case 'end':
        socket.emit('battle:end', roomId);
        break;
    }
  };

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

  const isHost = socket?.id ? room.host.socketId === socket.id : room.host.name === name;
  const myUser = room.contestants.find(c => socket?.id ? c.socketId === socket.id : c.name === name) || room.host;
  const otherUser = room.contestants.find(c => c.id !== myUser.id);
  const myStats = stats.get(myUser.id);
  const otherStats = otherUser ? stats.get(otherUser.id) : undefined;
  
  const remoteStreams = getRemoteStreams();
  const otherStream = otherUser ? remoteStreams.get(otherUser.id) || null : null;

  return (
    <Background>
      {showIntro && room.contestants.length >= 2 && (
        <BattleIntro
          contestant1={room.contestants[0]}
          contestant2={room.contestants[1]}
          challenge={room.config.challenge}
          onComplete={() => setShowIntro(false)}
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
        />

        <div className="flex flex-1 overflow-hidden p-2 gap-2">
          {/* Main Battle Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {!isSharing ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-black/40 border border-white/5 rounded backdrop-blur-sm m-4">
                <div className="text-5xl mb-6">📺</div>
                <h2 className="text-2xl font-display text-text-primary mb-2">Ready to Enter the Arena?</h2>
                <p className="text-text-secondary mb-8 text-center max-w-md">
                  Share your IDE screen to broadcast your coding battle to the audience.
                </p>
                <Button variant="neon" size="lg" onClick={handleStartShare}>
                  SHARE SCREEN NOW
                </Button>
                {shareError && <p className="text-neon-red mt-4">{shareError}</p>}
              </div>
            ) : (
              <div className="flex-1 relative flex flex-col">
                <div className="absolute top-2 right-2 z-20 flex gap-2">
                  <Button variant="danger" size="sm" onClick={handleStopShare}>
                    STOP SHARING
                  </Button>
                </div>
                
                {layout === 'side-by-side' && otherUser ? (
                  <DualView
                    stream1={localStream}
                    stream2={otherStream}
                    user1={myUser}
                    user2={otherUser}
                    stats1={myStats || null}
                    stats2={otherStats || null}
                    layout={layout}
                    challenge={room.config.challenge}
                  />
                ) : (
                  <div className="flex-1 relative h-full w-full p-2">
                    <StreamPanel
                      stream={localStream}
                      userName={myUser.name}
                      isLocal={true}
                      isActive={myStats?.momentum === 'high' || myStats?.momentum === 'extreme'}
                      color="cyan"
                      stats={myStats || null}
                    />
                  </div>
                )}
              </div>
            )}

            {isHost && (
              <BattleControls 
                roomId={roomId}
                isHost={isHost}
                status={room.status}
                onStartBattle={() => handleHostAction(room.status === 'paused' ? 'resume' : 'start')}
                onPauseBattle={() => handleHostAction('pause')}
                onEndBattle={() => handleHostAction('end')}
                onChangeLayout={setLayout}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80 flex flex-col gap-2 flex-shrink-0 h-full overflow-hidden">
            {myStats && (
              <div className="flex-shrink-0">
                <LiveStats stats={myStats} color="cyan" compact />
              </div>
            )}
            
            <div className="flex-1 min-h-0 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg p-4 flex flex-col justify-center items-center text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-display text-text-primary tracking-widest mb-2">BATTLE ARENA</h3>
              <p className="text-text-secondary text-sm font-body">Focus on the code. Live chat is disabled for this arena.</p>
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
}
