'use client';

import React, { useRef, useEffect, useState } from 'react';
import Editor, { useMonaco, Monaco } from '@monaco-editor/react';
import { CodingStats } from '@/types';
import { CodeBracketIcon, CommandLineIcon, XMarkIcon, PlayIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface EditorPanelProps {
  userName: string;
  isLocal: boolean;
  isActive: boolean;
  color: 'cyan' | 'magenta';
  stats: CodingStats | null;
  code: string;
  language?: string;
  onChange?: (value: string | undefined) => void;
  onValidation?: (markers: any[]) => void;
}

export function EditorPanel({
  userName,
  isLocal,
  isActive,
  color,
  stats,
  code,
  language = 'typescript',
  onChange,
  onValidation
}: EditorPanelProps) {
  const monaco = useMonaco();
  const [output, setOutput] = useState<string | null>(null);
  const [stdin, setStdin] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('output');

  const handleRunCode = async () => {
    if (!code) return;
    setIsExecuting(true);
    setShowTerminal(true);
    setActiveTab('output');
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, stdin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOutput(data.error || 'Execution failed');
      } else {
        setOutput(data.output || 'No output');
      }
    } catch (err) {
      setOutput('Failed to run code. Network error.');
    } finally {
      setIsExecuting(false);
    }
  };

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('neon-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#080810', // Deep void background
          'editor.lineHighlightBackground': '#ffffff0a',
        },
      });
      monaco.editor.setTheme('neon-dark');
    }
  }, [monaco]);

  const colorClass = color === 'cyan' ? 'text-neon-cyan border-neon-cyan/50' : 'text-neon-magenta border-neon-magenta/50';
  const bgGlow = color === 'cyan' ? 'bg-neon-cyan/5' : 'bg-neon-magenta/5';

  return (
    <div className={`relative w-full h-full flex flex-col bg-black/80 rounded-xl border overflow-hidden ${
      isActive ? `border-${color} shadow-[0_0_30px_rgba(var(--${color}-rgb),0.3)]` : 'border-white/10'
    }`}>
      {/* Header Bar */}
      <div className={`h-10 border-b border-white/10 flex items-center justify-between px-4 ${bgGlow}`}>
        <div className="flex items-center gap-2">
          <CodeBracketIcon className={`w-4 h-4 ${colorClass}`} />
          <span className={`font-display font-bold uppercase tracking-wider text-sm ${colorClass}`}>
            {userName}
          </span>
          {isLocal && (
            <span className="text-[10px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded font-mono">YOU</span>
          )}
        </div>
        
        {stats && (
          <div className="flex items-center gap-4 font-mono text-xs text-text-muted">
            {isLocal && (
              <div className="flex items-center gap-2 mr-2">
                <button 
                  onClick={() => {
                    setShowTerminal(!showTerminal);
                    setActiveTab('input');
                  }}
                  className="flex items-center gap-1 bg-white/5 hover:bg-white/10 transition-colors px-2 py-1 rounded text-text-secondary border border-white/10"
                >
                  <CommandLineIcon className="w-3 h-3" />
                  STDIN
                </button>
                <button 
                  onClick={handleRunCode}
                  disabled={isExecuting}
                  className="flex items-center gap-1 bg-neon-cyan/20 hover:bg-neon-cyan/30 transition-colors px-3 py-1 rounded text-neon-cyan border border-neon-cyan/40 font-bold"
                >
                  <PlayIcon className="w-3 h-3" />
                  {isExecuting ? 'RUNNING' : 'RUN'}
                </button>
              </div>
            )}
            <span className={stats.typingSpeed > 100 ? 'text-white font-bold text-glow-white' : ''}>
              {stats.typingSpeed} CPM
            </span>
            <span className={stats.errorCount > 0 ? 'text-neon-red font-bold' : 'text-neon-cyan'}>
              {stats.errorCount} ERR
            </span>
          </div>
        )}
      </div>

      {/* Monaco Editor Container */}
      <div className={`flex-1 relative flex flex-col ${showTerminal ? 'h-1/2' : 'h-full'}`}>
        <Editor
          height="100%"
          language={language.toLowerCase()}
          theme="neon-dark"
          value={code}
          onChange={onChange}
          onValidate={onValidation}
          options={{
            readOnly: !isLocal,
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            wordWrap: 'on',
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            formatOnPaste: true,
          }}
          loading={
            <div className="flex items-center justify-center h-full text-text-muted font-mono animate-pulse">
              Initializing Environment...
            </div>
          }
        />
        
        {/* Momentum Overlay (When typing fast) */}
        {isActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute inset-0 pointer-events-none border-2 ${colorClass} opacity-20`}
            style={{ mixBlendMode: 'screen' }}
          />
        )}
      </div>

      {/* Terminal UI */}
      {showTerminal && (
        <div className="h-1/2 bg-black border-t border-white/10 flex flex-col relative z-10 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 mr-4">
                <CommandLineIcon className="w-4 h-4 text-text-secondary" />
                <span className="text-xs font-display tracking-widest text-text-secondary uppercase">Terminal</span>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveTab('input')}
                  className={`text-xs font-mono uppercase px-2 py-1 rounded transition-colors ${activeTab === 'input' ? 'bg-white/10 text-white' : 'text-text-muted hover:text-white'}`}
                >
                  Input (stdin)
                </button>
                <button 
                  onClick={() => setActiveTab('output')}
                  className={`text-xs font-mono uppercase px-2 py-1 rounded transition-colors ${activeTab === 'output' ? 'bg-white/10 text-white' : 'text-text-muted hover:text-white'}`}
                >
                  Output
                </button>
              </div>
            </div>
            <button onClick={() => setShowTerminal(false)} className="text-text-muted hover:text-white transition-colors">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            {activeTab === 'input' ? (
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Enter input values here (one per line)..."
                className="w-full h-full bg-transparent text-white font-mono text-sm p-4 resize-none focus:outline-none placeholder:text-white/20"
                spellCheck={false}
              />
            ) : (
              <div className="w-full h-full p-4 font-mono text-sm overflow-y-auto text-white whitespace-pre-wrap bg-black/50">
                {output || <span className="text-white/30 italic">No output yet. Click RUN to execute.</span>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
