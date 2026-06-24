import axiosInstance from "../axios/axiosInstance";
import type { ApiResponse } from "../types/api";
import type { Token, TokenCreateRequest, TokenCreateResponse } from "../types/token";
import { formatDateTime } from "../utils/dateFormatter";

const baseUrl = '/web/gitbase/tokens';

export const tokenService = {

    async createToken(request: TokenCreateRequest): Promise<TokenCreateResponse> {
        const res = await axiosInstance.post<ApiResponse<TokenCreateResponse>>(baseUrl, request);
        return res.data.data;
    },

    async listTokens(): Promise<Token[]> {
        const res = await axiosInstance.get<ApiResponse<Token[]>>(baseUrl);
        return res.data.data.map(token => ({
            ...token,
            createdAt: formatDateTime(token.createdAt),
            expiresAt: formatDateTime(token.expiresAt),
        }));
    },

    async revokeToken(tokenId: string): Promise<void> {
        await axiosInstance.delete(`${baseUrl}/${tokenId}`);
    },
};
