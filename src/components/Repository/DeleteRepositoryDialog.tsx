import { useState } from 'react';
import { gitService } from '../../services/gitService';

interface DeleteRepositoryDialogProps {
  username: string;
  repo: string;
  onClose: () => void;
  onDeleted: () => void;
}

/**
 * Irreversible-action dialog for deleting a repository.
 *
 * Follows the GitHub/Gitea pattern of requiring the user to type the repository name before the
 * confirm button unlocks — deletion removes the database row *and* the bare repository on disk,
 * and there is no undo.
 */
export function DeleteRepositoryDialog({ username, repo, onClose, onDeleted }: DeleteRepositoryDialogProps) {
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmed = typed.trim() === repo;

  const remove = async () => {
    if (!confirmed) return;
    setDeleting(true);
    setError(null);
    try {
      await gitService.deleteRepository(username, repo);
      onDeleted();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to delete repository');
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-red-500/40 bg-gitbase-surface-dark shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-3 border-b border-gitbase-border-dark/30">
          <h2 className="text-white font-semibold">Delete this repository?</h2>
        </div>

        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-gitbase-text-secondary">
            This permanently deletes <strong className="text-gitbase-text-primary">{username}/{repo}</strong>,
            its git history, and every pull request attached to it. This cannot be undone.
          </p>
          <label className="block text-sm text-gitbase-text-secondary">
            Type <code className="font-mono text-gitbase-text-primary">{repo}</code> to confirm:
            <input
              autoFocus
              value={typed}
              onChange={e => setTyped(e.target.value)}
              className="mt-1.5 w-full px-3 py-2 rounded-md bg-gitbase-surface-dark border border-gitbase-border-dark/40 text-sm text-gitbase-text-primary focus:outline-none focus:border-red-500/60"
            />
          </label>
          {error && <div className="text-sm text-red-400">{error}</div>}
        </div>

        <div className="px-5 py-3 border-t border-gitbase-border-dark/30 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-white/5 text-sm text-gitbase-text-primary hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={remove}
            disabled={!confirmed || deleting}
            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium disabled:opacity-40 hover:opacity-90"
          >
            {deleting ? 'Deleting…' : 'I understand, delete it'}
          </button>
        </div>
      </div>
    </div>
  );
}
