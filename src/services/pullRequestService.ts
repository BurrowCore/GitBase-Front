import axiosInstance from '../axios/axiosInstance';
import type { ApiResponse } from '../types/api';
import type { Compare } from '../types/git';
import type {
    Comment,
    CommentPage,
    CreatePullRequestPayload,
    MergeConflictError,
    MergePullRequestPayload,
    MergeResult,
    PullRequest,
    PullRequestFilter,
    PullRequestPage,
    PullSuggestion,
} from '../types/pullRequest';

const base = (username: string, repoName: string) =>
    `/web/gitbase/${username}/${repoName}/pulls`;

export const pullRequestService = {

    /** List pull requests, filtered by state (defaults to OPEN on the backend). */
    async list(
        username: string,
        repoName: string,
        opts: { state?: PullRequestFilter; page?: number; size?: number } = {},
    ): Promise<PullRequestPage> {
        try {
            const params: Record<string, string | number> = {};
            if (opts.state) params.state = opts.state;
            if (opts.page != null) params.page = opts.page;
            if (opts.size != null) params.size = opts.size;
            const res = await axiosInstance.get<ApiResponse<PullRequestPage>>(
                base(username, repoName), { params },
            );
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    /**
     * Branches pushed recently that have no open pull request yet. Computed live from git refs,
     * so a branch created over the CLI shows up without any explicit sync.
     */
    async suggestions(username: string, repoName: string): Promise<PullSuggestion[]> {
        try {
            const res = await axiosInstance.get<ApiResponse<PullSuggestion[]>>(
                `${base(username, repoName)}/suggestions`,
            );
            return res.data.data ?? [];
        } catch (error) {
            throw this.handleError(error);
        }
    },

    async create(
        username: string,
        repoName: string,
        payload: CreatePullRequestPayload,
    ): Promise<PullRequest> {
        try {
            const res = await axiosInstance.post<ApiResponse<PullRequest>>(
                base(username, repoName), payload,
            );
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    async get(username: string, repoName: string, number: number): Promise<PullRequest> {
        try {
            const res = await axiosInstance.get<ApiResponse<PullRequest>>(
                `${base(username, repoName)}/${number}`,
            );
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    /** Three-way diff — same shape as the repository compare endpoint. */
    async diff(username: string, repoName: string, number: number): Promise<Compare> {
        try {
            const res = await axiosInstance.get<ApiResponse<Compare>>(
                `${base(username, repoName)}/${number}/diff`,
            );
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    async merge(
        username: string,
        repoName: string,
        number: number,
        payload: MergePullRequestPayload = {},
    ): Promise<MergeResult> {
        try {
            const res = await axiosInstance.post<ApiResponse<MergeResult>>(
                `${base(username, repoName)}/${number}/merge`, payload,
            );
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    async close(username: string, repoName: string, number: number): Promise<PullRequest> {
        try {
            const res = await axiosInstance.post<ApiResponse<PullRequest>>(
                `${base(username, repoName)}/${number}/close`,
            );
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    async reopen(username: string, repoName: string, number: number): Promise<PullRequest> {
        try {
            const res = await axiosInstance.post<ApiResponse<PullRequest>>(
                `${base(username, repoName)}/${number}/reopen`,
            );
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    async listComments(
        username: string,
        repoName: string,
        number: number,
        opts: { page?: number; size?: number } = {},
    ): Promise<CommentPage> {
        try {
            const params: Record<string, number> = {};
            if (opts.page != null) params.page = opts.page;
            if (opts.size != null) params.size = opts.size;
            const res = await axiosInstance.get<ApiResponse<CommentPage>>(
                `${base(username, repoName)}/${number}/comments`, { params },
            );
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    async addComment(
        username: string,
        repoName: string,
        number: number,
        body: string,
    ): Promise<Comment> {
        try {
            const res = await axiosInstance.post<ApiResponse<Comment>>(
                `${base(username, repoName)}/${number}/comments`, { body },
            );
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    /**
     * Normalises API errors. A 409 from the merge endpoint carries the conflicting paths in
     * `data`, so those are attached to the Error for the UI to list.
     */
    handleError(error: any): Error {
        const status = error?.response?.status;
        const payload = error?.response?.data;
        const message = payload?.message ?? error?.message ?? 'An unexpected error occurred';

        if (status === 409) {
            const conflictError = new Error(message) as MergeConflictError;
            conflictError.conflicts = Array.isArray(payload?.data) ? payload.data : [];
            return conflictError;
        }
        return new Error(message);
    },
};
