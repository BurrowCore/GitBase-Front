import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PageShell } from '../components/Organization/PageShell';
import { TeamForm } from '../components/Organization/TeamForm';
import { TransferRepositoryDialog } from '../components/Repository/TransferRepositoryDialog';
import {
  clearActionError,
  createTeam,
  fetchMembers,
  fetchOrganization,
  fetchTeams,
  removeMember,
  updateOrganization,
} from '../features/orgs/orgSlice';
import { useAppDispatch, useAppSelector } from '../features/store';
import { useOwnerRepositories } from '../hooks/useOwnerRepositories';
import { orgService } from '../services/orgService';

type Tab = 'repositories' | 'people' | 'teams' | 'settings';

/** Organization profile: Repositories | People | Teams | Settings. */
const Organization: React.FC = () => {
  const { org = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { current, loading, error, members, teams, actionError } = useAppSelector(s => s.orgs);
  const { repositories, loading: reposLoading } = useOwnerRepositories(org);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [bringing, setBringing] = useState(false);
  const viewer = useAppSelector(s => s.auth.user);
  // The viewer's personal repositories — the ones they can move in here.
  const { repositories: myRepositories } = useOwnerRepositories(bringing ? viewer?.name ?? '' : '');

  const tab = (params.get('tab') as Tab) || 'repositories';
  const isOwner = !!current?.viewerIsOwner;
  const isMember = !!current?.viewerIsMember;

  useEffect(() => { if (org) dispatch(fetchOrganization({ org })); }, [dispatch, org]);
  useEffect(() => {
    if (!org || !isMember) return;
    if (tab === 'people') dispatch(fetchMembers({ org }));
    if (tab === 'teams') dispatch(fetchTeams({ org }));
  }, [dispatch, org, tab, isMember]);

  if (loading && !current) return <PageShell><div className="text-gitbase-text-secondary">Loading…</div></PageShell>;
  if (error) return <PageShell><div className="text-red-400">{error}</div></PageShell>;
  if (!current) return <PageShell><div /></PageShell>;

  const tabs: { id: Tab; label: string; visible: boolean }[] = [
    { id: 'repositories', label: `Repositories (${current.repositoryCount})`, visible: true },
    { id: 'people', label: 'People', visible: isMember },
    { id: 'teams', label: 'Teams', visible: isMember },
    { id: 'settings', label: 'Settings', visible: isOwner },
  ];

  const tabClass = (active: boolean) =>
    `px-3 py-2 text-sm border-b-2 -mb-px ${active ? 'border-gitbase-primary text-white' : 'border-transparent text-gitbase-text-secondary hover:text-gitbase-text-primary'}`;

  return (
    <PageShell>
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h1 className="text-2xl text-white font-semibold">{current.fullName ?? current.name}</h1>
          <div className="text-sm text-gitbase-text-secondary">{current.name}</div>
          {current.description && <p className="text-sm text-gitbase-text-primary mt-2">{current.description}</p>}
        </div>
        {current.viewerCanCreateRepository && (
          <div className="flex gap-2">
            <button onClick={() => setBringing(true)}
                    className="px-4 py-2 rounded-lg bg-white/5 text-sm text-gitbase-text-primary hover:bg-white/10">
              Bring a repository
            </button>
            <Link to={`/new?owner=${current.name}`} className="px-4 py-2 rounded-lg bg-gitbase-primary text-white text-sm font-medium hover:opacity-90">
              New repository
            </Link>
          </div>
        )}
      </div>

      <div className="flex gap-1 border-b border-gitbase-border-dark/30 mb-4" role="tablist">
        {tabs.filter(t => t.visible).map(t => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={tabClass(tab === t.id)}
                  onClick={() => { dispatch(clearActionError()); setParams({ tab: t.id }); }}>
            {t.label}
          </button>
        ))}
      </div>

      {actionError && <div className="mb-3 text-sm text-red-400">{actionError}</div>}

      {tab === 'repositories' && (
        reposLoading ? <div className="text-gitbase-text-secondary">Loading repositories…</div> :
        repositories.length === 0 ? <div className="text-gitbase-text-secondary">No repositories you can see.</div> : (
          <ul className="space-y-2">
            {repositories.map(r => (
              <li key={r.repoName}>
                <Link to={`/gitbase/${current.name}/${r.repoName}`}
                      className="flex items-center gap-2 rounded-lg border border-gitbase-border-dark/30 bg-gitbase-surface-dark/60 px-4 py-3 hover:border-gitbase-primary/50">
                  <span className="text-white">{r.repoName}</span>
                  <span className="ml-auto text-xs text-gitbase-text-secondary">{r.private ? 'Private' : 'Public'}</span>
                </Link>
              </li>
            ))}
          </ul>
        )
      )}

      {tab === 'people' && (
        <ul className="space-y-1.5">
          {members.map(m => (
            <li key={m.username} className="flex items-center gap-2 text-sm">
              <span className="text-gitbase-text-primary">{m.username}</span>
              {m.fullName && <span className="text-gitbase-text-secondary">{m.fullName}</span>}
              {isOwner && (
                <button onClick={() => dispatch(removeMember({ org, username: m.username }))}
                        className="ml-auto text-xs text-gitbase-text-secondary hover:text-red-400">
                  Remove from organization
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {tab === 'teams' && (
        <div className="space-y-3">
          {isOwner && !creatingTeam && (
            <button onClick={() => setCreatingTeam(true)} className="px-3 py-1.5 rounded-lg bg-white/5 text-sm text-gitbase-text-primary hover:bg-white/10">
              New team
            </button>
          )}
          {creatingTeam && (
            <TeamForm
              onCancel={() => setCreatingTeam(false)}
              onSubmit={team => { dispatch(createTeam({ org, team })); setCreatingTeam(false); }}
            />
          )}
          <ul className="space-y-2">
            {teams.map(t => (
              <li key={t.name}>
                <Link to={`/orgs/${org}/teams/${t.name}`}
                      className="block rounded-lg border border-gitbase-border-dark/30 bg-gitbase-surface-dark/60 px-4 py-3 hover:border-gitbase-primary/50">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{t.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gitbase-text-primary">
                      {t.ownerTeam ? 'Owner' : t.permission}
                    </span>
                    <span className="ml-auto text-xs text-gitbase-text-secondary">
                      {t.membersCount} member(s) · {t.includesAllRepositories || t.ownerTeam ? 'all' : t.repositoriesCount} repo(s)
                    </span>
                  </div>
                  {t.description && <div className="text-sm text-gitbase-text-secondary mt-1">{t.description}</div>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {bringing && viewer?.name && (
        <TransferRepositoryDialog
          owner={viewer.name}
          org={current.name}
          repoChoices={myRepositories.map(r => r.repoName)}
          onClose={() => setBringing(false)}
          onTransferred={result => navigate(`/gitbase/${result.owner}/${result.repoName}`)}
        />
      )}

      {tab === 'settings' && isOwner && (
        <OrganizationSettings
          fullName={current.fullName ?? ''}
          description={current.description ?? ''}
          orgName={current.name}
          onSave={changes => dispatch(updateOrganization({ org, changes }))}
          onDeleted={() => navigate('/orgs')}
        />
      )}
    </PageShell>
  );
};

/** Profile edit + danger zone. Deletion needs the name typed, and fails (409) while repositories remain. */
function OrganizationSettings({ fullName, description, orgName, onSave, onDeleted }: {
  fullName: string; description: string; orgName: string;
  onSave: (changes: { fullName: string; description: string }) => void;
  onDeleted: () => void;
}) {
  const [name, setName] = useState(fullName);
  const [about, setAbout] = useState(description);
  const [confirm, setConfirm] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const input = 'w-full px-3 py-2 rounded-md bg-gitbase-surface-dark border border-gitbase-border-dark/30 text-sm text-gitbase-text-primary focus:outline-none focus:border-gitbase-primary/50';

  const remove = async () => {
    setDeleteError(null);
    try {
      await orgService.remove(orgName);
      onDeleted();
    } catch (err: any) {
      setDeleteError(err.message ?? 'Could not delete the organization');
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <form onSubmit={e => { e.preventDefault(); onSave({ fullName: name, description: about }); }} className="space-y-3">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Display name" aria-label="Display name" maxLength={255} className={input} />
        <textarea value={about} onChange={e => setAbout(e.target.value)} placeholder="Description" aria-label="Description" maxLength={500} rows={3} className={input} />
        <button type="submit" className="px-4 py-2 rounded-lg bg-gitbase-primary text-white text-sm font-medium hover:opacity-90">Save</button>
      </form>

      <div className="rounded-lg border border-red-500/40 p-4 space-y-2">
        <div className="text-sm text-red-300 font-medium">Delete this organization</div>
        <p className="text-xs text-gitbase-text-secondary">Its repositories must be deleted first. Type <code>{orgName}</code> to confirm.</p>
        <input value={confirm} onChange={e => setConfirm(e.target.value)} aria-label="Confirm organization name" className={input} />
        {deleteError && <div className="text-sm text-red-400">{deleteError}</div>}
        <button onClick={remove} disabled={confirm !== orgName}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium disabled:opacity-40">
          Delete organization
        </button>
      </div>
    </div>
  );
}

export default Organization;
