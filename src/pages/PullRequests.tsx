import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { DashboardNavbar } from '../components/Dashboard/DashboardNavbar';
import { NewPullRequestForm } from '../components/PullRequest/NewPullRequestForm';
import { PullRequestList } from '../components/PullRequest/PullRequestList';
import { RecentBranchBanner } from '../components/PullRequest/RecentBranchBanner';
import { fetchPullRequests, setFilter } from '../features/pullRequests/pullRequestSlice';
import { useAppDispatch, useAppSelector } from '../features/store';
import type { PullRequestFilter } from '../types/pullRequest';

/** Pull request list for a repository, plus the inline "new pull request" form. */
const PullRequests: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { username = '', repo = '' } = useParams<{ username: string; repo: string }>();

  const { page, listLoading, listError, filter } = useAppSelector(state => state.pullRequests);
  const [searchParams, setSearchParams] = useSearchParams();
  // Arriving from the "recent pushes" banner (?compare=branch) opens the form pre-filled.
  const compareBranch = searchParams.get('compare') ?? undefined;

  const [pageNum, setPageNum] = useState(0);
  const [creating, setCreating] = useState(!!compareBranch);
  const [bannerKey, setBannerKey] = useState(0);

  const startCreate = (branch?: string) => {
    setSearchParams(branch ? { compare: branch } : {}, { replace: true });
    setCreating(true);
  };

  const cancelCreate = () => {
    setSearchParams({}, { replace: true });
    setCreating(false);
  };

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
              onClick={() => startCreate()}
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
            initialSource={compareBranch}
            onCreated={number => {
              cancelCreate();
              setBannerKey(k => k + 1);
              navigate(`/gitbase/${username}/${repo}/pulls/${number}`);
            }}
            onCancel={cancelCreate}
          />
        ) : (
          <>
          <RecentBranchBanner
            username={username}
            repo={repo}
            reloadKey={bannerKey}
            onCompare={startCreate}
          />
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
          </>
        )}
      </main>
    </div>
  );
};

export default PullRequests;
