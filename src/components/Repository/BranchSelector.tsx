import { useEffect, useRef, useState } from 'react';
import type { BranchSummary } from '../../types/git';

interface BranchSelectorProps {
  branches: BranchSummary[];
  current: string;
  onSelect: (branch: string) => void;
}

/** GitHub-style branch dropdown. */
export function BranchSelector({ branches, current, onSelect }: BranchSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (branches.length === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/5 rounded-lg text-gitbase-text-primary hover:bg-white/10"
      >
        <span>🌿</span>
        <span className="font-medium">{current}</span>
        <span className="text-xs text-gitbase-text-secondary">▾</span>
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-60 rounded-lg border border-gitbase-border-dark/40 bg-gitbase-surface-dark shadow-xl overflow-hidden">
          <div className="px-3 py-2 text-xs text-gitbase-text-secondary border-b border-gitbase-border-dark/30">
            Switch branches ({branches.length})
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {branches.map(b => (
              <li key={b.name}>
                <button
                  onClick={() => { onSelect(b.name); setOpen(false); }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left hover:bg-white/5 ${
                    b.name === current ? 'text-gitbase-primary' : 'text-gitbase-text-primary'
                  }`}
                >
                  <span className="truncate">{b.name}</span>
                  <span className="flex items-center gap-2 flex-shrink-0">
                    {b.isDefault && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-gitbase-border-dark/40 text-gitbase-text-secondary">
                        default
                      </span>
                    )}
                    {b.name === current && <span>✓</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
