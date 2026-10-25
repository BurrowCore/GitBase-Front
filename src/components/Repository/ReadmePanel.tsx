import { useEffect, useState } from 'react';
import { gitService } from '../../services/gitService';
import type { DirEntry } from '../../types/git';
import { MarkdownView } from './MarkdownView';

interface ReadmePanelProps {
  username: string;
  repo: string;
  refName?: string;
  entries: DirEntry[];
}

const README_PATTERN = /^readme(\.md|\.markdown|\.mdown|\.rst|\.txt)?$/i;

/** Picks the README in the current directory, preferring markdown. */
function findReadme(entries: DirEntry[]): DirEntry | undefined {
  const candidates = entries.filter(e => e.type === 'file' && README_PATTERN.test(e.name));
  return candidates.find(e => /\.(md|markdown|mdown)$/i.test(e.name)) ?? candidates[0];
}

/** Rendered README shown beneath the directory listing. */
export function ReadmePanel({ username, repo, refName, entries }: ReadmePanelProps) {
  const readme = findReadme(entries);
  const readmePath = readme?.path;

  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!readmePath) {
      setContent(null);
      return;
    }
    let active = true;
    setLoading(true);
    gitService
      .getFileContent(username, repo, readmePath, refName)
      .then(file => { if (active) setContent(file.binary ? null : file.content); })
      .catch(() => { if (active) setContent(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [username, repo, readmePath, refName]);

  if (!readme) return null;

  const isMarkdown = /\.(md|markdown|mdown)$/i.test(readme.name);

  return (
    <div className="mt-4 rounded-lg border border-gitbase-border-dark/30 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-gitbase-surface-dark/80 border-b border-gitbase-border-dark/30">
        <span className="text-sm">📖</span>
        <span className="text-sm font-medium text-gitbase-text-primary">{readme.name}</span>
      </div>
      <div className="px-5 py-4">
        {loading && <div className="text-sm text-gitbase-text-secondary">Loading README…</div>}
        {!loading && content === null && (
          <div className="text-sm text-gitbase-text-secondary">Unable to render this README.</div>
        )}
        {!loading && content !== null && (
          isMarkdown
            ? <MarkdownView source={content} />
            : <pre className="whitespace-pre-wrap font-mono text-sm text-gitbase-text-primary">{content}</pre>
        )}
      </div>
    </div>
  );
}
