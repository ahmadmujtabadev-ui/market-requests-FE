/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Toast from "@/components/Toast";

import type { RootState } from "@/redux/store";
import { createCategoryAsync, deleteCategoryAsync, fetchCategoriesAsync, fetchCategoryByIdAsync, updateCategoryAsync } from "@/services/category/asyncThunk";


export interface Category {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    order: number;
    createdAt: string;
    updatedAt: string;
    _count?: {
        templates: number;
    };
}

export interface CategoryState {
    isLoading: boolean;
    error: string;
    items: Category[];
    selectedCategory: Category | null;
    lastCreated?: Category;
}

const initialState: CategoryState = {
    isLoading: false,
    error: "",
    items: [],
    selectedCategory: null,
    lastCreated: undefined,
};

export const categorySlice = createSlice({
    name: "category",
    initialState,
    reducers: {
        clearSelectedCategory: (state) => {
            state.selectedCategory = null;
        },
        clearError: (state) => {
            state.error = "";
        },
    },
    extraReducers: (builder) => {
        // FETCH ALL CATEGORIES
        builder
            .addCase(fetchCategoriesAsync.pending, (state) => {
                state.isLoading = true;
                state.error = "";
            })
            .addCase(fetchCategoriesAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = "";
                state.items = action.payload || [];
                console.log("Categories updated in state:", action.payload);
            })

            .addCase(fetchCategoriesAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = (action.payload as string) ?? "Failed to load categories";
                Toast.fire({ icon: "error", title: state.error });
            });

        // FETCH SINGLE CATEGORY
        builder
            .addCase(fetchCategoryByIdAsync.pending, (state) => {
                state.isLoading = true;
                state.error = "";
            })
            .addCase(
                fetchCategoryByIdAsync.fulfilled,
                (state, action: PayloadAction<Category>) => {
                    state.isLoading = false;
                    state.selectedCategory = action.payload;
                }
            )
            .addCase(fetchCategoryByIdAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = (action.payload as string) ?? "Failed to load category";
                Toast.fire({ icon: "error", title: state.error });
            });

        // CREATE CATEGORY
        builder
            .addCase(createCategoryAsync.pending, (state) => {
                state.isLoading = true;
                state.error = "";
            })
            .addCase(
                createCategoryAsync.fulfilled,
                (state, action: PayloadAction<Category>) => {
                    state.isLoading = false;
                    state.lastCreated = action.payload;
                    state.items?.push(action?.payload);
                    console.log("100", state.items)
                    // Sort by order
                    state.items.sort((a, b) => a.order - b.order);
                }
            )
            .addCase(createCategoryAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = (action.payload as string) ?? "Failed to create category";
            });

        // UPDATE CATEGORY
        builder
            .addCase(updateCategoryAsync.pending, (state) => {
                state.isLoading = true;
                state.error = "";
            })
            .addCase(
                updateCategoryAsync.fulfilled,
                (state, action: PayloadAction<Category>) => {
                    state.isLoading = false;
                    const index = state.items.findIndex(
                        (item) => item.id === action.payload.id
                    );
                    if (index >= 0) {
                        state.items[index] = action.payload;
                        // Sort by order after update
                        state.items.sort((a, b) => a.order - b.order);
                    }
                    if (state.selectedCategory?.id === action.payload.id) {
                        state.selectedCategory = action.payload;
                    }
                }
            )
            .addCase(updateCategoryAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = (action.payload as string) ?? "Failed to update category";
            });

        // DELETE CATEGORY
        builder
            .addCase(deleteCategoryAsync.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteCategoryAsync.fulfilled, (state, action) => {
                state.isLoading = false;

                const id = action.payload?.id;
                if (!id) return;

                state.items = state.items.filter((item) => item.id !== id);

                if (state.selectedCategory?.id === id) {
                    state.selectedCategory = null;
                }
            })
            .addCase(deleteCategoryAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = (action.payload as string) ?? "Failed to delete category";
            });
    },
});

export const { clearSelectedCategory, clearError } = categorySlice.actions;

export default categorySlice.reducer;

// Selectors
export const selectCategories = (state: RootState) =>
    state.category as CategoryState;
export const selectCategoryItems = (state: RootState) =>
    state.category.items;
export const selectActiveCategoryItems = (state: RootState) =>
    state.category.items.filter((item) => item.isActive);
export const selectCategoryLoading = (state: RootState) =>
    state.category.isLoading;
export const selectSelectedCategory = (state: RootState) =>
    state.category.selectedCategory;