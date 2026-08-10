import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardNavbar } from '../components/Dashboard/DashboardNavbar';
import { NewPullRequestForm } from '../components/PullRequest/NewPullRequestForm';
import { PullRequestList } from '../components/PullRequest/PullRequestList';
import { fetchPullRequests, setFilter } from '../features/pullRequests/pullRequestSlice';
import { useAppDispatch, useAppSelector } from '../features/store';
import type { PullRequestFilter } from '../types/pullRequest';

/** Pull request list for a repository, plus the inline "new pull request" form. */
const PullRequests: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { username = '', repo = '' } = useParams<{ username: string; repo: string }>();

  const { page, listLoading, listError, filter } = useAppSelector(state => state.pullRequests);
  const [pageNum, setPageNum] = useState(0);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!username || !repo) return;
    dispatch(fetchPullRequests({ username, repo, state: filter, page: pageNum }));
  }, [dispatch, username, repo, filter, pageNum]);

  const onFilterChange = (next: PullRequestFilter) => {
    setPageNum(0);
    dispatch(setFilter(next));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gitbase-dark via-gitbase-secondary to-gitbase-dark">
      <DashboardNavbar />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Repo header */}
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="text-base text-gitbase-text-secondary truncate">
            <button onClick={() => navigate('/projects')} className="hover:text-gitbase-primary">{username}</button>
            {' / '}
            <button onClick={() => navigate(`/gitbase/${username}/${repo}`)} className="text-white font-semibold hover:text-gitbase-primary">
              {repo}
            </button>
            <span className="text-gitbase-text-secondary"> / pull requests</span>
          </div>
          {!creating && (
            <button
              onClick={() => setCreating(true)}
              className="px-4 py-2 rounded-lg bg-gitbase-primary text-white text-sm font-medium hover:opacity-90"
            >
              New pull request
            </button>
          )}
        </div>

        {/* Tabs back to code */}
        <div className="flex items-center gap-1 border-b border-gitbase-border-dark/30 mb-4">
          <button
            onClick={() => navigate(`/gitbase/${username}/${repo}`)}
            className="px-3 py-2 text-sm border-b-2 -mb-px border-transparent text-gitbase-text-secondary hover:text-gitbase-text-primary"
          >
            Code
          </button>
          <button className="px-3 py-2 text-sm border-b-2 -mb-px border-gitbase-primary text-white">
            Pull requests
          </button>
        </div>

        {creating ? (
          <NewPullRequestForm
            username={username}
            repo={repo}
            onCreated={number => {
              setCreating(false);
              navigate(`/gitbase/${username}/${repo}/pulls/${number}`);
            }}
            onCancel={() => setCreating(false)}
          />
        ) : (
          <PullRequestList
            page={page}
            loading={listLoading}
            error={listError}
            filter={filter}
            onFilterChange={onFilterChange}
            onOpen={number => navigate(`/gitbase/${username}/${repo}/pulls/${number}`)}
            onPrev={() => setPageNum(n => Math.max(0, n - 1))}
            onNext={() => setPageNum(n => n + 1)}
          />
        )}
      </main>
    </div>
  );
};

export default PullRequests;
