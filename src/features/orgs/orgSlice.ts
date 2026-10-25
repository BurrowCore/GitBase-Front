import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { orgService } from '../../services/orgService';
import type {
    CreateTeamPayload,
    Organization,
    OrganizationSummary,
    Team,
    TeamRepository,
    UpdateOrganizationPayload,
    UpdateTeamPayload,
    UserSummary,
} from '../../types/org';

const messageOf = (err: unknown, fallback: string) =>
    (err as { message?: string } | null)?.message ?? fallback;

/** Wraps a service call so failures become `rejectWithValue(message)`. */
const thunk = <A, R>(type: string, run: (args: A) => Promise<R>, fallback: string) =>
    createAsyncThunk<R, A, { rejectValue: string }>(type, async (args, { rejectWithValue }) => {
        try {
            return await run(args);
        } catch (err) {
            return rejectWithValue(messageOf(err, fallback));
        }
    });

type OrgArgs = { org: string };
type TeamArgs = OrgArgs & { team: string };

export const fetchMyOrganizations = thunk('orgs/mine', () => orgService.mine(), 'Failed to load organizations');
export const fetchOrganization = thunk('orgs/get', (a: OrgArgs) => orgService.get(a.org), 'Organization not found');
export const updateOrganization = thunk('orgs/update',
    (a: OrgArgs & { changes: UpdateOrganizationPayload }) => orgService.update(a.org, a.changes), 'Update failed');
export const fetchMembers = thunk('orgs/members', (a: OrgArgs) => orgService.members(a.org), 'Failed to load members');
export const removeMember = thunk('orgs/removeMember',
    async (a: OrgArgs & { username: string }) => { await orgService.removeMember(a.org, a.username); return a.username; },
    'Could not remove member');

export const fetchTeams = thunk('orgs/teams', (a: OrgArgs) => orgService.teams(a.org), 'Failed to load teams');
export const createTeam = thunk('orgs/createTeam',
    (a: OrgArgs & { team: CreateTeamPayload }) => orgService.createTeam(a.org, a.team), 'Could not create team');
export const fetchTeam = thunk('orgs/team', (a: TeamArgs) => orgService.team(a.org, a.team), 'Team not found');
export const updateTeam = thunk('orgs/updateTeam',
    (a: TeamArgs & { changes: UpdateTeamPayload }) => orgService.updateTeam(a.org, a.team, a.changes), 'Could not update team');
export const fetchTeamMembers = thunk('orgs/teamMembers',
    (a: TeamArgs) => orgService.teamMembers(a.org, a.team), 'Failed to load team members');
export const addTeamMember = thunk('orgs/addTeamMember',
    async (a: TeamArgs & { username: string }) => {
        await orgService.addTeamMember(a.org, a.team, a.username);
        return (await orgService.teamMembers(a.org, a.team)).items;
    }, 'Could not add member');
export const removeTeamMember = thunk('orgs/removeTeamMember',
    async (a: TeamArgs & { username: string }) => {
        await orgService.removeTeamMember(a.org, a.team, a.username);
        return a.username;
    }, 'Could not remove member');
export const fetchTeamRepositories = thunk('orgs/teamRepos',
    (a: TeamArgs) => orgService.teamRepositories(a.org, a.team), 'Failed to load team repositories');
export const addTeamRepository = thunk('orgs/addTeamRepo',
    async (a: TeamArgs & { repo: string }) => {
        await orgService.addTeamRepository(a.org, a.team, a.repo);
        return (await orgService.teamRepositories(a.org, a.team)).items;
    }, 'Could not add repository');
export const removeTeamRepository = thunk('orgs/removeTeamRepo',
    async (a: TeamArgs & { repo: string }) => {
        await orgService.removeTeamRepository(a.org, a.team, a.repo);
        return a.repo;
    }, 'Could not remove repository');

