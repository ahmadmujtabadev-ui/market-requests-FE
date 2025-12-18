/* eslint-disable @typescript-eslint/no-explicit-any */

import { HttpService } from "../index";

/** Domain types */
export type RequestStatus = "new" | "progress" | "revision" | "completed";

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
  template: {
    id: string;
    title: string;
    category: string;
    type: string;
  };
  files?: RequestFile[];
}

export interface RequestFile {
  id: string;
  requestId: string;
  fileUrl: string;
  fileType: "agent_upload" | "va_completed";
  createdAt: string;
}

export interface CreateRequestDto {
  templateId: string;
  projectTitle: string;
  deadline: string;
  platforms: string[];
  dimensions?: string;
  notes?: string;
  fileUrls?: string[];
}

export interface UpdateRequestDto {
  projectTitle?: string;
  deadline?: string;
  platforms?: string[];
  dimensions?: string;
  notes?: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  status?: number;
}

class RequestService extends HttpService {
  private readonly prefix: string = "/request";

  list = (params?: { status?: RequestStatus }): Promise<any> =>
    this.get(this.prefix, { params });

  getById = (id: string): Promise<any> => this.get(`${this.prefix}/${id}`, {});

  /**
   * ✅ FIXED: Create new request
   * - If FormData: DO NOT set Content-Type
   */
  create = (data: CreateRequestDto | FormData, option: any = {}): Promise<any> => {
    const isFormData =
      typeof FormData !== "undefined" && data instanceof FormData;

    const finalOptions = {
      ...option,
      headers: {
        ...(option.headers || {}),
      },
    };

    if (isFormData) {
      // IMPORTANT: allow axios/browser to set boundary
      delete finalOptions.headers["Content-Type"];
      delete finalOptions.headers["content-type"];
    } else {
      finalOptions.headers["Content-Type"] =
        finalOptions.headers["Content-Type"] || "application/json";
    }

    return this.post(this.prefix, data as any, finalOptions);
  };

  update = (id: string, data: UpdateRequestDto, option = {}): Promise<any> =>
    this.put(`${this.prefix}/${id}`, data, option);

  updateStatus = (id: string, status: RequestStatus, option = {}): Promise<any> =>
    this.put(`${this.prefix}/${id}/status`, { status }, option);

  /**
   * ✅ FIXED: Upload completed file
   * - If FormData: DO NOT set Content-Type
   */
  uploadFile = (
    id: string,
    data: FormData | { fileUrl: string; fileType?: string },
    option: any = {}
  ): Promise<any> => {
    const isFormData =
      typeof FormData !== "undefined" && data instanceof FormData;

    const finalOptions = {
      ...option,
      headers: {
        ...(option.headers || {}),
      },
    };

    if (isFormData) {
      delete finalOptions.headers["Content-Type"];
      delete finalOptions.headers["content-type"];
    } else {
      finalOptions.headers["Content-Type"] =
        finalOptions.headers["Content-Type"] || "application/json";
    }

    return this.post(`${this.prefix}/${id}/files`, data as any, finalOptions);
  };

  deleteFile = (id: string, fileId: string, option = {}): Promise<any> =>
    this.delete(`${this.prefix}/${id}/files/${fileId}`, option);

  getStats = (): Promise<any> => this.get(`${this.prefix}/stats`, {});
}

export const requestService = new RequestService();
