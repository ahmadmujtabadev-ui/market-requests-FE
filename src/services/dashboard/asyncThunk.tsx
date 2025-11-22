/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardService, DashboardStats } from "./endpoint";
import { HttpService } from "../index";
// import ls if you need token from localstorage

type Reject = string;

export const fetchDashboardStatsAsync = createAsyncThunk<
  DashboardStats,
  void,                      
  { rejectValue: Reject }
>(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await dashboardService.getStats();
      console.log("dashboard response:", res);

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
