/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpService } from "../index";

// Dashboard Stats Response Types
export interface DashboardOverview {
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  completedRequests: number;
  thisWeekRequests: number;
  thisMonthCompleted: number;
  monthTrend: number;
}

export interface StatusBreakdown {
  new: number;
  progress: number;
  revision: number;
  completed: number;
}

export interface RecentRequest {
  id: string;
  title: string;
  status: 'new' | 'progress' | 'revision' | 'completed';
  date: string;
  template: string;
}

export interface DashboardStats {
  overview: DashboardOverview;
  statusBreakdown: StatusBreakdown;
  recentRequests: RecentRequest[];
}

export interface DashboardStatsResponse {
  message: string;
  stats: DashboardStats;
}

class DashboardService extends HttpService {
  private readonly base = "user";

  /**
   * GET /api/dashboard/stats
   * Fetch comprehensive dashboard statistics for the authenticated agent
   */
  getStats = () => this.get<DashboardStatsResponse>(`${this.base}/stats`);
}

export const dashboardService = new DashboardService();