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

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  status?: number;
}

class CategoryService extends HttpService {
  private readonly prefix: string = "template/categories";

  /**
   * List all categories
   * GET /api/categories
   */
  list = (): Promise<any> =>
    this.get(this.prefix);

  /**
   * Get single category by ID
   * GET /api/categories/:id
   */
  getById = (id: string): Promise<any> =>
    this.get(`${this.prefix}/${id}`, {});

  /**
   * Create new category (admin only)
   * POST /api/categories
   */
  create = (data: {
    name: string;
    description?: string;
    isActive?: boolean;
    order?: number;
  }, option = {}): Promise<any> =>
    this.post(this.prefix, data, option);

  /**
   * Update category (admin only)
   * PUT /api/categories/:id
   */
  update = (
    id: string,
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
      order?: number;
    },
    option = {}
  ): Promise<any> =>
    this.put(`${this.prefix}/${id}`, data, option);

  /**
   * Delete category (admin only)
   * DELETE /api/categories/:id
   */
  remove = (id: string, option = {}): Promise<any> =>
    this.delete(`${this.prefix}/${id}`, option);
}

export const categoryService = new CategoryService();