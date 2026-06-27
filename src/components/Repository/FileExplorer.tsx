import { useEffect, useMemo, useState } from 'react';
import { gitService } from '../../services/gitService';
import type { FileTreeNode } from '../../types/git';

interface FileExplorerProps {
  username: string;
  repo: string;
  refName?: string;
  currentFile: string | null;
  onOpenFile: (path: string) => void;
}

interface FlatFile { path: string; name: string; }

/** Recursively flatten files (leaf nodes) into full paths for the search filter. */
function flatten(node: FileTreeNode, prefix: string, out: FlatFile[]): void {
  for (const child of node.children ?? []) {
    const path = prefix ? `${prefix}/${child.name}` : child.name;
    if (child.directory) flatten(child, path, out);
    else out.push({ path, name: child.name });
  }
}

function TreeNode({
  node, prefix, depth, expanded, toggle, currentFile, onOpenFile,
}: {
  node: FileTreeNode;
  prefix: string;
  depth: number;
  expanded: Set<string>;
  toggle: (path: string) => void;
  currentFile: string | null;
  onOpenFile: (path: string) => void;
}) {
  const children = [...(node.children ?? [])].sort((a, b) => {
    if (a.directory !== b.directory) return a.directory ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <ul>
      {children.map(child => {
        const path = prefix ? `${prefix}/${child.name}` : child.name;
        const isOpen = expanded.has(path);
        const isActive = currentFile === path;
        return (
          <li key={path}>
            <button
              onClick={() => (child.directory ? toggle(path) : onOpenFile(path))}
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
              className={`w-full flex items-center gap-1.5 py-1 pr-2 text-sm text-left rounded hover:bg-white/5 ${
                isActive ? 'bg-white/10 text-gitbase-primary' : 'text-gitbase-text-primary'
              }`}
            >
              {child.directory ? (
                <span className="text-xs text-gitbase-text-secondary w-3">{isOpen ? '▾' : '▸'}</span>
              ) : (
                <span className="w-3" />
              )}
              <span className="flex-shrink-0">{child.directory ? (isOpen ? '📂' : '📁') : '📄'}</span>
              <span className="truncate">{child.name}</span>
            </button>
            {child.directory && isOpen && (
              <TreeNode
                node={child} prefix={path} depth={depth + 1}
                expanded={expanded} toggle={toggle} currentFile={currentFile} onOpenFile={onOpenFile}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Sidebar file tree with collapsible folders and a "go to file" fuzzy filter. */
export function FileExplorer({ username, repo, refName, currentFile, onOpenFile }: FileExplorerProps) {
  const [tree, setTree] = useState<FileTreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    gitService
      .getTree(username, repo, refName)
      .then(t => { if (active) setTree(t); })
      .catch(err => { if (active) setError(err.message ?? 'Failed to load file tree'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [username, repo, refName]);

  // Auto-expand the folders leading to the currently open file.
  useEffect(() => {
    if (!currentFile) return;
    const parts = currentFile.split('/');
    parts.pop();
    setExpanded(prev => {
      const next = new Set(prev);
      let acc = '';
      for (const p of parts) { acc = acc ? `${acc}/${p}` : p; next.add(acc); }
      return next;
    });
  }, [currentFile]);

  const toggle = (path: string) =>
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });

  const flatFiles = useMemo(() => {
    if (!tree) return [];
    const out: FlatFile[] = [];
    flatten(tree, '', out);
    return out;
  }, [tree]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return flatFiles.filter(f => f.path.toLowerCase().includes(q)).slice(0, 50);
  }, [flatFiles, query]);

  return (
    <aside className="rounded-lg border border-gitbase-border-dark/30 bg-gitbase-surface-dark/40 flex flex-col max-h-[78vh]">
      <div className="p-2 border-b border-gitbase-border-dark/30">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Go to file…"
          className="w-full px-2.5 py-1.5 rounded-md bg-gitbase-surface-dark border border-gitbase-border-dark/30 text-sm text-gitbase-text-primary placeholder:text-gitbase-text-secondary focus:outline-none focus:border-gitbase-primary/50"
        />
      </div>

      <div className="overflow-y-auto p-1">
        {loading && <div className="p-3 text-sm text-gitbase-text-secondary">Loading tree…</div>}
        {error && <div className="p-3 text-sm text-red-400">{error}</div>}

        {!loading && !error && query.trim() && (
          filtered.length === 0
            ? <div className="p-3 text-sm text-gitbase-text-secondary">No files match.</div>
            : (
              <ul>
                {filtered.map(f => (
                  <li key={f.path}>
                    <button
                      onClick={() => onOpenFile(f.path)}
                      className={`w-full flex items-center gap-1.5 py-1 px-2 text-sm text-left rounded hover:bg-white/5 ${
                        currentFile === f.path ? 'bg-white/10 text-gitbase-primary' : 'text-gitbase-text-primary'
                      }`}
                    >
                      <span className="flex-shrink-0">📄</span>
                      <span className="truncate">{f.path}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )
        )}

        {!loading && !error && !query.trim() && tree && (
          <TreeNode node={tree} prefix="" depth={0} expanded={expanded} toggle={toggle} currentFile={currentFile} onOpenFile={onOpenFile} />
        )}
      </div>
    </aside>
  );
}
