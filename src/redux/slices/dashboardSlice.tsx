// store/slices/dashboardSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { getDashboardStatsAsync } from "@/services/dashboard/asyncThunk";

type LastSyncStatus = "success" | "warning" | "error" | "idle";

interface DashboardState {
  isLoading: boolean;
  error: string | null;

  // Quick stats (match the Dashboard component)
  connectionsActive: number;
  connectionsTotal: number;
  connectionsTrendPct: number;

  credentialsValid: number;
  credentialsTotal: number;

  lastSyncAt: string | null;
  lastSyncStatus: LastSyncStatus;

  issuesCount: number;

  // optional: timestamp
  lastUpdated: string | null;
}

const initialState: DashboardState = {
  isLoading: false,
  error: null,

  connectionsActive: 0,
  connectionsTotal: 0,
  connectionsTrendPct: 0,

  credentialsValid: 0,
  credentialsTotal: 0,

  lastSyncAt: null,
  lastSyncStatus: "idle",

  issuesCount: 0,

  lastUpdated: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardStatsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDashboardStatsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.lastUpdated = new Date().toISOString();

        const d = action.payload ?? {};

        // ---- Mapping from /connections/stats response → UI fields ----
        // Expected shape (example):
        // {
        //   connections: { total, active, verifying, failed, paused, byExchange: [...] },
        //   credentials: { total, valid, revoked, byExchange: [...] },
        //   lastSync: { at, status },                 // optional
        //   issues: { count },                        // optional
        //   trend: { connectionsPct }                 // optional
        // }

        const connections = d.connections ?? d?.data?.connections ?? {};
        const credentials = d.credentials ?? d?.data?.credentials ?? {};
        const lastSync = d.lastSync ?? d?.data?.lastSync ?? {};
        const issues = d.issues ?? d?.data?.issues ?? {};
        const trend = d.trend ?? d?.data?.trend ?? {};

        state.connectionsActive = Number(connections.active ?? 0);
        state.connectionsTotal = Number(connections.total ?? 0);
        state.connectionsTrendPct = Number(trend.connectionsPct ?? 0);

        state.credentialsValid = Number(credentials.valid ?? 0);
        state.credentialsTotal = Number(credentials.total ?? 0);

        state.lastSyncAt = lastSync.at ?? null;
        state.lastSyncStatus = (lastSync.status as LastSyncStatus) ?? "idle";

        state.issuesCount = Number(issues.count ?? 0);
      })
      .addCase(getDashboardStatsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Failed to load dashboard stats";
      });
  },
});

export default dashboardSlice.reducer;
