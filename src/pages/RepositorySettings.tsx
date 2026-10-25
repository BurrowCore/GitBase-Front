import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardNavbar } from '../components/Dashboard/DashboardNavbar';
import { DeleteRepositoryDialog } from '../components/Repository/DeleteRepositoryDialog';
import { RepoTabs } from '../components/Repository/RepoTabs';
import { TransferRepositoryDialog } from '../components/Repository/TransferRepositoryDialog';
import { fetchMyOrganizations } from '../features/orgs/orgSlice';
import { useAppDispatch, useAppSelector } from '../features/store';
import { useRepoPermissions } from '../hooks/useRepoPermissions';
import { collaboratorService } from '../services/collaboratorService';
import type { Collaborator, RepositoryPermission } from '../types/collaborator';

const PERMISSIONS: { value: RepositoryPermission; label: string; hint: string }[] = [
  { value: 'READ', label: 'Read', hint: 'View the repository, clone it, open issues' },
  { value: 'WRITE', label: 'Write', hint: 'Push, manage branches, merge pull requests' },
  { value: 'ADMIN', label: 'Admin', hint: 'Repository settings (not deletion or collaborators)' },
];

/** Repository settings — collaborator management and the danger zone. Owner-only. */
const RepositorySettings: React.FC = () => {
  const navigate = useNavigate();
  const { username = '', repo = '' } = useParams<{ username: string; repo: string }>();
  const dispatch = useAppDispatch();
  // From the server, not `viewer.name === username`: for an organization's repository the owners
  // are the members of its Owners team, whose usernames never equal the namespace.
  const permissions = useRepoPermissions(username, repo);
  const isOwner = permissions.owner;
  const transferTargets = useAppSelector(state => state.orgs.mine)
    .filter(org => org.viewerCanCreateRepository && org.name !== username)
    .map(org => org.name);
  const [transferring, setTransferring] = useState(false);

  useEffect(() => { dispatch(fetchMyOrganizations(undefined)); }, [dispatch]);

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newUser, setNewUser] = useState('');
  const [newPermission, setNewPermission] = useState<RepositoryPermission>('WRITE');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    collaboratorService
      .list(username, repo)
      .then(setCollaborators)
      .catch(err => setError(err.message ?? 'Failed to load collaborators'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (username && repo) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, repo]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.trim() || saving) return;
    setSaving(true);
    setActionError(null);
    try {
      await collaboratorService.set(username, repo, newUser.trim(), newPermission);
      setNewUser('');
      load();
    } catch (err: any) {
      setActionError(err.message ?? 'Could not add collaborator');
    } finally {
      setSaving(false);
    }
  };

  const changePermission = async (target: string, permission: RepositoryPermission) => {
    setActionError(null);
    try {
      await collaboratorService.set(username, repo, target, permission);
      load();
    } catch (err: any) {
      setActionError(err.message ?? 'Could not change permission');
    }
  };

  const remove = async (target: string) => {
    setActionError(null);
    try {
      await collaboratorService.remove(username, repo, target);
      load();
    } catch (err: any) {
      setActionError(err.message ?? 'Could not remove collaborator');
    }
  };

  const input = 'px-3 py-2 rounded-md bg-gitbase-surface-dark border border-gitbase-border-dark/30 text-sm text-gitbase-text-primary placeholder:text-gitbase-text-secondary focus:outline-none focus:border-gitbase-primary/50';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gitbase-dark via-gitbase-secondary to-gitbase-dark">
      <DashboardNavbar />

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-base text-gitbase-text-secondary mb-4 truncate">
          <button onClick={() => navigate('/projects')} className="hover:text-gitbase-primary">{username}</button>
          {' / '}
          <button
            onClick={() => navigate(`/gitbase/${username}/${repo}`)}
            className="text-white font-semibold hover:text-gitbase-primary"
          >
            {repo}
          </button>
          <span> / settings</span>
        </div>

        <RepoTabs username={username} repo={repo} active="settings" showSettings={isOwner} />

        {!isOwner ? (
          <div className="rounded-lg border border-gitbase-border-dark/30 bg-gitbase-surface-dark/60 px-4 py-6 text-sm text-gitbase-text-secondary">
            Only the repository owner can manage settings.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Collaborators */}
            <section className="rounded-lg border border-gitbase-border-dark/30 overflow-hidden">
              <div className="px-4 py-3 bg-gitbase-surface-dark/80 border-b border-gitbase-border-dark/30">
                <h2 className="text-white font-semibold">Collaborators</h2>
                <p className="text-xs text-gitbase-text-secondary mt-0.5">
                  Access takes effect immediately — there is no invitation to accept.
                </p>
              </div>

              <form onSubmit={add} className="flex items-center gap-2 px-4 py-3 border-b border-gitbase-border-dark/30 flex-wrap">
                <input
                  value={newUser}
                  onChange={e => setNewUser(e.target.value)}
                  placeholder="Username"
                  className={`${input} flex-1 min-w-[160px]`}
                />
                <select
                  value={newPermission}
                  onChange={e => setNewPermission(e.target.value as RepositoryPermission)}
                  className={input}
                >
                  {PERMISSIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                <button
                  type="submit"
                  disabled={!newUser.trim() || saving}
                  className="px-4 py-2 rounded-lg bg-gitbase-primary text-white text-sm font-medium disabled:opacity-40 hover:opacity-90"
                >
                  {saving ? 'Adding…' : 'Add'}
                </button>
              </form>

              <p className="px-4 pt-2 text-xs text-gitbase-text-secondary">
                {PERMISSIONS.find(p => p.value === newPermission)?.hint}
              </p>

              {actionError && <div className="px-4 py-2 text-sm text-red-400">{actionError}</div>}
              {loading && <div className="px-4 py-4 text-sm text-gitbase-text-secondary">Loading…</div>}
              {error && <div className="px-4 py-4 text-sm text-red-400">{error}</div>}

              {!loading && !error && collaborators.length === 0 && (
                <div className="px-4 py-6 text-sm text-gitbase-text-secondary">
                  No collaborators yet. You are the only person with access.
                </div>
              )}

              {collaborators.map(c => (
                <div
                  key={c.user.username}
                  className="flex items-center gap-3 px-4 py-3 border-t border-gitbase-border-dark/20"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gitbase-purple to-gitbase-pink flex items-center justify-center text-white text-xs">
                    {(c.user.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gitbase-text-primary flex-1 truncate">{c.user.username}</span>
                  <select
                    value={c.permission}
                    onChange={e => changePermission(c.user.username, e.target.value as RepositoryPermission)}
                    className={input}
                  >
                    {PERMISSIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                  <button
                    onClick={() => remove(c.user.username)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 text-sm text-gitbase-text-secondary hover:bg-red-500/20 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </section>

            {/* Danger zone */}
            <section className="rounded-lg border border-red-500/40 overflow-hidden">
              <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/30">
                <h2 className="text-red-300 font-semibold">Danger zone</h2>
              </div>
              <div className="px-4 py-4 flex items-center justify-between gap-3 flex-wrap border-b border-red-500/20">
                <div className="min-w-0">
                  <div className="text-sm text-gitbase-text-primary">Transfer ownership</div>
                  <div className="text-xs text-gitbase-text-secondary">
                    Move this repository into an organization. Issues, pull requests and history go with it;
                    clone URLs change.
                  </div>
                </div>
                <button
                  onClick={() => setTransferring(true)}
                  className="px-3 py-1.5 rounded-lg bg-yellow-600/80 text-white text-sm font-medium hover:bg-yellow-600 flex-shrink-0"
                >
                  Transfer
                </button>
              </div>
              <div className="px-4 py-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="text-sm text-gitbase-text-primary">Delete this repository</div>
                  <div className="text-xs text-gitbase-text-secondary">
                    Removes the git history and every issue and pull request. This cannot be undone.
                  </div>
                </div>
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:opacity-90 flex-shrink-0"
                >
                  Delete repository
                </button>
              </div>
            </section>
          </div>
        )}
      </main>

      {transferring && (
        <TransferRepositoryDialog
          owner={username}
          repo={repo}
          orgChoices={transferTargets}
          onClose={() => setTransferring(false)}
          onTransferred={result => navigate(`/gitbase/${result.owner}/${result.repoName}/settings`)}
        />
      )}

      {confirmingDelete && (
        <DeleteRepositoryDialog
          username={username}
          repo={repo}
          onClose={() => setConfirmingDelete(false)}
          onDeleted={() => navigate('/projects')}
        />
      )}
    </div>
  );
};

export default RepositorySettings;
