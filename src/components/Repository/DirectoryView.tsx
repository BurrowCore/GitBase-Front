import type { DirectoryListing } from '../../types/git';
import { formatRelativeTime } from '../../utils/dateFormatter';

interface DirectoryViewProps {
  listing: DirectoryListing;
  onOpenDir: (path: string) => void;
  onOpenFile: (path: string) => void;
}

/** GitHub-style directory listing: latest-commit header bar + a row per entry with its last commit. */
export function DirectoryView({ listing, onOpenDir, onOpenFile }: DirectoryViewProps) {
  const entries = [...listing.entries].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="rounded-lg border border-gitbase-border-dark/30 overflow-hidden">
      {listing.latestCommit && (
        <div className="flex items-center gap-3 px-4 py-3 bg-gitbase-surface-dark/80 border-b border-gitbase-border-dark/30">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gitbase-purple to-gitbase-pink flex items-center justify-center text-white text-xs flex-shrink-0">
            {(listing.latestCommit.authorName || 'U').charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-gitbase-text-primary font-medium flex-shrink-0">
            {listing.latestCommit.authorName}
          </span>
          <span className="text-sm text-gitbase-text-secondary truncate flex-1">
            {listing.latestCommit.message}
          </span>
          <span className="text-xs font-mono text-gitbase-text-secondary flex-shrink-0">
            {listing.latestCommit.shortSha}
          </span>
          <span className="text-xs text-gitbase-text-secondary flex-shrink-0">
            {formatRelativeTime(listing.latestCommit.date)}
          </span>
        </div>
      )}

      <table className="w-full text-sm table-fixed">
        <tbody>
          {entries.map(entry => (
            <tr key={entry.path} className="border-b border-gitbase-border-dark/20 hover:bg-white/5 last:border-0">
              <td className="px-4 py-2 w-1/3">
                <button
                  onClick={() => (entry.type === 'dir' ? onOpenDir(entry.path) : onOpenFile(entry.path))}
                  className="flex items-center gap-2 text-gitbase-text-primary hover:text-gitbase-primary max-w-full"
                >
                  <span className="flex-shrink-0">{entry.type === 'dir' ? '📁' : '📄'}</span>
                  <span className="truncate">{entry.name}</span>
                </button>
              </td>
              <td className="px-4 py-2 text-gitbase-text-secondary truncate">
                {entry.lastCommitMessage || ''}
              </td>
              <td className="px-4 py-2 text-right text-gitbase-text-secondary whitespace-nowrap w-32">
                {formatRelativeTime(entry.lastCommitDate)}
              </td>
            </tr>
          ))}
          {entries.length === 0 && (
            <tr>
              <td className="px-4 py-6 text-gitbase-text-secondary">This directory is empty.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
