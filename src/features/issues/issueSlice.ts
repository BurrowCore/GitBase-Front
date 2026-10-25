import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { issueService } from '../../services/issueService';
import type {
    Issue,
    IssueFilter,
    IssuePage,
    IssueRef,
    IssueTemplates,
    Label,
    UpdateIssuePayload,
} from '../../types/issue';

interface RepoRef {
    username: string;
    repo: string;
}

type IssueRefArgs = RepoRef & { number: number };

/** Message of a rejected thunk, with a fallback. */
const messageOf = (err: unknown, fallback: string) =>
    (err as { message?: string } | null)?.message ?? fallback;

/** List query. The filters live in the slice, so the page passes them explicitly. */
export const fetchIssues = createAsyncThunk(
    'issues/fetchList',
    async (
        args: RepoRef & { state: IssueFilter; label: string | null; search: string; page: number },
        { rejectWithValue },
    ) => {
        try {
            return await issueService.list(args.username, args.repo, {
                state: args.state,
                label: args.label ?? undefined,
                search: args.search.trim() || undefined,
                page: args.page,
            });
        } catch (err) {
            return rejectWithValue(messageOf(err, 'Failed to load issues'));
        }
    },
);

export const fetchLabels = createAsyncThunk('issues/fetchLabels', async (args: RepoRef) => {
    // Labels are decoration: a failure leaves the list empty rather than breaking the page.
    return issueService.listLabels(args.username, args.repo).catch((): Label[] => []);
});

export const fetchIssue = createAsyncThunk('issues/fetchOne', async (args: IssueRefArgs, { rejectWithValue }) => {
    try {
        return await issueService.get(args.username, args.repo, args.number);
    } catch (err) {
        return rejectWithValue(messageOf(err, 'Failed to load issue'));
    }
});

export const closeIssue = createAsyncThunk('issues/close', async (args: IssueRefArgs, { rejectWithValue }) => {
    try {
        return await issueService.close(args.username, args.repo, args.number);
    } catch (err) {
        return rejectWithValue(messageOf(err, 'Failed to close issue'));
    }
});

export const reopenIssue = createAsyncThunk('issues/reopen', async (args: IssueRefArgs, { rejectWithValue }) => {
    try {
        return await issueService.reopen(args.username, args.repo, args.number);
    } catch (err) {
        return rejectWithValue(messageOf(err, 'Failed to reopen issue'));
    }
});

export const updateIssue = createAsyncThunk(
    'issues/update',
    async (args: IssueRefArgs & { changes: UpdateIssuePayload }, { rejectWithValue }) => {
        try {
            return await issueService.update(args.username, args.repo, args.number, args.changes);
        } catch (err) {
            return rejectWithValue(messageOf(err, 'Could not update issue'));
        }
    },
);

/** Both directions at once — the sidebar shows "blocked by" and "blocks" together. */
export const fetchDependencies = createAsyncThunk(
    'issues/fetchDependencies',
    async (args: IssueRefArgs, { rejectWithValue }) => {
        try {
            const [blockedBy, blocks] = await Promise.all([
                issueService.listDependencies(args.username, args.repo, args.number),
                issueService.listBlocks(args.username, args.repo, args.number),
            ]);
            return { blockedBy: blockedBy.issues, blocks: blocks.issues };
        } catch (err) {
            return rejectWithValue(messageOf(err, 'Failed to load dependencies'));
        }
    },
);

export const addDependency = createAsyncThunk(
    'issues/addDependency',
    async (args: IssueRefArgs & { dependency: number }, { rejectWithValue }) => {
        try {
            return await issueService.addDependency(args.username, args.repo, args.number, args.dependency);
        } catch (err) {
            return rejectWithValue(messageOf(err, 'Could not add dependency'));
        }
    },
);

export const removeDependency = createAsyncThunk(
    'issues/removeDependency',
    async (args: IssueRefArgs & { dependency: number }, { rejectWithValue }) => {
        try {
            await issueService.removeDependency(args.username, args.repo, args.number, args.dependency);
            return args.dependency;
        } catch (err) {
            return rejectWithValue(messageOf(err, 'Could not remove dependency'));
        }
    },
);

export const fetchTemplates = createAsyncThunk('issues/fetchTemplates', async (args: RepoRef) => {
    // No templates is a normal state; so is a failure to read them — fall back to a blank issue.
    return issueService.getTemplates(args.username, args.repo).catch((): IssueTemplates => ({
        templates: [], blankIssuesEnabled: true, contactLinks: [], errors: [],
    }));
});

export interface IssuesState {
    /** "owner/repo" whose list state this is; entering another repository resets it. */
    repoKey: string | null;
    page: IssuePage | null;
    listLoading: boolean;
    listError: string | null;
    filter: IssueFilter;
    labelFilter: string | null;
    search: string;
    pageNum: number;
    labels: Label[];

    current: Issue | null;
    /**
     * The issue the page is showing now. Responses for any other number are stale (the user
     * navigated on before they arrived) and are ignored.
     */
    currentNumber: number | null;
    currentLoading: boolean;
    currentError: string | null;
    /** Error from close/reopen/edit, kept separate from load errors. */
    actionError: string | null;

