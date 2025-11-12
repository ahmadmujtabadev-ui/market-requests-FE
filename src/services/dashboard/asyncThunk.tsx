/* eslint-disable @typescript-eslint/no-explicit-any */
// services/dashboard/asyncThunk.ts (Updated with better error handling)
import { createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardStatusService } from "./endpoint";
import ls from "localstorage-slim";
import Toast from "@/components/Toast";

export const getDashboardStatsAsync = createAsyncThunk(
  "dashboard/stats",
  async (_, { rejectWithValue }) => {
    try {
      const token = ls.get("access_token", { decrypt: true });

      if (!token) {
        return rejectWithValue("Authentication token not found");
      }

      const response = await dashboardStatusService.dashboardStats();

      if (response?.success || response?.status === 200) {
        Toast.fire({ icon: "success", title: response.message as string });
      }

      if (!response) {
        return rejectWithValue("No data received from server");
      }

      if (response.success === false) {
        return rejectWithValue(response.detail || "Request failed");
      }

      return response.data || response;
    } catch (error: any) {
      console.error("Dashboard stats error:", error);

      if (error.code === 'NETWORK_ERROR') {
        return rejectWithValue("Network error. Please check your connection.");
      }

      if (error.status === 401) {
        return rejectWithValue("Session expired. Please log in again.");
      }

      if (error.status === 403) {
        return rejectWithValue("You don't have permission to access this resource.");
      }

      if (error.status === 404) {
        return rejectWithValue("Dashboard statistics not found.");
      }

      if (error.status >= 500) {
        return rejectWithValue("Server error. Please try again later.");
      }

      return rejectWithValue(
        error.message || "Failed to fetch dashboard statistics"
      );
    }
  }
);

