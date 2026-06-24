import type { FileContent } from '../../types/git';

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

interface FileViewerProps {
  file: FileContent | null;
  loading: boolean;
  error: string | null;
}

/** Displays a single file's content, a binary notice, or loading/error/empty states. */
export function FileViewer({ file, loading, error }: FileViewerProps) {
  if (loading) {
    return <div className="p-4 text-sm text-gitbase-text-secondary">Loading file…</div>;
  }
  if (error) {
    return <div className="p-4 text-sm text-red-400">{error}</div>;
  }
  if (!file) {
    return <div className="p-6 text-sm text-gitbase-text-secondary">Select a file to view its contents.</div>;
  }

  const lines = (file.content ?? '').split('\n');

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gitbase-border-dark/30">
        <span className="text-sm font-mono text-gitbase-text-primary truncate">{file.path}</span>
        <span className="text-xs text-gitbase-text-secondary">{formatBytes(file.size)}</span>
      </div>

      {file.binary ? (
        <div className="p-4 text-sm text-gitbase-text-secondary">
          Binary file not shown ({formatBytes(file.size)}).
        </div>
      ) : (
        <div className="overflow-auto text-sm font-mono">
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="hover:bg-white/5">
                  <td className="select-none text-right pr-4 pl-3 text-gitbase-text-secondary align-top w-12">
                    {i + 1}
                  </td>
                  <td className="whitespace-pre text-white pr-4">{line || ' '}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
