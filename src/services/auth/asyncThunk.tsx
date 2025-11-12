/* eslint-disable @typescript-eslint/no-explicit-any */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { authBaseService, LoginDto, RegisterDto, ForgotPasswordDto } from "./endpoints";

export type BackendRole = "user" | "tenant" | "landlord" | "admin";

export interface BackendUser {
  id: string;
  email: string;
  businessName?: string;
  role: BackendRole | string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  lastLoginAt?: string;
}

export interface LoginResponse {
  user: BackendUser;
  accessToken: string;
}

export interface RegisterResponse {
  user: BackendUser;
  accessToken?: string;
}

export interface GenericResponse {
  message: string;
  success?: boolean;
}

type Reject = string;

export const userSignUpAsync = createAsyncThunk<RegisterResponse, RegisterDto, { rejectValue: Reject }>(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authBaseService.register(data);
      return res as RegisterResponse;
    } catch (e: any) {
      return rejectWithValue(e.res?.error ??  "Registration failed");
    }
  }
);

export const userSignInAsync = createAsyncThunk<LoginResponse, LoginDto, { rejectValue: Reject }>(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authBaseService.login(data);
      console.log(res)
      return res as LoginResponse;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message ?? e?.message ?? "Login failed");
    }
  }
);

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
