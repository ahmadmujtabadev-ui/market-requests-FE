/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Toast from "@/components/Toast";

import type { RootState } from "@/redux/store";
import { createRequestAsync, deleteRequestFileAsync, fetchRequestByIdAsync, fetchRequestsAsync, fetchRequestStatsAsync, updateRequestAsync, updateRequestStatusAsync, uploadCompletedFileAsync } from "@/services/request/asyncThunk";


export type RequestStatus = 'new' | 'progress' | 'revision' | 'completed';

export interface RequestFile {
  id: string;
  requestId: string;
  fileUrl: string;
  fileType: 'agent_upload' | 'va_completed';
  createdAt: string;
}

export interface Request {
  id: string;
  agentId: string;
  templateId: string;
  projectTitle: string;
  deadline: string;
  platforms: string[];
  dimensions?: string;
  notes?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  agent?: {
    id: string;
    name: string;
    email: string;
  };
  template?: {
    id: string;
    title: string;
    category: string;
    type: string;
    previewUrl?:string;
  };
  files?: RequestFile[];
}

export interface RequestStats {
  total: number;
  byStatus: {
    new: number;
    progress: number;
    revision: number;
    completed: number;
  };
}

export interface RequestState {
  isLoading: boolean;
  error: string;
  items: Request[];
  selectedRequest: Request | null;
  stats: RequestStats | null;
  lastCreated?: Request;
}

const initialState: RequestState = {
  isLoading: false,
  error: "",
  items: [],
  selectedRequest: null,
  stats: null,
  lastCreated: undefined,
};

export const requestSlice = createSlice({
  name: "request",
  initialState,
  reducers: {
    clearSelectedRequest: (state) => {
      state.selectedRequest = null;
    },
    clearError: (state) => {
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    // FETCH ALL REQUESTS
  builder
      .addCase(fetchRequestsAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRequestsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchRequestsAsync.rejected, (state) => {
        state.isLoading = false;
        // state.error = (action.payload as string) || "Failed to fetch requests";
      });

    // FETCH SINGLE REQUEST
    builder
      .addCase(fetchRequestByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(
        fetchRequestByIdAsync.fulfilled,
        (state, action: PayloadAction<Request>) => {
          state.isLoading = false;
          state.selectedRequest = action.payload;
        }
      )
      .addCase(fetchRequestByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Failed to load request";
        // Toast.fire({ icon: "error", title: state.error });
      });

    // CREATE REQUEST
    builder
      .addCase(createRequestAsync.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(
        createRequestAsync.fulfilled,
        (state, action: PayloadAction<Request>) => {
          state.isLoading = false;
          state.lastCreated = action.payload;
          state.items.unshift(action.payload);
          Toast.fire({ icon: "success", title: "Request created successfully" });
        }
      )
      .addCase(createRequestAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Failed to create request";
        Toast.fire({ icon: "error", title: state.error });
      });

    // UPDATE REQUEST
    builder
      .addCase(updateRequestAsync.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(
        updateRequestAsync.fulfilled,
        (state, action: PayloadAction<Request>) => {
          state.isLoading = false;
          const index = state.items.findIndex(
            (item) => item.id === action.payload.id
          );
          if (index >= 0) {
            state.items[index] = action.payload;
          }
          if (state.selectedRequest?.id === action.payload.id) {
            state.selectedRequest = action.payload;
          }
          Toast.fire({ icon: "success", title: "Request updated successfully" });
        }
      )
      .addCase(updateRequestAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Failed to update request";
        Toast.fire({ icon: "error", title: state.error });
      });

    // UPDATE REQUEST STATUS
    builder
      .addCase(updateRequestStatusAsync.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(
        updateRequestStatusAsync.fulfilled,
        (state, action: PayloadAction<Request>) => {
          state.isLoading = false;
          const index = state.items.findIndex(
            (item) => item.id === action.payload.id
          );
          if (index >= 0) {
            state.items[index] = action.payload;
          }
          if (state.selectedRequest?.id === action.payload.id) {
            state.selectedRequest = action.payload;
          }
          Toast.fire({ icon: "success", title: "Request status updated successfully" });
        }
      )
      .addCase(updateRequestStatusAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Failed to update request status";
        Toast.fire({ icon: "success", title: state.error });
      });

    // UPLOAD COMPLETED FILE
    builder
      .addCase(uploadCompletedFileAsync.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(
        uploadCompletedFileAsync.fulfilled,
        (state, action: PayloadAction<{ requestId: string; file: RequestFile }>) => {
          state.isLoading = false;
          const { requestId, file } = action.payload;
          
          // Add file to the request in items
          const requestIndex = state.items.findIndex(r => r.id === requestId);
          if (requestIndex >= 0) {
            if (!state.items[requestIndex].files) {
              state.items[requestIndex].files = [];
            }
            state.items[requestIndex].files!.push(file);
          }
          
          // Add file to selected request if it matches
          if (state.selectedRequest?.id === requestId) {
            if (!state.selectedRequest.files) {
              state.selectedRequest.files = [];
            }
            state.selectedRequest.files.push(file);
          }
          
          Toast.fire({ icon: "success", title: "File uploaded successfully" });
        }
      )
      .addCase(uploadCompletedFileAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Failed to upload file";
        Toast.fire({ icon: "error", title: state.error });
      });

    // DELETE REQUEST FILE
    builder
      .addCase(deleteRequestFileAsync.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(
        deleteRequestFileAsync.fulfilled,
        (state, action: PayloadAction<{ requestId: string; fileId: string }>) => {
          state.isLoading = false;
          const { requestId, fileId } = action.payload;
          
          // Remove file from request in items
          const requestIndex = state.items.findIndex(r => r.id === requestId);
          if (requestIndex >= 0 && state.items[requestIndex].files) {
            state.items[requestIndex].files = state.items[requestIndex].files!.filter(
              f => f.id !== fileId
            );
          }
          
          // Remove file from selected request if it matches
          if (state.selectedRequest?.id === requestId && state.selectedRequest.files) {
            state.selectedRequest.files = state.selectedRequest.files.filter(
              f => f.id !== fileId
            );
          }
          
          Toast.fire({ icon: "success", title: "File deleted successfully" });
        }
      )
      .addCase(deleteRequestFileAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Failed to delete file";
        Toast.fire({ icon: "error", title: state.error });
      });

    // FETCH REQUEST STATS
    builder
      .addCase(fetchRequestStatsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(
        fetchRequestStatsAsync.fulfilled,
        (state, action: PayloadAction<RequestStats>) => {
          state.isLoading = false;
          state.stats = action.payload;
        }
      )
      .addCase(fetchRequestStatsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Failed to load stats";
        Toast.fire({ icon: "error", title: state.error });
      });
  },
});

export const { clearSelectedRequest, clearError } = requestSlice.actions;

export default requestSlice.reducer;

// Selectors
export const selectRequests = (state: RootState) => state.request as RequestState;
export const selectRequestItems = (state: RootState) => state.request.items;
export const selectRequestLoading = (state: RootState) => state.request.isLoading;
export const selectSelectedRequest = (state: RootState) => state.request.selectedRequest;
export const selectRequestStats = (state: RootState) => state.request.stats;