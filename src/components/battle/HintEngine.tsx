import React, { useState } from 'react';
import { ErrorSpec } from '@/types/ai';

interface HintEngineProps {
  errors: ErrorSpec[];
  onShowHint: (marker: any) => void;
  onApplyPenalty: (amount: number) => void;
}

export function HintEngine({ errors, onShowHint, onApplyPenalty }: HintEngineProps) {
  const [revealedHints, setRevealedHints] = useState<Set<string>>(new Set());

  const handleReveal = (err: ErrorSpec) => {
    if (revealedHints.has(err.id)) return;
    
    setRevealedHints(prev => new Set(prev).add(err.id));
    onApplyPenalty(50); // Penalty for using a hint
    
    onShowHint({
      message: err.fixHint || err.message,
      severity: 8, // monaco.MarkerSeverity.Error
      startLineNumber: err.line,
      startColumn: err.column,
      endLineNumber: err.line,
      endColumn: err.column + 5, // arbitrary width
    });
  };

  if (errors.length === 0) return null;

  return (
    <div className="bg-void border border-border-subtle p-4 mt-4 hud-bracket">
      <h4 className="font-heading text-sm text-neon-cyan uppercase tracking-widest mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-[16px]">psychology</span>
        AI Hint Engine
      </h4>
      <div className="space-y-2">
        {errors.map((err, i) => {
          const isRevealed = revealedHints.has(err.id);
          return (
            <div key={err.id} className="flex items-center justify-between bg-surface/50 p-2 border border-border-subtle/50 rounded">
              <span className="font-mono text-xs text-text-secondary">Bug #{i + 1}</span>
              {isRevealed ? (
                <span className="font-mono text-[10px] text-neon-magenta text-right w-48 truncate" title={err.fixHint || err.message}>
                  {err.fixHint || err.message}
                </span>
              ) : (
                <button
                  onClick={() => handleReveal(err)}
                  className="font-mono text-[10px] bg-border-subtle hover:bg-neon-cyan/20 hover:text-neon-cyan transition-colors px-2 py-1 rounded text-text-muted uppercase"
                >
                  Reveal (-50pts)
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
