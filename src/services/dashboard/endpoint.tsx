// dashboard/endpoint.ts
import { HttpService } from "../index";

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
  status: "new" | "progress" | "revision" | "completed";
  date: string;
  template: string;
}

export interface DashboardStats {
  overview: DashboardOverview;
  statusBreakdown: StatusBreakdown;
  recentRequests: RecentRequest[];
}

// Fix: Use 'stats' instead of 'data' to match actual API response
export interface DashboardStatsResponse {
  success: boolean;
  message?: string;
  stats: DashboardStats;
  status?: number;
}

class DashboardService extends HttpService {
  private readonly base = "user";

  getStats = () =>
    this.get<DashboardStatsResponse>(`${this.base}/stats`);
}

export const dashboardService = new DashboardService();