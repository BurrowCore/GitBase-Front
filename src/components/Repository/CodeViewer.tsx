import { useMemo, useState } from 'react';
// prism-async lazily code-splits each grammar, keeping the main bundle light.
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-async';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { FileContent } from '../../types/git';

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

const MAX_HIGHLIGHT_LINES = 5000; // skip highlighting very large files to stay snappy

function langFor(path: string): string {
  const name = path.split('/').pop()?.toLowerCase() ?? '';
  if (name === 'dockerfile') return 'docker';
  if (name === 'makefile') return 'makefile';
  const ext = name.includes('.') ? name.split('.').pop()! : '';
  return EXT_LANG[ext] ?? 'text';
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
}

/** GitHub/Gitea-style read-only blob view: header bar + syntax-highlighted code with line numbers. */
export function CodeViewer({ file, loading, error }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const content = file?.content ?? '';
  const lineCount = useMemo(() => (content ? content.split('\n').length : 0), [content]);
  const language = useMemo(() => (file ? langFor(file.path) : 'text'), [file]);
  const highlight = lineCount > 0 && lineCount <= MAX_HIGHLIGHT_LINES;

  if (loading) return <div className="p-4 text-sm text-gitbase-text-secondary">Loading file…</div>;
  if (error) return <div className="p-4 text-sm text-red-400">{error}</div>;
  if (!file) return <div className="p-6 text-sm text-gitbase-text-secondary">Select a file to view its contents.</div>;

  const fileName = file.path.split('/').pop();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  return (
    <div className="flex flex-col h-full rounded-lg border border-gitbase-border-dark/30 overflow-hidden bg-[#282c34]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gitbase-surface-dark/80 border-b border-gitbase-border-dark/30">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm">📄</span>
          <span className="text-sm font-mono text-gitbase-text-primary truncate">{fileName}</span>
          {!file.binary && <span className="text-xs text-gitbase-text-secondary">· {lineCount} lines</span>}
          <span className="text-xs text-gitbase-text-secondary">· {formatBytes(file.size)}</span>
        </div>
        {!file.binary && (
          <button onClick={copy} className="px-2 py-1 text-xs bg-white/5 rounded text-gitbase-text-primary hover:bg-white/10 flex-shrink-0">
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>

      {file.binary ? (
        <div className="p-6 text-sm text-gitbase-text-secondary">Binary file not shown ({formatBytes(file.size)}).</div>
      ) : highlight ? (
        <div className="overflow-auto">
          <SyntaxHighlighter
            language={language}
            style={oneDark}
            showLineNumbers
            wrapLongLines={false}
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
