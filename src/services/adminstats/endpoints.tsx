/* eslint-disable @typescript-eslint/no-explicit-any */

import { OverviewStats } from "@/types/stats";
import { HttpService } from "../index";

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: {
    admin?: number;
    agent?: number;
    va?: number;
  };
}

export interface TemplateStats {
  total: number;
  active: number;
  inactive: number;
  byCategory?: Record<string, number>;
}

export interface RequestStats {
  total: number;
  success: number;
  failed: number;
  byType?: Record<string, number>;
}

class StatsService extends HttpService {
  private readonly base = "stats";

  getOverview = () =>
    this.get<{ overview: OverviewStats }>(`${this.base}/view`);

  
  getUserStats = () =>
    this.get<{ stats: UserStats }>(`${this.base}/users`);

  // GET /admin/stats/templates
  getTemplateStats = () =>
    this.get<{ stats: TemplateStats }>(`${this.base}/templates`);

  // GET /admin/stats/requests
  getRequestStats = () =>
    this.get<{ stats: RequestStats }>(`${this.base}/requests`);
}

export const statsService = new StatsService();
