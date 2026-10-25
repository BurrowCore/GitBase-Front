import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardNavbar } from '../components/Dashboard/DashboardNavbar';
import { IssueBadge } from '../components/Issue/IssueBadge';
import { IssueDependencies } from '../components/Issue/IssueDependencies';
import { LabelChip } from '../components/Issue/LabelChip';
import { MarkdownView } from '../components/Repository/MarkdownView';
import {
  addDependency,
  clearCurrent,
  closeIssue,
  fetchDependencies,
  fetchIssue,
  fetchLabels,
  removeDependency,
  reopenIssue,
  updateIssue,
} from '../features/issues/issueSlice';
import { useAppDispatch, useAppSelector } from '../features/store';
import { useRepoPermissions } from '../hooks/useRepoPermissions';
import { issueService } from '../services/issueService';
import type { Comment } from '../types/pullRequest';
import { formatRelativeTime } from '../utils/dateFormatter';

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gitbase-purple to-gitbase-pink flex items-center justify-center text-white text-xs flex-shrink-0">
      {(name || 'U').charAt(0).toUpperCase()}
    </div>
  );
}

const IssueDetail: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { username = '', repo = '', number: numberParam = '' } = useParams();
  const number = Number(numberParam);
  const viewer = useAppSelector(state => state.auth.user);
  const {
    current: issue, currentLoading, currentError, actionError, labels, blockedBy, blocks, dependencyError,
  } = useAppSelector(state => state.issues);
  const permissions = useRepoPermissions(username, repo);

  // Comments stay local, as on the pull-request page: they are only ever shown here.
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const ref = { username, repo, number };

  useEffect(() => {
    if (!username || !repo || !Number.isFinite(number)) return;
    dispatch(fetchIssue({ username, repo, number }));
    dispatch(fetchDependencies({ username, repo, number }));
    dispatch(fetchLabels({ username, repo }));
    return () => { dispatch(clearCurrent()); };
  }, [dispatch, username, repo, number]);

  const loadComments = useCallback(() => {
    issueService.listComments(username, repo, number)
      .then(page => setComments(page.comments))
      .catch(err => setCommentError(err.message ?? 'Failed to load comments'));
  }, [username, repo, number]);

  useEffect(() => { loadComments(); }, [loadComments]);

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || posting) return;
    setPosting(true);
    setCommentError(null);
    try {
      const created = await issueService.addComment(username, repo, number, body.trim());
      setComments(prev => [...prev, created]);
      setBody('');
    } catch (err: any) {
      setCommentError(err.message ?? 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-gradient-to-br from-gitbase-dark via-gitbase-secondary to-gitbase-dark">
      <DashboardNavbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );

  if (currentLoading && !issue) return shell(<div className="text-gitbase-text-secondary">Loading issue…</div>);
  if (currentError) return shell(<div className="text-red-400">{currentError}</div>);
  if (!issue) return shell(<div />);

  // The author or anyone with write access may edit, close or reopen. The server
  // enforces this too, so hiding the controls is a convenience rather than the actual gate.
  const canModify = permissions.push || viewer?.name === issue.author?.username;

  /** Toggling a label sends the full desired set — the API replaces rather than merges. */
  const toggleLabel = (name: string) => {
    const current = issue.labels.map(l => l.name);
    const next = current.includes(name) ? current.filter(n => n !== name) : [...current, name];
    dispatch(updateIssue({ ...ref, changes: { labels: next } }));
  };

  const openIssue = (target: number) => navigate(`/gitbase/${username}/${repo}/issues/${target}`);

  return shell(
    <>
      <div className="text-sm text-gitbase-text-secondary mb-3 truncate">
        <button onClick={() => navigate('/projects')} className="hover:text-gitbase-primary">{username}</button>
        {' / '}
        <button onClick={() => navigate(`/gitbase/${username}/${repo}`)} className="text-white font-semibold hover:text-gitbase-primary">{repo}</button>
        {' / '}
        <button onClick={() => navigate(`/gitbase/${username}/${repo}/issues`)} className="hover:text-gitbase-primary">issues</button>
      </div>

      <h1 className="text-2xl text-white font-semibold mb-2">
        {issue.title} <span className="text-gitbase-text-secondary font-normal">#{issue.number}</span>
      </h1>
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <IssueBadge state={issue.state} />
        <span className="text-sm text-gitbase-text-secondary">
          <span className="text-gitbase-text-primary">{issue.author?.username}</span>
          {' opened this '}{formatRelativeTime(issue.createdAt ?? 0)}
          {' · '}{issue.commentsCount} comment(s)
        </span>
        {issue.state === 'CLOSED' && issue.closedByPullNumber != null && (
          <span className="text-sm text-gitbase-text-secondary">
            · closed by pull request{' '}
            <button
              onClick={() => navigate(`/gitbase/${username}/${repo}/pulls/${issue.closedByPullNumber}`)}
              className="text-gitbase-primary hover:underline"
            >
              #{issue.closedByPullNumber}
            </button>
          </span>
        )}
        {canModify && (
          <button
            onClick={() => dispatch(issue.state === 'OPEN' ? closeIssue(ref) : reopenIssue(ref))}
            className="ml-auto px-3 py-1.5 rounded-lg bg-white/5 text-sm text-gitbase-text-primary hover:bg-white/10"
          >
            {issue.state === 'OPEN' ? 'Close issue' : 'Reopen issue'}
          </button>
        )}
      </div>

      {actionError && <div className="mb-3 text-sm text-red-400">{actionError}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-5">
        {/* Conversation */}
        <div className="space-y-4 min-w-0">
          <div className="rounded-lg border border-gitbase-border-dark/30 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-gitbase-surface-dark/80 border-b border-gitbase-border-dark/30">
              <Avatar name={issue.author?.username ?? 'U'} />
              <span className="text-sm text-gitbase-text-primary font-medium">{issue.author?.username}</span>
              <span className="text-xs text-gitbase-text-secondary">
                commented {formatRelativeTime(issue.createdAt ?? 0)}
              </span>
            </div>
            <div className="px-5 py-4">
              {issue.body?.trim()
                ? <MarkdownView source={issue.body} />
                : <span className="text-sm text-gitbase-text-secondary italic">No description provided.</span>}
            </div>
          </div>

          {comments.map(comment => (
            <div key={comment.id ?? `${comment.author?.username}-${comment.createdAt}`}
                 className="rounded-lg border border-gitbase-border-dark/30 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-gitbase-surface-dark/80 border-b border-gitbase-border-dark/30">
                <Avatar name={comment.author?.username ?? 'U'} />
                <span className="text-sm text-gitbase-text-primary font-medium">{comment.author?.username}</span>
                <span className="text-xs text-gitbase-text-secondary">
                  commented {formatRelativeTime(comment.createdAt ?? 0)}
                </span>
              </div>
              <div className="px-5 py-4"><MarkdownView source={comment.body} /></div>
            </div>
          ))}

          <form onSubmit={postComment} className="rounded-lg border border-gitbase-border-dark/30 bg-gitbase-surface-dark/60 p-3 space-y-2">
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Leave a comment (Markdown supported)"
              rows={4}
              className="w-full px-3 py-2 rounded-md bg-gitbase-surface-dark border border-gitbase-border-dark/30 text-sm text-gitbase-text-primary placeholder:text-gitbase-text-secondary focus:outline-none focus:border-gitbase-primary/50"
            />
            {commentError && <div className="text-sm text-red-400">{commentError}</div>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!body.trim() || posting}
                className="px-4 py-1.5 rounded-lg bg-gitbase-primary text-white text-sm font-medium disabled:opacity-40 hover:opacity-90"
              >
                {posting ? 'Posting…' : 'Comment'}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-gitbase-text-secondary mb-2">Labels</div>
            {issue.labels.length === 0 && <div className="text-sm text-gitbase-text-secondary mb-2">None yet</div>}
            <div className="flex flex-wrap gap-1.5">
              {(canModify ? labels : issue.labels).map(label => (
                <LabelChip
                  key={label.name}
                  label={label}
                  active={issue.labels.some(l => l.name === label.name)}
                  onClick={canModify ? () => toggleLabel(label.name) : undefined}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-gitbase-text-secondary mb-2">Assignees</div>
            {issue.assignees.length === 0 ? (
              <div className="text-sm text-gitbase-text-secondary">No one assigned</div>
            ) : (
              <div className="space-y-1.5">
                {issue.assignees.map(a => (
                  <div key={a.username} className="flex items-center gap-2">
                    <Avatar name={a.username} />
                    <span className="text-sm text-gitbase-text-primary">{a.username}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <IssueDependencies
            blockedBy={blockedBy}
            blocks={blocks}
            canEdit={permissions.push /* write access only — authorship isn't enough */}
            error={dependencyError}
            onAdd={dependency => dispatch(addDependency({ ...ref, dependency }))}
            onRemove={dependency => dispatch(removeDependency({ ...ref, dependency }))}
            onOpen={openIssue}
          />
        </aside>
      </div>
    </>
  );
};

export default IssueDetail;
