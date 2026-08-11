import axiosInstance from '../axios/axiosInstance';
import type { ApiResponse } from '../types/api';
import type { Comment, CommentPage } from '../types/pullRequest';
import type {
    CreateIssuePayload,
    CreateLabelPayload,
    Issue,
    IssueFilter,
    IssuePage,
    Label,
    UpdateIssuePayload,
} from '../types/issue';

const base = (username: string, repoName: string) =>
    `/web/gitbase/${username}/${repoName}/issues`;

export const issueService = {

    async list(
        username: string,
        repoName: string,
        opts: { state?: IssueFilter; label?: string; assignee?: string; search?: string; page?: number } = {},
    ): Promise<IssuePage> {
        try {
            const params: Record<string, string | number> = {};
            if (opts.state) params.state = opts.state;
            if (opts.label) params.label = opts.label;
            if (opts.assignee) params.assignee = opts.assignee;
            if (opts.search) params.search = opts.search;
            if (opts.page != null) params.page = opts.page;
            const res = await axiosInstance.get<ApiResponse<IssuePage>>(base(username, repoName), { params });
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    async create(username: string, repoName: string, payload: CreateIssuePayload): Promise<Issue> {
        try {
            const res = await axiosInstance.post<ApiResponse<Issue>>(base(username, repoName), payload);
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    async get(username: string, repoName: string, number: number): Promise<Issue> {
        try {
            const res = await axiosInstance.get<ApiResponse<Issue>>(`${base(username, repoName)}/${number}`);
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    /** Partial update — omitted fields are left unchanged. */
    async update(username: string, repoName: string, number: number, payload: UpdateIssuePayload): Promise<Issue> {
        try {
            const res = await axiosInstance.patch<ApiResponse<Issue>>(
                `${base(username, repoName)}/${number}`, payload,
            );
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    async close(username: string, repoName: string, number: number): Promise<Issue> {
        try {
            const res = await axiosInstance.post<ApiResponse<Issue>>(`${base(username, repoName)}/${number}/close`);
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    async reopen(username: string, repoName: string, number: number): Promise<Issue> {
        try {
            const res = await axiosInstance.post<ApiResponse<Issue>>(`${base(username, repoName)}/${number}/reopen`);
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    async listComments(username: string, repoName: string, number: number): Promise<CommentPage> {
        try {
            const res = await axiosInstance.get<ApiResponse<CommentPage>>(
                `${base(username, repoName)}/${number}/comments`,
            );
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    async addComment(username: string, repoName: string, number: number, body: string): Promise<Comment> {
        try {
            const res = await axiosInstance.post<ApiResponse<Comment>>(
                `${base(username, repoName)}/${number}/comments`, { body },
            );
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    // ── labels ──

    async listLabels(username: string, repoName: string): Promise<Label[]> {
        try {
            const res = await axiosInstance.get<ApiResponse<Label[]>>(`${base(username, repoName)}/labels`);
            return res.data.data ?? [];
        } catch (error) {
            throw this.handleError(error);
        }
    },

    /** Idempotent — saving an existing name recolours it. */
    async saveLabel(username: string, repoName: string, payload: CreateLabelPayload): Promise<Label> {
        try {
            const res = await axiosInstance.put<ApiResponse<Label>>(
                `${base(username, repoName)}/labels`, payload,
            );
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    async deleteLabel(username: string, repoName: string, name: string): Promise<void> {
        try {
            await axiosInstance.delete(`${base(username, repoName)}/labels`, { params: { name } });
        } catch (error) {
            throw this.handleError(error);
        }
    },

    handleError(error: any): Error {
        return new Error(error?.response?.data?.message ?? error?.message ?? 'An unexpected error occurred');
    },
};
