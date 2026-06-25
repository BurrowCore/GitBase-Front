import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardNavbar } from '../components/Dashboard/DashboardNavbar';
import { DirectoryView } from '../components/Repository/DirectoryView';
import { FileViewer } from '../components/Repository/FileViewer';
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

  // Selected branch/ref. Empty = repo HEAD until branches load.
  const [branches, setBranches] = useState<BranchSummary[]>([]);
  const [refName, setRefName] = useState('');

  // Current directory path within the repo ('' = root).
  const [path, setPath] = useState('');
  const [listing, setListing] = useState<DirectoryListing | null>(null);
  const [listingLoading, setListingLoading] = useState(true);
  const [listingError, setListingError] = useState<string | null>(null);

  // When set, we're viewing a file rather than a directory.
  const [viewFile, setViewFile] = useState<string | null>(null);
  const [file, setFile] = useState<FileContent | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Commit history + detail.
  const [commitPage, setCommitPage] = useState<CommitPage | null>(null);
  const [commitPageNum, setCommitPageNum] = useState(0);
  const [commitsLoading, setCommitsLoading] = useState(false);
  const [commitsError, setCommitsError] = useState<string | null>(null);
  const [commitDetail, setCommitDetail] = useState<CommitDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const backendUrl = `http://localhost:8880/gitbase/${username}/${repo}.git`;

  // Load branches once; pick the default as the initial ref.
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
      .catch(() => { /* empty repo or no branches — ignore */ });
    return () => { active = false; };
  }, [username, repo]);

  // Load the directory listing whenever the path or ref changes.
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

  // Load commit history when viewing the Commits tab.
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

  // Breadcrumb segments: based on the file path when viewing a file, else the directory path.
  const crumbPath = viewFile ?? path;
  const segments = crumbPath ? crumbPath.split('/') : [];

  const tabClass = (active: boolean) =>
    `px-4 py-2 text-sm rounded-lg ${active ? 'bg-white/10 text-white' : 'bg-white/5 text-gitbase-text-primary'}`;

  const currentBranch = refName || branches.find(b => b.isDefault)?.name || branches[0]?.name || 'HEAD';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gitbase-dark via-gitbase-secondary to-gitbase-dark">
      <DashboardNavbar />

      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-gitbase-purple to-gitbase-pink flex items-center justify-center text-white">
              {(username || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="text-sm text-gitbase-text-secondary">
              {username} / <span className="text-white font-semibold">{repo}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-white/5 text-gitbase-text-primary rounded-lg text-sm"
          >
            Back to projects
          </button>
        </div>

        {/* Clone URL bar */}
        <div className="rounded bg-gitbase-surface-dark/80 p-3 border border-gitbase-border-dark/30 flex items-center justify-between mb-4">
          <div className="text-sm text-gitbase-text-primary break-all font-mono">
            {backendUrl.replace(/^https?:\/\//, '')}
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-1 text-xs bg-white/5 rounded text-gitbase-text-primary"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Toolbar: branch selector + tabs */}
        {!isEmptyRepo && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <BranchSelector branches={branches} current={currentBranch} onSelect={onSelectBranch} />
            <div className="w-px h-6 bg-gitbase-border-dark/30 mx-1" />
            <button onClick={() => openDir('')} className={tabClass(view === 'browse')}>Code</button>
            <button onClick={openCommits} className={tabClass(view === 'commits' || view === 'commit')}>Commits</button>
          </div>
        )}

        {/* ── Browse view ── */}
        {view === 'browse' && (
          <>
            {!isEmptyRepo && (segments.length > 0 || viewFile) && (
              <div className="flex items-center gap-1 text-sm mb-3 flex-wrap">
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
                        <button onClick={() => openDir(cumulative)} className="text-gitbase-primary hover:underline">
                          {seg}
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>
            )}

            {listingLoading && <div className="text-gitbase-text-secondary">Loading repository…</div>}
            {listingError && <div className="text-red-400">{listingError}</div>}

            {/* Empty repo → quick setup commands */}
            {!listingLoading && !listingError && isEmptyRepo && (
              <div className="rounded bg-gitbase-surface-dark border border-gitbase-border-dark/30 p-4">
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

            {/* File view */}
            {!isEmptyRepo && viewFile && (
              <div className="rounded-lg border border-gitbase-border-dark/30 bg-gitbase-surface-dark/60 overflow-auto max-h-[75vh]">
                <FileViewer file={file} loading={fileLoading} error={fileError} />
              </div>
            )}

            {/* Directory view */}
            {!isEmptyRepo && !viewFile && !listingLoading && !listingError && listing && (
              <DirectoryView listing={listing} onOpenDir={openDir} onOpenFile={openFile} />
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
            <button
              onClick={openCommits}
              className="mb-3 px-3 py-1 text-xs bg-white/5 rounded text-gitbase-text-primary"
            >
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
