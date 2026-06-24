import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardNavbar } from '../components/Dashboard/DashboardNavbar';
import { DirectoryView } from '../components/Repository/DirectoryView';
import { FileViewer } from '../components/Repository/FileViewer';
import { gitService } from '../services/gitService';
import type { DirectoryListing, FileContent } from '../types/git';

const GitbaseRepo: React.FC = () => {
  const navigate = useNavigate();
  const { username = '', repo = '' } = useParams<{ username: string; repo: string }>();

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

  const [copied, setCopied] = useState(false);
  const backendUrl = `http://localhost:8880/gitbase/${username}/${repo}.git`;

  // Load the directory listing whenever the path changes.
  useEffect(() => {
    if (!username || !repo) return;
    let active = true;
    setListingLoading(true);
    setListingError(null);
    gitService
      .listContents(username, repo, path)
      .then(data => { if (active) setListing(data); })
      .catch(err => { if (active) setListingError(err.message ?? 'Failed to load repository'); })
      .finally(() => { if (active) setListingLoading(false); });
    return () => { active = false; };
  }, [username, repo, path]);

  const openDir = (dirPath: string) => {
    setViewFile(null);
    setFile(null);
    setPath(dirPath);
  };

  const openFile = (filePath: string) => {
    setViewFile(filePath);
    setFileLoading(true);
    setFileError(null);
    gitService
      .getFileContent(username, repo, filePath)
      .then(setFile)
      .catch(err => setFileError(err.message ?? 'Failed to load file'))
      .finally(() => setFileLoading(false));
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
        <div className="rounded bg-gitbase-surface-dark/80 p-3 border border-gitbase-border-dark/30 flex items-center justify-between mb-6">
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

        {/* Breadcrumb */}
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
      </main>
    </div>
  );
};

export default GitbaseRepo;
