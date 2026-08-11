import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import activityService from '../../services/activityService';
import type { Activity } from '../../types/activity';

interface ActivityState {
  items: Activity[];
  loading: boolean;
  error: string | null;
}

const initialState: ActivityState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchRecentActivities = createAsyncThunk(
  'activity/fetchRecent',
  async (_, thunkAPI) => {
    try {
      const data = await activityService.getRecent();
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.message || 'Failed to load activities');
    }
  }
);

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    clearActivities(state) {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecentActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentActivities.fulfilled, (state, action: PayloadAction<Activity[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRecentActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to load activities';
      });
  },
});

export const { clearActivities } = activitySlice.actions;

export default activitySlice.reducer;
