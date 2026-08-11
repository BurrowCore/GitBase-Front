import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import type { LoginDTO, UserInfo } from '../../types/auth';

interface AuthState {
  user: UserInfo | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}



const saveStateToLocalStorage = (state: AuthState) => {
  try {
    const serializedState = JSON.stringify({
      isLoggedIn: state.isLoggedIn,
      user: state.user
    });
    localStorage.setItem("authState", serializedState);
  } catch (e) {
    console.warn("Impossible d'enregistrer l'état", e);
  }
};

const loadStateFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem("authState");
    if (serializedState === null) {
      return undefined;
    }
    const parsedState = JSON.parse(serializedState);

    // Ensure we return a complete state object with all fields
    return {
      isLoggedIn: parsedState.isLoggedIn || false,
      isRegistered: false,
      message: null,
      error: null,
      loading: false,
      user: parsedState.user || null
    };
  } catch (e) {
    console.warn("Impossible de charger l'état", e);
    return undefined;
  }
};

// Load the persisted state first
const persistedState = loadStateFromLocalStorage();

const initialState: AuthState = persistedState || {
  user: null,
  isLoggedIn: false,
  loading: false,
  error: null,
};

// Async thunk for login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginDTO, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  }
);

// Async thunk for Google login  
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.initiateGoogleLogin();
      console.log('Google login response:', response);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Google login failed');
    }
  }
);

// Async thunk for logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Logout failed');
    }
  }
);

// Async thunk for getting current user
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const authState = localStorage.getItem("authState");
      if (!authState) {
        return rejectWithValue("No auth state found");
      }
      const user = await authService.getCurrentUser();
      return user;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to get user');
    }
  }
);

// Async thunk to check auth state on app start
export const checkAuthState = createAsyncThunk(
  "auth/checkAuthState",
  async (forceRefresh: boolean = false, thunkAPI) => {
    try {
      // Try to get data from localStorage first
      const authState = localStorage.getItem("authState");
      if (authState && !forceRefresh) {
        const parsedState = JSON.parse(authState);
        if (parsedState.isLoggedIn && parsedState.user) {
          return {
            isLoggedIn: true,
            user: parsedState.user
          };
        }
      }

      // If no cached data or force refresh, verify with server
      try {
        const response = await authService.getCurrentUser();
        if (response) {
          return {
            isLoggedIn: true,
            user: response
          };
        }
      } catch (error) {
        localStorage.removeItem("authState");
        return thunkAPI.rejectWithValue("Session expired");
      }

      localStorage.removeItem("authState");
      return thunkAPI.rejectWithValue("No valid session found");
    } catch (error) {
      localStorage.removeItem("authState");
      return thunkAPI.rejectWithValue("Failed to verify auth state");
    }
  }
);
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<UserInfo>) => {
      state.user = action.payload;
      state.isLoggedIn = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isLoggedIn = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload.user;
        state.error = null;
        saveStateToLocalStorage(state);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isLoggedIn = false;
        state.user = null;
        state.error = action.payload as string;
      })
      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        //state.user = action.payload.user;
        state.error = null;
        saveStateToLocalStorage(state);
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.isLoggedIn = false;
        state.user = null;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isLoggedIn = false;
        state.error = null;
        localStorage.removeItem("authState");
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Still logout on client side even if server request fails
        state.user = null;
        state.isLoggedIn = false;
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isLoggedIn = true;
        state.error = null;
        saveStateToLocalStorage(state);
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.isLoggedIn = false;
        state.user = null;
        state.error = action.payload as string;
      })
      // Check Auth State
      .addCase(checkAuthState.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthState.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isLoggedIn = action.payload.isLoggedIn;
        state.error = null;
        saveStateToLocalStorage(state);
      })
      .addCase(checkAuthState.rejected, (state) => {
        state.loading = false;
        state.isLoggedIn = false;
        state.user = null;
        state.error = null; // Don't show error for failed auth check
      });
  },
});

export const { clearError, setUser, clearUser } = authSlice.actions;
export default authSlice.reducer; 