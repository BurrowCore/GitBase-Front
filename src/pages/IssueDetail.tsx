import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardNavbar } from '../components/Dashboard/DashboardNavbar';
import { IssueBadge } from '../components/Issue/IssueBadge';
import { LabelChip } from '../components/Issue/LabelChip';
import { MarkdownView } from '../components/Repository/MarkdownView';
import { useAppSelector } from '../features/store';
import { issueService } from '../services/issueService';
import type { Issue, Label } from '../types/issue';
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
  const { username = '', repo = '', number: numberParam = '' } = useParams();
  const number = Number(numberParam);
  const viewer = useAppSelector(state => state.auth.user);

  const [issue, setIssue] = useState<Issue | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [detail, commentPage, labelList] = await Promise.all([
        issueService.get(username, repo, number),
        issueService.listComments(username, repo, number),
        issueService.listLabels(username, repo).catch(() => []),
      ]);
      setIssue(detail);
      setComments(commentPage.comments);
      setLabels(labelList);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load issue');
    } finally {
      setLoading(false);
    }
  }, [username, repo, number]);

  useEffect(() => { void load(); }, [load]);

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || posting) return;
    setPosting(true);
    setActionError(null);
    try {
      const created = await issueService.addComment(username, repo, number, body.trim());
      setComments(prev => [...prev, created]);
      setBody('');
    } catch (err: any) {
      setActionError(err.message ?? 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const toggleState = async () => {
    if (!issue) return;
    setActionError(null);
    try {
      const updated = issue.state === 'OPEN'
        ? await issueService.close(username, repo, number)
        : await issueService.reopen(username, repo, number);
      setIssue(updated);
    } catch (err: any) {
      setActionError(err.message ?? 'Action failed');
    }
  };

  /** Toggling a label sends the full desired set — the API replaces rather than merges. */
  const toggleLabel = async (name: string) => {
    if (!issue) return;
    const current = issue.labels.map(l => l.name);
    const next = current.includes(name) ? current.filter(n => n !== name) : [...current, name];
    setActionError(null);
    try {
      setIssue(await issueService.update(username, repo, number, { labels: next }));
    } catch (err: any) {
      setActionError(err.message ?? 'Could not update labels');
    }
  };

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-gradient-to-br from-gitbase-dark via-gitbase-secondary to-gitbase-dark">
      <DashboardNavbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );

  if (loading && !issue) return shell(<div className="text-gitbase-text-secondary">Loading issue…</div>);
  if (error) return shell(<div className="text-red-400">{error}</div>);
  if (!issue) return shell(<div />);

  // Only the author or someone with write access may close/reopen; the server enforces this too,
  // so hiding the control is a convenience rather than the actual gate.
  const canModify = viewer?.name === issue.author?.username || viewer?.name === username;

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
        {canModify && (
          <button
            onClick={toggleState}
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
        </aside>
      </div>
    </>
  );
};

export default IssueDetail;
