import { useEffect, useMemo, useState } from 'react';
// prism-async lazily code-splits each grammar, keeping the main bundle light.
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-async';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { gitService } from '../../services/gitService';
import type { FileContent } from '../../types/git';
import { MarkdownView } from './MarkdownView';

/** Map common file extensions to Prism language ids (Gitea does this lexer-by-filename too). */
const EXT_LANG: Record<string, string> = {
  ts: 'typescript', tsx: 'tsx', js: 'javascript', jsx: 'jsx', mjs: 'javascript', cjs: 'javascript',
  java: 'java', kt: 'kotlin', scala: 'scala', groovy: 'groovy',
  py: 'python', rb: 'ruby', go: 'go', rs: 'rust', php: 'php', swift: 'swift', dart: 'dart',
  c: 'c', h: 'c', cpp: 'cpp', cc: 'cpp', hpp: 'cpp', cs: 'csharp',
  json: 'json', yml: 'yaml', yaml: 'yaml', toml: 'toml', xml: 'markup', html: 'markup', svg: 'markup',
  css: 'css', scss: 'scss', less: 'less', md: 'markdown', mdx: 'markdown',
  sh: 'bash', bash: 'bash', zsh: 'bash', sql: 'sql', graphql: 'graphql', gql: 'graphql',
  dockerfile: 'docker', makefile: 'makefile', ini: 'ini', properties: 'properties',
};

/** Mirrors the backend's inline-image allowlist (GitServiceImpl.INLINE_IMAGE_TYPES). */
const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'bmp', 'ico']);

const MAX_HIGHLIGHT_LINES = 5000; // skip highlighting very large files to stay snappy

function extOf(path: string): string {
  const name = path.split('/').pop()?.toLowerCase() ?? '';
  return name.includes('.') ? name.split('.').pop()! : '';
}

