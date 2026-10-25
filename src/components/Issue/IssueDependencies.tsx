import { useState } from 'react';
import type { IssueRef } from '../../types/issue';

interface IssueDependenciesProps {
  /** Issues this one depends on. */
  blockedBy: IssueRef[];
  /** Issues that depend on this one. */
  blocks: IssueRef[];
  canEdit: boolean;
  error: string | null;
  onAdd: (number: number) => void;
  onRemove: (number: number) => void;
  onOpen: (number: number) => void;
}

function RefRow({ issue, onOpen, onRemove }: { issue: IssueRef; onOpen: () => void; onRemove?: () => void }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span className={issue.state === 'OPEN' ? 'text-green-400' : 'text-purple-400'} aria-label={issue.state}>
        {issue.state === 'OPEN' ? '⊙' : '✓'}
      </span>
      <button onClick={onOpen} className="text-gitbase-text-primary hover:text-gitbase-primary truncate text-left">
        #{issue.number} {issue.title}
      </button>
      {onRemove && (
        <button onClick={onRemove} aria-label={`Remove dependency on #${issue.number}`}
                className="ml-auto text-gitbase-text-secondary hover:text-red-400">
          ✕
        </button>
      )}
    </li>
  );
}

/** Sidebar section for issue dependencies: "Blocked by" (editable) and "Blocks". */
export function IssueDependencies({ blockedBy, blocks, canEdit, error, onAdd, onRemove, onOpen }: IssueDependenciesProps) {
  const [value, setValue] = useState('');
  const openBlockers = blockedBy.filter(ref => ref.state === 'OPEN').length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const number = Number(value.replace('#', '').trim());
    if (!Number.isInteger(number) || number < 1) return;
    onAdd(number);
    setValue('');
  };

  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-gitbase-text-secondary mb-2">Dependencies</div>

      {openBlockers > 0 && (
        <div className="text-xs text-yellow-300 mb-2">
          Blocked by {openBlockers} open issue{openBlockers === 1 ? '' : 's'} — it can't be closed until they are.
        </div>
      )}

      <div className="text-xs text-gitbase-text-secondary mb-1">Blocked by</div>
      {blockedBy.length === 0
        ? <div className="text-sm text-gitbase-text-secondary mb-2">Nothing</div>
        : (
          <ul className="space-y-1 mb-2">
            {blockedBy.map(ref => (
              <RefRow key={ref.number} issue={ref} onOpen={() => onOpen(ref.number)}
                      onRemove={canEdit ? () => onRemove(ref.number) : undefined} />
            ))}
          </ul>
        )}

      {canEdit && (
        <form onSubmit={submit} className="flex gap-1.5 mb-3">
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="#issue"
            aria-label="Add dependency by issue number"
            inputMode="numeric"
            className="w-full px-2 py-1 rounded-md bg-gitbase-surface-dark border border-gitbase-border-dark/30 text-sm text-gitbase-text-primary placeholder:text-gitbase-text-secondary focus:outline-none focus:border-gitbase-primary/50"
          />
          <button type="submit" className="px-2 py-1 rounded-md bg-white/5 text-sm text-gitbase-text-primary hover:bg-white/10">
            Add
          </button>
        </form>
      )}

      {blocks.length > 0 && (
        <>
          <div className="text-xs text-gitbase-text-secondary mb-1">Blocks</div>
          <ul className="space-y-1">
            {blocks.map(ref => <RefRow key={ref.number} issue={ref} onOpen={() => onOpen(ref.number)} />)}
          </ul>
        </>
      )}

      {error && <div className="text-xs text-red-400 mt-2">{error}</div>}
    </div>
  );
}
