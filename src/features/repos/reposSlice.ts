import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { gitService } from '../../services/gitService';
import type { RepositoryTreeDto } from '../../types/git';

export const fetchUserRepos = createAsyncThunk(
  'repos/fetchUserRepos',
  async (username: string, { rejectWithValue }) => {
    try {
      return await gitService.listRepositories(username);
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to load repositories');
    }
  }
);

type ReposState = {
  items: RepositoryTreeDto[];
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
    builder.addCase(fetchUserRepos.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; });
    builder.addCase(fetchUserRepos.rejected, (state, action) => { state.loading = false; state.error = (action.payload as string) ?? 'Failed to load'; });
  }
});

export default reposSlice.reducer;
