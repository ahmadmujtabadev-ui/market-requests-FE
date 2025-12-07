/* eslint-disable @typescript-eslint/no-explicit-any */

import { createAsyncThunk } from "@reduxjs/toolkit";
import ls from "localstorage-slim";
import { HttpService } from "../index";
import Toast from "@/components/Toast";
import { categoryService } from "./endpoints";

/**
 * Fetch all categories with optional filters
 */
export const fetchCategoriesAsync = createAsyncThunk<
  any[],         // better: Category[]
  void,
  { rejectValue: string }
>(
  "category/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      HttpService.setToken(token);

      const response = await categoryService.list();

      const categoryArray = response.data ?? [];

      return categoryArray;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch categories";
      return rejectWithValue(message);
    }
  }
);

/**
 * Fetch single category by ID
 */
export const fetchCategoryByIdAsync = createAsyncThunk(
  "category/fetchCategoryById",
  async (id: string, { rejectWithValue }) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      HttpService.setToken(token);

      const response = await categoryService.getById(id);
      console.log("category response", response);

      if (!response?.success && response?.status === 400) {
        return rejectWithValue(response.message);
      }

      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch category"
      );
    }
  }
);

/**
 * Create new category (admin only)
 */
export const createCategoryAsync = createAsyncThunk(
  "category/createCategory",
  async (
    dto: {
      name: string;
      description?: string;
      isActive?: boolean;
      order?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      HttpService.setToken(token);

      const response = await categoryService.create(dto);

      if (response.success || response.message === "Category created successfully") {
        Toast.fire({ icon: "success", title: response.message || "Category created successfully" });
      }

      return response.data || response;
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to create category";
      Toast.fire({ icon: "error", title: message });
      return rejectWithValue(message);
    }
  }
);

/**
 * Update category (admin only)
 */
export const updateCategoryAsync = createAsyncThunk(
  "category/updateCategory",
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        description?: string;
        isActive?: boolean;
        order?: number;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      HttpService.setToken(token);

      const response = await categoryService.update(id, data);

      if (response.success || response.message === "Category updated successfully") {
        Toast.fire({ icon: "success", title: response.message || "Category updated successfully" });
      }

      return response.data || response;
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to update category";
      Toast.fire({ icon: "error", title: message });
      return rejectWithValue(message);
    }
  }
);

/**
 * Delete category (admin only)
 */
export const deleteCategoryAsync = createAsyncThunk(
  "category/deleteCategory",
  async (id: string, { rejectWithValue }) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      HttpService.setToken(token);

      const response = await categoryService.remove(id);

      if (response.success || response.message === "Category deleted successfully") {
        Toast.fire({ icon: "success", title: response.message || "Category deleted successfully" });
        return { id };
      } else {
        Toast.fire({ icon: "error", title: response.message as string });
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      console.error("Delete category error:", error);
      const errorMessage =
        error?.response?.data?.message || "Failed to delete category";
      Toast.fire({ icon: "error", title: errorMessage });
      return rejectWithValue(errorMessage);
    }
  }
);