function langFor(path: string): string {
  const name = path.split('/').pop()?.toLowerCase() ?? '';
  if (name === 'dockerfile') return 'docker';
  if (name === 'makefile') return 'makefile';
  return EXT_LANG[extOf(path)] ?? 'text';
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

interface CodeViewerProps {
  file: FileContent | null;
  loading: boolean;
  error: string | null;
  username: string;
  repo: string;
  refName?: string;
  /** Opens the commit history filtered to this file. */
  onViewHistory?: (path: string) => void;
}

/** GitHub/Gitea-style blob view: header bar, image preview, markdown preview, highlighted code. */
export function CodeViewer({
  file, loading, error, username, repo, refName, onViewHistory,
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [showRendered, setShowRendered] = useState(true);

  const path = file?.path ?? '';
  const isImage = !!file && IMAGE_EXTS.has(extOf(path));
  const isMarkdown = !!file && /\.(md|markdown|mdown)$/i.test(path);

  const content = file?.content ?? '';
  const lineCount = useMemo(() => (content ? content.split('\n').length : 0), [content]);
  const language = useMemo(() => (file ? langFor(path) : 'text'), [file, path]);
  const highlight = lineCount > 0 && lineCount <= MAX_HIGHLIGHT_LINES;

  // Fetch image bytes through the API (cookie auth is cross-origin, so a bare <img src> would
  // not be authenticated). Object URL is revoked on cleanup to avoid leaking blobs.
  useEffect(() => {
    if (!isImage || !path) {
      setImageUrl(null);
      return;
    }
    let active = true;
    let objectUrl: string | null = null;
    setImageError(false);
    gitService
      .getRawBlob(username, repo, path, refName)
      .then(blob => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      })
      .catch(() => { if (active) setImageError(true); });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [isImage, username, repo, path, refName]);

  // Reset per-file view state, then honour a #L<n> deep link for the newly opened file.
  // (Single effect so the reset can't clobber the deep-linked selection.)
  useEffect(() => {
    setShowRendered(true);

    const match = /^#L(\d+)$/.exec(window.location.hash);
    if (!match) {
      setSelectedLine(null);
      return;
    }
    const line = Number(match[1]);
    setSelectedLine(line);
    const frame = requestAnimationFrame(() => {
      document.getElementById(`L${line}`)?.scrollIntoView({ block: 'center' });
    });
    return () => cancelAnimationFrame(frame);
  }, [path]);

  if (loading) return <div className="p-4 text-sm text-gitbase-text-secondary">Loading file…</div>;
  if (error) return <div className="p-4 text-sm text-red-400">{error}</div>;
  if (!file) return <div className="p-6 text-sm text-gitbase-text-secondary">Select a file to view its contents.</div>;

  const fileName = path.split('/').pop();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  const download = () => { void gitService.downloadFile(username, repo, path, refName); };

  const selectLine = (line: number) => {
    setSelectedLine(line);
    history.replaceState(null, '', `#L${line}`);
  };

  const btn = 'px-2 py-1 text-xs bg-white/5 rounded text-gitbase-text-primary hover:bg-white/10 flex-shrink-0';

  return (
    <div className="flex flex-col h-full rounded-lg border border-gitbase-border-dark/30 overflow-hidden bg-[#282c34]">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gitbase-surface-dark/80 border-b border-gitbase-border-dark/30">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm">{isImage ? '🖼️' : '📄'}</span>
          <span className="text-sm font-mono text-gitbase-text-primary truncate">{fileName}</span>
          {!file.binary && !isImage && <span className="text-xs text-gitbase-text-secondary">· {lineCount} lines</span>}
          <span className="text-xs text-gitbase-text-secondary">· {formatBytes(file.size)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isMarkdown && !file.binary && (
            <button onClick={() => setShowRendered(v => !v)} className={btn}>
              {showRendered ? 'Code' : 'Preview'}
            </button>
          )}
          {onViewHistory && (
            <button onClick={() => onViewHistory(path)} className={btn}>History</button>
          )}
          {!file.binary && <button onClick={copy} className={btn}>{copied ? 'Copied' : 'Copy'}</button>}
          <button onClick={download} className={btn}>Download</button>
        </div>
      </div>

      {isImage ? (
        <div className="p-6 flex justify-center bg-[#1e2127]">
          {imageError
            ? <span className="text-sm text-red-400">Failed to load image.</span>
            : imageUrl
              ? <img src={imageUrl} alt={fileName} className="max-w-full max-h-[70vh] object-contain rounded" />
              : <span className="text-sm text-gitbase-text-secondary">Loading image…</span>}
        </div>
      ) : file.binary ? (
        <div className="p-6 text-sm text-gitbase-text-secondary">
          Binary file not shown ({formatBytes(file.size)}). Use Download to fetch it.
        </div>
      ) : isMarkdown && showRendered ? (
        <div className="px-5 py-4 bg-gitbase-surface-dark/40 overflow-auto">
          <MarkdownView source={content} />
        </div>
      ) : highlight ? (
        <div className="overflow-auto">
          <SyntaxHighlighter
            language={language}
            style={oneDark}
            showLineNumbers
            wrapLines
            lineProps={(lineNumber: number) => ({
              id: `L${lineNumber}`,
              onClick: () => selectLine(lineNumber),
              style: {
                display: 'block',
                cursor: 'pointer',
                backgroundColor: selectedLine === lineNumber ? 'rgba(255, 212, 0, 0.12)' : 'transparent',
              },
            })}
            customStyle={{ margin: 0, background: 'transparent', fontSize: '0.8rem', padding: '0.75rem 0' }}
            lineNumberStyle={{ minWidth: '3em', paddingRight: '1em', color: '#5c6370', userSelect: 'none' }}
            codeTagProps={{ style: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' } }}
          >
            {content}
          </SyntaxHighlighter>
        </div>
      ) : (
        // Very large file — render plain to stay responsive.
        <pre className="overflow-auto text-xs font-mono text-gitbase-text-primary p-3 whitespace-pre">{content}</pre>
      )}
    </div>
  );
}
