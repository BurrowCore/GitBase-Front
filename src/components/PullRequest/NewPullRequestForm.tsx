import { useEffect, useState } from 'react';
import { gitService } from '../../services/gitService';
import { pullRequestService } from '../../services/pullRequestService';
import type { BranchSummary } from '../../types/git';
import type { Compare } from '../../types/git';

interface NewPullRequestFormProps {
  username: string;
  repo: string;
  onCreated: (number: number) => void;
  onCancel: () => void;
}

/** Branch-to-branch compare + open-a-pull-request form (US-001). */
export function NewPullRequestForm({ username, repo, onCreated, onCancel }: NewPullRequestFormProps) {
  const [branches, setBranches] = useState<BranchSummary[]>([]);
  const [target, setTarget] = useState('');
  const [source, setSource] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [preview, setPreview] = useState<Compare | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    gitService
      .listBranches(username, repo)
      .then(list => {
        if (!active) return;
        setBranches(list);
        const def = list.find(b => b.isDefault) ?? list[0];
        if (def) setTarget(prev => prev || def.name);
        const other = list.find(b => b.name !== def?.name);
        if (other) setSource(prev => prev || other.name);
      })
      .catch(err => { if (active) setError(err.message ?? 'Failed to load branches'); });
    return () => { active = false; };
  }, [username, repo]);

  // Live preview of what the pull request would contain.
  useEffect(() => {
    if (!source || !target || source === target) {
      setPreview(null);
      return;
    }
    let active = true;
    setPreviewLoading(true);
    gitService
      .compare(username, repo, target, source)
      .then(result => {
        if (!active) return;
        setPreview(result);
        // Seed the title from the single commit, the way GitHub does.
        if (result.commits.length === 1) {
          setTitle(prev => prev || result.commits[0].message.split('\n')[0]);
        }
      })
      .catch(() => { if (active) setPreview(null); })
      .finally(() => { if (active) setPreviewLoading(false); });
    return () => { active = false; };
  }, [username, repo, source, target]);

  const sameBranch = !!source && source === target;
  const canSubmit = !!title.trim() && !!source && !!target && !sameBranch && !submitting;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await pullRequestService.create(username, repo, {
        title: title.trim(),
        description: description.trim() || undefined,
        sourceBranch: source,
        targetBranch: target,
      });
      onCreated(created.number);
    } catch (err: any) {
      setError(err.message ?? 'Failed to create pull request');
    } finally {
      setSubmitting(false);
    }
  };

  const select = 'px-2.5 py-1.5 rounded-md bg-gitbase-surface-dark border border-gitbase-border-dark/30 text-sm text-gitbase-text-primary focus:outline-none focus:border-gitbase-primary/50';

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Branch pickers */}
      <div className="rounded-lg border border-gitbase-border-dark/30 bg-gitbase-surface-dark/60 px-4 py-3 flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gitbase-text-secondary">base:</span>
        <select value={target} onChange={e => setTarget(e.target.value)} className={select}>
          {branches.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
        </select>
        <span className="text-gitbase-text-secondary">←</span>
        <span className="text-sm text-gitbase-text-secondary">compare:</span>
        <select value={source} onChange={e => setSource(e.target.value)} className={select}>
          {branches.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
        </select>

        <span className="ml-auto text-xs text-gitbase-text-secondary">
          {previewLoading && 'Comparing…'}
          {!previewLoading && preview && (
            <>
              <span className="text-gitbase-text-primary">{preview.commits.length}</span> commit(s) ·{' '}
              <span className="text-gitbase-text-primary">{preview.files.length}</span> file(s) ·{' '}
              <span className="text-green-400">+{preview.totalAdditions}</span>{' '}
              <span className="text-red-400">−{preview.totalDeletions}</span>
            </>
          )}
        </span>
      </div>

      {sameBranch && (
        <div className="text-sm text-yellow-300">Source and target must be different branches.</div>
      )}
      {!sameBranch && preview && preview.commits.length === 0 && (
        <div className="text-sm text-yellow-300">
          These branches are identical — there is nothing to merge.
        </div>
      )}

      {/* Title + description */}
      <div className="space-y-3">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title"
          maxLength={255}
          className="w-full px-3 py-2 rounded-md bg-gitbase-surface-dark border border-gitbase-border-dark/30 text-sm text-gitbase-text-primary placeholder:text-gitbase-text-secondary focus:outline-none focus:border-gitbase-primary/50"
        />
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe your changes (Markdown supported)"
          rows={8}
          className="w-full px-3 py-2 rounded-md bg-gitbase-surface-dark border border-gitbase-border-dark/30 text-sm text-gitbase-text-primary placeholder:text-gitbase-text-secondary focus:outline-none focus:border-gitbase-primary/50 font-mono"
        />
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="px-4 py-2 rounded-lg bg-gitbase-primary text-white text-sm font-medium disabled:opacity-40 hover:opacity-90"
        >
          {submitting ? 'Creating…' : 'Create pull request'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-white/5 text-gitbase-text-primary text-sm hover:bg-white/10">
          Cancel
        </button>
      </div>
    </form>
  );
}
