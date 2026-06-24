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
