import type { IssueFilter, IssuePage, Label } from '../../types/issue';
import { formatRelativeTime } from '../../utils/dateFormatter';
import { IssueBadge } from './IssueBadge';
import { LabelChip } from './LabelChip';

interface IssueListProps {
  page: IssuePage | null;
  labels: Label[];
  loading: boolean;
  error: string | null;
  filter: IssueFilter;
  labelFilter: string | null;
  search: string;
  onFilterChange: (filter: IssueFilter) => void;
  onLabelFilterChange: (label: string | null) => void;
  onSearchChange: (search: string) => void;
  onOpen: (number: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

/** GitHub-style issue list: Open/Closed tabs, label + text filters, rows, pagination. */
export function IssueList({
  page, labels, loading, error, filter, labelFilter, search,
  onFilterChange, onLabelFilterChange, onSearchChange, onOpen, onPrev, onNext,
}: IssueListProps) {
  const tab = (active: boolean) =>
    `px-3 py-1.5 text-sm rounded-md transition-colors ${
      active ? 'bg-white/10 text-white font-medium' : 'text-gitbase-text-secondary hover:text-gitbase-text-primary'
    }`;

  const rows = page?.issues ?? [];

  return (
    <div className="space-y-3">
      {/* Search + label filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search issues…"
          className="flex-1 min-w-[200px] px-3 py-1.5 rounded-md bg-gitbase-surface-dark border border-gitbase-border-dark/30 text-sm text-gitbase-text-primary placeholder:text-gitbase-text-secondary focus:outline-none focus:border-gitbase-primary/50"
        />
        {labels.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {labels.map(label => (
              <LabelChip
                key={label.name}
                label={label}
                active={labelFilter === label.name}
                onClick={() => onLabelFilterChange(labelFilter === label.name ? null : label.name)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gitbase-border-dark/30 overflow-hidden">
        {/* State tabs */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gitbase-surface-dark/80 border-b border-gitbase-border-dark/30">
          <button onClick={() => onFilterChange('OPEN')} className={tab(filter === 'OPEN')}>
            ⊙ {page?.openCount ?? 0} Open
          </button>
          <button onClick={() => onFilterChange('CLOSED')} className={tab(filter === 'CLOSED')}>
            ✓ {page?.closedCount ?? 0} Closed
          </button>
          <button onClick={() => onFilterChange('ALL')} className={tab(filter === 'ALL')}>
            All
          </button>
        </div>

        {loading && <div className="px-4 py-6 text-sm text-gitbase-text-secondary">Loading issues…</div>}
        {error && <div className="px-4 py-6 text-sm text-red-400">{error}</div>}

        {!loading && !error && rows.length === 0 && (
          <div className="px-4 py-10 text-center">
            <div className="text-3xl mb-2">⊙</div>
            <div className="text-gitbase-text-primary font-medium mb-1">No issues here</div>
            <div className="text-sm text-gitbase-text-secondary">
              {filter === 'OPEN' && !labelFilter && !search
                ? 'Open an issue to track a bug or an idea.'
                : 'Try a different filter.'}
            </div>
          </div>
        )}

        {!loading && !error && rows.map(issue => (
          <button
            key={issue.number}
            onClick={() => onOpen(issue.number)}
            className="w-full flex items-start gap-3 px-4 py-3 border-b border-gitbase-border-dark/20 last:border-0 hover:bg-white/5 text-left"
          >
            <div className="pt-0.5">
              <IssueBadge state={issue.state} size="sm" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gitbase-text-primary font-medium truncate">
                  {issue.title} <span className="text-gitbase-text-secondary font-normal">#{issue.number}</span>
                </span>
                {issue.labels.map(label => <LabelChip key={label.name} label={label} />)}
              </div>
              <div className="text-xs text-gitbase-text-secondary mt-0.5">
                opened {formatRelativeTime(issue.createdAt ?? 0)} by {issue.author?.username ?? 'unknown'}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 pt-1">
              {issue.assignees.slice(0, 3).map(a => (
                <span
                  key={a.username}
                  title={a.username}
                  className="w-5 h-5 rounded-full bg-gradient-to-r from-gitbase-purple to-gitbase-pink flex items-center justify-center text-white text-[10px]"
                >
                  {(a.username || 'U').charAt(0).toUpperCase()}
                </span>
              ))}
              {issue.commentsCount > 0 && (
                <span className="text-xs text-gitbase-text-secondary">💬 {issue.commentsCount}</span>
              )}
            </div>
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
    </div>
  );
}
