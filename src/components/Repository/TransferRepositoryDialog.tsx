import { useState } from 'react';
import { gitService } from '../../services/gitService';
import type { TransferResult } from '../../types/git';

interface TransferRepositoryDialogProps {
  /** Current owner of the repository (the user, for a personal repository). */
  owner: string;
  /** Repository to move; when omitted the user picks one of `repoChoices`. */
  repo?: string;
  repoChoices?: string[];
  /** Destination organization; when omitted the user picks one of `orgChoices`. */
  org?: string;
  orgChoices?: string[];
  onClose: () => void;
  onTransferred: (result: TransferResult) => void;
}

/**
 * Moves a repository into an organization. Opened from repository settings (repository fixed,
 * pick the organization) or from an organization page (organization fixed, pick a repository).
 * Typing the repository name confirms, as for deletion — clone URLs change.
 */
export function TransferRepositoryDialog({
  owner, repo, repoChoices = [], org, orgChoices = [], onClose, onTransferred,
}: TransferRepositoryDialogProps) {
  const [pickedRepo, setSelectedRepo] = useState(repo ?? '');
  const [pickedOrg, setSelectedOrg] = useState(org ?? '');
  // The choices may arrive after the dialog opens; default to the first one until the user picks.
  const selectedRepo = pickedRepo || repoChoices[0] || '';
  const selectedOrg = pickedOrg || orgChoices[0] || '';
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = !!selectedRepo && !!selectedOrg && typed.trim() === selectedRepo;
  const nothingToChoose = (!repo && repoChoices.length === 0) || (!org && orgChoices.length === 0);
  const select = 'mt-1.5 w-full px-3 py-2 rounded-md bg-gitbase-surface-dark border border-gitbase-border-dark/40 text-sm text-gitbase-text-primary';

  const transfer = async () => {
    if (!ready) return;
    setBusy(true);
    setError(null);
    try {
      onTransferred(await gitService.transferRepository(owner, selectedRepo, selectedOrg));
    } catch (err: any) {
      setError(err?.message ?? 'Transfer failed');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg border border-yellow-500/40 bg-gitbase-surface-dark shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-3 border-b border-gitbase-border-dark/30">
          <h2 className="text-white font-semibold">Transfer repository to an organization</h2>
        </div>

        <div className="px-5 py-4 space-y-3">
          {nothingToChoose ? (
            <p className="text-sm text-gitbase-text-secondary">
              {!org && orgChoices.length === 0
                ? 'You are not in any organization where you may create repositories.'
                : `You have no personal repositories to move into ${org}.`}
            </p>
          ) : (
            <>
              {!repo && (
                <label className="block text-sm text-gitbase-text-secondary">
                  Repository
                  <select value={selectedRepo} onChange={e => { setSelectedRepo(e.target.value); setTyped(''); }} className={select}>
                    {repoChoices.map(name => <option key={name} value={name}>{owner}/{name}</option>)}
                  </select>
                </label>
              )}
              {!org && (
                <label className="block text-sm text-gitbase-text-secondary">
                  Organization
                  <select value={selectedOrg} onChange={e => setSelectedOrg(e.target.value)} className={select}>
                    {orgChoices.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                </label>
              )}
              <p className="text-sm text-gitbase-text-secondary">
                <strong className="text-gitbase-text-primary">{owner}/{selectedRepo}</strong> becomes{' '}
                <strong className="text-gitbase-text-primary">{selectedOrg}/{selectedRepo}</strong>. Issues, pull
                requests and history move with it. Existing clones must update their remote — the old URL stops working.
              </p>
              <label className="block text-sm text-gitbase-text-secondary">
                Type <code className="font-mono text-gitbase-text-primary">{selectedRepo}</code> to confirm:
                <input autoFocus value={typed} onChange={e => setTyped(e.target.value)} aria-label="Confirm repository name"
                       className="mt-1.5 w-full px-3 py-2 rounded-md bg-gitbase-surface-dark border border-gitbase-border-dark/40 text-sm text-gitbase-text-primary focus:outline-none focus:border-yellow-500/60" />
              </label>
            </>
          )}
          {error && <div className="text-sm text-red-400">{error}</div>}
        </div>

        <div className="px-5 py-3 border-t border-gitbase-border-dark/30 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg bg-white/5 text-sm text-gitbase-text-primary hover:bg-white/10">
            Cancel
          </button>
          <button onClick={transfer} disabled={!ready || busy}
                  className="px-3 py-1.5 rounded-lg bg-yellow-600 text-white text-sm font-medium disabled:opacity-40 hover:opacity-90">
            {busy ? 'Transferring…' : 'Transfer'}
          </button>
        </div>
      </div>
    </div>
  );
}
