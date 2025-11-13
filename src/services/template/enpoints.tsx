/* eslint-disable @typescript-eslint/no-explicit-any */

import { HttpService } from "../index";

/** Domain types */
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

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  status?: number;
}

class TemplateService extends HttpService {
  private readonly prefix: string = "/template";

  /**
   * List all templates
   * GET /api/v1/templates
   */
  list = (params?: { type?: TemplateType; category?: string }): Promise<any> =>
    this.get(this.prefix, { params });

  /**
   * Get single template by ID
   * GET /api/v1/templates/:id
   */
  getById = (id: string): Promise<any> =>
    this.get(`${this.prefix}/${id}`, {});

  /**
   * Create new template (admin only)
   * POST /api/v1/templates
   */
  create = (data: Partial<Template>, option = {}): Promise<any> =>
    this.post(this.prefix, data, option);

  /**
   * Update template (admin only)
   * PUT /api/v1/templates/:id
   */
  update = (id: string, data: Partial<Template>, option = {}): Promise<any> =>
    this.put(`${this.prefix}/${id}`, data, option);

  /**
   * Delete template (admin only)
   * DELETE /api/v1/templates/:id
   */
  remove = (id: string, option = {}): Promise<any> =>
    this.delete(`${this.prefix}/${id}`, option);
}

export const templateService = new TemplateService();