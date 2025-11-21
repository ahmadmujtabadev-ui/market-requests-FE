/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardService, DashboardStats } from "./endpoint";
import { HttpService } from "../index";

type Reject = string;

export const fetchDashboardStatsAsync = createAsyncThunk<
  DashboardStats,
  string | undefined,          // token as arg
  { rejectValue: Reject }
>(
  "dashboard/fetchStats",
  async (token, { rejectWithValue }) => {
    try {
      if (!token) {
        return rejectWithValue("Missing access token");
      }

      HttpService.setToken(token);

      // res is DashboardStatsResponse
      const res = await dashboardService.getStats();

      // ✅ Use the actual type shape. No `.data` here.
      const stats = res.stats;

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