export interface OrgsState {
    mine: OrganizationSummary[];
    current: Organization | null;
    /** Name of the organization being shown; responses for any other are stale and ignored. */
    currentName: string | null;
    loading: boolean;
    error: string | null;
    members: UserSummary[];
    teams: Team[];
    team: Team | null;
    teamMembers: UserSummary[];
    teamRepositories: TeamRepository[];
    /** Error from a change (add/remove/update), shown next to the control. */
    actionError: string | null;
}

const initialState: OrgsState = {
    mine: [],
    current: null,
    currentName: null,
    loading: false,
    error: null,
    members: [],
    teams: [],
    team: null,
    teamMembers: [],
    teamRepositories: [],
    actionError: null,
};

const orgSlice = createSlice({
    name: 'orgs',
    initialState,
    reducers: {
        clearActionError(state) {
            state.actionError = null;
        },
    },
    extraReducers: (builder) => {
        const isCurrent = (state: OrgsState, org: string) => state.currentName === org;

        builder
            .addCase(fetchMyOrganizations.fulfilled, (state, action) => { state.mine = action.payload.items; })

            .addCase(fetchOrganization.pending, (state, action) => {
                if (state.currentName !== action.meta.arg.org) {
                    // A different organization: drop everything that belonged to the previous one.
                    Object.assign(state, { ...initialState, mine: state.mine });
                }
                state.currentName = action.meta.arg.org;
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrganization.fulfilled, (state, action) => {
                if (!isCurrent(state, action.meta.arg.org)) return;
                state.loading = false;
                state.current = action.payload;
            })
            .addCase(fetchOrganization.rejected, (state, action) => {
                if (!isCurrent(state, action.meta.arg.org)) return;
                state.loading = false;
                state.error = action.payload ?? 'Organization not found';
            })
            .addCase(updateOrganization.fulfilled, (state, action) => { state.current = action.payload; })

            .addCase(fetchMembers.fulfilled, (state, action) => {
                if (isCurrent(state, action.meta.arg.org)) state.members = action.payload.items;
            })
            .addCase(removeMember.fulfilled, (state, action) => {
                state.members = state.members.filter(m => m.username !== action.payload);
            })
            .addCase(fetchTeams.fulfilled, (state, action) => {
                if (isCurrent(state, action.meta.arg.org)) state.teams = action.payload.items;
            })
            .addCase(createTeam.fulfilled, (state, action) => { state.teams = [...state.teams, action.payload]; })

            .addCase(fetchTeam.pending, (state) => {
                state.team = null;
                state.teamMembers = [];
                state.teamRepositories = [];
            })
            .addCase(fetchTeam.fulfilled, (state, action) => { state.team = action.payload; })
            .addCase(fetchTeam.rejected, (state, action) => { state.error = action.payload ?? 'Team not found'; })
            .addCase(updateTeam.fulfilled, (state, action) => { state.team = action.payload; })
            .addCase(fetchTeamMembers.fulfilled, (state, action) => { state.teamMembers = action.payload.items; })
            .addCase(addTeamMember.fulfilled, (state, action) => { state.teamMembers = action.payload; })
            .addCase(removeTeamMember.fulfilled, (state, action) => {
                state.teamMembers = state.teamMembers.filter(m => m.username !== action.payload);
            })
            .addCase(fetchTeamRepositories.fulfilled, (state, action) => { state.teamRepositories = action.payload.items; })
            .addCase(addTeamRepository.fulfilled, (state, action) => { state.teamRepositories = action.payload; })
            .addCase(removeTeamRepository.fulfilled, (state, action) => {
                state.teamRepositories = state.teamRepositories.filter(r => r.name !== action.payload);
            });

        // Every change reports its failure the same way.
        for (const change of [updateOrganization, removeMember, createTeam, updateTeam, addTeamMember,
            removeTeamMember, addTeamRepository, removeTeamRepository]) {
            builder
                .addCase(change.pending, (state) => { state.actionError = null; })
                .addCase(change.rejected, (state, action) => {
                    state.actionError = (action.payload as string | undefined) ?? 'Action failed';
                });
        }
    },
});

export const { clearActionError } = orgSlice.actions;
export default orgSlice.reducer;
