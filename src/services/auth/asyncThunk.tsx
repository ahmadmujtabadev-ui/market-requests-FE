/* eslint-disable @typescript-eslint/no-explicit-any */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { authBaseService, LoginDto, RegisterDto, ForgotPasswordDto } from "./endpoints";

export type BackendRole = "user" | "tenant" | "landlord" | "admin" | "agent";

export interface BackendUser {
  id: string;
  email: string;
  businessName?: string;
  name?: string;
  role: BackendRole | string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  lastLoginAt?: string;
  phone?: string;
  country?: string;
}

export interface LoginResponse {
  user: BackendUser;
  access: string;
  refresh?: string;
}

export interface RegisterResponse {
  user: BackendUser;
  access?: string;
  refresh?: string;
}

export interface GenericResponse {
  message: string;
  success?: boolean;
}

export interface MeResponse {
  user: BackendUser;
}

type Reject = string;

// Fetch current user data
export const fetchUserMeAsync = createAsyncThunk<BackendUser, void, { rejectValue: Reject }>(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const res = await authBaseService.me();
      return res.user as BackendUser;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message ?? e?.message ?? "Failed to fetch user data");
    }
  }
);

// Sign Up
export const userSignUpAsync = createAsyncThunk<RegisterResponse, RegisterDto, { rejectValue: Reject }>(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authBaseService.register(data);
      return res as RegisterResponse;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message ?? e?.message ?? "Registration failed");
    }
  }
);

// Sign In
export const userSignInAsync = createAsyncThunk<LoginResponse, LoginDto, { rejectValue: Reject }>(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authBaseService.login(data);
      console.log("Login response:", res);
      return res as LoginResponse;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message ?? e?.message ?? "Login failed");
    }
  }
);

// Social Sign In
export const socialSignInAsync = createAsyncThunk<any, any, { rejectValue: Reject }>(
  "auth/social-login",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authBaseService.googleLogin(data);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message ?? e?.message ?? "Social login failed");
    }
  }
);

// Forgot Password
export const userForgetRequestAsync = createAsyncThunk<GenericResponse, ForgotPasswordDto, { rejectValue: Reject }>(
  "auth/forgot-password",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authBaseService.forgotPassword(data);
      return res.data as GenericResponse;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message ?? e?.message ?? "Request failed");
    }
  }
);

// Verify OTP
export const userVerifyOTPAsync = createAsyncThunk<GenericResponse, any, { rejectValue: Reject }>(
  "auth/verify-otp",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authBaseService.verifyOTP(data);
      return res.data as GenericResponse;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message ?? e?.message ?? "Verification failed");
    }
  }
);

// Reset Password
export const userResetPasswordAsync = createAsyncThunk<GenericResponse, any, { rejectValue: Reject }>(
  "auth/reset-password",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authBaseService.resetPassword(data);
      return res.data as GenericResponse;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message ?? e?.message ?? "Reset failed");
    }
  }
);