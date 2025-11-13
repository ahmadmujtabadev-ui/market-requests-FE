import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  userForgetRequestAsync,
  userResetPasswordAsync,
  userSignInAsync,
  userSignUpAsync,
  userVerifyOTPAsync,
  socialSignInAsync,
  BackendUser,
  LoginResponse,
  RegisterResponse,
  GenericResponse,
} from "@/services/auth/asyncThunk";
import ls from "localstorage-slim";
import Toast from "@/components/Toast";
import type { RootState } from "@/redux/store";

export interface UserState {
  isLoading: boolean;
  signUpSuccess: boolean;
  resetSuccess: boolean;
  emailSent: boolean;
  authError: string;
  otp: string;
  profile: BackendUser | null;
  accessToken?: string;
  filters: Record<string, unknown>;
  metaData: Record<string, unknown>;
  newsAlerts: Record<string, unknown>;
  bills: unknown[];
  reports: unknown[];
}

const initialState: UserState = {
  isLoading: false,
  signUpSuccess: false,
  resetSuccess: false,
  emailSent: false,
  authError: "",
  otp: "",
  profile: null,
  accessToken: undefined,
  filters: {},
  metaData: {},
  newsAlerts: {},
  bills: [],
  reports: [],
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<BackendUser | null>) => {
      state.profile = action.payload;
    },
    setReset: (state, action: PayloadAction<boolean>) => {
      state.resetSuccess = action.payload;
    },
    setEmail: (state, action: PayloadAction<boolean>) => {
      state.emailSent = action.payload;
    },
    setSignUp: (state, action: PayloadAction<boolean>) => {
      state.signUpSuccess = action.payload;
    },
    setOTP: (state, action: PayloadAction<string>) => {
      state.otp = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.authError = action.payload;
    },
    userLogout: (state) => {
      state.profile = null;
      state.accessToken = undefined;
      ls.remove("access_token");
      if (typeof window !== "undefined") window.location.href = "/auth/login";
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setMetaData: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.metaData = action.payload;
    },
    setAlertsFilters: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.filters = action.payload;
    },
  },
  extraReducers: (builder) => {
    // SIGN UP
    builder
      .addCase(userSignUpAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(userSignUpAsync.fulfilled, (state, action: PayloadAction<RegisterResponse>) => {
        state.isLoading = false;
        state.signUpSuccess = true;
        // optionally store token
        if (action.payload.access) {
          state.accessToken = action.payload.access;
          ls.set("access_token", action.payload.refresh, { encrypt: true });
        }
        state.profile = action.payload.user;
      })
      .addCase(userSignUpAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.authError = action.payload as string;
        Toast.fire({ icon: "error", title: state.authError });
      });

    // LOGIN
    builder
      .addCase(userSignInAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(userSignInAsync.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.isLoading = false;
        state.profile = action.payload.user;
        state.accessToken = action.payload.access;
        ls.set("access_token", action.payload.access, { encrypt: true });
      })
      .addCase(userSignInAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.authError = action.payload as string;
        Toast.fire({ icon: "error", title: state.authError });
      });

    // SOCIAL
    builder
      .addCase(socialSignInAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(socialSignInAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const token = (action.payload?.accessToken ??
          action.payload?.access_token) as string | undefined;
        if (token) {
          state.accessToken = token;
          ls.set("access_token", token, { encrypt: true });
        }
        state.profile = (action.payload?.user ??
          action.payload?.data?.profile ??
          null) as BackendUser | null;
      })
      .addCase(socialSignInAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.authError = action.payload as string;
        Toast.fire({ icon: "error", title: state.authError });
      });

    // FORGOT
    builder
      .addCase(userForgetRequestAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(userForgetRequestAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.emailSent = true;
      })
      .addCase(userForgetRequestAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.authError = action.payload as string;
        Toast.fire({ icon: "error", title: state.authError });
      });

    // VERIFY OTP
    builder
      .addCase(userVerifyOTPAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(userVerifyOTPAsync.fulfilled, (state, action: PayloadAction<GenericResponse>) => {
        state.isLoading = false;
        Toast.fire({ icon: "success", title: action.payload.message });
      })
      .addCase(userVerifyOTPAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.authError = action.payload as string;
        Toast.fire({ icon: "error", title: state.authError });
      });

    // RESET PASSWORD
    builder
      .addCase(userResetPasswordAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(userResetPasswordAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.otp = "";
        state.resetSuccess = true;
      })
      .addCase(userResetPasswordAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.authError = action.payload as string;
        Toast.fire({ icon: "error", title: state.authError });
      });
  },
});

export const {
  setProfile,
  userLogout,
  setLoading,
  setError,
  setReset,
  setEmail,
  setSignUp,
  setOTP,
  setMetaData,
  setAlertsFilters,
} = userSlice.actions;

export const selectUser = (state: RootState) => state.user;

export default userSlice.reducer;
