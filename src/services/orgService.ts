import axiosInstance from '../axios/axiosInstance';
import type { ApiResponse } from '../types/api';
import type {
    CreateOrganizationPayload,
    CreateTeamPayload,
    Organization,
    OrganizationSummary,
    Page,
    Team,
    TeamRepository,
    UpdateOrganizationPayload,
    UpdateTeamPayload,
    UserSummary,
} from '../types/org';

const orgBase = (org: string) => `/web/gitbase/orgs/${encodeURIComponent(org)}`;
const teamBase = (org: string, team: string) => `${orgBase(org)}/teams/${encodeURIComponent(team)}`;

/** Unwraps the ApiResponse envelope, normalising errors to `Error(message)`. */
async function call<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> {
    try {
        return (await request).data.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message ?? error?.message ?? 'An unexpected error occurred');
    }
}

const pageParams = (page = 0, size = 30) => ({ params: { page, size } });

export const orgService = {
    // ── organizations ──
    create: (payload: CreateOrganizationPayload) =>
        call<Organization>(axiosInstance.post('/web/gitbase/orgs', payload)),

    get: (org: string) => call<Organization>(axiosInstance.get(orgBase(org))),

    update: (org: string, payload: UpdateOrganizationPayload) =>
        call<Organization>(axiosInstance.patch(orgBase(org), payload)),

    /** Refused (409) while the organization still owns repositories. */
    remove: (org: string) => call<void>(axiosInstance.delete(orgBase(org))),

    mine: (page = 0) => call<Page<OrganizationSummary>>(axiosInstance.get('/web/gitbase/user/orgs', pageParams(page))),

    members: (org: string, page = 0) =>
        call<Page<UserSummary>>(axiosInstance.get(`${orgBase(org)}/members`, pageParams(page))),

    /** Removes the user from every team; refused (409) for the last owner. */
    removeMember: (org: string, username: string) =>
        call<void>(axiosInstance.delete(`${orgBase(org)}/members/${encodeURIComponent(username)}`)),

    // ── teams ──
    teams: (org: string, page = 0) => call<Page<Team>>(axiosInstance.get(`${orgBase(org)}/teams`, pageParams(page))),

    team: (org: string, team: string) => call<Team>(axiosInstance.get(teamBase(org, team))),

    createTeam: (org: string, payload: CreateTeamPayload) =>
        call<Team>(axiosInstance.post(`${orgBase(org)}/teams`, payload)),

    updateTeam: (org: string, team: string, payload: UpdateTeamPayload) =>
        call<Team>(axiosInstance.patch(teamBase(org, team), payload)),

    deleteTeam: (org: string, team: string) => call<void>(axiosInstance.delete(teamBase(org, team))),

    teamMembers: (org: string, team: string, page = 0) =>
        call<Page<UserSummary>>(axiosInstance.get(`${teamBase(org, team)}/members`, pageParams(page))),

    /** Adding someone to any team makes them a member — there is no invitation step. */
    addTeamMember: (org: string, team: string, username: string) =>
        call<void>(axiosInstance.put(`${teamBase(org, team)}/members/${encodeURIComponent(username)}`)),

    removeTeamMember: (org: string, team: string, username: string) =>
        call<void>(axiosInstance.delete(`${teamBase(org, team)}/members/${encodeURIComponent(username)}`)),

    teamRepositories: (org: string, team: string, page = 0) =>
        call<Page<TeamRepository>>(axiosInstance.get(`${teamBase(org, team)}/repos`, pageParams(page))),

    addTeamRepository: (org: string, team: string, repo: string) =>
        call<void>(axiosInstance.put(`${teamBase(org, team)}/repos/${encodeURIComponent(repo)}`)),

    removeTeamRepository: (org: string, team: string, repo: string) =>
        call<void>(axiosInstance.delete(`${teamBase(org, team)}/repos/${encodeURIComponent(repo)}`)),
};
