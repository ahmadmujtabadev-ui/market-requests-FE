/* eslint-disable @typescript-eslint/no-explicit-any */

import { createAsyncThunk } from "@reduxjs/toolkit";
import ls from "localstorage-slim";
import { HttpService } from "../index";
import { CreateRequestDto, requestService, RequestStatus, UpdateRequestDto } from "./endpoint";

/**
 * Fetch all requests with optional filters
 */
export const fetchRequestsAsync = createAsyncThunk(
  "request/fetchRequests",
  async (
    params?: { status?: RequestStatus },
  ) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      HttpService.setToken(token);

      const response = await requestService.list(params);

  
      // Handle the 'requests' key from backend
      const data = Array.isArray(response)
        ? response
        : response.requests || response?.items || response;

      return data;
    } catch (error: any) {
      return (
        error?.response?.data?.message || "Failed to fetch requests"
      );
    }
  }
);

/**
 * Fetch single request by ID
 */
export const fetchRequestByIdAsync = createAsyncThunk(
  "request/fetchRequestById",
  async (id: string, { rejectWithValue }) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      HttpService.setToken(token);

      const response = await requestService.getById(id);

      if (!response?.message) {
        return rejectWithValue(response.message || "Failed to fetch request");
      }

      return response.request || response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch request"
      );
    }
  }
);

/**
 * Create new request (agent only)
 */
export const createRequestAsync = createAsyncThunk(
  "request/createRequest",
  async (dto: CreateRequestDto, { rejectWithValue }) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      console.log("token",token)
      HttpService.setToken(token);

      const response = await requestService.create(dto);

      if (!response?.message) {
        return rejectWithValue(response.message || "Failed to create request");
      }

      return response.request || response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create request"
      );
    }
  }
);

/**
 * Update request (agent can update their own)
 */
export const updateRequestAsync = createAsyncThunk(
  "request/updateRequest",
  async (
    { id, data }: { id: string; data: UpdateRequestDto },
    { rejectWithValue }
  ) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      HttpService.setToken(token);

      const response = await requestService.update(id, data);

      if (!response?.message) {
        return rejectWithValue(response.message || "Failed to update request");
      }

      return response.request || response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update request"
      );
    }
  }
);

/**
 * Update request status (VA/Admin only)
 */
export const updateRequestStatusAsync = createAsyncThunk(
  "request/updateRequestStatus",
  async (
    { id, status }: { id: string; status: RequestStatus },
    { rejectWithValue }
  ) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      HttpService.setToken(token);

      const response = await requestService.updateStatus(id, status);

      if (!response?.message) {
        return rejectWithValue(response.message || "Failed to update status");
      }

      return response.request || response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update request status"
      );
    }
  }
);

/**
 * Upload completed file (VA only)
 */
export const uploadCompletedFileAsync = createAsyncThunk(
  "request/uploadCompletedFile",
  async (
    { id, fileUrl, fileType }: { id: string; fileUrl: string; fileType?: string },
    { rejectWithValue }
  ) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      HttpService.setToken(token);

      const response = await requestService.uploadFile(id, fileUrl, fileType);

      if (!response?.message) {
        return rejectWithValue(response.message || "Failed to upload file");
      }

      return {
        requestId: id,
        file: response.file || response.data
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to upload file"
      );
    }
  }
);

/**
 * Delete request file
 */
export const deleteRequestFileAsync = createAsyncThunk(
  "request/deleteRequestFile",
  async (
    { id, fileId }: { id: string; fileId: string },
    { rejectWithValue }
  ) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      HttpService.setToken(token);

      const response = await requestService.deleteFile(id, fileId);

      if (!response?.message) {
        return rejectWithValue(response.message || "Failed to delete file");
      }

      return { requestId: id, fileId };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete file"
      );
    }
  }
);

/**
 * Fetch request statistics
 */
export const fetchRequestStatsAsync = createAsyncThunk(
  "request/fetchRequestStats",
  async (_, { rejectWithValue }) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      HttpService.setToken(token);

      const response = await requestService.getStats();

      if (!response?.message) {
        return rejectWithValue(response.message || "Failed to fetch stats");
      }

      return response.stats || response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch stats"
      );
    }
  }
);