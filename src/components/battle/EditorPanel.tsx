'use client';

import React, { useRef, useEffect, useState } from 'react';
import Editor, { useMonaco, Monaco } from '@monaco-editor/react';
import { CodingStats } from '@/types';
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
  onTerminalChange?: (updates: Partial<Pick<CodingStats, 'terminalOutput' | 'terminalInput' | 'showTerminal' | 'activeTab' | 'terminalIsError'>>) => void;
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
  onValidation,
  onTerminalChange
}: EditorPanelProps) {
  const monaco = useMonaco();
  const [output, setOutput] = useState<string | null>(null);
  const [stdin, setStdin] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('output');
  const [isError, setIsError] = useState(false);

  // Sync remote terminal state if not local
  const currentOutput = isLocal ? output : stats?.terminalOutput ?? null;
  const currentStdin = isLocal ? stdin : stats?.terminalInput ?? '';
  const currentShowTerminal = isLocal ? showTerminal : stats?.showTerminal ?? false;
  const currentActiveTab = isLocal ? activeTab : stats?.activeTab ?? 'output';
  const currentIsError = isLocal ? isError : stats?.terminalIsError ?? false;

  const updateTerminal = (updates: Partial<Pick<CodingStats, 'terminalOutput' | 'terminalInput' | 'showTerminal' | 'activeTab' | 'terminalIsError'>>) => {
    if (updates.terminalOutput !== undefined) setOutput(updates.terminalOutput);
    if (updates.terminalInput !== undefined) setStdin(updates.terminalInput);
    if (updates.showTerminal !== undefined) setShowTerminal(updates.showTerminal);
    if (updates.activeTab !== undefined) setActiveTab(updates.activeTab);
    if (updates.terminalIsError !== undefined) setIsError(updates.terminalIsError);
    
    if (isLocal && onTerminalChange) {
      onTerminalChange(updates);
    }
  };

  const handleRunCode = async () => {
    if (!code) return;
    setIsExecuting(true);
    updateTerminal({ showTerminal: true, activeTab: 'output' });

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, stdin }),
      });
      const data = await res.json();
      if (!res.ok) {
        updateTerminal({ terminalOutput: data.error || 'Execution failed', terminalIsError: true });
      } else {
        const outputText = data.output || 'No output';
        const hasErrorKeywords = /(Error|Exception|Failed|Traceback|SyntaxError|ReferenceError):/i.test(outputText);
        updateTerminal({ terminalOutput: outputText, terminalIsError: hasErrorKeywords });
      }
    } catch (err) {
      updateTerminal({ terminalOutput: 'Failed to run code. Network error.', terminalIsError: true });
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
          'editor.background': '#0D0F17', // Match abyss
          'editor.lineHighlightBackground': '#22E9E10a', // Slight cyan tint
        },
      });
      monaco.editor.setTheme('neon-dark');
    }
  }, [monaco]);

  const colorClass = color === 'cyan' ? 'text-neon-cyan border-neon-cyan/50' : 'text-neon-magenta border-neon-magenta/50';
  const bgGlow = color === 'cyan' ? 'bg-neon-cyan/5' : 'bg-neon-magenta/5';

  return (
    <div className={`relative w-full h-full flex flex-col glass-surface rounded-lg overflow-hidden hud-bracket ${
      isActive ? `border-${color === 'cyan' ? 'neon-cyan' : 'neon-magenta'} shadow-[0_0_30px_rgba(${color === 'cyan' ? '34,233,225' : '247,37,133'},0.2)]` : 'border-border-subtle'
    }`}>
      {/* Header Bar */}
      <div className={`h-12 border-b border-border-subtle flex items-center justify-between px-4 ${bgGlow}`}>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[18px] text-text-muted">data_object</span>
          <span className={`font-heading font-bold uppercase tracking-widest text-sm ${colorClass}`}>
            {userName}
          </span>
          {isLocal && (
            <span className="text-[10px] bg-neon-cyan/10 text-neon-cyan px-2 py-0.5 rounded border border-neon-cyan/30 font-mono">YOU</span>
          )}
        </div>
        
        {stats && (
          <div className="flex items-center gap-4 font-mono text-xs text-text-muted">
            {isLocal && (
              <div className="flex items-center gap-2 mr-2">
                <button 
                  onClick={() => updateTerminal({ showTerminal: !showTerminal, activeTab: 'input' })}
                  className="flex items-center gap-1 bg-surface hover:bg-abyss transition-colors px-2 py-1 rounded text-text-secondary hover:text-text-primary border border-border-subtle"
                >
                  <span className="material-symbols-outlined text-[14px]">terminal</span>
                  STDIN
                </button>
                <button 
                  onClick={handleRunCode}
                  disabled={isExecuting}
                  className="flex items-center gap-1 bg-neon-cyan text-void transition-colors px-3 py-1 rounded font-bold uppercase disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                  {isExecuting ? 'RUNNING' : 'RUN'}
                </button>
              </div>
            )}
            <span className={stats.typingSpeed > 100 ? 'text-neon-cyan font-bold' : ''}>
              {stats.typingSpeed} CPM
            </span>
            <span className={stats.errorCount > 0 ? 'text-danger-red font-bold' : 'text-neon-cyan'}>
              {stats.errorCount} ERR
            </span>
          </div>
        )}
      </div>

      {/* Monaco Editor Container */}
      <div className={`flex-1 relative flex flex-col ${currentShowTerminal ? 'h-1/2' : 'h-full'}`}>
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
            fontFamily: "'JetBrains Mono', monospace",
            wordWrap: 'on',
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            renderValidationDecorations: 'off',
            cursorSmoothCaretAnimation: 'on',
            formatOnPaste: true,
          }}
          loading={
            <div className="flex items-center justify-center h-full text-text-muted font-mono animate-pulse">
              Initializing Environment...
            </div>
          }
        />
        
        {/* Subtle scanline overlay for the editor */}
        <div className="scanline-overlay opacity-30 pointer-events-none"></div>

        {/* Momentum Overlay (When typing fast) */}
        {isActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute inset-0 pointer-events-none border-2 ${colorClass} opacity-10`}
            style={{ mixBlendMode: 'screen' }}
          />
        )}
      </div>

      {/* Terminal UI */}
      {currentShowTerminal && (
        <div className="h-1/2 bg-void border-t border-border-subtle flex flex-col relative z-10 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle bg-abyss/80">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 mr-4 text-text-secondary">
                <span className="material-symbols-outlined text-[14px]">terminal</span>
                <span className="text-xs font-mono tracking-widest uppercase">Console</span>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => isLocal && updateTerminal({ activeTab: 'input' })}
                  className={`text-xs font-mono uppercase px-2 py-1 rounded transition-colors ${currentActiveTab === 'input' ? 'bg-border-subtle text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
                >
                  STDIN
                </button>
                <button 
                  onClick={() => isLocal && updateTerminal({ activeTab: 'output' })}
                  className={`text-xs font-mono uppercase px-2 py-1 rounded transition-colors ${currentActiveTab === 'output' ? 'bg-border-subtle text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
                >
                  STDOUT
                </button>
              </div>
            </div>
            {isLocal && (
              <button onClick={() => updateTerminal({ showTerminal: false })} className="text-text-muted hover:text-danger-red transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            {currentActiveTab === 'input' ? (
              <textarea
                value={currentStdin}
                onChange={(e) => updateTerminal({ terminalInput: e.target.value })}
                readOnly={!isLocal}
                placeholder={isLocal ? "Enter input values here (one per line)..." : "Player has not entered any input."}
                className="w-full h-full bg-transparent text-text-primary font-mono text-sm p-4 resize-none focus:outline-none placeholder:text-text-muted/50"
                spellCheck={false}
              />
            ) : (
              <div className={`w-full h-full p-4 font-mono text-sm overflow-y-auto whitespace-pre-wrap ${currentOutput ? (currentIsError ? 'text-danger-red' : 'text-neon-cyan') : 'text-text-primary'}`}>
                {currentOutput || <span className="text-text-muted/50 italic">No output yet. Click RUN to execute.</span>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
