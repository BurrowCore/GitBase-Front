import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardNavbar } from '../components/Dashboard/DashboardNavbar';
import { IssueList } from '../components/Issue/IssueList';
import { NewIssueForm } from '../components/Issue/NewIssueForm';
import { RepoTabs } from '../components/Repository/RepoTabs';
import { issueService } from '../services/issueService';
import type { IssueFilter, IssuePage, Label } from '../types/issue';

/** Issue list for a repository, plus the inline "new issue" form. */
const Issues: React.FC = () => {
  const navigate = useNavigate();
  const { username = '', repo = '' } = useParams<{ username: string; repo: string }>();

  const [page, setPage] = useState<IssuePage | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<IssueFilter>('OPEN');
  const [labelFilter, setLabelFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [pageNum, setPageNum] = useState(0);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!username || !repo) return;
    let active = true;
    issueService
      .listLabels(username, repo)
      .then(list => { if (active) setLabels(list); })
      .catch(() => { if (active) setLabels([]); });
    return () => { active = false; };
  }, [username, repo]);

  const load = useCallback(() => {
    if (!username || !repo) return () => {};
    let active = true;
    setLoading(true);
    setError(null);
    issueService
      .list(username, repo, {
        state: filter,
        label: labelFilter ?? undefined,
        search: search.trim() || undefined,
        page: pageNum,
      })
      .then(data => { if (active) setPage(data); })
      .catch(err => { if (active) setError(err.message ?? 'Failed to load issues'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [username, repo, filter, labelFilter, search, pageNum]);

  // Debounced so typing in the search box doesn't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gitbase-dark via-gitbase-secondary to-gitbase-dark">
      <DashboardNavbar />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="text-base text-gitbase-text-secondary truncate">
            <button onClick={() => navigate('/projects')} className="hover:text-gitbase-primary">{username}</button>
            {' / '}
            <button
              onClick={() => navigate(`/gitbase/${username}/${repo}`)}
              className="text-white font-semibold hover:text-gitbase-primary"
            >
              {repo}
            </button>
            <span> / issues</span>
          </div>
          {!creating && (
            <button
              onClick={() => setCreating(true)}
              className="px-4 py-2 rounded-lg bg-gitbase-primary text-white text-sm font-medium hover:opacity-90"
            >
              New issue
            </button>
          )}
        </div>

        <RepoTabs username={username} repo={repo} active="issues" />

        {creating ? (
          <NewIssueForm
            username={username}
            repo={repo}
            labels={labels}
            onCreated={number => navigate(`/gitbase/${username}/${repo}/issues/${number}`)}
            onCancel={() => setCreating(false)}
          />
        ) : (
          <IssueList
            page={page}
            labels={labels}
            loading={loading}
            error={error}
            filter={filter}
            labelFilter={labelFilter}
            search={search}
            onFilterChange={next => { setPageNum(0); setFilter(next); }}
            onLabelFilterChange={next => { setPageNum(0); setLabelFilter(next); }}
            onSearchChange={next => { setPageNum(0); setSearch(next); }}
            onOpen={number => navigate(`/gitbase/${username}/${repo}/issues/${number}`)}
            onPrev={() => setPageNum(n => Math.max(0, n - 1))}
            onNext={() => setPageNum(n => n + 1)}
          />
        )}
      </main>
    </div>
  );
};

export default Issues;
