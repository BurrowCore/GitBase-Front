import axiosInstance from "../axios/axiosInstance";
import type { Token, TokenCreateRequest, TokenCreateResponse } from "../types/token";
import { formatDateTime } from "../utils/dateFormatter";

const baseUrl = '/web/gitbase/tokens';

export const tokenService = {

    async createToken(request: TokenCreateRequest): Promise<TokenCreateResponse> {
        console.log('Creating token with request:', request);

        const response = await axiosInstance.post<TokenCreateResponse>(
            baseUrl,
            request
        );

        console.log('Token created:', response.data);
        return response.data;
    },

    async listTokens(): Promise<Token[]> {
        const response = await axiosInstance.get<Token[]>(baseUrl);

        const formattedTokens = response.data.map(token => ({
            ...token,
            createdAt: formatDateTime(token.createdAt),
            expiresAt: formatDateTime(token.expiresAt)
        }));

        console.log('Fetched tokens:', formattedTokens);
        return formattedTokens;
    },

    async revokeToken(tokenId: string): Promise<void> {
        await axiosInstance.delete(`${baseUrl}/${tokenId}`);
    }
}