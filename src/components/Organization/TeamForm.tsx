import { useState } from 'react';
import type { RepositoryPermission } from '../../types/collaborator';
import type { CreateTeamPayload } from '../../types/org';

interface TeamFormProps {
  onSubmit: (team: CreateTeamPayload) => void;
  onCancel: () => void;
}

const PERMISSIONS: { value: RepositoryPermission; hint: string }[] = [
  { value: 'READ', hint: 'View and clone, open issues' },
  { value: 'WRITE', hint: 'Also push, merge pull requests, manage branches' },
  { value: 'ADMIN', hint: 'Also change repository settings' },
];

/** Create-a-team form (owners only). */
export function TeamForm({ onSubmit, onCancel }: TeamFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permission, setPermission] = useState<RepositoryPermission>('READ');
  const [includesAllRepositories, setIncludesAll] = useState(false);
  const [canCreateOrgRepo, setCanCreate] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim() || undefined, permission,
      includesAllRepositories, canCreateOrgRepo });
  };

  const input = 'w-full px-3 py-2 rounded-md bg-gitbase-surface-dark border border-gitbase-border-dark/30 text-sm text-gitbase-text-primary placeholder:text-gitbase-text-secondary focus:outline-none focus:border-gitbase-primary/50';

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-gitbase-border-dark/30 bg-gitbase-surface-dark/60 p-4">
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Team name (letters, digits, . _ -)"
             aria-label="Team name" pattern="[A-Za-z0-9._\-]+" maxLength={100} className={input} />
      <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)"
             aria-label="Team description" maxLength={500} className={input} />

      <fieldset className="space-y-1">
        <legend className="text-xs uppercase tracking-wide text-gitbase-text-secondary mb-1">Permission</legend>
        {PERMISSIONS.map(p => (
          <label key={p.value} className="flex items-center gap-2 text-sm text-gitbase-text-primary">
            <input type="radio" name="permission" checked={permission === p.value} onChange={() => setPermission(p.value)} />
            <span className="font-medium">{p.value}</span>
            <span className="text-gitbase-text-secondary">— {p.hint}</span>
          </label>
        ))}
      </fieldset>

      <label className="flex items-center gap-2 text-sm text-gitbase-text-primary">
        <input type="checkbox" checked={includesAllRepositories} onChange={e => setIncludesAll(e.target.checked)} />
        Access to all repositories, including future ones
      </label>
      <label className="flex items-center gap-2 text-sm text-gitbase-text-primary">
        <input type="checkbox" checked={canCreateOrgRepo} onChange={e => setCanCreate(e.target.checked)} />
        Members may create repositories in the organization
      </label>

      <div className="flex gap-2">
        <button type="submit" disabled={!name.trim()}
                className="px-4 py-2 rounded-lg bg-gitbase-primary text-white text-sm font-medium disabled:opacity-40 hover:opacity-90">
          Create team
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-white/5 text-sm text-gitbase-text-primary hover:bg-white/10">
          Cancel
        </button>
      </div>
    </form>
  );
}
