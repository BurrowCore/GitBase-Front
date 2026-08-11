import axios, { type InternalAxiosRequestConfig } from 'axios';
import { CSRF_HEADER, getCsrfToken, needsCsrfToken } from '../utils/csrf';

// Global state for token refresh management
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;
let logoutCallback: (() => void) | null = null;

const setLogoutCallback = (callback: () => void): void => {
    logoutCallback = callback;
};

const clearAuthData = (): void => {
    localStorage.removeItem('authState');
};

const performLogout = async (): Promise<void> => {
    try {
        // Use the auth instance for logout to avoid interceptor conflicts
        await authAxiosInstance.post('/auth/logout');
    } catch (logoutError) {
        console.error('Logout request failed:', logoutError);
    }

    clearAuthData();
    if (logoutCallback) {
        logoutCallback();
    }
};

// Create a separate axios instance for auth operations (no interceptors)
const authAxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8880/api/v1',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Main axios instance with interceptors for regular API calls
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8880/api/v1',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

/**
 * Attaches the CSRF token to state-changing requests.
 *
 * Axios has built-in XSRF support, but since v1.6 it only fires for same-origin requests — the SPA
 * (:5173) and the API (:8880) are different origins, so it never triggers here and every POST/PUT/
 * PATCH/DELETE was being rejected with a bare 403. Setting the header explicitly fixes that.
 */
const attachCsrfToken = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (needsCsrfToken(config.method)) {
        const token = getCsrfToken();
        if (token) {
            config.headers.set(CSRF_HEADER, token);
        }
    }
    return config;
};

axiosInstance.interceptors.request.use(attachCsrfToken);
authAxiosInstance.interceptors.request.use(attachCsrfToken);

// Helper function to check if request is auth-related
const isAuthRequest = (url: string): boolean => {
    return url.includes('/auth/') || url.includes('/oauth2/');
};

// Response interceptor only for the main instance
axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // Skip interceptor logic for auth-related requests
        if (isAuthRequest(originalRequest.url || '')) {
            return Promise.reject(error);
        }

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            // If already refreshing, wait for the existing refresh to complete
            if (isRefreshing && refreshPromise) {
                try {
                    await refreshPromise;
                    // After refresh completes, retry the original request
                    return axiosInstance(originalRequest);
                } catch (refreshError) {
                    return Promise.reject(refreshError);
                }
            }

            originalRequest._retry = true;
            isRefreshing = true;

            // Create the refresh promise
            refreshPromise = authAxiosInstance.post('/auth/refreshToken')
                .then(() => {
                    // Reset refresh state on success
                    isRefreshing = false;
                    refreshPromise = null;
                    return true;
                })
                .catch(async (refreshError) => {
                    // Reset refresh state on error
                    isRefreshing = false;
                    refreshPromise = null;

                    // If refresh token fails, perform complete logout
                    if (refreshError.response && refreshError.response.status === 401) {
                        await performLogout();
                    } else {
                        // For other errors, just clear local data
                        clearAuthData();
                        if (logoutCallback) {
                            logoutCallback();
                        }
                    }
                    throw refreshError;
                });

            try {
                await refreshPromise;
                // If refresh succeeded, retry the original request
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// Export both instances
export { axiosInstance as default, authAxiosInstance, setLogoutCallback };