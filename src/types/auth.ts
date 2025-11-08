export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
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

export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE'
}

export interface ApiResponse<T> {
  timestamp: string;
  success: boolean;
  message: string;
  httpStatus: string;
  data: T;
} 