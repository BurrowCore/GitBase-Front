export interface TokenCreateRequest {
    name: string;
    scopes: string;
}

export interface TokenCreateResponse {
    token: string;
    note: string;
}

export interface Token {
    id: number;
    name: string;
    expiresAt: string;
    createdAt: string;
    scopes: string;
}