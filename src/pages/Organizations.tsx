import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '../components/Organization/PageShell';
import { fetchMyOrganizations } from '../features/orgs/orgSlice';
import { useAppDispatch, useAppSelector } from '../features/store';

/** "Your organizations" — every organization the viewer belongs to through a team. */
const Organizations: React.FC = () => {
  const dispatch = useAppDispatch();
  const mine = useAppSelector(s => s.orgs.mine);

  useEffect(() => { dispatch(fetchMyOrganizations(undefined)); }, [dispatch]);

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl text-white font-semibold">Your organizations</h1>
        <Link to="/orgs/new" className="px-4 py-2 rounded-lg bg-gitbase-primary text-white text-sm font-medium hover:opacity-90">
          New organization
        </Link>
      </div>

      {mine.length === 0 ? (
        <div className="text-gitbase-text-secondary">
          You are not in any organization yet. Create one, or ask an owner to add you to a team.
        </div>
      ) : (
        <ul className="space-y-2">
          {mine.map(org => (
            <li key={org.name}>
              <Link to={`/orgs/${org.name}`}
                    className="block rounded-lg border border-gitbase-border-dark/30 bg-gitbase-surface-dark/60 px-4 py-3 hover:border-gitbase-primary/50">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{org.fullName ?? org.name}</span>
                  <span className="text-xs text-gitbase-text-secondary">{org.name}</span>
                  {org.viewerIsOwner && <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200">Owner</span>}
                </div>
                {org.description && <div className="text-sm text-gitbase-text-secondary mt-1">{org.description}</div>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
};

export default Organizations;
