import { useEffect, useState } from 'react';
import { pullRequestService } from '../../services/pullRequestService';
import type { Comment } from '../../types/pullRequest';
import { formatRelativeTime } from '../../utils/dateFormatter';
import { MarkdownView } from '../Repository/MarkdownView';

interface ConversationProps {
  username: string;
  repo: string;
  number: number;
  /** The PR description, rendered as the first entry in the thread. */
  description: string | null;
  authorName: string;
  createdAt: number | null;
  /** Bumped by the parent to force a reload (e.g. after merging). */
  reloadKey?: number;
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gitbase-purple to-gitbase-pink flex items-center justify-center text-white text-xs flex-shrink-0">
      {(name || 'U').charAt(0).toUpperCase()}
    </div>
  );
}

/** Comment thread: PR description first, then comments, then a composer. */
export function Conversation({
  username, repo, number, description, authorName, createdAt, reloadKey = 0,
}: ConversationProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    pullRequestService
      .listComments(username, repo, number)
      .then(page => { if (active) setComments(page.comments); })
      .catch(err => { if (active) setError(err.message ?? 'Failed to load comments'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [username, repo, number, reloadKey]);

  const post = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    setPostError(null);
    try {
      const created = await pullRequestService.addComment(username, repo, number, body.trim());
      setComments(prev => [...prev, created]);
      setBody('');
    } catch (err: any) {
      setPostError(err.message ?? 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* PR description */}
      <div className="rounded-lg border border-gitbase-border-dark/30 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-gitbase-surface-dark/80 border-b border-gitbase-border-dark/30">
          <Avatar name={authorName} />
          <span className="text-sm text-gitbase-text-primary font-medium">{authorName}</span>
          <span className="text-xs text-gitbase-text-secondary">
            opened this {formatRelativeTime(createdAt ?? 0)}
          </span>
        </div>
        <div className="px-5 py-4">
          {description?.trim()
            ? <MarkdownView source={description} />
            : <span className="text-sm text-gitbase-text-secondary italic">No description provided.</span>}
        </div>
      </div>

      {loading && <div className="text-sm text-gitbase-text-secondary">Loading comments…</div>}
      {error && <div className="text-sm text-red-400">{error}</div>}

      {comments.map(comment => (
        <div key={comment.id} className="rounded-lg border border-gitbase-border-dark/30 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-gitbase-surface-dark/80 border-b border-gitbase-border-dark/30">
            <Avatar name={comment.author?.username ?? 'U'} />
            <span className="text-sm text-gitbase-text-primary font-medium">
              {comment.author?.username ?? 'unknown'}
            </span>
            <span className="text-xs text-gitbase-text-secondary">
              commented {formatRelativeTime(comment.createdAt ?? 0)}
            </span>
          </div>
          <div className="px-5 py-4">
            <MarkdownView source={comment.body} />
          </div>
        </div>
      ))}

      {/* Composer */}
      <form onSubmit={post} className="rounded-lg border border-gitbase-border-dark/30 bg-gitbase-surface-dark/60 p-3 space-y-2">
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Leave a comment (Markdown supported)"
          rows={4}
          className="w-full px-3 py-2 rounded-md bg-gitbase-surface-dark border border-gitbase-border-dark/30 text-sm text-gitbase-text-primary placeholder:text-gitbase-text-secondary focus:outline-none focus:border-gitbase-primary/50"
        />
        {postError && <div className="text-sm text-red-400">{postError}</div>}
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
  );
}
