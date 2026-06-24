import React, { useEffect } from 'react';
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

  useEffect(() => {
    if (!authUser?.name) return;
    dispatch(fetchUserRepos(authUser.name) as any);
  }, [dispatch, authUser?.name]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gitbase-dark via-gitbase-secondary to-gitbase-dark">
      <DashboardNavbar />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-gitbase-text-secondary mt-1">All repositories in your account.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="text-gitbase-text-secondary">Loading...</div>
          ) : (
            items.map((r) => (
              <ProjectCard
                key={r.repoName}
                name={r.repoName}
                visibility={r.private ? 'Private' : 'Public'}
                onOpen={() => navigate(`/gitbase/${encodeURIComponent(String(authUser?.name || ''))}/${r.repoName}`)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Projects;
