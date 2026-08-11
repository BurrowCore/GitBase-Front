import { useState } from 'react';
import { issueService } from '../../services/issueService';
import type { Label } from '../../types/issue';
import { LabelChip } from './LabelChip';

interface NewIssueFormProps {
  username: string;
  repo: string;
  labels: Label[];
  onCreated: (number: number) => void;
  onCancel: () => void;
}

/** Open-an-issue form with inline label selection. */
export function NewIssueForm({ username, repo, labels, onCreated, onCancel }: NewIssueFormProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLabel = (name: string) =>
    setSelected(prev => (prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await issueService.create(username, repo, {
        title: title.trim(),
        body: body.trim() || undefined,
        labels: selected.length ? selected : undefined,
      });
      onCreated(created.number);
    } catch (err: any) {
      setError(err.message ?? 'Failed to create issue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title"
        maxLength={255}
        className="w-full px-3 py-2 rounded-md bg-gitbase-surface-dark border border-gitbase-border-dark/30 text-sm text-gitbase-text-primary placeholder:text-gitbase-text-secondary focus:outline-none focus:border-gitbase-primary/50"
      />
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Leave a description (Markdown supported)"
        rows={10}
        className="w-full px-3 py-2 rounded-md bg-gitbase-surface-dark border border-gitbase-border-dark/30 text-sm text-gitbase-text-primary placeholder:text-gitbase-text-secondary focus:outline-none focus:border-gitbase-primary/50 font-mono"
      />

      {labels.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gitbase-text-secondary">Labels:</span>
          {labels.map(label => (
            <LabelChip
              key={label.name}
              label={label}
              active={selected.includes(label.name)}
              onClick={() => toggleLabel(label.name)}
            />
          ))}
        </div>
      )}

      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={!title.trim() || submitting}
          className="px-4 py-2 rounded-lg bg-gitbase-primary text-white text-sm font-medium disabled:opacity-40 hover:opacity-90"
        >
          {submitting ? 'Creating…' : 'Submit new issue'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-white/5 text-gitbase-text-primary text-sm hover:bg-white/10"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
