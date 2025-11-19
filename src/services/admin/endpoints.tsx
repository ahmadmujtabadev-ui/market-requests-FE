/* eslint-disable @typescript-eslint/no-explicit-any */

import { HttpService } from "@/services";

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: "admin" | "agent" | "va";
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: "admin" | "agent" | "va";
  isActive?: boolean;
}

export interface AdminResetPasswordDto {
  newPassword: string;
}

export interface UserListParams {
  role?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent" | "va";
  isActive: boolean;
  lastLoginAt: string | null;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  requestCount?: number;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserStatsResponse {
  stats: {
    total: number;
    active: number;
    inactive: number;
    byRole: {
      admin?: number;
      agent?: number;
      va?: number;
    };
  };
}

export interface UpdateUserResponse {
  user: User;
  message: string;
}

class UserManagementService extends HttpService {
  private readonly base = "admin";

  // List users with filters
  listUsers = (params?: UserListParams) =>
    this.get<UserListResponse>(this.base, { params });

  // Get single user
  getUser = (id: string) =>
    this.get<{ user: User }>(`${this.base}/${id}`);

  // Create new user
  createUser = (data: CreateUserDto) =>
    this.post<{ user: User; message: string }>(this.base, data);

  // Update user  ✅ note the explicit return type instead of generic
  updateUser = (id: string, data: UpdateUserDto): Promise<UpdateUserResponse> =>
    this.put(`${this.base}/${id}`, data);

  // Delete user
  deleteUser = (id: string) =>
    this.delete<{ message: string }>(`${this.base}/${id}`);

  // Admin reset user password
  adminResetPassword = (id: string, data: AdminResetPasswordDto) =>
    this.post<{ message: string }>(
      `${this.base}/${id}/reset-password`,
      data
    );

  // Toggle user active status
  toggleUserActive = (id: string) =>
    this.post<{ user: User; isActive: boolean; message: string }>(
      `${this.base}/${id}/toggle-active`
    );

  // Get user statistics
  getUserStats = () =>
    this.get<UserStatsResponse>(`${this.base}/stats`);
}

export const userManagementService = new UserManagementService();
