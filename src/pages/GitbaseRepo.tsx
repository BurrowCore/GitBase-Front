import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardNavbar } from '../components/Dashboard/DashboardNavbar';
import { DirectoryView } from '../components/Repository/DirectoryView';
import { CodeViewer } from '../components/Repository/CodeViewer';
import { FileExplorer } from '../components/Repository/FileExplorer';
import { ReadmePanel } from '../components/Repository/ReadmePanel';
import { RecentBranchBanner } from '../components/PullRequest/RecentBranchBanner';
import { CommitList } from '../components/Repository/CommitList';
import { CommitDetailView } from '../components/Repository/CommitDetailView';
import { BranchSelector } from '../components/Repository/BranchSelector';
import { DeleteRepositoryDialog } from '../components/Repository/DeleteRepositoryDialog';
import { useAppSelector } from '../features/store';
import { gitService } from '../services/gitService';
import type { BranchSummary, CommitDetail, CommitPage, DirectoryListing, FileContent, RepositoryInfo } from '../types/git';

type View = 'browse' | 'commits' | 'commit';

const GitbaseRepo: React.FC = () => {
  const navigate = useNavigate();
  const { username = '', repo = '' } = useParams<{ username: string; repo: string }>();

  const [view, setView] = useState<View>('browse');

  const [branches, setBranches] = useState<BranchSummary[]>([]);
  const [refName, setRefName] = useState('');

  const [path, setPath] = useState('');
  const [listing, setListing] = useState<DirectoryListing | null>(null);
  const [listingLoading, setListingLoading] = useState(true);
  const [listingError, setListingError] = useState<string | null>(null);

  const [viewFile, setViewFile] = useState<string | null>(null);
  const [file, setFile] = useState<FileContent | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const [commitPage, setCommitPage] = useState<CommitPage | null>(null);
  const [commitPageNum, setCommitPageNum] = useState(0);
  // When set, the Commits tab shows history for just this file.
  const [historyPath, setHistoryPath] = useState<string | null>(null);
  const [commitsLoading, setCommitsLoading] = useState(false);
  const [commitsError, setCommitsError] = useState<string | null>(null);
  const [commitDetail, setCommitDetail] = useState<CommitDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [repoInfo, setRepoInfo] = useState<RepositoryInfo | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const viewer = useAppSelector(state => state.auth.user);
  const isOwner = !!viewer?.name && viewer.name === username;

  const [copied, setCopied] = useState(false);
  const backendUrl = `http://localhost:8880/gitbase/${username}/${repo}.git`;

  const loadBranches = useCallback(async () => {
    const list = await gitService.listBranches(username, repo);
    setBranches(list);
    const def = list.find(b => b.isDefault) ?? list[0];
    if (def) setRefName(prev => prev || def.name);
    return list;
  }, [username, repo]);

  useEffect(() => {
    if (!username || !repo) return;
    let active = true;
    gitService
      .listBranches(username, repo)
      .then(list => {
        if (!active) return;
        setBranches(list);
        const def = list.find(b => b.isDefault) ?? list[0];
        if (def) setRefName(prev => prev || def.name);
      })
      .catch(() => { /* empty repo — ignore */ });
    return () => { active = false; };
  }, [username, repo]);

  // Repository metadata (visibility, last commit) for the header pill.
  useEffect(() => {
    if (!username || !repo) return;
    let active = true;
    gitService
      .getRepositoryInfo(username, repo)
      .then(info => { if (active) setRepoInfo(info); })
      .catch(() => { if (active) setRepoInfo(null); });
    return () => { active = false; };
  }, [username, repo]);

  /** Create a branch (git ref) and switch to it. */
  const createBranch = async (name: string, from: string) => {
    await gitService.createBranch(username, repo, name, from);
    await loadBranches();
    onSelectBranch(name);
  };

  /** Delete a branch ref; fall back to the default branch if we were viewing it. */
  const deleteBranch = async (name: string) => {
    await gitService.deleteBranch(username, repo, name);
    const list = await loadBranches();
    if (refName === name) {
      const def = list.find(b => b.isDefault) ?? list[0];
      if (def) onSelectBranch(def.name);
    }
  };

  useEffect(() => {
    if (!username || !repo) return;
    let active = true;
    setListingLoading(true);
    setListingError(null);
    gitService
      .listContents(username, repo, path, refName || undefined)
      .then(data => { if (active) setListing(data); })
      .catch(err => { if (active) setListingError(err.message ?? 'Failed to load repository'); })
      .finally(() => { if (active) setListingLoading(false); });
    return () => { active = false; };
  }, [username, repo, path, refName]);

  useEffect(() => {
    if (view !== 'commits' || !username || !repo) return;
    let active = true;
    setCommitsLoading(true);
    setCommitsError(null);
    gitService
      .listCommits(username, repo, {
        page: commitPageNum,
        ref: refName || undefined,
        path: historyPath ?? undefined,
      })
      .then(data => { if (active) setCommitPage(data); })
      .catch(err => { if (active) setCommitsError(err.message ?? 'Failed to load commits'); })
      .finally(() => { if (active) setCommitsLoading(false); });
    return () => { active = false; };
  }, [view, username, repo, commitPageNum, refName, historyPath]);

  const openDir = (dirPath: string) => {
    setView('browse');
    setViewFile(null);
    setFile(null);
    setPath(dirPath);
  };

  const openFile = (filePath: string) => {
    // Drop any #L<n> anchor from the previously viewed file so it doesn't follow us over.
    if (filePath !== viewFile && window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setView('browse');
    setViewFile(filePath);
    setFileLoading(true);
    setFileError(null);
    gitService
      .getFileContent(username, repo, filePath, refName || undefined)
      .then(setFile)
      .catch(err => setFileError(err.message ?? 'Failed to load file'))
      .finally(() => setFileLoading(false));
  };

  const onSelectBranch = (branch: string) => {
    setRefName(branch);
    setPath('');
    setViewFile(null);
    setFile(null);
    setCommitPageNum(0);
    setView('browse');
  };

  const openCommits = () => {
    setView('commits');
    setCommitPageNum(0);
    setHistoryPath(null);
  };

  /** Commits touching a single file ("History" in the blob header). */
  const openFileHistory = (filePath: string) => {
    setHistoryPath(filePath);
    setView('commits');
    setCommitPageNum(0);
  };

  const openCommit = (sha: string) => {
    setView('commit');
    setDetailLoading(true);
    setDetailError(null);
    setCommitDetail(null);
    gitService
      .getCommitDetail(username, repo, sha)
      .then(setCommitDetail)
      .catch(err => setDetailError(err.message ?? 'Failed to load commit'))
      .finally(() => setDetailLoading(false));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(backendUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {
      console.error('copy failed', e);
    }
  };

  const isEmptyRepo = !!listing && listing.entries.length === 0 && path === '' && !listing.latestCommit;

  const crumbPath = viewFile ?? path;
  const segments = crumbPath ? crumbPath.split('/') : [];

  const currentBranch = refName || branches.find(b => b.isDefault)?.name || branches[0]?.name || 'HEAD';

  const tab = (active: boolean) =>
    `px-3 py-2 text-sm border-b-2 -mb-px transition-colors ${
      active
        ? 'border-gitbase-primary text-white'
        : 'border-transparent text-gitbase-text-secondary hover:text-gitbase-text-primary'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gitbase-dark via-gitbase-secondary to-gitbase-dark">
      <DashboardNavbar />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-gitbase-purple to-gitbase-pink flex items-center justify-center text-white flex-shrink-0">
              {(username || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="text-base text-gitbase-text-secondary truncate">
              <button onClick={() => navigate('/projects')} className="hover:text-gitbase-primary">{username}</button>
              {' / '}
              <span className="text-white font-semibold">{repo}</span>
            </div>
            {repoInfo && (
              <span className="text-[11px] px-2 py-0.5 rounded-full border border-gitbase-border-dark/40 text-gitbase-text-secondary flex-shrink-0">
                {/* Jackson serialises isPrivate() as "private" — see types/git.ts */}
                {repoInfo.private ? 'Private' : 'Public'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <code className="hidden md:inline text-xs text-gitbase-text-secondary font-mono bg-gitbase-surface-dark/80 border border-gitbase-border-dark/30 rounded px-2 py-1">
              {backendUrl.replace(/^https?:\/\//, '')}
            </code>
            <button onClick={handleCopy} className="px-3 py-1.5 text-xs bg-white/5 rounded-lg text-gitbase-text-primary hover:bg-white/10">
              {copied ? 'Copied' : 'Clone'}
            </button>
            {isOwner && (
              <button
                onClick={() => setConfirmingDelete(true)}
                title="Delete this repository"
                className="px-3 py-1.5 text-xs bg-white/5 rounded-lg text-gitbase-text-secondary hover:bg-red-500/20 hover:text-red-300"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Tab nav */}
        {!isEmptyRepo && (
          <div className="flex items-center gap-1 border-b border-gitbase-border-dark/30 mb-4">
            <button onClick={() => openDir('')} className={tab(view === 'browse')}>Code</button>
            <button onClick={openCommits} className={tab(view === 'commits' || view === 'commit')}>Commits</button>
            <button
              onClick={() => navigate(`/gitbase/${username}/${repo}/pulls`)}
              className={tab(false)}
            >
              Pull requests
            </button>
          </div>
        )}

        {/* Surfaces branches pushed from the CLI that have no pull request yet. */}
        {!isEmptyRepo && (
          <RecentBranchBanner
            username={username}
            repo={repo}
            onCompare={branch =>
              navigate(`/gitbase/${username}/${repo}/pulls?compare=${encodeURIComponent(branch)}`)}
          />
        )}

        {/* ── Browse view ── */}
        {view === 'browse' && (
          <>
            {!isEmptyRepo && (
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <BranchSelector
                  branches={branches}
                  current={currentBranch}
                  onSelect={onSelectBranch}
                  onCreate={isOwner ? createBranch : undefined}
                  onDelete={isOwner ? deleteBranch : undefined}
                />
                {(segments.length > 0 || viewFile) && (
                  <div className="flex items-center gap-1 text-sm flex-wrap">
                    <button onClick={() => openDir('')} className="text-gitbase-primary hover:underline">{repo}</button>
                    {segments.map((seg, i) => {
                      const cumulative = segments.slice(0, i + 1).join('/');
                      const isLast = i === segments.length - 1;
                      const isFileLeaf = !!viewFile && isLast;
                      return (
                        <span key={cumulative} className="flex items-center gap-1">
                          <span className="text-gitbase-text-secondary">/</span>
                          {isFileLeaf ? (
                            <span className="text-gitbase-text-primary">{seg}</span>
                          ) : (
                            <button onClick={() => openDir(cumulative)} className="text-gitbase-primary hover:underline">{seg}</button>
                          )}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Empty repo → quick setup commands */}
            {!listingLoading && !listingError && isEmptyRepo && (
              <div className="rounded-lg bg-gitbase-surface-dark border border-gitbase-border-dark/30 p-4">
                <div className="text-white font-medium mb-3">Create a new repository on the command line</div>
                <pre className="rounded bg-gitbase-surface-dark/80 p-4 border border-gitbase-border-dark/20 whitespace-pre-wrap text-sm text-white">{`echo "# ${repo}" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin ${backendUrl}
git push -u origin main`}</pre>
              </div>
            )}

            {/* Sidebar tree + content */}
            {!isEmptyRepo && (
              <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
                <FileExplorer
                  username={username}
                  repo={repo}
                  refName={refName || undefined}
                  currentFile={viewFile}
                  onOpenFile={openFile}
                />

                <div className="min-w-0">
                  {listingLoading && !viewFile && <div className="text-gitbase-text-secondary">Loading…</div>}
                  {listingError && !viewFile && <div className="text-red-400">{listingError}</div>}

                  {viewFile ? (
                    <CodeViewer
                      file={file}
                      loading={fileLoading}
                      error={fileError}
                      username={username}
                      repo={repo}
                      refName={refName || undefined}
                      onViewHistory={openFileHistory}
                    />
                  ) : (
                    !listingLoading && !listingError && listing && (
                      <>
                        <DirectoryView listing={listing} onOpenDir={openDir} onOpenFile={openFile} />
                        <ReadmePanel
                          username={username}
                          repo={repo}
                          refName={refName || undefined}
                          entries={listing.entries}
                        />
                      </>
                    )
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Commit history view ── */}
        {view === 'commits' && (
          <>
            {historyPath && (
              <div className="flex items-center gap-2 mb-3 text-sm flex-wrap">
                <span className="text-gitbase-text-secondary">History for</span>
                <code className="font-mono text-gitbase-text-primary bg-white/5 rounded px-2 py-0.5">{historyPath}</code>
                <button onClick={openCommits} className="text-gitbase-primary hover:underline">Clear filter</button>
              </div>
            )}
            <CommitList
              page={commitPage}
              loading={commitsLoading}
              error={commitsError}
              onOpenCommit={openCommit}
              onPrev={() => setCommitPageNum(n => Math.max(0, n - 1))}
              onNext={() => setCommitPageNum(n => n + 1)}
            />
          </>
        )}

        {/* ── Commit detail view ── */}
        {view === 'commit' && (
          <>
            <button onClick={openCommits} className="mb-3 px-3 py-1 text-xs bg-white/5 rounded text-gitbase-text-primary">
              ← Back to commits
            </button>
            <CommitDetailView detail={commitDetail} loading={detailLoading} error={detailError} />
          </>
        )}
      </main>

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

export default GitbaseRepo;
