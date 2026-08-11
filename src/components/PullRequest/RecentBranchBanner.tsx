import { useEffect, useState } from 'react';
import { pullRequestService } from '../../services/pullRequestService';
import type { PullSuggestion } from '../../types/pullRequest';
import { formatRelativeTime } from '../../utils/dateFormatter';

interface RecentBranchBannerProps {
  username: string;
  repo: string;
  /** Called with the branch name when the user clicks "Compare & pull request". */
  onCompare: (branch: string) => void;
  /** Bump to re-check (e.g. after opening a pull request). */
  reloadKey?: number;
}

const DISMISSED_KEY = 'gitbase:dismissedBranchBanners';

/** Branches the user has dismissed, keyed by `repo#branch@sha` so a new push re-surfaces them. */
function loadDismissed(): string[] {
  try {
    const raw = sessionStorage.getItem(DISMISSED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistDismissed(keys: string[]) {
  try {
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(keys));
  } catch { /* storage unavailable — dismissal just won't persist */ }
}

/**
 * GitHub-style notifier: "<branch> had recent pushes — Compare & pull request".
 *
 * Bridges CLI and web — a branch pushed from the terminal is surfaced here on the next page load,
 * instead of the user having to dig into the new-pull-request form to discover it.
 */
export function RecentBranchBanner({ username, repo, onCompare, reloadKey = 0 }: RecentBranchBannerProps) {
  const [suggestions, setSuggestions] = useState<PullSuggestion[]>([]);
  const [dismissed, setDismissed] = useState<string[]>(loadDismissed);

  useEffect(() => {
    if (!username || !repo) return;
    let active = true;
    pullRequestService
      .suggestions(username, repo)
      .then(list => { if (active) setSuggestions(list); })
      .catch(() => { if (active) setSuggestions([]); }); // decorative — never surface an error
    return () => { active = false; };
  }, [username, repo, reloadKey]);

  // Key on the tip SHA so a fresh push to a dismissed branch shows the banner again.
  const keyFor = (s: PullSuggestion) => `${username}/${repo}#${s.branch}@${s.commitSha}`;
  const visible = suggestions.filter(s => !dismissed.includes(keyFor(s)));

  if (visible.length === 0) return null;

  const dismiss = (s: PullSuggestion) => {
    const next = [...dismissed, keyFor(s)];
    setDismissed(next);
    persistDismissed(next);
  };

  return (
    <div className="space-y-2 mb-4">
      {visible.map(suggestion => (
        <div
          key={suggestion.branch}
          className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gitbase-primary/40 bg-gitbase-primary/10 flex-wrap"
        >
          <span className="text-gitbase-primary text-lg" aria-hidden>⑂</span>
          <div className="min-w-0 flex-1">
            <div className="text-sm text-gitbase-text-primary">
              <code className="font-mono font-semibold">{suggestion.branch}</code>
              {' had recent pushes '}
              <span className="text-gitbase-text-secondary">
                {formatRelativeTime(suggestion.lastCommitAt)}
              </span>
            </div>
            {suggestion.lastCommitMessage && (
              <div className="text-xs text-gitbase-text-secondary truncate mt-0.5">
                {suggestion.lastCommitMessage}
                {suggestion.authorName ? ` — ${suggestion.authorName}` : ''}
                {' · '}
                <span className="font-mono">{suggestion.shortSha}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => onCompare(suggestion.branch)}
            className="px-3 py-1.5 rounded-lg bg-gitbase-primary text-white text-sm font-medium hover:opacity-90 flex-shrink-0"
          >
            Compare &amp; pull request
          </button>
          <button
            onClick={() => dismiss(suggestion)}
            aria-label={`Dismiss ${suggestion.branch}`}
            title="Dismiss"
            className="px-2 py-1 text-gitbase-text-secondary hover:text-gitbase-text-primary flex-shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
