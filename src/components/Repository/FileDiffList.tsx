import { useState } from 'react';
import type { FileDiff } from '../../types/git';

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

/** One collapsible file diff: header row (change type, path, +/−) over the unified patch. */
export function FileDiffBlock({ file }: { file: FileDiff }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="rounded-lg border border-gitbase-border-dark/30 overflow-hidden">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center gap-2 px-4 py-2 bg-gitbase-surface-dark/80 border-b border-gitbase-border-dark/30 text-sm hover:bg-white/5"
      >
        <span className="text-gitbase-text-secondary text-xs w-3">{collapsed ? '▸' : '▾'}</span>
        <span className={`px-1.5 py-0.5 rounded text-xs ${CHANGE_BADGE[file.changeType]}`}>
          {file.changeType}
        </span>
        <span className="font-mono text-gitbase-text-primary truncate flex-1 text-left">
          {file.oldPath && file.oldPath !== file.path ? `${file.oldPath} → ${file.path}` : file.path}
        </span>
        <span className="text-xs text-green-400">+{file.additions}</span>
        <span className="text-xs text-red-400">−{file.deletions}</span>
      </button>
      {!collapsed && (
        file.binary || file.patch == null ? (
          <div className="px-4 py-3 text-sm text-gitbase-text-secondary">Binary file not shown.</div>
        ) : (
          <pre className="text-xs font-mono overflow-x-auto">
            {file.patch.split('\n').map((line, i) => (
              <div key={i} className={`px-4 ${diffLineClass(line)}`}>
                {line || ' '}
              </div>
            ))}
          </pre>
        )
      )}
    </div>
  );
}

interface FileDiffListProps {
  files: FileDiff[];
  /** Set when the backend capped the diff (>500 files or >50k lines). */
  truncated?: boolean;
  emptyMessage?: string;
}

/** A list of per-file diffs, shared by the commit-detail and pull-request views. */
export function FileDiffList({ files, truncated, emptyMessage }: FileDiffListProps) {
  if (files.length === 0) {
    return (
      <div className="text-gitbase-text-secondary text-sm">
        {emptyMessage ?? 'No file changes.'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {truncated && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
          This diff is too large to display in full — showing a truncated view.
        </div>
      )}
      {files.map(file => <FileDiffBlock key={`${file.oldPath ?? ''}:${file.path}`} file={file} />)}
    </div>
  );
}
