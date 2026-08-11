/**
 * Pull-request types. Curated mirrors of the backend DTOs — see `backend/docs/openapi.yaml`
 * (the contract source of truth) and the generated `api.gen.ts`.
 */

export type PullRequestState = 'OPEN' | 'CLOSED' | 'MERGED';

/** Filter accepted by the list endpoint. */
export type PullRequestFilter = PullRequestState | 'ALL';

export interface UserSummary {
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
}

export interface PullRequest {
    id: number;
    number: number;
    title: string;
    description: string | null;
    state: PullRequestState;
    sourceBranch: string;
    targetBranch: string;
    headSha: string | null;
    baseSha: string | null;
    author: UserSummary;
    mergedBy: UserSummary | null;
    mergeCommitSha: string | null;
    commitsCount: number;
    changedFilesCount: number;
    commentsCount: number;
    createdAt: number | null;   // epoch millis
    updatedAt: number | null;
    mergedAt: number | null;
    closedAt: number | null;
}

export interface PullRequestSummary {
    id: number;
    number: number;
    title: string;
    state: PullRequestState;
    sourceBranch: string;
    targetBranch: string;
    author: UserSummary;
    commentsCount: number;
    createdAt: number | null;
    updatedAt: number | null;
}

export interface PullRequestPage {
    pullRequests: PullRequestSummary[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    openCount: number;
    closedCount: number;
}

export interface CreatePullRequestPayload {
    title: string;
    description?: string;
    sourceBranch: string;
    targetBranch: string;
}

export interface MergePullRequestPayload {
    mergeMethod?: 'merge';
    commitMessage?: string;
}

export interface MergeResult {
    merged: boolean;
    sha: string;
    message: string;
}

export interface Comment {
    id: number;
    author: UserSummary;
    body: string;
    createdAt: number | null;
    updatedAt: number | null;
}

export interface CommentPage {
    comments: Comment[];
    page: number;
    size: number;
    totalElements: number;
    hasNext: boolean;
}

/** A recently-pushed branch with no open pull request (drives the "Compare & pull request" banner). */
export interface PullSuggestion {
    branch: string;
    commitSha: string;
    shortSha: string;
    lastCommitMessage: string | null;
    authorName: string | null;
    lastCommitAt: number; // epoch millis
}

/** A 409 from the merge endpoint: the message plus the conflicting paths. */
export interface MergeConflictError extends Error {
    conflicts: string[];
}
