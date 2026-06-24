/**
 * Payload returned in `data` by /auth/login, /auth/google and /auth/refreshToken.
 *
 * NOTE: access/refresh tokens are delivered as HttpOnly cookies, NOT in the body.
 * Do not expect token strings here.
 */
export interface AuthResponse {
  expiresIn: number;
  user: UserInfo;
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  fullName: string;
}

export interface OAuthUrlResponse {
  authorizationUrl: string;
  state: string;
}

export interface UserInfo {
  id: string;
  fullName: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
  roles: Role[];
}

export interface Role {
  id: number;
  roleName: string;
}

export interface User {
  id: string;
  fullName: string;
  name: string;
  email: string;
  googleId?: string;
  profilePictureUrl?: string;
  authProvider: AuthProvider;
  roles: Role[];
  emailVerified: boolean;
  accountLocked: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  password?: string;
  enabled: boolean;
}

export interface RefreshToken {
  id: number;
  token: string;
  expiryDate: string;
  user: User;
}

// Union instead of enum so the type is fully erasable (tsconfig: erasableSyntaxOnly).
export type AuthProvider = 'LOCAL' | 'GOOGLE';

// Canonical envelope lives in ./api — re-exported here for backward-compatible imports.
export type { ApiResponse } from './api';