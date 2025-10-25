import React, { useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardNavbar } from '../components/Dashboard/DashboardNavbar';

const GitbaseRepo: React.FC = () => {
  const { username, repo } = useParams<{ username: string; repo: string }>();
  const navigate = useNavigate();
  const backendUrl = `http://localhost:8880/gitbase/${username}/${repo}.git`;

  const openBackend = useCallback(() => {
    window.open(backendUrl, '_blank', 'noopener');
  }, [backendUrl]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error('copy failed', e);
    }
  }, []);

  const [copied, setCopied] = useState<string | null>(null);
  const copyWithFeedback = useCallback(async (text: string, key: string) => {
    await copyToClipboard(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1600);
  }, [copyToClipboard]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gitbase-dark via-gitbase-secondary to-gitbase-dark">
      <DashboardNavbar />

      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="p-6">
          <div className="rounded-2xl bg-gradient-to-b from-gitbase-primary/6 to-transparent p-6 border border-gitbase-border-dark backdrop-blur-xl shadow-lg">

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-gitbase-purple to-gitbase-pink flex items-center justify-center text-white">{(username||'U').charAt(0).toUpperCase()}</div>
                <div>
                  <div className="text-sm text-gitbase-text-secondary">{username} / <span className="text-white font-semibold">{repo}</span> <span className="ml-2 inline-block px-2 py-0.5 text-xs bg-white/5 rounded text-gitbase-text-primary">Private</span></div>
                </div>
              </div>
        </div>
            </div>

            <div className="rounded-md overflow-hidden">
            <div className="px-5 py-3 bg-gitbase-surface-dark/90 border-t border-gitbase-border-dark/20">
              <div className="flex items-center justify-between">
                <div className="text-sm text-white font-semibold">Quick setup — if you've done this kind of thing before</div>
                <div className="flex items-center gap-3">
                  <div className="px-2 py-1 text-xs bg-white/5 rounded text-gitbase-text-primary">HTTPS</div>
                  <div className="px-2 py-1 text-xs bg-white/5 rounded text-gitbase-text-primary">SSH</div>
                </div>
              </div>

              <div className="mt-3 relative">
                <div className="rounded bg-gitbase-surface-dark/80 p-3 border border-gitbase-border-dark/30 flex items-center justify-between">
                  <div className="text-sm text-gitbase-text-primary break-all">{backendUrl.replace('http://', '').replace('https://', '')}</div>
                  <button onClick={() => copyWithFeedback(backendUrl, 'quick-url')} className="ml-4 px-3 py-1 text-xs bg-white/5 rounded text-gitbase-text-primary">{copied === 'quick-url' ? 'Copied' : 'Copy'}</button>
                </div>
              </div>
            </div>
          </div>

          {/* Three command blocks */}
          <div className="space-y-6">
            <div className="rounded bg-gitbase-surface-dark border border-gitbase-border-dark/30 p-4">
              <div className="flex items-center justify-between">
                <div className="text-white font-medium">...or create a new repository on the command line</div>
                <button onClick={() => copyWithFeedback(`echo \"# ${repo}\" >> README.md\ngit init\ngit add README.md\ngit commit -m \"first commit\"\ngit branch -M master\ngit remote add origin ${backendUrl}\ngit push -u origin master`, 'create')} className="px-3 py-1 text-xs bg-white/5 rounded text-gitbase-text-primary">{copied === 'create' ? 'Copied' : 'Copy'}</button>
              </div>
              <div className="mt-3 rounded bg-gitbase-surface-dark/80 p-4 border border-gitbase-border-dark/20">
                <pre className="whitespace-pre-wrap text-sm text-white">{`echo "# ${repo}" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M master
git remote add origin ${backendUrl}
git push -u origin master`}</pre>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-white/5 text-gitbase-text-primary rounded-lg">Back to dashboard</button>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
};

export default GitbaseRepo;
