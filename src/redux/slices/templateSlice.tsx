/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Toast from "@/components/Toast";

import type { RootState } from "@/redux/store";
import { createTemplateAsync, deleteTemplateAsync, fetchTemplateByIdAsync, fetchTemplatesAsync, updateTemplateAsync } from "@/services/template/asyncThunk";

export type TemplateType = 'residential' | 'commercial';

export interface Template {
  id: string;
  title: string;
  category: string;
  type: TemplateType;
  previewUrl?: string;
  canvaUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateState {
  isLoading: boolean;
  error: string;
  items: Template[];
  selectedTemplate: Template | null;
  lastCreated?: Template;
}

const initialState: TemplateState = {
  isLoading: false,
  error: "",
  items: [],
  selectedTemplate: null,
  lastCreated: undefined,
};

export const templateSlice = createSlice({
  name: "template",
  initialState,
  reducers: {
    clearSelectedTemplate: (state) => {
      state.selectedTemplate = null;
    },
    clearError: (state) => {
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    // FETCH ALL TEMPLATES
    builder
      .addCase(fetchTemplatesAsync.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(
        fetchTemplatesAsync.fulfilled,
        (state, action) => {
          state.isLoading = false;
          state.error = "";
          // CRITICAL: Make sure you're setting items to the templates array
          state.items = action?.payload?.templates || action?.payload || [];
          console.log('Templates updated in state:', state.items.length);
        }
      )
      .addCase(fetchTemplatesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Failed to load templates";
        Toast.fire({ icon: "error", title: state.error });
      });

    // FETCH SINGLE TEMPLATE
    builder
      .addCase(fetchTemplateByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(
        fetchTemplateByIdAsync.fulfilled,
        (state, action: PayloadAction<Template>) => {
          state.isLoading = false;
          state.selectedTemplate = action.payload;
        }

      )
      .addCase(fetchTemplateByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Failed to load template";
        Toast.fire({ icon: "success", title: state.error });
      });

    // CREATE TEMPLATE
    builder
      .addCase(createTemplateAsync.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(
        createTemplateAsync.fulfilled,
        (state, action: PayloadAction<Template>) => {
          state.isLoading = false;
          state.lastCreated = action.payload;
          state.items.unshift(action.payload);
          Toast.fire({ icon: "success", title: "Template created successfully" });
        }
      )
      .addCase(createTemplateAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Failed to create template";
        Toast.fire({ icon: "success", title: state.error });
      });

    // UPDATE TEMPLATE
    builder
      .addCase(updateTemplateAsync.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(
        updateTemplateAsync.fulfilled,
        (state, action: PayloadAction<Template>) => {
          state.isLoading = false;
          const index = state.items.findIndex(
            (item) => item.id === action.payload.id
          );
          if (index >= 0) {
            state.items[index] = action.payload;
          }
          if (state.selectedTemplate?.id === action.payload.id) {
            state.selectedTemplate = action.payload;
          }
          Toast.fire({ icon: "success", title: "Template updated successfully" });
        }
      )
      .addCase(updateTemplateAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Failed to update template";
        Toast.fire({ icon: "success", title: "Template updated successfully" });
      });

    builder
      .addCase(deleteTemplateAsync.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(
        deleteTemplateAsync.fulfilled,
        (state, action: PayloadAction<{ id: string }>) => {
          state.isLoading = false;
          state.items = state.items.filter(
            (item) => item.id !== action.payload.id
          );
          if (state.selectedTemplate?.id === action.payload.id) {
            state.selectedTemplate = null;
          }
          // Show success toast
          Toast.fire({ icon: "success", title: "Template deleted successfully" });
        }
      )
      .addCase(deleteTemplateAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Failed to delete template";
        // Show error toast
        Toast.fire({ icon: "error", title: state.error });
      });
  },
});

export const { clearSelectedTemplate, clearError } = templateSlice.actions;

export default templateSlice.reducer;

// Selectors
export const selectTemplates = (state: RootState) => state.template as TemplateState;
export const selectTemplateItems = (state: RootState) => state.template.items;
export const selectTemplateLoading = (state: RootState) => state.template.isLoading;
export const selectSelectedTemplate = (state: RootState) => state.template.selectedTemplate;