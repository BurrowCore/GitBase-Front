import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardNavbar } from '../components/Dashboard/DashboardNavbar';
import { DirectoryView } from '../components/Repository/DirectoryView';
import { CodeViewer } from '../components/Repository/CodeViewer';
import { FileExplorer } from '../components/Repository/FileExplorer';
import { CommitList } from '../components/Repository/CommitList';
import { CommitDetailView } from '../components/Repository/CommitDetailView';
import { BranchSelector } from '../components/Repository/BranchSelector';
import { gitService } from '../services/gitService';
import type { BranchSummary, CommitDetail, CommitPage, DirectoryListing, FileContent } from '../types/git';

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
  const [commitsLoading, setCommitsLoading] = useState(false);
  const [commitsError, setCommitsError] = useState<string | null>(null);
  const [commitDetail, setCommitDetail] = useState<CommitDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const backendUrl = `http://localhost:8880/gitbase/${username}/${repo}.git`;

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
      .listCommits(username, repo, { page: commitPageNum, ref: refName || undefined })
      .then(data => { if (active) setCommitPage(data); })
      .catch(err => { if (active) setCommitsError(err.message ?? 'Failed to load commits'); })
      .finally(() => { if (active) setCommitsLoading(false); });
    return () => { active = false; };
  }, [view, username, repo, commitPageNum, refName]);

  const openDir = (dirPath: string) => {
    setView('browse');
    setViewFile(null);
    setFile(null);
    setPath(dirPath);
  };

  const openFile = (filePath: string) => {
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
          </div>
          <div className="flex items-center gap-2">
            <code className="hidden md:inline text-xs text-gitbase-text-secondary font-mono bg-gitbase-surface-dark/80 border border-gitbase-border-dark/30 rounded px-2 py-1">
              {backendUrl.replace(/^https?:\/\//, '')}
            </code>
            <button onClick={handleCopy} className="px-3 py-1.5 text-xs bg-white/5 rounded-lg text-gitbase-text-primary hover:bg-white/10">
              {copied ? 'Copied' : 'Clone'}
            </button>
          </div>
        </div>

        {/* Tab nav */}
        {!isEmptyRepo && (
          <div className="flex items-center gap-1 border-b border-gitbase-border-dark/30 mb-4">
            <button onClick={() => openDir('')} className={tab(view === 'browse')}>Code</button>
            <button onClick={openCommits} className={tab(view === 'commits' || view === 'commit')}>Commits</button>
          </div>
        )}

        {/* ── Browse view ── */}
        {view === 'browse' && (
          <>
            {!isEmptyRepo && (
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <BranchSelector branches={branches} current={currentBranch} onSelect={onSelectBranch} />
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
                    <CodeViewer file={file} loading={fileLoading} error={fileError} />
                  ) : (
                    !listingLoading && !listingError && listing && (
                      <DirectoryView listing={listing} onOpenDir={openDir} onOpenFile={openFile} />
                    )
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Commit history view ── */}
        {view === 'commits' && (
          <CommitList
            page={commitPage}
            loading={commitsLoading}
            error={commitsError}
            onOpenCommit={openCommit}
            onPrev={() => setCommitPageNum(n => Math.max(0, n - 1))}
            onNext={() => setCommitPageNum(n => n + 1)}
          />
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
    </div>
  );
};

export default GitbaseRepo;
