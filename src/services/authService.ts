import axiosInstance from '../axios/axiosInstance';
import type {
  AuthResponse,
  LoginDTO,
  RegisterDTO,
  GoogleAuthRequest,
  OAuthUrlResponse,
  UserInfo,
  ApiResponse
} from '../types/auth';


export const authService = {
  // Login with email and password
  async login(credentials: LoginDTO): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      const authData = response.data.data;

      return authData;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Register new user
  async register(userData: RegisterDTO): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/register', userData);
      const authData = response.data.data;


      return authData;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Get Google OAuth URL and redirect
  async initiateGoogleLogin(): Promise<void> {
    try {
      const response = await axiosInstance.get<ApiResponse<OAuthUrlResponse>>('/auth/oauth2/google/url');
      const { authorizationUrl } = response.data.data;
      // Redirect to Google OAuth URL
      window.location.href = authorizationUrl;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Legacy Google OAuth login (keeping for backward compatibility if needed)
  async googleLogin(idToken: string): Promise<AuthResponse> {
    try {
      const googleAuthRequest: GoogleAuthRequest = { idToken };
      const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/oauth2/authorize/google', googleAuthRequest);
      const authData = response.data.data;


      return authData;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Get Google OAuth URL (keeping for compatibility)
  async getGoogleOAuthUrl(): Promise<OAuthUrlResponse> {
    try {
      const response = await axiosInstance.get<ApiResponse<OAuthUrlResponse>>('/auth/oauth2/google/url');
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Get current user info
  async getCurrentUser(): Promise<UserInfo> {
    try {
      const response = await axiosInstance.get<ApiResponse<UserInfo>>('/auth/profile-info');
      return response.data.data;
    } catch (error) {
      // If there's an error, clear any stale auth state
      localStorage.removeItem('authState');
      throw this.handleError(error);
    }
  },

  // Refresh access token
  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/refreshToken');
      const authData = response.data.data
      return authData;
    } catch (error) {

      throw this.handleError(error);
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {

    }
  },


  // Error handler
  handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    } else if (error.message) {
      return new Error(error.message);
    } else {
      return new Error('An unexpected error occurred');
    }
  }
};

export default authService; 