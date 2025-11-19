// src/services/adminstats/endpoints.ts

export interface OverviewStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    byRole: {
      admin: number;
      agent: number;
      va: number;
    };
  };
  templates: {
    total: number;
    residential: number;
    commercial: number;
  };
  requests: {
    total: number;
    new: number;
    progress: number;
    revision: number;
    completed: number;
    byStatus: {
      [status: string]: number; // e.g. "new": 7
    };
  };
  recentActivity: {
    id: string;
    projectTitle: string;
    status: string;
    agent: {
      id: string;
      name: string;
      email: string;
    };
    template: {
      id: string;
      title: string;
      category: string;
    };
    createdAt: string;
    deadline: string | null;
  }[];
  charts: {
    monthlyRequests: {
      month: string; // "2025-11"
      total: number;
      new: number;
      progress: number;
      revision: number;
      completed: number;
    }[];
  };
}
