import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardNavbar } from '../components/Dashboard/DashboardNavbar';
import ProjectCard from '../components/Projects/ProjectCard';
import { useAppDispatch, useAppSelector } from '../features/store';
import { fetchUserRepos } from '../features/repos/reposSlice';

const Projects: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading } = useAppSelector(state => state.repos);
  const authUser = useAppSelector(state => state.auth.user);

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!authUser?.name) return;
    dispatch(fetchUserRepos(authUser.name) as any);
  }, [dispatch, authUser?.name]);

  const filtered = useMemo(
    () => items.filter(r => r.repoName.toLowerCase().includes(query.trim().toLowerCase())),
    [items, query],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gitbase-dark via-gitbase-secondary to-gitbase-dark">
      <DashboardNavbar />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Projects</h1>
            <p className="text-gitbase-text-secondary mt-1">
              {loading ? 'Loading…' : `${items.length} repositor${items.length === 1 ? 'y' : 'ies'} in your account.`}
            </p>
          </div>
          <button
            onClick={() => navigate('/new')}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-gitbase-purple to-gitbase-pink hover:opacity-90"
          >
            + New repository
          </button>
        </div>

        {/* Search */}
        {!loading && items.length > 0 && (
          <div className="mb-6">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Find a repository…"
              className="w-full sm:max-w-sm px-4 py-2 rounded-lg bg-gitbase-surface-dark border border-gitbase-border-dark/30 text-sm text-gitbase-text-primary placeholder:text-gitbase-text-secondary focus:outline-none focus:border-gitbase-primary/50"
            />
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-28 rounded-2xl bg-gitbase-surface-dark/60 border border-gitbase-border-dark/20 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gitbase-border-dark/40 p-12 text-center">
            <div className="text-white font-medium mb-1">No repositories yet</div>
            <div className="text-gitbase-text-secondary text-sm mb-4">Create your first repository to get started.</div>
            <button
              onClick={() => navigate('/new')}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-gitbase-purple to-gitbase-pink hover:opacity-90"
            >
              + New repository
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-gitbase-text-secondary">No repositories match “{query}”.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(r => (
              <ProjectCard
                key={r.repoName}
                name={r.repoName}
                visibility={r.private ? 'Private' : 'Public'}
                entryCount={r.root?.children?.length ?? 0}
                empty={!r.root || (r.root.children?.length ?? 0) === 0}
                onOpen={() =>
                  navigate(`/gitbase/${encodeURIComponent(String(authUser?.name || ''))}/${r.repoName}`)
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Projects;
