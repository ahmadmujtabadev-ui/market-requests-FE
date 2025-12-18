/* eslint-disable @typescript-eslint/no-explicit-any */

import { createAsyncThunk } from "@reduxjs/toolkit";
import ls from "localstorage-slim";
import { HttpService } from "../index";
import { CreateRequestDto, requestService, RequestStatus, UpdateRequestDto } from "./endpoint";
import Toast from "@/components/Toast";

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

      if (response.message === "Request retrieved") {
        Toast.fire({ icon: "success", title: response.message as string });
      }

      return response.request || response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch request"
      );
    }
  }
);

export const createRequestAsync = createAsyncThunk<any, FormData | CreateRequestDto>(
  "request/createRequest",
  async (dto, { rejectWithValue }) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      HttpService.setToken(token);

      const response = await requestService.create(dto as any); // no headers override

      if (!response?.message) {
        return rejectWithValue(response?.message || "Failed to create request");
      }

      return response.request || response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to create request");
    }
  }
);

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

      if (response.message === "Request status updated") {
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
      console.log("response at 131", response)

      if (response.data.message === "Request status updated") {
        console.log("4sucess running")
        Toast.fire({ icon: "success", title: response.data.message as string });
        return response.request || response.data.request;
      } else {
        Toast.fire({ icon: "error", title: response.data.message as string });
      }
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update request status"
      );
    }
  }
);

/**
 * Upload completed file async thunk
 * Handles multipart/form-data file upload
 */
export const uploadCompletedFileAsync = createAsyncThunk(
  'request/uploadCompletedFile',
  async (
    {
      id,
      formData
    }: {
      id: string;
      formData: FormData;
    },
    { rejectWithValue }
  ) => {
    try {
      const token = `${ls.get('access_token', { decrypt: true })}`;
      HttpService.setToken(token);

      // Use the service method with multipart/form-data
      const response = await requestService.uploadFile(id, formData);

      if (response.message === "File uploaded") {
        Toast.fire({
          icon: "success",
          title: response.message,
        });
      }

      return {
        requestId: id,
        file: response.data?.file || response.file || response.data,
        message: response.message || 'File uploaded successfully',
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error?.message ||
        'Failed to upload file'
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