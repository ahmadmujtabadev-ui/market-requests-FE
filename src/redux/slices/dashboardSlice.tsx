import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import Toast from "@/components/Toast";
import type { RootState } from "@/redux/store";
import { fetchDashboardStatsAsync } from "@/services/dashboard/asyncThunk";
import { DashboardOverview, DashboardStats, RecentRequest, StatusBreakdown } from "@/services/dashboard/endpoint";

export interface DashboardState {
  isLoading: boolean;
  error: string | null;
  stats: DashboardStats | null;
  lastFetched: number | null;
}

const initialState: DashboardState = {
  isLoading: false,
  error: null,
  stats: null,
  lastFetched: null,
};

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    // Clear dashboard data (useful for logout)
    clearDashboard: (state) => {
      state.stats = null;
      state.error = null;
      state.lastFetched = null;
    },

    // Set loading manually if needed
    setDashboardLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Clear error
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // FETCH DASHBOARD STATS
    builder
      .addCase(fetchDashboardStatsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchDashboardStatsAsync.fulfilled,
        (state, action: PayloadAction<DashboardStats>) => {
          state.isLoading = false;
          state.stats = action.payload;   // 👈 becomes { overview, statusBreakdown, recentRequests }
          state.lastFetched = Date.now();
          state.error = null;
        }
      )
      .addCase(fetchDashboardStatsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        Toast.fire({
          icon: "error",
          title: action.payload || "Failed to load dashboard stats",
        });
      });
  },
});

// Actions
export const {
  clearDashboard,
  setDashboardLoading,
  clearDashboardError,
} = dashboardSlice.actions;

// Selectors
export const selectDashboard = (state: RootState) => state.dashboard;
export const selectDashboardStats = (state: RootState) => state.dashboard.stats;
export const selectDashboardLoading = (state: RootState) => state.dashboard.isLoading;
export const selectDashboardError = (state: RootState) => state.dashboard.error;

// Computed selectors for easy access
export const selectOverviewStats = (state: RootState): DashboardOverview | null =>
  state.dashboard.stats?.overview ?? null;

export const selectStatusBreakdown = (state: RootState): StatusBreakdown | null =>
  state.dashboard.stats?.statusBreakdown ?? null;

export const selectRecentRequests = (state: RootState): RecentRequest[] =>
  state.dashboard.stats?.recentRequests ?? [];

// Check if data is stale (older than 5 minutes)
export const selectIsDataStale = (state: RootState): boolean => {
  const { lastFetched } = state.dashboard;
  if (!lastFetched) return true;

  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() - lastFetched > fiveMinutes;
};

export default dashboardSlice.reducer;