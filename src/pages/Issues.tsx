import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardNavbar } from '../components/Dashboard/DashboardNavbar';
import { IssueList } from '../components/Issue/IssueList';
import { IssueTemplateChooser } from '../components/Issue/IssueTemplateChooser';
import { NewIssueForm } from '../components/Issue/NewIssueForm';
import { RepoTabs } from '../components/Repository/RepoTabs';
import {
  fetchIssues,
  fetchLabels,
  fetchTemplates,
  enterRepository,
  setFilter,
  setLabelFilter,
  setPageNum,
  setSearch,
} from '../features/issues/issueSlice';
import { useAppDispatch, useAppSelector } from '../features/store';
import { useRepoPermissions } from '../hooks/useRepoPermissions';
import type { IssueTemplate } from '../types/issue';

/** Where the "new issue" flow is: not started, picking a template, or filling the form. */
type Composer = { step: 'closed' } | { step: 'choosing' } | { step: 'writing'; template: IssueTemplate | null };

/** Issue list for a repository, plus the template chooser and the "new issue" form. */
const Issues: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { username = '', repo = '' } = useParams<{ username: string; repo: string }>();
  const {
    page, listLoading, listError, filter, labelFilter, search, pageNum, labels, templates,
  } = useAppSelector(s => s.issues);
  const permissions = useRepoPermissions(username, repo);
  const [composer, setComposer] = useState<Composer>({ step: 'closed' });

  // Filters survive a round trip to an issue and back; another repository starts clean.
  useEffect(() => {
    if (!username || !repo) return;
    dispatch(enterRepository(`${username}/${repo}`));
    dispatch(fetchLabels({ username, repo }));
  }, [dispatch, username, repo]);

  // Debounced so typing in the search box doesn't fire a request per keystroke.
  useEffect(() => {
    if (!username || !repo) return;
    const timer = setTimeout(
      () => dispatch(fetchIssues({ username, repo, state: filter, label: labelFilter, search, page: pageNum })),
      search ? 300 : 0,
    );
    return () => clearTimeout(timer);
  }, [dispatch, username, repo, filter, labelFilter, search, pageNum]);

  // Templates are read from git on demand — only when someone actually starts a new issue.
  const startNewIssue = async () => {
    const loaded = templates ?? await dispatch(fetchTemplates({ username, repo })).unwrap();
    const hasTemplates = loaded.templates.length > 0 || loaded.contactLinks.length > 0;
    setComposer(hasTemplates ? { step: 'choosing' } : { step: 'writing', template: null });
  };

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
          {composer.step === 'closed' && (
            <button
              onClick={startNewIssue}
              className="px-4 py-2 rounded-lg bg-gitbase-primary text-white text-sm font-medium hover:opacity-90"
            >
              New issue
            </button>
          )}
        </div>

        <RepoTabs username={username} repo={repo} active="issues" />

        {composer.step === 'choosing' && templates && (
          <IssueTemplateChooser
            templates={templates}
            showErrors={permissions.push}
            onPick={template => setComposer({ step: 'writing', template })}
            onCancel={() => setComposer({ step: 'closed' })}
          />
        )}

        {composer.step === 'writing' && (
          <NewIssueForm
            key={composer.template?.fileName ?? 'blank'}
            username={username}
            repo={repo}
            labels={labels}
            template={composer.template}
            onCreated={number => navigate(`/gitbase/${username}/${repo}/issues/${number}`)}
            onCancel={() => setComposer({ step: 'closed' })}
          />
        )}

        {composer.step === 'closed' && (
          <IssueList
            page={page}
            labels={labels}
            loading={listLoading}
            error={listError}
            filter={filter}
            labelFilter={labelFilter}
            search={search}
            onFilterChange={next => dispatch(setFilter(next))}
            onLabelFilterChange={next => dispatch(setLabelFilter(next))}
            onSearchChange={next => dispatch(setSearch(next))}
            onOpen={number => navigate(`/gitbase/${username}/${repo}/issues/${number}`)}
            onPrev={() => dispatch(setPageNum(pageNum - 1))}
            onNext={() => dispatch(setPageNum(pageNum + 1))}
          />
        )}
      </main>
    </div>
  );
};

export default Issues;
