import { useEffect, useState } from 'react';
import { gitService } from '../services/gitService';
import type { RepositoryTreeDto } from '../types/git';

/**
 * Repositories in a namespace (a user or an organization — they share one), as the viewer may
 * see them: the server already hides private repositories the viewer has no access to.
 */
export function useOwnerRepositories(owner: string) {
  const [repositories, setRepositories] = useState<RepositoryTreeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!owner) return;
    let cancelled = false;
    setLoading(true);
    gitService.listRepositories(owner)
      .then(list => { if (!cancelled) { setRepositories(list); setError(null); } })
      .catch(err => { if (!cancelled) setError(err.message ?? 'Failed to load repositories'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [owner]);

  return { repositories, loading, error };
}
