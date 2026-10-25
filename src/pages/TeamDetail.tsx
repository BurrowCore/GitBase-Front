import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { NameAdder } from '../components/Organization/NameAdder';
import { PageShell } from '../components/Organization/PageShell';
import {
  addTeamMember,
  addTeamRepository,
  fetchOrganization,
  fetchTeam,
  fetchTeamMembers,
  fetchTeamRepositories,
  removeTeamMember,
  removeTeamRepository,
  updateTeam,
} from '../features/orgs/orgSlice';
import { useAppDispatch, useAppSelector } from '../features/store';
import { orgService } from '../services/orgService';
import type { RepositoryPermission } from '../types/collaborator';

/** One team: its members and repositories; owners can change both, and the team's settings. */
const TeamDetail: React.FC = () => {
  const { org = '', team: teamName = '' } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { current, team, teamMembers, teamRepositories, actionError, error } = useAppSelector(s => s.orgs);
  const isOwner = !!current?.viewerIsOwner;
  const args = { org, team: teamName };

  useEffect(() => {
    if (!org || !teamName) return;
    dispatch(fetchOrganization({ org }));
    dispatch(fetchTeam({ org, team: teamName }));
    dispatch(fetchTeamMembers({ org, team: teamName }));
    dispatch(fetchTeamRepositories({ org, team: teamName }));
  }, [dispatch, org, teamName]);

  if (error) return <PageShell><div className="text-red-400">{error}</div></PageShell>;
  if (!team) return <PageShell><div className="text-gitbase-text-secondary">Loading team…</div></PageShell>;

  const coversEverything = team.includesAllRepositories || team.ownerTeam;
  const editable = isOwner && !team.ownerTeam;

  const deleteTeam = async () => {
    await orgService.deleteTeam(org, team.name);
    navigate(`/orgs/${org}?tab=teams`);
  };

  return (
    <PageShell>
      <div className="text-sm text-gitbase-text-secondary mb-2">
        <Link to={`/orgs/${org}?tab=teams`} className="hover:text-gitbase-primary">{org} / teams</Link>
      </div>
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-2xl text-white font-semibold">{team.name}</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gitbase-text-primary">
          {team.ownerTeam ? 'Owner' : team.permission}
        </span>
      </div>
      {team.description && <p className="text-sm text-gitbase-text-secondary mb-4">{team.description}</p>}
      {team.ownerTeam && (
        <p className="text-xs text-gitbase-text-secondary mb-4">
          Members of this team own {org}: full access to every repository and to the organization's settings.
        </p>
      )}

      {actionError && <div className="mb-3 text-sm text-red-400">{actionError}</div>}

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="text-sm uppercase tracking-wide text-gitbase-text-secondary mb-2">Members ({teamMembers.length})</h2>
          {isOwner && <NameAdder placeholder="Add member by username" buttonLabel="Add"
                                 onAdd={username => dispatch(addTeamMember({ ...args, username }))} />}
          <ul className="space-y-1.5 mt-3">
            {teamMembers.map(m => (
              <li key={m.username} className="flex items-center text-sm">
                <span className="text-gitbase-text-primary">{m.username}</span>
                {isOwner && (
                  <button onClick={() => dispatch(removeTeamMember({ ...args, username: m.username }))}
                          aria-label={`Remove ${m.username}`} className="ml-auto text-xs text-gitbase-text-secondary hover:text-red-400">
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-wide text-gitbase-text-secondary mb-2">Repositories</h2>
          {coversEverything ? (
            <p className="text-xs text-gitbase-text-secondary mb-2">This team has access to every repository of {org}, including future ones.</p>
          ) : isOwner && (
            <NameAdder placeholder="Add repository by name" buttonLabel="Add"
                       onAdd={repo => dispatch(addTeamRepository({ ...args, repo }))} />
          )}
          <ul className="space-y-1.5 mt-3">
            {teamRepositories.map(r => (
              <li key={r.name} className="flex items-center gap-2 text-sm">
                <Link to={`/gitbase/${org}/${r.name}`} className="text-gitbase-text-primary hover:text-gitbase-primary">{r.name}</Link>
                <span className="text-xs text-gitbase-text-secondary">{r.visibility}</span>
                {isOwner && !coversEverything && (
                  <button onClick={() => dispatch(removeTeamRepository({ ...args, repo: r.name }))}
                          aria-label={`Remove ${r.name}`} className="ml-auto text-xs text-gitbase-text-secondary hover:text-red-400">
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {editable && (
        <section className="mt-8 space-y-3 max-w-xl">
          <h2 className="text-sm uppercase tracking-wide text-gitbase-text-secondary">Settings</h2>
          <label className="flex items-center gap-2 text-sm text-gitbase-text-primary">
            Permission
            <select value={team.permission} aria-label="Team permission"
                    onChange={e => dispatch(updateTeam({ ...args, changes: { permission: e.target.value as RepositoryPermission } }))}
                    className="px-2 py-1 rounded-md bg-gitbase-surface-dark border border-gitbase-border-dark/30 text-sm">
              <option value="READ">READ</option>
              <option value="WRITE">WRITE</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-gitbase-text-primary">
            <input type="checkbox" checked={team.includesAllRepositories}
                   onChange={e => dispatch(updateTeam({ ...args, changes: { includesAllRepositories: e.target.checked } }))} />
            Access to all repositories
          </label>
          <label className="flex items-center gap-2 text-sm text-gitbase-text-primary">
            <input type="checkbox" checked={team.canCreateOrgRepo}
                   onChange={e => dispatch(updateTeam({ ...args, changes: { canCreateOrgRepo: e.target.checked } }))} />
            Members may create repositories
          </label>
          <button onClick={deleteTeam} className="px-4 py-2 rounded-lg bg-red-600/80 text-white text-sm font-medium hover:bg-red-600">
            Delete team
          </button>
        </section>
      )}
    </PageShell>
  );
};

export default TeamDetail;
