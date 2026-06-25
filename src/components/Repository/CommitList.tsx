import type { CommitPage } from '../../types/git';
import { formatRelativeTime } from '../../utils/dateFormatter';

interface CommitListProps {
  page: CommitPage | null;
  loading: boolean;
  error: string | null;
  onOpenCommit: (sha: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

/** GitHub-style commit history list with simple page navigation. */
export function CommitList({ page, loading, error, onOpenCommit, onPrev, onNext }: CommitListProps) {
  if (loading) return <div className="text-gitbase-text-secondary">Loading commits…</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!page) return null;

  if (page.commits.length === 0) {
    return <div className="text-gitbase-text-secondary">No commits on this ref yet.</div>;
  }

  return (
    <div className="rounded-lg border border-gitbase-border-dark/30 overflow-hidden">
      <div className="px-4 py-2 bg-gitbase-surface-dark/80 border-b border-gitbase-border-dark/30 text-sm text-gitbase-text-secondary">
        Commits on <span className="font-mono text-gitbase-text-primary">{page.ref}</span>
      </div>

      <ul>
        {page.commits.map(c => (
          <li
            key={c.sha}
            className="flex items-center gap-3 px-4 py-3 border-b border-gitbase-border-dark/20 hover:bg-white/5 last:border-0"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gitbase-purple to-gitbase-pink flex items-center justify-center text-white text-xs flex-shrink-0">
              {(c.authorName || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <button
                onClick={() => onOpenCommit(c.sha)}
                className="block text-left text-gitbase-text-primary hover:text-gitbase-primary truncate max-w-full"
              >
                {c.message}
              </button>
              <div className="text-xs text-gitbase-text-secondary">
                {c.authorName} committed {formatRelativeTime(c.date)}
              </div>
            </div>
            <button
              onClick={() => onOpenCommit(c.sha)}
              className="px-2 py-1 text-xs font-mono bg-white/5 rounded text-gitbase-text-primary hover:text-gitbase-primary flex-shrink-0"
            >
              {c.shortSha}
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between px-4 py-2 bg-gitbase-surface-dark/60 border-t border-gitbase-border-dark/30">
        <button
          onClick={onPrev}
          disabled={page.page <= 0}
          className="px-3 py-1 text-xs bg-white/5 rounded text-gitbase-text-primary disabled:opacity-40"
        >
          ← Newer
        </button>
        <span className="text-xs text-gitbase-text-secondary">Page {page.page + 1}</span>
        <button
          onClick={onNext}
          disabled={!page.hasNext}
          className="px-3 py-1 text-xs bg-white/5 rounded text-gitbase-text-primary disabled:opacity-40"
        >
          Older →
        </button>
      </div>
    </div>
  );
}
