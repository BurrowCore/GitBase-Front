import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { gitService } from '../../services/gitService';

type Repo = {
  repoName: string;
  root?: any;
  private?: boolean;
};

export const fetchUserRepos = createAsyncThunk('repos/fetchUserRepos', async (username: string) => {
  const data = await gitService.listRepositories(username);
  return data as Repo[];
});

type ReposState = {
  items: Repo[];
  loading: boolean;
  error?: string | null;
};

const initialState: ReposState = { items: [], loading: false, error: null };

const reposSlice = createSlice({
  name: 'repos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUserRepos.pending, (state) => { state.loading = true; state.error = null; });
  builder.addCase(fetchUserRepos.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; console.debug('fetchUserRepos result', action.payload); });
    builder.addCase(fetchUserRepos.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed to load'; });
  }
});

export default reposSlice.reducer;
