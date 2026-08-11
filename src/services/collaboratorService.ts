import axiosInstance from '../axios/axiosInstance';
import type { ApiResponse } from '../types/api';
import type { Collaborator, RepositoryPermission } from '../types/collaborator';

const base = (username: string, repoName: string) =>
    `/web/gitbase/${username}/${repoName}/collaborators`;

export const collaboratorService = {

    async list(username: string, repoName: string): Promise<Collaborator[]> {
        try {
            const res = await axiosInstance.get<ApiResponse<Collaborator[]>>(base(username, repoName));
            return res.data.data ?? [];
        } catch (error) {
            throw this.handleError(error);
        }
    },

    /** Adds the collaborator, or updates their permission. Owner-only; effective immediately. */
    async set(
        username: string,
        repoName: string,
        collaborator: string,
        permission: RepositoryPermission,
    ): Promise<Collaborator> {
        try {
            const res = await axiosInstance.put<ApiResponse<Collaborator>>(
                `${base(username, repoName)}/${collaborator}`, { permission },
            );
            return res.data.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    async remove(username: string, repoName: string, collaborator: string): Promise<void> {
        try {
            await axiosInstance.delete(`${base(username, repoName)}/${collaborator}`);
        } catch (error) {
            throw this.handleError(error);
        }
    },

    handleError(error: any): Error {
        return new Error(error?.response?.data?.message ?? error?.message ?? 'An unexpected error occurred');
    },
};
