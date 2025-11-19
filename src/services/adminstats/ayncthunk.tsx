/* eslint-disable @typescript-eslint/no-explicit-any */

// services/stats/asyncThunk.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { statsService } from "./endpoints";
import type {
    UserStats,
    TemplateStats,
    RequestStats
} from "./endpoints";
import ls from "localstorage-slim";
import { OverviewStats } from "@/types/stats";

type Reject = string;

// Fetch complete dashboard overview
export const fetchOverviewAsync = createAsyncThunk<
    OverviewStats,
    void,
    { rejectValue: Reject }
>(
    "stats/fetchOverview",
    async (_, { rejectWithValue }) => {
        try {
            const token = ls.get("access_token", { decrypt: true });

            if (!token) {
                return rejectWithValue("Authentication token not found");
            }

            const res = await statsService.getOverview();
            return res.overview;
        } catch (e: any) {
            return rejectWithValue(
                e?.response?.data?.error ?? e?.message ?? "Failed to fetch overview"
            );
        }
    }
);

// Fetch detailed user statistics
export const fetchUserStatsAsync = createAsyncThunk<
    UserStats,
    void,
    { rejectValue: Reject }
>(
    "stats/fetchUserStats",
    async (_, { rejectWithValue }) => {
        try {
            const res = await statsService.getUserStats();
            return res.stats;
        } catch (e: any) {
            return rejectWithValue(
                e?.response?.data?.error ?? e?.message ?? "Failed to fetch user stats"
            );
        }
    }
);

// Fetch detailed template statistics
export const fetchTemplateStatsAsync = createAsyncThunk<
    TemplateStats,
    void,
    { rejectValue: Reject }
>(
    "stats/fetchTemplateStats",
    async (_, { rejectWithValue }) => {
        try {
            const res = await statsService.getTemplateStats();
            return res.stats;
        } catch (e: any) {
            return rejectWithValue(
                e?.response?.data?.error ?? e?.message ?? "Failed to fetch template stats"
            );
        }
    }
);

// Fetch detailed request statistics
export const fetchRequestStatsAsync = createAsyncThunk<
    RequestStats,
    void,
    { rejectValue: Reject }
>(
    "stats/fetchRequestStats",
    async (_, { rejectWithValue }) => {
        try {
            const res = await statsService.getRequestStats();
            return res.stats;
        } catch (e: any) {
            return rejectWithValue(
                e?.response?.data?.error ?? e?.message ?? "Failed to fetch request stats"
            );
        }
    }
);