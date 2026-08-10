import type { CommitDetail } from '../../types/git';
import { formatRelativeTime } from '../../utils/dateFormatter';
import { FileDiffList } from './FileDiffList';

interface CommitDetailViewProps {
  detail: CommitDetail | null;
  loading: boolean;
  error: string | null;
}

/** Commit detail: message + metadata header, then per-file diffs. */
export function CommitDetailView({ detail, loading, error }: CommitDetailViewProps) {
  if (loading) return <div className="text-gitbase-text-secondary">Loading commit…</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!detail) return null;

  const [subject, ...bodyLines] = detail.message.split('\n');
  const body = bodyLines.join('\n').trim();

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gitbase-border-dark/30 bg-gitbase-surface-dark/60 p-4">
        <h2 className="text-white font-semibold mb-1">{subject}</h2>
        {body && (
          <pre className="text-sm text-gitbase-text-secondary whitespace-pre-wrap mb-3 font-sans">{body}</pre>
        )}
        <div className="flex items-center gap-3 text-sm text-gitbase-text-secondary flex-wrap">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gitbase-purple to-gitbase-pink flex items-center justify-center text-white text-xs">
            {(detail.authorName || 'U').charAt(0).toUpperCase()}
          </div>
          <span className="text-gitbase-text-primary">{detail.authorName}</span>
          <span>committed {formatRelativeTime(detail.date)}</span>
          <span className="font-mono">{detail.shortSha}</span>
          <span className="ml-auto text-xs">
            {detail.files.length} file(s) · <span className="text-green-400">+{detail.additions}</span>{' '}
            <span className="text-red-400">−{detail.deletions}</span>
          </span>
        </div>
        {detail.parents.length > 1 && (
          <div className="mt-2 text-xs text-gitbase-text-secondary">
            Merge of {detail.parents.length} parents
          </div>
        )}
      </div>

      <FileDiffList
        files={detail.files}
        emptyMessage="No file changes (empty or merge commit)."
      />
    </div>
  );
}
