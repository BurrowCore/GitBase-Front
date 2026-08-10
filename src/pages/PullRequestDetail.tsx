import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardNavbar } from '../components/Dashboard/DashboardNavbar';
import { Conversation } from '../components/PullRequest/Conversation';
import { MergeBox } from '../components/PullRequest/MergeBox';
import { PullRequestBadge } from '../components/PullRequest/PullRequestBadge';
import { CommitList } from '../components/Repository/CommitList';
import { FileDiffList } from '../components/Repository/FileDiffList';
import {
  clearCurrent,
  closePullRequest,
  fetchPullRequest,
  reopenPullRequest,
} from '../features/pullRequests/pullRequestSlice';
import { useAppDispatch, useAppSelector } from '../features/store';
import { pullRequestService } from '../services/pullRequestService';
import type { Compare } from '../types/git';
import { formatRelativeTime } from '../utils/dateFormatter';

type Tab = 'conversation' | 'commits' | 'files';

const PullRequestDetail: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { username = '', repo = '', number: numberParam = '' } = useParams();
  const number = Number(numberParam);

  const { current, currentLoading, currentError, actionError } = useAppSelector(s => s.pullRequests);
  const viewer = useAppSelector(s => s.auth.user);

  const [tab, setTab] = useState<Tab>('conversation');
  const [diff, setDiff] = useState<Compare | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [diffError, setDiffError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!username || !repo || !Number.isFinite(number)) return;
    dispatch(fetchPullRequest({ username, repo, number }));
    return () => { dispatch(clearCurrent()); };
  }, [dispatch, username, repo, number]);

  // The diff powers both the Commits and Files tabs, so fetch it once for either.
  useEffect(() => {
    if (tab === 'conversation' || diff || diffLoading) return;
    setDiffLoading(true);
    setDiffError(null);
    pullRequestService
      .diff(username, repo, number)
      .then(setDiff)
      .catch(err => setDiffError(err.message ?? 'Failed to load diff'))
      .finally(() => setDiffLoading(false));
  }, [tab, diff, diffLoading, username, repo, number]);

  const refresh = () => {
    dispatch(fetchPullRequest({ username, repo, number }));
    setReloadKey(k => k + 1);
    setDiff(null);
  };

  if (currentLoading && !current) {
    return <Shell><div className="text-gitbase-text-secondary">Loading pull request…</div></Shell>;
  }
  if (currentError) {
    return <Shell><div className="text-red-400">{currentError}</div></Shell>;
  }
  if (!current) return <Shell><div /></Shell>;

  const isOwner = !!viewer?.name && viewer.name === username;

  const tabClass = (active: boolean) =>
    `px-3 py-2 text-sm border-b-2 -mb-px transition-colors ${
      active ? 'border-gitbase-primary text-white' : 'border-transparent text-gitbase-text-secondary hover:text-gitbase-text-primary'
    }`;

  return (
    <Shell>
      {/* Breadcrumb */}
      <div className="text-sm text-gitbase-text-secondary mb-3 truncate">
        <button onClick={() => navigate('/projects')} className="hover:text-gitbase-primary">{username}</button>
        {' / '}
        <button onClick={() => navigate(`/gitbase/${username}/${repo}`)} className="text-white font-semibold hover:text-gitbase-primary">{repo}</button>
        {' / '}
        <button onClick={() => navigate(`/gitbase/${username}/${repo}/pulls`)} className="hover:text-gitbase-primary">pull requests</button>
      </div>

      {/* Title */}
      <h1 className="text-2xl text-white font-semibold mb-2">
        {current.title} <span className="text-gitbase-text-secondary font-normal">#{current.number}</span>
      </h1>
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <PullRequestBadge state={current.state} />
        <span className="text-sm text-gitbase-text-secondary">
          <span className="text-gitbase-text-primary">{current.author?.username}</span>
          {' wants to merge '}
          <span className="text-gitbase-text-primary">{current.commitsCount}</span>
          {' commit(s) into '}
          <code className="font-mono text-gitbase-text-primary">{current.targetBranch}</code>
          {' from '}
          <code className="font-mono text-gitbase-text-primary">{current.sourceBranch}</code>
        </span>
        <span className="text-xs text-gitbase-text-secondary">
          opened {formatRelativeTime(current.createdAt ?? 0)}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gitbase-border-dark/30 mb-4">
        <button onClick={() => setTab('conversation')} className={tabClass(tab === 'conversation')}>
          Conversation {current.commentsCount > 0 && <span className="text-xs">({current.commentsCount})</span>}
        </button>
        <button onClick={() => setTab('commits')} className={tabClass(tab === 'commits')}>
          Commits {current.commitsCount > 0 && <span className="text-xs">({current.commitsCount})</span>}
        </button>
        <button onClick={() => setTab('files')} className={tabClass(tab === 'files')}>
          Files changed {current.changedFilesCount > 0 && <span className="text-xs">({current.changedFilesCount})</span>}
        </button>
      </div>

      {tab === 'conversation' && (
        <div className="space-y-4">
          <Conversation
            username={username}
            repo={repo}
            number={number}
            description={current.description}
            authorName={current.author?.username ?? 'unknown'}
            createdAt={current.createdAt}
            reloadKey={reloadKey}
          />
          <MergeBox
            username={username}
            repo={repo}
            pr={current}
            canMerge={isOwner}
            actionError={actionError}
            onMerged={refresh}
            onClose={() => dispatch(closePullRequest({ username, repo, number }))}
            onReopen={() => dispatch(reopenPullRequest({ username, repo, number }))}
          />
        </div>
      )}

      {tab === 'commits' && (
        <CommitList
          page={diff ? {
            ref: current.sourceBranch,
            page: 0,
            size: diff.commits.length,
            hasNext: false,
            commits: diff.commits,
          } : null}
          loading={diffLoading}
          error={diffError}
          onOpenCommit={sha => navigate(`/gitbase/${username}/${repo}?commit=${sha}`)}
          onPrev={() => {}}
          onNext={() => {}}
        />
      )}

      {tab === 'files' && (
        <>
          {diffLoading && <div className="text-gitbase-text-secondary">Loading diff…</div>}
          {diffError && <div className="text-red-400">{diffError}</div>}
          {diff && (
            <>
              <div className="mb-3 text-sm text-gitbase-text-secondary">
                {diff.files.length} changed file(s) ·{' '}
                <span className="text-green-400">+{diff.totalAdditions}</span>{' '}
                <span className="text-red-400">−{diff.totalDeletions}</span>
              </div>
              <FileDiffList
                files={diff.files}
                truncated={diff.truncated}
                emptyMessage="No file changes between these branches."
              />
            </>
          )}
        </>
      )}
    </Shell>
  );
};

/** Shared page chrome so the loading/error states keep the navbar. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gitbase-dark via-gitbase-secondary to-gitbase-dark">
      <DashboardNavbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

export default PullRequestDetail;
