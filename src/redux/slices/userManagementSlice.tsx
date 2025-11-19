/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchUsersAsync,
  fetchUserByIdAsync,
  createUserAsync,
  updateUserAsync,
  deleteUserAsync,
  adminResetPasswordAsync,
  toggleUserActiveAsync,
  fetchUserStatsAsync,
} from "../../services/admin/asyncThunk";
import { UpdateUserResponse, User, UserListResponse, UserStatsResponse } from "@/services/admin/endpoints";

interface UserManagementState {
  users: User[];
  currentUser: User | null;
  stats: UserStatsResponse["stats"] | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;

  // Individual operation states
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  resetPasswordLoading: boolean;
  toggleActiveLoading: boolean;
}

const initialState: UserManagementState = {
  users: [],
  currentUser: null,
  stats: null,
  pagination: null,
  loading: false,
  error: null,
  successMessage: null,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  resetPasswordLoading: false,
  toggleActiveLoading: false,
};

const userManagementSlice = createSlice({
  name: "userManagement",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    setFilters: (state) => {
      // Store filter state if needed
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Users
    builder
      .addCase(fetchUsersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUsersAsync.fulfilled,
        (state, action: PayloadAction<UserListResponse>) => {
          state.loading = false;
          state.users = action?.payload?.users;
          state.pagination = action?.payload?.pagination;
        }
      )
      .addCase(fetchUsersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action?.payload || "Failed to fetch users";
      });

    // Fetch User by ID
    builder
      .addCase(fetchUserByIdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserByIdAsync.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.currentUser = action.payload;
        }
      )
      .addCase(fetchUserByIdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch user";
      });

    // Create User
    builder
      .addCase(createUserAsync.pending, (state) => {
        state.createLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createUserAsync.fulfilled, (state, action) => {
        state.createLoading = false;
        state.users.unshift(action.payload.user);
        state.successMessage = action.payload.message;
      })
      .addCase(createUserAsync.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload || "Failed to create user";
      });

    builder
      .addCase(updateUserAsync.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        updateUserAsync.fulfilled,
        (state, action: PayloadAction<UpdateUserResponse>) => {
          state.updateLoading = false;

          const updatedUser = action.payload.user;

          const index = state.users.findIndex((u) => u.id === updatedUser.id);
          if (index !== -1) {
            state.users[index] = updatedUser;
          }

          if (state.currentUser?.id === updatedUser.id) {
            state.currentUser = updatedUser;
          }

          state.successMessage = action.payload.message;
        }
      )

      .addCase(updateUserAsync.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload || "Failed to update user";
      });

    // Delete User
    builder
      .addCase(deleteUserAsync.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteUserAsync.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.users = state.users.filter((u) => u.id !== action.payload.userId);
        state.successMessage = action.payload.message;
      })
      .addCase(deleteUserAsync.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload || "Failed to delete user";
      });

    // Admin Reset Password
    builder
      .addCase(adminResetPasswordAsync.pending, (state) => {
        state.resetPasswordLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(adminResetPasswordAsync.fulfilled, (state, action) => {
        state.resetPasswordLoading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(adminResetPasswordAsync.rejected, (state, action) => {
        state.resetPasswordLoading = false;
        state.error = action.payload || "Failed to reset password";
      });

    // Toggle User Active
    builder
      .addCase(toggleUserActiveAsync.pending, (state) => {
        state.toggleActiveLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(toggleUserActiveAsync.fulfilled, (state, action) => {
        state.toggleActiveLoading = false;
        const index = state.users.findIndex(
          (u) => u.id === action.payload.user.id
        );
        if (index !== -1) {
          state.users[index] = action.payload.user;
        }
        if (state.currentUser?.id === action.payload.user.id) {
          state.currentUser = action.payload.user;
        }
        state.successMessage = action.payload.message;
      })
      .addCase(toggleUserActiveAsync.rejected, (state, action) => {
        state.toggleActiveLoading = false;
        state.error = action.payload || "Failed to toggle user status";
      });

    // Fetch Stats
    builder
      .addCase(fetchUserStatsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserStatsAsync.fulfilled,
        (state, action: PayloadAction<UserStatsResponse>) => {
          state.loading = false;
          state.stats = action?.payload?.stats;
        }
      )
      .addCase(fetchUserStatsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch statistics";
      });
  },
});

export const { clearError, clearSuccessMessage, clearCurrentUser, setFilters } =
  userManagementSlice.actions;

export default userManagementSlice.reducer;