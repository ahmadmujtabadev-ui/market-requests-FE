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
  ) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      HttpService.setToken(token);

      const response = await templateService.list(params);
      console.log("response", response)

  
      // Handle the 'templates' key from backend
      const data = Array.isArray(response)
        ? response
        : response.templates || response?.items || response;

      return data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch templates";
      console.log(message)
    }
  }
);

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
      console.log("response", response)
      if (!response?.success && response?.status === 400) {
        return rejectWithValue(response.message);
      }

      return response.template;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Fetch Successfully"
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

      // const response = await templateService.create(dto);
       const response = await templateService.create(dto, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response) {
        Toast.fire({ icon: "success", title: "Template created successfully" });
      }

      if (!response.success || response.status === 400) {
        return rejectWithValue(response.message);
      }

      return response;
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
    { id, data }: { id: string; data: FormData },
    { rejectWithValue }
  ) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      HttpService.setToken(token);

      const response = await templateService.update(id, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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

export const deleteTemplateAsync = createAsyncThunk(
  "template/deleteTemplate",
  async (id: string, { rejectWithValue }) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      HttpService.setToken(token);

      const response = await templateService.remove(id);

      console.log('Delete response:', response);

      // Check if deletion failed
      if (!response?.success && response?.status !== 200 && response?.status !== 204) {
        return rejectWithValue(response?.message || "Failed to delete template");
      }

      // Return the ID that was deleted
      return { id };
      
    } catch (error: any) {
      console.error('Delete error:', error);
      const errorMessage = error?.response?.data?.message || "Failed to delete template";
      return rejectWithValue(errorMessage);
    }
  }
);