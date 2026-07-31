'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { getClientId } from '@/lib/client-id';
import { RoomConfig, DuelType, RoomMode } from '@/types';
import { LANGUAGES, TIMER_PRESETS, DUEL_TYPES, ROOM_MODES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';

export default function CreateRoomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [isCustomTimeMode, setIsCustomTimeMode] = useState(false);
  
  const [config, setConfig] = useState<RoomConfig>({
    roomName: '',
    hostName: '',
    challenge: '',
    challengeDescription: '',
    timerSeconds: 900,
    language: 'javascript',
    duelType: 'debug-battle',
    maxContestants: 2,
    allowAudience: true,
    roomMode: 'terminal',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, clientId: getClientId() }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setFormError(data.error || 'Failed to create room.');
        return;
      }

      if (data.room && data.room.code) {
        setCreatedRoomCode(data.room.code);
      } else {
        setFormError('The server did not return a room code.');
      }
    } catch (err) {
      setLoading(false);
      setFormError(
        err instanceof Error ? err.message : 'Room creation failed. Check network connectivity.',
      );
    }
  };

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

  // Helper for summary bar
  const selectedLang = LANGUAGES.find(l => l.value === config.language)?.label || config.language;
  const selectedType = DUEL_TYPES.find(d => d.value === config.duelType)?.label || config.duelType;
  const timeDisplay = config.timerSeconds >= 60 ? `${Math.floor(config.timerSeconds / 60)} min` : `${config.timerSeconds} sec`;

  return (
    <>
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12 relative min-h-screen flex items-center justify-center overflow-hidden">
        
        <div className="container mx-auto px-gutter max-w-[1200px] relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <div className="bg-void border border-border-subtle p-8 hud-bracket relative shadow-[0_0_60px_rgba(255,184,74,0.06)]">
              <div className="flex items-center gap-4 mb-8">
                <span className="material-symbols-outlined text-brand-primary text-4xl">terminal</span>
                <h1 className="font-display text-4xl md:text-5xl text-text-primary tracking-tight">
                  Initialize <em className="italic text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Loadout.</em>
                </h1>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  
                  {/* Left Column: Configuration */}
                  <div className="space-y-8">
                    
                    {/* Identity Group */}
                    <div className="space-y-4">
                      <h3 className="font-display text-2xl text-text-primary tracking-tight border-b border-border-subtle pb-2">Identity</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-xs text-text-muted uppercase tracking-widest">Host Name *</label>
                          <input
                            type="text"
                            placeholder="Your alias"
                            value={config.hostName}
                            onChange={(e) => setConfig({...config, hostName: e.target.value})}
                            required
                            className="w-full bg-[#121214] border border-white/[0.12] rounded px-4 py-3 font-mono text-sm text-white placeholder:text-slate-500 focus:border-[#3b82f6] focus:outline-none transition-colors shadow-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-xs text-text-muted uppercase tracking-widest">Room Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Midnight Showdown"
                            value={config.roomName}
                            onChange={(e) => setConfig({...config, roomName: e.target.value})}
                            required
                            className="w-full bg-[#121214] border border-white/[0.12] rounded px-4 py-3 font-mono text-sm text-white placeholder:text-slate-500 focus:border-[#3b82f6] focus:outline-none transition-colors shadow-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Room Mode Group */}
                    <div className="space-y-4">
                      <h3 className="font-display text-2xl text-text-primary tracking-tight border-b border-border-subtle pb-2">Room Mode</h3>
                      <div className="flex flex-col gap-4">
                        {ROOM_MODES.map((mode, index) => {
                          const isSelected = config.roomMode === mode.value;
                          const cardColor = index === 0 ? 'brand-primary' : 'brand-accent';
                          return (
                            <div
                              key={mode.value}
                              onClick={() => setConfig({...config, roomMode: mode.value as RoomMode})}
                              className={`p-4 rounded border cursor-pointer flex items-center gap-4 group transition-all duration-300 ${isSelected ? `border-${cardColor} bg-${cardColor}/5 scale-[1.02]` : 'border-border-subtle bg-surface hover:border-text-muted hover:scale-[1.01]'}`}
                            >
                              <div className={`w-12 h-12 rounded flex items-center justify-center shrink-0 border ${isSelected ? `bg-${cardColor}/10 border-${cardColor}/30 text-${cardColor}` : 'bg-abyss border-border-subtle text-text-muted group-hover:text-text-secondary'}`}>
                                <span className="material-symbols-outlined">{mode.icon}</span>
                              </div>
                              <div className="flex-1">
                                <div className={`font-display tracking-tight text-xl ${isSelected ? `text-${cardColor}` : 'text-text-primary'}`}>
                                  {mode.label}
                                </div>
                                <div className="font-mono text-[11px] leading-tight text-text-secondary mt-1">
                                  {mode.description}
                                </div>
                              </div>
                              {isSelected && (
                                <div className={`text-${cardColor}`}>
                                  <span className="material-symbols-outlined">check_circle</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Challenge Group */}
                    <div className="space-y-4">
                      <h3 className="font-display text-2xl text-text-primary tracking-tight border-b border-border-subtle pb-2">Challenge Parameters</h3>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-xs text-text-muted uppercase tracking-widest">Challenge Title *</label>
                        <input
                          type="text"
                          placeholder="e.g. Fix the Memory Leak"
                          value={config.challenge}
                          onChange={(e) => setConfig({...config, challenge: e.target.value})}
                          required
                          className="w-full bg-[#121214] border border-white/[0.12] rounded px-4 py-3 font-mono text-sm text-white placeholder:text-slate-500 focus:border-[#3b82f6] focus:outline-none transition-colors shadow-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-xs text-text-muted uppercase tracking-widest">Description (Optional)</label>
                        <textarea
                          placeholder="Describe the task..."
                          value={config.challengeDescription}
                          onChange={(e) => setConfig({...config, challengeDescription: e.target.value})}
                          className="w-full bg-[#121214] border border-white/[0.12] rounded px-4 py-3 font-mono text-sm text-white placeholder:text-slate-500 focus:border-[#3b82f6] focus:outline-none transition-colors min-h-[80px] shadow-none"
                        />
                      </div>
                      
                      {config.roomMode === 'terminal' && (
                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-xs text-text-muted uppercase tracking-widest">Initial Debug Code (Optional)</label>
                          <textarea
                            placeholder="Provide the buggy code..."
                            value={config.initialCode || ''}
                            onChange={(e) => setConfig({...config, initialCode: e.target.value})}
                            className="w-full bg-[#121214] border border-white/[0.12] rounded px-4 py-3 font-mono text-sm text-white placeholder:text-slate-500 focus:border-[#3b82f6] focus:outline-none transition-colors min-h-[120px] shadow-none"
                          />
                        </div>
                      )}
                    </div>

                    {/* Environment Group */}
                    <div className="space-y-4">
                      <h3 className="font-display text-2xl text-text-primary tracking-tight border-b border-border-subtle pb-2">Environment</h3>
                      <div className="flex flex-col gap-1.5 relative">
                        <label className="font-mono text-xs text-text-muted uppercase tracking-widest">Language</label>
                        <select
                          value={config.language}
                          onChange={(e) => setConfig({...config, language: e.target.value})}
                          className="w-full bg-[#121214] border border-white/[0.12] rounded px-4 py-3 font-mono text-sm text-white focus:border-brand-accent focus:outline-none transition-colors appearance-none shadow-none"
                        >
                          {LANGUAGES.map(lang => <option key={lang.value} value={lang.value}>{lang.label}</option>)}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-9 pointer-events-none text-text-muted">expand_more</span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-xs text-text-muted uppercase tracking-widest">Timer Limit</label>
                        <div className="flex flex-wrap gap-2">
                          {TIMER_PRESETS.map(preset => (
                            <button
                              key={preset.value}
                              type="button"
                              onClick={() => {
                                setIsCustomTimeMode(false);
                                setConfig({...config, timerSeconds: preset.value});
                              }}
                              className={`px-4 py-2 font-mono text-xs uppercase rounded transition-colors ${!isCustomTimeMode && config.timerSeconds === preset.value ? 'bg-brand-accent/10 border border-brand-accent text-brand-accent' : 'bg-surface border border-border-subtle text-text-secondary hover:border-text-muted'}`}
                            >
                              {preset.shortLabel}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomTimeMode(true);
                              if (TIMER_PRESETS.some(p => p.value === config.timerSeconds)) {
                                setConfig({...config, timerSeconds: 1200});
                              }
                            }}
                            className={`px-4 py-2 font-mono text-xs uppercase rounded transition-colors ${isCustomTimeMode ? 'bg-brand-accent/10 border border-brand-accent text-brand-accent' : 'bg-surface border border-border-subtle text-text-secondary hover:border-text-muted'}`}
                          >
                            Custom
                          </button>
                        </div>
                        
                        {isCustomTimeMode && (
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="number"
                              min="1"
                              max="300"
                              value={Math.floor(config.timerSeconds / 60) || ''}
                              onChange={(e) => {
                                const mins = parseInt(e.target.value);
                                if (!isNaN(mins)) {
                                  setConfig({...config, timerSeconds: mins * 60});
                                } else {
                                  setConfig({...config, timerSeconds: 0});
                                }
                              }}
                              className="w-24 bg-[#121214] border border-white/[0.12] rounded px-4 py-2 font-mono text-sm text-white focus:border-brand-accent focus:outline-none text-center shadow-none"
                            />
                            <span className="font-mono text-xs text-text-muted">minutes</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Duel Type */}
                  <div className="space-y-4">
                    <h3 className="font-display text-2xl text-text-primary tracking-tight border-b border-border-subtle pb-2">Duel Type</h3>
                    <div className="flex flex-col gap-4">
                      {DUEL_TYPES.map((type, index) => {
                        const isSelected = config.duelType === type.value;
                        const cardColor = index === 0 ? 'brand-primary' : index === 1 ? 'brand-secondary' : 'warn-amber';
                        return (
                          <div
                            key={type.value}
                            onClick={() => setConfig({...config, duelType: type.value as DuelType})}
                            className={`p-4 rounded border cursor-pointer flex items-center gap-4 group transition-all duration-300 ${isSelected ? `border-${cardColor} bg-${cardColor}/5 scale-[1.02]` : 'border-border-subtle bg-surface hover:border-text-muted hover:scale-[1.01]'}`}
                          >
                            <div className={`w-12 h-12 rounded flex items-center justify-center shrink-0 border ${isSelected ? `bg-${cardColor}/10 border-${cardColor}/30 text-${cardColor}` : 'bg-abyss border-border-subtle text-text-muted group-hover:text-text-secondary'}`}>
                              <span className="material-symbols-outlined">{type.icon}</span>
                            </div>
                            <div className="flex-1">
                              <div className={`font-display tracking-tight text-2xl ${isSelected ? `text-${cardColor}` : 'text-text-primary'}`}>
                                {type.label}
                              </div>
                              <div className="font-mono text-[11px] leading-tight text-text-secondary mt-1">
                                {type.description}
                              </div>
                            </div>
                            {isSelected && (
                              <div className={`text-${cardColor}`}>
                                <span className="material-symbols-outlined">check_circle</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                </div>

                {/* Bottom Summary Bar */}
                <div className="mt-12 p-4 border border-border-subtle bg-abyss rounded flex flex-col md:flex-row items-center justify-between gap-6 relative">
                  {/* Subtle scanline overlay for the bar */}
                  <div className="scanline-overlay rounded"></div>
                  
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-brand-secondary relative z-10">
                    <span className="bg-brand-secondary/10 px-2 py-1 rounded border border-brand-secondary/20">{selectedType}</span>
                    <span className="text-text-muted">•</span>
                    <span className="text-brand-primary">{config.roomMode === 'terminal' ? 'Terminal' : 'Screen Share'}</span>
                    <span className="text-text-muted">•</span>
                    <span className="text-text-primary">{selectedLang}</span>
                    <span className="text-text-muted">•</span>
                    <span className="text-text-primary">{timeDisplay}</span>
                    <span className="text-text-muted">•</span>
                    <span className="text-text-primary">Up to 8 Players</span>
                  </div>

                  <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                    {formError && (
                      <div className="font-mono text-xs text-danger-red border border-danger-red/30 bg-danger-red/10 px-3 py-1 rounded">
                        {formError}
                      </div>
                    )}
                    <Button
                      type="submit" 
                      disabled={loading || !config.hostName.trim() || !config.roomName.trim() || !config.challenge.trim()}
                      className="w-full md:w-auto"
                      size="lg"
                    >
                      {loading ? 'INITIALIZING...' : 'CREATE_ROOM'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Success Modal - Reusing the global Modal styling concept */}
      {createdRoomCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md glass-surface rounded-lg p-6 relative hud-bracket"
          >
            <div className="flex items-center justify-between mb-6 border-b border-border-subtle pb-4">
              <h2 className="font-display text-3xl text-text-primary tracking-tight">Arena Deployed</h2>
              <button
                onClick={() => setCreatedRoomCode(null)}
                className="text-text-muted hover:text-brand-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="flex flex-col items-center py-4 space-y-6">
              <div className="text-center w-full">
                <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-2">Access Token</p>
                <div className="text-4xl font-display text-brand-accent bg-brand-accent/5 border border-brand-accent/30 px-6 py-4 rounded tracking-[0.2em] relative overflow-hidden">
                  <div className="relative z-10">{createdRoomCode}</div>
                  <div className="scanline-overlay"></div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Button onClick={copyToClipboard} className="w-full sm:w-1/2" variant="secondary">
                  COPY_TOKEN
                </Button>
                <Button onClick={joinCreatedRoom} className="w-full sm:w-1/2">
                  ENTER_ARENA
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
