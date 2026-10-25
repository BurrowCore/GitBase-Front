/**
 * Organization & team types. Curated mirrors of the backend DTOs — see `backend/docs/openapi.yaml`.
 *
 * An organization shares the user namespace, so its repositories live at the ordinary
 * `/gitbase/:owner/:repo` routes.
 */
import type { UserSummary } from './pullRequest';
import type { RepositoryPermission } from './collaborator';

export interface Organization {
    name: string;
    fullName: string | null;
    description: string | null;
    createdAt: number | null;
    repositoryCount: number;
    viewerIsMember: boolean;
    viewerIsOwner: boolean;
    viewerCanCreateRepository: boolean;
}

export interface OrganizationSummary {
    name: string;
    fullName: string | null;
    description: string | null;
    viewerIsOwner: boolean;
    viewerCanCreateRepository: boolean;
}

export interface Team {
    name: string;
    description: string | null;
    permission: RepositoryPermission;
    includesAllRepositories: boolean;
    canCreateOrgRepo: boolean;
    /** The Owners team: its members own the organization; it cannot be deleted or re-permissioned. */
    ownerTeam: boolean;
    membersCount: number;
    repositoriesCount: number;
}

export interface TeamRepository {
    name: string;
    visibility: 'public' | 'private';
}

export interface Page<T> {
    items: T[];
    page: number;
    size: number;
    totalElements: number;
    hasNext: boolean;
}

export interface CreateOrganizationPayload {
    name: string;
    fullName?: string;
    description?: string;
}

export interface UpdateOrganizationPayload {
    fullName?: string;
    description?: string;
}

export interface CreateTeamPayload {
    name: string;
    description?: string;
    permission: RepositoryPermission;
    includesAllRepositories: boolean;
    canCreateOrgRepo: boolean;
}

export type UpdateTeamPayload = Partial<CreateTeamPayload>;

export type { UserSummary };
