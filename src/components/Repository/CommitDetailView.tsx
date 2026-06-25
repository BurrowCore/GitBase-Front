import type { CommitDetail, FileDiff } from '../../types/git';
import { formatRelativeTime } from '../../utils/dateFormatter';

interface CommitDetailViewProps {
  detail: CommitDetail | null;
  loading: boolean;
  error: string | null;
}

const CHANGE_BADGE: Record<FileDiff['changeType'], string> = {
  ADD: 'bg-green-500/15 text-green-400',
  MODIFY: 'bg-yellow-500/15 text-yellow-400',
  DELETE: 'bg-red-500/15 text-red-400',
  RENAME: 'bg-blue-500/15 text-blue-400',
  COPY: 'bg-blue-500/15 text-blue-400',
};

/** Colorizes a unified-diff line by its leading character. */
function diffLineClass(line: string): string {
  if (line.startsWith('+') && !line.startsWith('+++')) return 'bg-green-500/10 text-green-300';
  if (line.startsWith('-') && !line.startsWith('---')) return 'bg-red-500/10 text-red-300';
  if (line.startsWith('@@')) return 'text-gitbase-primary';
  if (line.startsWith('diff ') || line.startsWith('index ') || line.startsWith('+++') || line.startsWith('---')) {
    return 'text-gitbase-text-secondary';
  }
  return 'text-gitbase-text-primary';
}

function FileDiffBlock({ file }: { file: FileDiff }) {
  return (
    <div className="rounded-lg border border-gitbase-border-dark/30 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-gitbase-surface-dark/80 border-b border-gitbase-border-dark/30 text-sm">
        <span className={`px-1.5 py-0.5 rounded text-xs ${CHANGE_BADGE[file.changeType]}`}>
          {file.changeType}
        </span>
        <span className="font-mono text-gitbase-text-primary truncate flex-1">
          {file.oldPath && file.oldPath !== file.path ? `${file.oldPath} → ${file.path}` : file.path}
        </span>
        <span className="text-xs text-green-400">+{file.additions}</span>
        <span className="text-xs text-red-400">−{file.deletions}</span>
      </div>
      {file.binary || file.patch == null ? (
        <div className="px-4 py-3 text-sm text-gitbase-text-secondary">Binary file not shown.</div>
      ) : (
        <pre className="text-xs font-mono overflow-x-auto">
          {file.patch.split('\n').map((line, i) => (
            <div key={i} className={`px-4 ${diffLineClass(line)}`}>
              {line || ' '}
            </div>
          ))}
        </pre>
      )}
    </div>
  );
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

      {detail.files.length === 0 ? (
        <div className="text-gitbase-text-secondary text-sm">No file changes (empty or merge commit).</div>
      ) : (
        detail.files.map(file => <FileDiffBlock key={file.path} file={file} />)
      )}
    </div>
  );
}
