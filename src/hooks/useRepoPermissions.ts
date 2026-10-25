import { useEffect, useState } from 'react';
import { gitService } from '../services/gitService';
import type { RepositoryPermissions } from '../types/git';

const NONE: RepositoryPermissions = { pull: false, push: false, admin: false, owner: false };

/**
 * The viewer's permissions on a repository (the `permissions` object of repo-info), for deciding
 * which controls to render. Starts as "nothing allowed" until the server answers, so a control is
 * never shown that the server would then refuse. The server enforces every check regardless.
 */
export function useRepoPermissions(username: string, repo: string): RepositoryPermissions {
  const [permissions, setPermissions] = useState<RepositoryPermissions>(NONE);

  useEffect(() => {
    if (!username || !repo) return;
    let cancelled = false;
    gitService
      .getRepositoryInfo(username, repo)
      .then(info => { if (!cancelled) setPermissions(info.permissions ?? NONE); })
      .catch(() => { if (!cancelled) setPermissions(NONE); });
    return () => { cancelled = true; };
  }, [username, repo]);

  return permissions;
}
