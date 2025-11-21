// dashboard/endpoint.ts
import { HttpService } from "../index";
export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  status?: number;
}


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

// If your backend returns: { success, message, data: { overview, statusBreakdown, recentRequests } }
export type DashboardStatsResponse = ApiEnvelope<DashboardStats>;

class DashboardService extends HttpService {
  private readonly base = "user";

  getStats = () =>
    this.get<DashboardStatsResponse>(`${this.base}/stats`);
}

export const dashboardService = new DashboardService();
