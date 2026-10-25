import { useEffect, useMemo, useRef, useState } from 'react';
import type { BranchSummary } from '../../types/git';

interface BranchSelectorProps {
  branches: BranchSummary[];
  current: string;
  onSelect: (branch: string) => void;
  /** Only the repository owner may mutate branches; omit these to render a read-only dropdown. */
  onCreate?: (name: string, from: string) => Promise<void>;
  onDelete?: (name: string) => Promise<void>;
}

/**
 * GitHub-style branch dropdown: filter, switch, create, delete.
 *
 * Creating mirrors GitHub — type a name that doesn't exist and the filter row turns into
 * "Create branch: <name> from <current>". Branches live only as git refs, so every action here
 * maps straight onto a ref operation server-side.
 */
export function BranchSelector({ branches, current, onSelect, onCreate, onDelete }: BranchSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Reset transient state whenever the menu closes.
  useEffect(() => {
    if (!open) { setQuery(''); setError(null); setConfirmDelete(null); }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? branches.filter(b => b.name.toLowerCase().includes(q)) : branches;
  }, [branches, query]);

  const trimmed = query.trim();
  const canOfferCreate =
    !!onCreate && trimmed.length > 0 && !branches.some(b => b.name === trimmed);

  if (branches.length === 0) return null;

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      setOpen(false);
    } catch (err: any) {
      setError(err?.message ?? 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/5 rounded-lg text-gitbase-text-primary hover:bg-white/10"
      >
        <span className="font-medium">{current}</span>
        <span className="text-xs text-gitbase-text-secondary">▾</span>
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-72 rounded-lg border border-gitbase-border-dark/40 bg-gitbase-surface-dark shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gitbase-border-dark/30">
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={onCreate ? 'Find or create a branch…' : 'Find a branch…'}
              className="w-full px-2.5 py-1.5 rounded-md bg-gitbase-surface-dark border border-gitbase-border-dark/40 text-sm text-gitbase-text-primary placeholder:text-gitbase-text-secondary focus:outline-none focus:border-gitbase-primary/50"
            />
          </div>

          {error && <div className="px-3 py-2 text-xs text-red-400">{error}</div>}

          <ul className="max-h-64 overflow-y-auto">
            {filtered.map(b => (
              <li key={b.name} className="group">
                {confirmDelete === b.name ? (
                  <div className="px-3 py-2 flex items-center gap-2 bg-red-500/10">
                    <span className="text-xs text-red-300 flex-1 truncate">Delete {b.name}?</span>
                    <button
                      disabled={busy}
                      onClick={() => run(async () => { await onDelete!(b.name); })}
                      className="px-2 py-0.5 text-xs rounded bg-red-500/80 text-white disabled:opacity-40"
                    >
                      {busy ? '…' : 'Delete'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-2 py-0.5 text-xs rounded bg-white/10 text-gitbase-text-primary"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <button
                      onClick={() => { onSelect(b.name); setOpen(false); }}
                      className={`flex-1 min-w-0 flex items-center justify-between gap-2 px-3 py-2 text-sm text-left hover:bg-white/5 ${
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
                    {/* The default branch cannot be deleted — the server rejects it too. */}
                    {onDelete && !b.isDefault && (
                      <button
                        onClick={() => setConfirmDelete(b.name)}
                        title={`Delete ${b.name}`}
                        aria-label={`Delete branch ${b.name}`}
                        className="px-2 py-2 text-gitbase-text-secondary opacity-0 group-hover:opacity-100 hover:text-red-400"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}

            {filtered.length === 0 && !canOfferCreate && (
              <li className="px-3 py-3 text-sm text-gitbase-text-secondary">No branches match.</li>
            )}
          </ul>

          {canOfferCreate && (
            <button
              disabled={busy}
              onClick={() => run(async () => { await onCreate!(trimmed, current); })}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left border-t border-gitbase-border-dark/30 hover:bg-white/5 text-gitbase-primary disabled:opacity-40"
            >
              <span>＋</span>
              <span className="truncate">
                {busy ? 'Creating…' : <>Create branch: <strong>{trimmed}</strong> from <em>{current}</em></>}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
