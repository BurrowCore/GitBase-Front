import { useState } from 'react';
import { Link } from 'react-router-dom';
import { pullRequestService } from '../../services/pullRequestService';
import type { MergeConflictError, MergeMethod, PullRequest } from '../../types/pullRequest';

interface MergeBoxProps {
  username: string;
  repo: string;
  pr: PullRequest;
  /** Viewer has write access (owner or WRITE/ADMIN collaborator). */
  canMerge: boolean;
  /** Viewer may close/reopen: write access, or the pull request's author. */
  canClose: boolean;
  onMerged: () => void;
  onClose: () => void;
  onReopen: () => void;
  actionError?: string | null;
}

/** GitHub's three options, with the wording GitHub uses. */
const METHODS: { value: MergeMethod; label: string; button: string; hint: string }[] = [
  {
    value: 'merge',
    label: 'Create a merge commit',
    button: 'Merge pull request',
    hint: 'All commits are added to the base branch via a merge commit.',
  },
  {
    value: 'squash',
    label: 'Squash and merge',
    button: 'Squash and merge',
    hint: 'The commits are combined into one commit on the base branch.',
  },
  {
    value: 'rebase',
    label: 'Rebase and merge',
    button: 'Rebase and merge',
    hint: 'The commits are replayed onto the base branch, without a merge commit.',
  },
];

const MERGED_LABEL: Record<MergeMethod, string> = {
  merge: 'Merged',
  squash: 'Squashed and merged',
  rebase: 'Rebased and merged',
};

/** Default commit message the server will use when the field is left empty. */
function defaultMessage(method: MergeMethod, pr: PullRequest): string {
  return method === 'squash'
    ? `${pr.title} (#${pr.number})`
    : `Merge pull request #${pr.number}: ${pr.title}`;
}

/** Merge / close / reopen panel at the foot of the conversation, with conflict reporting. */
export function MergeBox({
  username, repo, pr, canMerge, canClose, onMerged, onClose, onReopen, actionError,
}: MergeBoxProps) {
  const [method, setMethod] = useState<MergeMethod>('merge');
  const [merging, setMerging] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);

  const selected = METHODS.find(m => m.value === method) ?? METHODS[0];

  const merge = async () => {
    setMerging(true);
    setError(null);
    setConflicts([]);
    try {
      await pullRequestService.merge(username, repo, pr.number, {
        mergeMethod: method,
        // Rebase keeps each commit's own message, so there is nothing to override.
        commitMessage: method === 'rebase' ? undefined : message.trim() || undefined,
        // Refuse (409) if someone pushed after this page loaded — never merge unreviewed commits.
        expectedHeadSha: pr.currentHeadSha ?? undefined,
      });
      onMerged();
    } catch (err: any) {
      setError(err.message ?? 'Merge failed');
      setConflicts((err as MergeConflictError).conflicts ?? []);
    } finally {
      setMerging(false);
    }
  };

  if (pr.state === 'MERGED') {
    return (
      <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-3">
        <div className="text-sm text-purple-300 font-medium">
          ⑂ {MERGED_LABEL[pr.mergeMethod ?? 'merge']}{pr.mergedBy ? ` by ${pr.mergedBy.username}` : ''}
        </div>
        {pr.mergeCommitSha && (
          <div className="text-xs text-gitbase-text-secondary mt-1 font-mono">
            {pr.mergeCommitSha.slice(0, 7)}
          </div>
        )}
      </div>
    );
  }

  if (pr.state === 'CLOSED') {
    return (
      <div className="rounded-lg border border-gitbase-border-dark/30 bg-gitbase-surface-dark/60 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <span className="text-sm text-gitbase-text-secondary">This pull request is closed.</span>
        {canClose && (
          <button onClick={onReopen} className="px-3 py-1.5 rounded-lg bg-white/5 text-sm text-gitbase-text-primary hover:bg-white/10">
            Reopen pull request
          </button>
        )}
        {actionError && <div className="w-full text-sm text-red-400">{actionError}</div>}
      </div>
    );
  }

  // OPEN
  return (
    <div className="rounded-lg border border-gitbase-border-dark/30 bg-gitbase-surface-dark/60 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-green-400">⊙</span>
        <span className="text-sm text-gitbase-text-primary font-medium">
          This branch can be merged into <code className="font-mono">{pr.targetBranch}</code>
        </span>
      </div>

      {pr.closingIssues.length > 0 && (
        <div className="text-xs text-gitbase-text-secondary">
          Merging into the default branch will close{' '}
          {pr.closingIssues.map((n, i) => (
            <span key={n}>
              {i > 0 && ', '}
              <Link to={`/gitbase/${username}/${repo}/issues/${n}`} className="text-gitbase-primary hover:underline">#{n}</Link>
            </span>
          ))}
        </div>
      )}

      {canMerge && (
        <>
          <div role="radiogroup" aria-label="Merge method" className="flex flex-wrap gap-2">
            {METHODS.map(m => (
              <button
                key={m.value}
                role="radio"
                aria-checked={method === m.value}
                onClick={() => setMethod(m.value)}
                className={`px-3 py-1.5 rounded-md text-xs border transition-colors ${
                  method === m.value
                    ? 'border-purple-500/60 bg-purple-500/15 text-white'
                    : 'border-gitbase-border-dark/30 text-gitbase-text-secondary hover:text-gitbase-text-primary'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gitbase-text-secondary">{selected.hint}</p>

          {method !== 'rebase' && (
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={defaultMessage(method, pr)}
              maxLength={10000}
              aria-label="Commit message"
              className="w-full px-3 py-2 rounded-md bg-gitbase-surface-dark border border-gitbase-border-dark/30 text-sm text-gitbase-text-primary placeholder:text-gitbase-text-secondary focus:outline-none focus:border-gitbase-primary/50"
            />
          )}
        </>
      )}

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2">
          <div className="text-sm text-red-400">{error}</div>
          {conflicts.length > 0 && (
            <>
              <div className="text-xs text-gitbase-text-secondary mt-2 mb-1">Conflicting files:</div>
              <ul className="text-xs font-mono text-red-300 space-y-0.5">
                {conflicts.map(path => <li key={path}>· {path}</li>)}
              </ul>
              <div className="text-xs text-gitbase-text-secondary mt-2">
                Resolve these locally and push to <code className="font-mono">{pr.sourceBranch}</code>, then merge again.
              </div>
            </>
          )}
        </div>
      )}
      {actionError && <div className="text-sm text-red-400">{actionError}</div>}

      <div className="flex items-center gap-2 flex-wrap">
        {canMerge ? (
          <button
            onClick={merge}
            disabled={merging}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium disabled:opacity-40 hover:opacity-90"
          >
            {merging ? 'Merging…' : selected.button}
          </button>
        ) : (
          <span className="text-xs text-gitbase-text-secondary">
            Only users with write access can merge this pull request.
          </span>
        )}
        {canClose && (
          <button onClick={onClose} className="px-3 py-2 rounded-lg bg-white/5 text-sm text-gitbase-text-primary hover:bg-white/10">
            Close pull request
          </button>
        )}
      </div>
    </div>
  );
}
