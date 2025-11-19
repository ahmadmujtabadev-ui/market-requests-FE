// e.g. src/services/adminstats/statsSlice.ts

import { fetchOverviewAsync } from '@/services/adminstats/ayncthunk';
import { OverviewStats } from '@/types/stats';
import { createSlice } from '@reduxjs/toolkit';

interface StatsState {
  overview: OverviewStats | null;
  overviewLoading: boolean;
  error: string | null;
}

const initialState: StatsState = {
  overview: null,
  overviewLoading: false,
  error: null,
};

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverviewAsync.pending, (state) => {
        state.overviewLoading = true;
        state.error = null;
      })
      .addCase(fetchOverviewAsync.fulfilled, (state, action) => {
        state.overviewLoading = false;
        state.overview = action.payload; // payload must be OverviewStats
      })
      .addCase(fetchOverviewAsync.rejected, (state, action) => {
        state.overviewLoading = false;
        state.error = action.error.message ?? 'Failed to fetch overview';
      });
  },
});

export default statsSlice.reducer;
