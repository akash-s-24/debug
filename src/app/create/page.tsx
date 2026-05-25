'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Background } from '@/components/layout/Background';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useSocket } from '@/hooks/useSocket';
import { RoomConfig, DuelType } from '@/types';
import { LANGUAGES, TIMER_PRESETS, DUEL_TYPES } from '@/lib/constants';

export default function CreateRoomPage() {
  const router = useRouter();
  const { socket, isConnected, connectionError } = useSocket();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  
  const [config, setConfig] = useState<RoomConfig>({
    roomName: '',
    hostName: '',
    challenge: '',
    challengeDescription: '',
    timerSeconds: 900,
    language: 'JavaScript',
    duelType: 'debug-battle',
    maxContestants: 2,
    allowAudience: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !isConnected) {
      setFormError(
        connectionError ??
          'Realtime server is not connected. On Vercel, set NEXT_PUBLIC_SOCKET_URL to a running Socket.IO backend.',
      );
      return;
    }
    
    setLoading(true);
    setFormError(null);
    let didRespond = false;
    const timeout = window.setTimeout(() => {
      if (didRespond) return;
      didRespond = true;
      setLoading(false);
      setFormError('Room creation timed out. Check that the Socket.IO backend is running.');
    }, 10000);

    socket.emit('room:create', config, (room) => {
      if (didRespond) return;
      didRespond = true;
      window.clearTimeout(timeout);
      setLoading(false);
      if (room && room.code) {
        setCreatedRoomCode(room.code);
      } else {
        setFormError('The server did not return a room code.');
      }
    });
  };

  const socketMessage =
    connectionError ??
    (!isConnected ? 'Connecting to realtime arena server...' : null);

  const copyToClipboard = () => {
    if (createdRoomCode) {
      navigator.clipboard.writeText(createdRoomCode);
    }
  };

  const joinCreatedRoom = () => {
    if (createdRoomCode) {
      router.push(`/battle/${createdRoomCode}?role=host&name=${encodeURIComponent(config.hostName)}`);
    }
  };

  return (
    <Background>
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl"
        >
          <Card variant="glass" className="p-8">
            <h1 className="text-3xl font-display text-neon-cyan mb-8 uppercase tracking-widest text-glow-cyan text-center">
              Configure Arena
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Host Name"
                  placeholder="Your hacker alias"
                  value={config.hostName}
                  onChange={(e) => setConfig({...config, hostName: e.target.value})}
                  required
                />
                <Input
                  label="Room Name"
                  placeholder="e.g. Midnight Showdown"
                  value={config.roomName}
                  onChange={(e) => setConfig({...config, roomName: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-text-secondary font-display uppercase tracking-wider text-sm border-b border-white/10 pb-2">Challenge Details</h3>
                <Input
                  label="Challenge Title"
                  placeholder="e.g. Fix the Memory Leak"
                  value={config.challenge}
                  onChange={(e) => setConfig({...config, challenge: e.target.value})}
                  required
                />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-display uppercase text-text-secondary ml-1">Description (Optional)</label>
                  <textarea
                    className="bg-abyss border border-slate-dark text-text-primary px-4 py-3 focus:outline-none focus:border-neon-cyan transition-colors font-mono resize-y min-h-[100px] clip-path-[polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,0_100%)]"
                    placeholder="Describe the task..."
                    value={config.challengeDescription}
                    onChange={(e) => setConfig({...config, challengeDescription: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-text-secondary font-display uppercase tracking-wider text-sm border-b border-white/10 pb-2">Configuration</h3>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-display uppercase text-text-secondary ml-1">Language</label>
                    <select
                      className="bg-abyss border border-slate-dark text-text-primary px-4 py-3 focus:outline-none focus:border-neon-cyan transition-colors font-mono appearance-none"
                      value={config.language}
                      onChange={(e) => setConfig({...config, language: e.target.value})}
                    >
                      {LANGUAGES.map(lang => <option key={lang.value} value={lang.value}>{lang.label}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-display uppercase text-text-secondary ml-1">Timer Limit</label>
                    <div className="flex flex-wrap gap-2">
                      {TIMER_PRESETS.map(preset => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => setConfig({...config, timerSeconds: preset.value})}
                          className={`px-3 py-1.5 text-sm font-mono border transition-colors ${config.timerSeconds === preset.value ? 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan' : 'border-slate-dark bg-abyss text-text-secondary hover:border-white/30'}`}
                        >
                          {preset.shortLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-text-secondary font-display uppercase tracking-wider text-sm border-b border-white/10 pb-2">Duel Type</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {DUEL_TYPES.map(type => (
                      <div
                        key={type.value}
                        onClick={() => setConfig({...config, duelType: type.value as DuelType})}
                        className={`p-3 border cursor-pointer transition-all flex items-center gap-3 ${config.duelType === type.value ? 'border-neon-magenta bg-neon-magenta/10 shadow-[0_0_10px_rgba(255,0,110,0.2)]' : 'border-slate-dark bg-abyss hover:border-white/30'}`}
                      >
                        <span className="text-2xl">{type.icon}</span>
                        <div>
                          <div className={`font-display uppercase text-sm ${config.duelType === type.value ? 'text-neon-magenta' : 'text-text-primary'}`}>{type.label}</div>
                          <div className="text-xs text-text-muted">{type.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-end">
                {(socketMessage || formError) && (
                  <div className="mr-auto max-w-md rounded border border-neon-red/40 bg-neon-red/10 px-4 py-3 text-sm text-neon-red font-mono">
                    {formError ?? socketMessage}
                  </div>
                )}
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="lg" 
                  disabled={
                    loading || 
                    !isConnected || 
                    !config.hostName.trim() || 
                    !config.roomName.trim() || 
                    !config.challenge.trim()
                  }
                  loading={loading}
                >
                  INITIALIZE ARENA
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </main>

      <Modal 
        isOpen={!!createdRoomCode} 
        onClose={() => setCreatedRoomCode(null)}
        title="Arena Initialized"
      >
        <div className="flex flex-col items-center py-6 space-y-6">
          <div className="text-center">
            <p className="text-text-secondary mb-2 uppercase tracking-widest text-sm font-display">Your Room Code</p>
            <div className="text-5xl font-mono text-neon-cyan text-glow-cyan bg-abyss border-2 border-neon-cyan p-6 rounded-lg tracking-[0.2em]">
              {createdRoomCode}
            </div>
          </div>
          
          <div className="flex gap-4 w-full justify-center">
            <Button variant="ghost" onClick={copyToClipboard}>
              Copy Code
            </Button>
            <Button variant="neon" onClick={joinCreatedRoom}>
              Enter Arena
            </Button>
          </div>
        </div>
      </Modal>
    </Background>
  );
}
