/* eslint-disable @typescript-eslint/no-explicit-any */

import { createAsyncThunk } from "@reduxjs/toolkit";
import ls from "localstorage-slim";
import { HttpService } from "../index"; 
import Toast from "@/components/Toast";
import { credentialService } from "./enpoints";

export const saveLeasesAsync = createAsyncThunk(
  "user/lease",
  async (dto, { rejectWithValue }) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`
        HttpService.setToken(token);
      const response = await credentialService.save(dto); 
       if (response?.success || response?.status === 200) {
        Toast.fire({ icon: "success", title: response.message as string });
      }
      console.log("response", response)
      if (!response.success || response.status === 400) {
        return rejectWithValue(response.message);
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch drafts");
    }
  }
);

// in asyncThunk.ts
export const fetchCredentialsAsync = createAsyncThunk(
  "user/getlease",
  async (_: void, { rejectWithValue }) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      HttpService.setToken(token);
      const response = await credentialService.getcrediential();

      if (!response?.success && response?.status === 400) {
        return rejectWithValue(response.message);
      }

      const data = Array.isArray(response.data)
        ? { items: response.data, page: 1, pageSize: response.data.length, total: response.data.length }
        : response.data; 

      return data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || "Failed to fetch drafts");
    }
  }
);


/** ROTATE */
export const rotateCredentialAsync = createAsyncThunk(
  "user/rotateCredential",
  async (id: string, { rejectWithValue }) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      console.log("async running");
      HttpService.setToken(token);

      const response = await credentialService.rotate(id);
      if (response?.success || response?.status === 200) {
        Toast.fire({ icon: "success", title: response.message as string });
      }
      console.log("response", response);

      if (!response.success || response.status === 400) {
        return rejectWithValue(response.message);
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to rotate credential"
      );
    }
  }
);

/** REVOKE */
export const revokeCredentialAsync = createAsyncThunk(
  "user/revokeCredential",
  async (id: string, { rejectWithValue }) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      console.log("async running");
      HttpService.setToken(token);

      const response = await credentialService.revoke(id);
      if (response?.success || response?.status === 200) {
        Toast.fire({ icon: "success", title: response.message as string });
      }
      console.log("response", response);

      if (!response.success || response.status === 400) {
        return rejectWithValue(response.message);
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to revoke credential"
      );
    }
  }
);

/** DELETE */
export const deleteCredentialAsync = createAsyncThunk(
  "user/deleteCredential",
  async (id: string, { rejectWithValue }) => {
    try {
      const token = `${ls.get("access_token", { decrypt: true })}`;
      console.log("async running");
      HttpService.setToken(token);

      const response = await credentialService.remove(id);
      if (response?.success || response?.status === 200) {
        Toast.fire({ icon: "success", title: response.message as string });
      }
      console.log("response", response);

      if (!response.success || response.status === 400) {
        return rejectWithValue(response.message);
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete credential"
      );
    }
  }
);