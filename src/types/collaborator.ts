import type { UserSummary } from './pullRequest';

/**
 * Repository access ladder. The owner is not represented here — ownership lives on the repository
 * and always outranks any grant.
 *
 * READ  — view a private repo, clone, open issues
 * WRITE — plus push, branch CRUD, merge pull requests
 * ADMIN — plus repository settings (deleting the repo and managing collaborators stay owner-only)
 */
export type RepositoryPermission = 'READ' | 'WRITE' | 'ADMIN';

export interface Collaborator {
    user: UserSummary;
    permission: RepositoryPermission;
    createdAt: number | null;
}
