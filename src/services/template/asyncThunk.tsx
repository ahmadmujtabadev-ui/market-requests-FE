/* eslint-disable @typescript-eslint/no-explicit-any */

import { createAsyncThunk } from "@reduxjs/toolkit";
import ls from "localstorage-slim";
import { HttpService } from "../index";
import Toast from "@/components/Toast";
import { templateService, TemplateType } from "./enpoints";


/**
 * Fetch all templates with optional filters
 */
export const fetchTemplatesAsync = createAsyncThunk(
  "template/fetchTemplates",
  async (
    params?: { type?: TemplateType; category?: string },
    { rejectWithValue }
  ) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      HttpService.setToken(token);

      const response = await templateService.list(params);
      console.log("response", response)

      if (!response?.message) {
        return rejectWithValue(response.message);
      }

      // Handle the 'templates' key from backend
      const data = Array.isArray(response)
        ? response
        : response.templates || response?.items || response;

      return data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch templates"
      );
    }
  }
);;

/**
 * Fetch single template by ID
 */
export const fetchTemplateByIdAsync = createAsyncThunk(
  "template/fetchTemplateById",
  async (id: string, { rejectWithValue }) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      HttpService.setToken(token);

      const response = await templateService.getById(id);

      if (!response?.success && response?.status === 400) {
        return rejectWithValue(response.message);
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch template"
      );
    }
  }
);

/**
 * Create new template (admin only)
 */
export const createTemplateAsync = createAsyncThunk(
  "template/createTemplate",
  async (dto: any, { rejectWithValue }) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      HttpService.setToken(token);

      const response = await templateService.create(dto);

      if (response?.success || response?.status === 200) {
        Toast.fire({ icon: "success", title: response.message as string });
      }

      if (!response.success || response.status === 400) {
        return rejectWithValue(response.message);
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create template"
      );
    }
  }
);

/**
 * Update template (admin only)
 */
export const updateTemplateAsync = createAsyncThunk(
  "template/updateTemplate",
  async (
    { id, data }: { id: string; data: any },
    { rejectWithValue }
  ) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      HttpService.setToken(token);

      const response = await templateService.update(id, data);

      if (response?.success || response?.status === 200) {
        Toast.fire({ icon: "success", title: response.message as string });
      }

      if (!response.success || response.status === 400) {
        return rejectWithValue(response.message);
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update template"
      );
    }
  }
);

/**
 * Delete template (admin only)
 */
export const deleteTemplateAsync = createAsyncThunk(
  "template/deleteTemplate",
  async (id: string, { rejectWithValue }) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      HttpService.setToken(token);

      const response = await templateService.remove(id);

      if (response?.success || response?.status === 200) {
        Toast.fire({ icon: "success", title: response.message as string });
      }

      if (!response.success || response.status === 400) {
        return rejectWithValue(response.message);
      }

      return { id, ...response.data };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete template"
      );
    }
  }
);