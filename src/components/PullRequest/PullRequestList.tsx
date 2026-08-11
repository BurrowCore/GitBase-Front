import type { PullRequestFilter, PullRequestPage } from '../../types/pullRequest';
import { formatRelativeTime } from '../../utils/dateFormatter';
import { PullRequestBadge } from './PullRequestBadge';

interface PullRequestListProps {
  page: PullRequestPage | null;
  loading: boolean;
  error: string | null;
  filter: PullRequestFilter;
  onFilterChange: (filter: PullRequestFilter) => void;
  onOpen: (number: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

/** GitHub-style pull request list: Open/Closed tabs, rows, pagination. */
export function PullRequestList({
  page, loading, error, filter, onFilterChange, onOpen, onPrev, onNext,
}: PullRequestListProps) {
  const tab = (active: boolean) =>
    `px-3 py-1.5 text-sm rounded-md transition-colors ${
      active ? 'bg-white/10 text-white font-medium' : 'text-gitbase-text-secondary hover:text-gitbase-text-primary'
    }`;

  const rows = page?.pullRequests ?? [];

  return (
    <div className="rounded-lg border border-gitbase-border-dark/30 overflow-hidden">
      {/* Filter bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gitbase-surface-dark/80 border-b border-gitbase-border-dark/30">
        <button onClick={() => onFilterChange('OPEN')} className={tab(filter === 'OPEN')}>
          ⊙ {page?.openCount ?? 0} Open
        </button>
        <button onClick={() => onFilterChange('CLOSED')} className={tab(filter === 'CLOSED')}>
          ⊘ Closed
        </button>
        <button onClick={() => onFilterChange('MERGED')} className={tab(filter === 'MERGED')}>
          ⑂ Merged
        </button>
        <button onClick={() => onFilterChange('ALL')} className={tab(filter === 'ALL')}>
          All
        </button>
      </div>

      {loading && <div className="px-4 py-6 text-sm text-gitbase-text-secondary">Loading pull requests…</div>}
      {error && <div className="px-4 py-6 text-sm text-red-400">{error}</div>}

      {!loading && !error && rows.length === 0 && (
        <div className="px-4 py-10 text-center">
          <div className="text-3xl mb-2">⊙</div>
          <div className="text-gitbase-text-primary font-medium mb-1">No pull requests here</div>
          <div className="text-sm text-gitbase-text-secondary">
            {filter === 'OPEN'
              ? 'Open a pull request to propose changes from one branch to another.'
              : 'Try a different filter.'}
          </div>
        </div>
      )}

      {!loading && !error && rows.map(pr => (
        <button
          key={pr.id}
          onClick={() => onOpen(pr.number)}
          className="w-full flex items-start gap-3 px-4 py-3 border-b border-gitbase-border-dark/20 last:border-0 hover:bg-white/5 text-left"
        >
          <div className="pt-0.5">
            <PullRequestBadge state={pr.state} size="sm" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-gitbase-text-primary font-medium truncate">
              {pr.title} <span className="text-gitbase-text-secondary font-normal">#{pr.number}</span>
            </div>
            <div className="text-xs text-gitbase-text-secondary mt-0.5">
              opened {formatRelativeTime(pr.createdAt ?? 0)} by {pr.author?.username ?? 'unknown'}
              {' · '}
              <code className="font-mono">{pr.sourceBranch}</code> → <code className="font-mono">{pr.targetBranch}</code>
            </div>
          </div>
          {pr.commentsCount > 0 && (
            <span className="text-xs text-gitbase-text-secondary flex-shrink-0 pt-1">💬 {pr.commentsCount}</span>
          )}
        </button>
      ))}

      {/* Pagination */}
      {!loading && !error && page && (page.page > 0 || page.hasNext) && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-gitbase-surface-dark/60 border-t border-gitbase-border-dark/30">
          <button
            onClick={onPrev}
            disabled={page.page === 0}
            className="px-3 py-1 text-xs bg-white/5 rounded text-gitbase-text-primary disabled:opacity-40 hover:bg-white/10"
          >
            ← Previous
          </button>
          <span className="text-xs text-gitbase-text-secondary">
            Page {page.page + 1}{page.totalPages > 0 ? ` of ${page.totalPages}` : ''}
          </span>
          <button
            onClick={onNext}
            disabled={!page.hasNext}
            className="px-3 py-1 text-xs bg-white/5 rounded text-gitbase-text-primary disabled:opacity-40 hover:bg-white/10"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
