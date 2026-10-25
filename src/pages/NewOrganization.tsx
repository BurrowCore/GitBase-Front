import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../components/Organization/PageShell';
import { fetchMyOrganizations } from '../features/orgs/orgSlice';
import { useAppDispatch } from '../features/store';
import { orgService } from '../services/orgService';

const NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,38}$/;

/** Create an organization; the creator becomes its first owner. */
const NewOrganization: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [fullName, setFullName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const valid = NAME_PATTERN.test(name);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const org = await orgService.create({
        name, fullName: fullName.trim() || undefined, description: description.trim() || undefined,
      });
      dispatch(fetchMyOrganizations(undefined));
      navigate(`/orgs/${org.name}`);
    } catch (err: any) {
      setError(err.message ?? 'Could not create the organization');
    } finally {
      setSubmitting(false);
    }
  };

  const input = 'w-full px-3 py-2 rounded-md bg-gitbase-surface-dark border border-gitbase-border-dark/30 text-sm text-gitbase-text-primary placeholder:text-gitbase-text-secondary focus:outline-none focus:border-gitbase-primary/50';

  return (
    <PageShell>
      <h1 className="text-2xl text-white font-semibold mb-1">New organization</h1>
      <p className="text-sm text-gitbase-text-secondary mb-5">
        Organizations own repositories together. You become its first owner; add people by putting them in teams.
      </p>
      <form onSubmit={submit} className="space-y-3 max-w-xl">
        <div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Organization name"
                 aria-label="Organization name" maxLength={39} className={input} />
          <p className="text-xs text-gitbase-text-secondary mt-1">
            Used in URLs: <code>/{name.toLowerCase() || 'name'}/repository</code>. Letters, digits, <code>. _ -</code>; shared with usernames.
          </p>
        </div>
        <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Display name (optional)"
               aria-label="Display name" maxLength={255} className={input} />
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)"
                  aria-label="Description" maxLength={500} rows={3} className={input} />
        {error && <div className="text-sm text-red-400">{error}</div>}
        <button type="submit" disabled={!valid || submitting}
                className="px-4 py-2 rounded-lg bg-gitbase-primary text-white text-sm font-medium disabled:opacity-40 hover:opacity-90">
          {submitting ? 'Creating…' : 'Create organization'}
        </button>
      </form>
    </PageShell>
  );
};

export default NewOrganization;
