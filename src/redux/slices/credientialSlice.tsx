/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Toast from "@/components/Toast";
import {
  fetchCredentialsAsync,
  revokeCredentialAsync,
  rotateCredentialAsync,
  saveLeasesAsync,
} from "@/services/credientials/asyncThunk";
import type { RootState } from "@/redux/store";

type ItemsOrPaged =
  | CredentialModel[]
  | { items: CredentialModel[]; page?: number; total?: number };


export interface CredentialModel {
  id: string;
  exchange?: "binance" | "bybit" | "bingx";
  label?: string;
  apiKeyMasked?: string;
  apiKeyFingerprint?: string;
  status?: "active" | "revoked";
  createdAt?: string;
  lastUsedAt?: string;
  ownerEmail?: string;
  ownerUsername?: string;
  notes?: string;
}

export interface CredentialState {
  isLoading: boolean;
  error: string;
  items: CredentialModel[];   // <-- plain array
  lastSaved?: CredentialModel;
}

const initialState: CredentialState = {
  isLoading: false,
  error: "",
  items: [],
  lastSaved: undefined,
};

function updateOne(itemsOrPaged: ItemsOrPaged, id: string, patch: Partial<CredentialModel>) {
  if (Array.isArray(itemsOrPaged)) {
    const idx = itemsOrPaged.findIndex((x) => String(x.id) === String(id));
    if (idx >= 0) itemsOrPaged[idx] = { ...itemsOrPaged[idx], ...patch };
  } else if (itemsOrPaged?.items) {
    const idx = itemsOrPaged.items.findIndex((x) => String(x.id) === String(id));
    if (idx >= 0) itemsOrPaged.items[idx] = { ...itemsOrPaged.items[idx], ...patch };
  }
}
export const credentialSlice = createSlice({
  name: "credential",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // SAVE
    builder
      .addCase(saveLeasesAsync.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(saveLeasesAsync.fulfilled, (state, action: PayloadAction<CredentialModel>) => {
        state.isLoading = false;
        state.lastSaved = action.payload;
        state.items.unshift(action.payload);
        Toast.fire({ icon: "success", title: "Credential saved" });
      })
      .addCase(saveLeasesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Failed to save credential";
        Toast.fire({ icon: "error", title: state.error });
      });

    // LIST
    builder
      .addCase(fetchCredentialsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(
        fetchCredentialsAsync.fulfilled,
        (state, action: PayloadAction<CredentialModel[]>) => {
          state.isLoading = false;
          state.items = action.payload; // <-- assign array
        }
      )
      .addCase(fetchCredentialsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Failed to load credentials";
      });

    // ROTATE
    builder
      .addCase(
        rotateCredentialAsync.fulfilled,
        (state, action: PayloadAction<{ id: string; rotatedAt?: string }>) => {
          const id = action.payload.id;
          const arr = state.items; // <-- array, not `.items`
          const i = arr.findIndex((x) => x.id === id);
          if (i >= 0) {
            arr[i] = { ...arr[i], ...action.payload };
          }
          Toast.fire({ icon: "success", title: "Credential rotated" });
        }
      )
      .addCase(rotateCredentialAsync.rejected, (_state, action) => {
        Toast.fire({ icon: "error", title: (action.payload as string) ?? "Rotate failed" });
      });

    // REVOKE
    builder
        .addCase(revokeCredentialAsync.fulfilled, (state, action) => {
        // your service returns { id, status: 'revoked' }
        const { id } = action.payload as { id: string; status?: string };
        updateOne(state.items, id, { status: 'revoked' as any });
      })
      .addCase(revokeCredentialAsync.rejected, (_state, action) => {
        Toast.fire({ icon: "error", title: (action.payload as string) ?? "Revoke failed" });
      });
  },
});

export default credentialSlice.reducer;

// Selector
export const selectCredentials = (s: RootState) => s.credential as CredentialState;
