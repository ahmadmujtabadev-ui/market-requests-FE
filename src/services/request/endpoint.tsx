/* eslint-disable @typescript-eslint/no-explicit-any */

import { HttpService } from '../index';

/** Domain types */
export type RequestStatus = 'new' | 'progress' | 'revision' | 'completed';

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
  };
  files?: RequestFile[];
}

export interface RequestFile {
  id: string;
  requestId: string;
  fileUrl: string;
  fileType: 'agent_upload' | 'va_completed';
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
  private readonly prefix: string = '/request';

  /**
   * List all requests (role-based filtering)
   * GET /api/v1/requests
   */
  list = (params?: { status?: RequestStatus }): Promise<any> =>
    this.get(this.prefix, { params });

  /**
   * Get single request by ID
   * GET /api/v1/requests/:id
   */
  getById = (id: string): Promise<any> =>
    this.get(`${this.prefix}/${id}`, {});

  /**
   * Create new request (agent only)
   * POST /api/v1/requests
   * Supports both JSON and multipart/form-data
   */
  create = (
    data: CreateRequestDto | FormData,
    option: any = {}
  ): Promise<any> => {
    const isFormData =
      typeof FormData !== 'undefined' && data instanceof FormData;

    const finalOptions = {
      ...option,
      ...(isFormData && {
        headers: {
          ...(option.headers || {}),
          'Content-Type': 'multipart/form-data',
        },
      }),
    };

    return this.post(this.prefix, data, finalOptions);
  };

  /**
   * Update request (agent can update their own)
   * PUT /api/v1/requests/:id
   */
  update = (id: string, data: UpdateRequestDto, option = {}): Promise<any> =>
    this.put(`${this.prefix}/${id}`, data, option);

  /**
   * Update request status (VA/Admin only)
   * PUT /api/v1/requests/:id/status
   */
  updateStatus = (
    id: string,
    status: RequestStatus,
    option = {}
  ): Promise<any> =>
    this.put(`${this.prefix}/${id}/status`, { status }, option);

  /**
   * Upload completed file (VA only)
   * POST /api/v1/requests/:id/files
   * Accepts FormData with file and fileType
   */
  uploadFile = (
    id: string,
    data: FormData | { fileUrl: string; fileType?: string },
    option: any = {}
  ): Promise<any> => {
    const isFormData =
      typeof FormData !== 'undefined' && data instanceof FormData;

    const finalOptions = {
      ...option,
      ...(isFormData && {
        headers: {
          ...(option.headers || {}),
          'Content-Type': 'multipart/form-data',
        },
      }),
    };

    return this.post(`${this.prefix}/${id}/files`, data, finalOptions);
  };

  /**
   * Delete file
   * DELETE /api/v1/requests/:id/files/:fileId
   */
  deleteFile = (id: string, fileId: string, option = {}): Promise<any> =>
    this.delete(`${this.prefix}/${id}/files/${fileId}`, option);

  /**
   * Get request statistics
   * GET /api/v1/requests/stats
   */
  getStats = (): Promise<any> => this.get(`${this.prefix}/stats`, {});
}

export const requestService = new RequestService();