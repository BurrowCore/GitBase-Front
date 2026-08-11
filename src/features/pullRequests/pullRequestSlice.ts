import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { pullRequestService } from '../../services/pullRequestService';
import type {
    PullRequest,
    PullRequestFilter,
    PullRequestPage,
} from '../../types/pullRequest';

interface RepoRef {
    username: string;
    repo: string;
}

export const fetchPullRequests = createAsyncThunk(
    'pullRequests/fetchList',
    async (
        args: RepoRef & { state?: PullRequestFilter; page?: number },
        { rejectWithValue },
    ) => {
        try {
            return await pullRequestService.list(args.username, args.repo, {
                state: args.state,
                page: args.page,
            });
        } catch (err: any) {
            return rejectWithValue(err?.message ?? 'Failed to load pull requests');
        }
    },
);

export const fetchPullRequest = createAsyncThunk(
    'pullRequests/fetchOne',
    async (args: RepoRef & { number: number }, { rejectWithValue }) => {
        try {
            return await pullRequestService.get(args.username, args.repo, args.number);
        } catch (err: any) {
            return rejectWithValue(err?.message ?? 'Failed to load pull request');
        }
    },
);

export const closePullRequest = createAsyncThunk(
    'pullRequests/close',
    async (args: RepoRef & { number: number }, { rejectWithValue }) => {
        try {
            return await pullRequestService.close(args.username, args.repo, args.number);
        } catch (err: any) {
            return rejectWithValue(err?.message ?? 'Failed to close pull request');
        }
    },
);

export const reopenPullRequest = createAsyncThunk(
    'pullRequests/reopen',
    async (args: RepoRef & { number: number }, { rejectWithValue }) => {
        try {
            return await pullRequestService.reopen(args.username, args.repo, args.number);
        } catch (err: any) {
            return rejectWithValue(err?.message ?? 'Failed to reopen pull request');
        }
    },
);

interface PullRequestState {
    page: PullRequestPage | null;
    listLoading: boolean;
    listError: string | null;
    filter: PullRequestFilter;
    current: PullRequest | null;
    currentLoading: boolean;
    currentError: string | null;
    /** Error from a close/reopen action, kept separate from load errors. */
    actionError: string | null;
}

const initialState: PullRequestState = {
    page: null,
    listLoading: false,
    listError: null,
    filter: 'OPEN',
    current: null,
    currentLoading: false,
    currentError: null,
    actionError: null,
};

const pullRequestSlice = createSlice({
    name: 'pullRequests',
    initialState,
    reducers: {
        setFilter(state, action: PayloadAction<PullRequestFilter>) {
            state.filter = action.payload;
        },
        clearCurrent(state) {
            state.current = null;
            state.currentError = null;
            state.actionError = null;
        },
        /** Applied after a successful merge, which is dispatched from the detail page. */
        pullRequestUpdated(state, action: PayloadAction<PullRequest>) {
            state.current = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPullRequests.pending, (state) => {
                state.listLoading = true;
                state.listError = null;
            })
            .addCase(fetchPullRequests.fulfilled, (state, action) => {
                state.listLoading = false;
                state.page = action.payload;
            })
            .addCase(fetchPullRequests.rejected, (state, action) => {
                state.listLoading = false;
                state.listError = (action.payload as string) ?? 'Failed to load pull requests';
            })

            .addCase(fetchPullRequest.pending, (state) => {
                state.currentLoading = true;
                state.currentError = null;
            })
            .addCase(fetchPullRequest.fulfilled, (state, action) => {
                state.currentLoading = false;
                state.current = action.payload;
            })
            .addCase(fetchPullRequest.rejected, (state, action) => {
                state.currentLoading = false;
                state.currentError = (action.payload as string) ?? 'Failed to load pull request';
            });

        // Close and reopen both just replace the current pull request.
        for (const thunk of [closePullRequest, reopenPullRequest]) {
            builder
                .addCase(thunk.pending, (state) => { state.actionError = null; })
                .addCase(thunk.fulfilled, (state, action) => { state.current = action.payload; })
                .addCase(thunk.rejected, (state, action) => {
                    state.actionError = (action.payload as string) ?? 'Action failed';
                });
        }
    },
});

export const { setFilter, clearCurrent, pullRequestUpdated } = pullRequestSlice.actions;
export default pullRequestSlice.reducer;
