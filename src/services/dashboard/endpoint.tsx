/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpService } from "../index";

class DashboardBaseService extends HttpService {
  private readonly prefix: string = "/api/v1/connections";

  /**
   * Lease
   * @paramdata
   */
  auth = (data: any): Promise<any> => this.get(this.prefix + ``, data);
   dashboardStats = (): Promise<any> =>
      this.get(this.prefix + `/stats`, {})

}

export const dashboardStatusService = new DashboardBaseService();

