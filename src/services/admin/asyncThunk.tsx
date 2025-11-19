/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AdminResetPasswordDto, CreateUserDto, UpdateUserDto, UpdateUserResponse, User, UserListParams, UserListResponse, userManagementService, UserStatsResponse } from "./endpoints";

type Reject = string;

// List Users
export const fetchUsersAsync = createAsyncThunk<
  UserListResponse,
  UserListParams | undefined,
  { rejectValue: Reject }
>(
  "userManagement/fetchUsers",
  async (params, { rejectWithValue }) => {
    try {
      const res = await userManagementService.listUsers(params);
      return res as UserListResponse;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.error ?? e?.message ?? "Failed to fetch users"
      );
    }
  }
);

// Get Single User
export const fetchUserByIdAsync = createAsyncThunk<
  User,
  string,
  { rejectValue: Reject }
>(
  "userManagement/fetchUserById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await userManagementService.getUser(id);
      return res.user;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.error ?? e?.message ?? "Failed to fetch user"
      );
    }
  }
);

// Create User
export const createUserAsync = createAsyncThunk<
  { user: User; message: string },
  CreateUserDto,
  { rejectValue: Reject }
>(
  "userManagement/createUser",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userManagementService.createUser(data);
      return res;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.error ?? e?.message ?? "Failed to create user"
      );
    }
  }
);

export const updateUserAsync = createAsyncThunk<
  UpdateUserResponse,
  { id: string; data: UpdateUserDto },
  { rejectValue: string }
>(
  "userManagement/updateUser",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await userManagementService.updateUser(id, data);
      return res; // { user, message }
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.error ?? e?.message ?? "Failed to update user"
      );
    }
  }
);


// Delete User
export const deleteUserAsync = createAsyncThunk<
  { message: string; userId: string },
  string,
  { rejectValue: Reject }
>(
  "userManagement/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const res = await userManagementService.deleteUser(id);
      return { ...res, userId: id };
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.error ?? e?.message ?? "Failed to delete user"
      );
    }
  }
);

// Admin Reset Password
export const adminResetPasswordAsync = createAsyncThunk<
  { message: string },
  { id: string; data: AdminResetPasswordDto },
  { rejectValue: Reject }
>(
  "userManagement/adminResetPassword",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await userManagementService.adminResetPassword(id, data);
      return res;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.error ?? e?.message ?? "Failed to reset password"
      );
    }
  }
);

// Toggle User Active Status
export const toggleUserActiveAsync = createAsyncThunk<
  { user: User; isActive: boolean; message: string },
  string,
  { rejectValue: Reject }
>(
  "userManagement/toggleUserActive",
  async (id, { rejectWithValue }) => {
    try {
      const res = await userManagementService.toggleUserActive(id);
      return res;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.error ?? e?.message ?? "Failed to toggle user status"
      );
    }
  }
);

// Get User Statistics
export const fetchUserStatsAsync = createAsyncThunk<
  UserStatsResponse,
  void,
  { rejectValue: Reject }
>(
  "userManagement/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await userManagementService.getUserStats();
      return res;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.error ?? e?.message ?? "Failed to fetch statistics"
      );
    }
  }
);