import axiosInstance from '../axios/axiosInstance';
import type { ApiResponse } from '../types/auth';
import type { createRepository, gitRepository } from '../types/git';


export const gitService = {

    async createRepository(gitRepository: createRepository): Promise<unknown> {
        try {
            const response = await axiosInstance.post<unknown>('/web/gitbase/create', gitRepository);

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    async listRepositories(username: string): Promise<any[]> {
        try {
            console.log('Listing repositories for user:', username);
            const resp = await axiosInstance.get<any[]>(`/web/gitbase/repositories/${username}`);
            return resp.data;
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
    }
}

