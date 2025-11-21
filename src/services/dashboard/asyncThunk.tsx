/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardService, DashboardStats } from "./endpoint";
import { HttpService } from "../index";
// import ls if you need token from localstorage

type Reject = string;

export const fetchDashboardStatsAsync = createAsyncThunk<
  DashboardStats,
  void,                       // no args, if you read token yourself or no token
  { rejectValue: Reject }
>(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      // If you need token like templates:
      // const token = `${ls.get("access_token", { decrypt: true })}`;
      // if (!token) return rejectWithValue("Missing access token");
      // HttpService.setToken(token);

      const res = await dashboardService.getStats();
      console.log("dashboard response:", res);

      // ⬅ THIS is the key line
      const stats = res.stats; // inner object with overview/statusBreakdown/recentRequests

      return stats as DashboardStats;
    } catch (e: any) {
      const errorMessage =
        e?.response?.data?.error ??
        e?.response?.data?.message ??
        e?.message ??
        "Failed to fetch dashboard stats";

      return rejectWithValue(errorMessage);
    }
  }
);
