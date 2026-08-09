import axiosInstance from '../axios/axiosInstance';
import type { ApiResponse } from '../types/api';
import type {
    createRepository,
    CreateRepositoryData,
    RepositoryTreeDto,
    RepositoryInfo,
    FileTreeNode,
    FileContent,
    DirectoryListing,
    CommitPage,
    CommitDetail,
    BranchSummary,
    Compare,
} from '../types/git';

export const gitService = {

    /** Create a new repository. Returns the suggested git commands + remote URL. */
    async createRepository(payload: createRepository): Promise<CreateRepositoryData> {
        try {
            const res = await axiosInstance.post<ApiResponse<CreateRepositoryData>>(
                '/web/gitbase/create',
                payload,
            );
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    /** List all repositories (with file trees) for a user. */
    async listRepositories(username: string): Promise<RepositoryTreeDto[]> {
        try {
            const res = await axiosInstance.get<ApiResponse<RepositoryTreeDto[]>>(
                `/web/gitbase/repositories/${username}`,
            );
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    /** Get metadata (last commit time, visibility) for a single repository. */
    async getRepositoryInfo(username: string, repoName: string): Promise<RepositoryInfo> {
        try {
            const res = await axiosInstance.get<ApiResponse<RepositoryInfo>>(
                `/web/gitbase/repo-info`,
                { params: { username, repoName } },
            );
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    /** GitHub-style listing of one directory level, with per-entry last commit. */
    async listContents(
        username: string,
        repoName: string,
        path?: string,
        ref?: string,
    ): Promise<DirectoryListing> {
        try {
            const params: Record<string, string> = {};
            if (path) params.path = path;
            if (ref) params.ref = ref;
            const res = await axiosInstance.get<ApiResponse<DirectoryListing>>(
                `/web/gitbase/${username}/${repoName}/contents`,
                { params },
            );
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    /** Three-way comparison of two refs (ahead/behind, added commits, diff). */
    async compare(username: string, repoName: string, base: string, head: string): Promise<Compare> {
        try {
            const res = await axiosInstance.get<ApiResponse<Compare>>(
                `/web/gitbase/${username}/${repoName}/compare`,
                { params: { base, head } },
            );
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    /** Live list of local branches with their head commit. */
    async listBranches(username: string, repoName: string): Promise<BranchSummary[]> {
        try {
            const res = await axiosInstance.get<ApiResponse<BranchSummary[]>>(
                `/web/gitbase/${username}/${repoName}/branches`,
            );
            return res.data.data ?? [];
        } catch (error) {
            throw this.handleError(error);
        }
    },

    /** Paginated commit history for a ref (optionally filtered to a path). */
    async listCommits(
        username: string,
        repoName: string,
        opts: { ref?: string; path?: string; page?: number; size?: number } = {},
    ): Promise<CommitPage> {
        try {
            const params: Record<string, string | number> = {};
            if (opts.ref) params.ref = opts.ref;
            if (opts.path) params.path = opts.path;
            if (opts.page != null) params.page = opts.page;
            if (opts.size != null) params.size = opts.size;
            const res = await axiosInstance.get<ApiResponse<CommitPage>>(
                `/web/gitbase/${username}/${repoName}/commits`,
                { params },
            );
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    /** Full metadata + per-file diff for a single commit. */
    async getCommitDetail(username: string, repoName: string, sha: string): Promise<CommitDetail> {
        try {
            const res = await axiosInstance.get<ApiResponse<CommitDetail>>(
                `/web/gitbase/${username}/${repoName}/commits/${sha}`,
            );
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    /** Get the file tree of a single repository at an optional ref (branch/tag/SHA). */
    async getTree(username: string, repoName: string, ref?: string): Promise<FileTreeNode> {
        try {
            const res = await axiosInstance.get<ApiResponse<FileTreeNode>>(
                `/web/gitbase/${username}/${repoName}/tree`,
                { params: ref ? { ref } : {} },
            );
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    /** Get the raw content of a single file at an optional ref. */
    async getFileContent(username: string, repoName: string, path: string, ref?: string): Promise<FileContent> {
        try {
            const res = await axiosInstance.get<ApiResponse<FileContent>>(
                `/web/gitbase/${username}/${repoName}/blob`,
                { params: ref ? { path, ref } : { path } },
            );
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    /**
     * Fetch a file's raw bytes as a Blob (image preview, download).
     *
     * Goes through axios rather than pointing an `<img src>` straight at the endpoint: auth is a
     * cross-origin HttpOnly cookie, which a plain image request would not send, and this way the
     * 401-refresh interceptor still applies.
     */
    async getRawBlob(username: string, repoName: string, path: string, ref?: string): Promise<Blob> {
        try {
            const res = await axiosInstance.get<Blob>(
                `/web/gitbase/${username}/${repoName}/raw`,
                { params: ref ? { path, ref } : { path }, responseType: 'blob' },
            );
            return res.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    /** Download a file to disk via a temporary object URL. */
    async downloadFile(username: string, repoName: string, path: string, ref?: string): Promise<void> {
        const blob = await this.getRawBlob(username, repoName, path, ref);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = path.split('/').pop() ?? 'download';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    },

    /** Delete a repository the current user owns. */
    async deleteRepository(username: string, repoName: string): Promise<void> {
        try {
            await axiosInstance.delete(`/web/gitbase/${username}/${repoName}`);
        } catch (error) {
            throw this.handleError(error);
        }
    },

    handleError(error: any): Error {
        if (error.response?.data?.message) {
            return new Error(error.response.data.message);
        } else if (error.message) {
            return new Error(error.message);
        } else {
            return new Error('An unexpected error occurred');
        }
    },
};