    blockedBy: IssueRef[];
    blocks: IssueRef[];
    dependencyError: string | null;

    /** null until fetched for the current repository. */
    templates: IssueTemplates | null;
}

const initialState: IssuesState = {
    repoKey: null,
    page: null,
    listLoading: false,
    listError: null,
    filter: 'OPEN',
    labelFilter: null,
    search: '',
    pageNum: 0,
    labels: [],
    current: null,
    currentNumber: null,
    currentLoading: false,
    currentError: null,
    actionError: null,
    blockedBy: [],
    blocks: [],
    dependencyError: null,
    templates: null,
};

const issueSlice = createSlice({
    name: 'issues',
    initialState,
    reducers: {
        // Changing any filter returns to the first page.
        setFilter(state, action: PayloadAction<IssueFilter>) {
            state.filter = action.payload;
            state.pageNum = 0;
        },
        setLabelFilter(state, action: PayloadAction<string | null>) {
            state.labelFilter = action.payload;
            state.pageNum = 0;
        },
        setSearch(state, action: PayloadAction<string>) {
            state.search = action.payload;
            state.pageNum = 0;
        },
        setPageNum(state, action: PayloadAction<number>) {
            state.pageNum = Math.max(0, action.payload);
        },
        /**
         * Entering a repository's issues. Filters, labels and templates survive a round trip to an
         * issue and back, but are dropped when the repository changes.
         */
        enterRepository(state, action: PayloadAction<string>) {
            if (state.repoKey === action.payload) return state;
            return { ...initialState, repoKey: action.payload };
        },
        clearCurrent(state) {
            state.current = null;
            state.currentNumber = null;
            state.currentError = null;
            state.actionError = null;
            state.blockedBy = [];
            state.blocks = [];
            state.dependencyError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchIssues.pending, (state) => {
                state.listLoading = true;
                state.listError = null;
            })
            .addCase(fetchIssues.fulfilled, (state, action) => {
                state.listLoading = false;
                state.page = action.payload;
            })
            .addCase(fetchIssues.rejected, (state, action) => {
                state.listLoading = false;
                state.listError = (action.payload as string) ?? 'Failed to load issues';
            })
            .addCase(fetchLabels.fulfilled, (state, action) => {
                state.labels = action.payload;
            })
            .addCase(fetchTemplates.fulfilled, (state, action) => {
                state.templates = action.payload;
            })

            .addCase(fetchIssue.pending, (state, action) => {
                state.currentNumber = action.meta.arg.number;
                state.currentLoading = true;
                state.currentError = null;
            })
            .addCase(fetchIssue.fulfilled, (state, action) => {
                if (action.meta.arg.number !== state.currentNumber) return; // stale
                state.currentLoading = false;
                state.current = action.payload;
            })
            .addCase(fetchIssue.rejected, (state, action) => {
                if (action.meta.arg.number !== state.currentNumber) return; // stale
                state.currentLoading = false;
                state.currentError = (action.payload as string) ?? 'Failed to load issue';
            })

            .addCase(fetchDependencies.fulfilled, (state, action) => {
                if (action.meta.arg.number !== state.currentNumber) return; // stale
                state.blockedBy = action.payload.blockedBy;
                state.blocks = action.payload.blocks;
                state.dependencyError = null;
            })
            .addCase(fetchDependencies.rejected, (state, action) => {
                if (action.meta.arg.number !== state.currentNumber) return; // stale
                state.dependencyError = (action.payload as string) ?? 'Failed to load dependencies';
            })
            .addCase(addDependency.pending, (state) => { state.dependencyError = null; })
            .addCase(addDependency.fulfilled, (state, action) => {
                if (action.meta.arg.number !== state.currentNumber) return; // stale
                state.blockedBy = [...state.blockedBy, action.payload].sort((a, b) => a.number - b.number);
            })
            .addCase(addDependency.rejected, (state, action) => {
                state.dependencyError = (action.payload as string) ?? 'Could not add dependency';
            })
            .addCase(removeDependency.pending, (state) => { state.dependencyError = null; })
            .addCase(removeDependency.fulfilled, (state, action) => {
                if (action.meta.arg.number !== state.currentNumber) return; // stale
                state.blockedBy = state.blockedBy.filter(ref => ref.number !== action.payload);
            })
            .addCase(removeDependency.rejected, (state, action) => {
                state.dependencyError = (action.payload as string) ?? 'Could not remove dependency';
            });

        // Close, reopen and edit all replace the current issue — unless the user has moved on.
        for (const thunk of [closeIssue, reopenIssue, updateIssue]) {
            builder
                .addCase(thunk.pending, (state) => { state.actionError = null; })
                .addCase(thunk.fulfilled, (state, action) => {
                    if (action.meta.arg.number !== state.currentNumber) return; // stale
                    state.current = action.payload;
                })
                .addCase(thunk.rejected, (state, action) => {
                    state.actionError = (action.payload as string) ?? 'Action failed';
                });
        }
    },
});

export const {
    setFilter, setLabelFilter, setSearch, setPageNum, enterRepository, clearCurrent,
} = issueSlice.actions;
export default issueSlice.reducer;
