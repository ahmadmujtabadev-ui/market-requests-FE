/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  CancelTokenSource
} from "axios";
import Config from "../config/index";
import ls from "localstorage-slim";

export class HttpService {
  private axiosInstance: AxiosInstance;
  private cancelTokenSources: Map<string, CancelTokenSource> = new Map();

  constructor() {
    // Create axios instance with base configuration
    this.axiosInstance = axios.create({
      baseURL: Config.API_ENDPOINT,
      timeout: Config.API_TIMEOUT || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = ls.get("access_token", { decrypt: true });
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (Config.API_ENDPOINT.includes('ngrok')) {
          config.headers['ngrok-skip-browser-warning'] = 'true';
        }

        if (Config.DEBUG) {
          console.log(` ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            params: config.params
          });
        }

        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response in development
        if (Config.DEBUG) {
          console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Log error in development
        if (Config.DEBUG) {
          console.error(`❌ ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
            status: error.response?.status,
            message: error.response?.data || error.message
          });
        }

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh token
            const refreshToken = ls.get("refresh_token", { decrypt: true });
            if (refreshToken) {
              // Implement your token refresh logic here
              // const newToken = await this.refreshToken(refreshToken);
              // ls.set("access_token", newToken, { encrypt: true });
              // return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            console.log(refreshError)
            // Refresh failed, redirect to login
            this.clearAuthData();
            // You might want to emit an event or call a callback here
            // to redirect user to login page
          }

          this.clearAuthData();
        }

        // Handle network errors

      }
    );
  }

  private clearAuthData(): void {
    ls.remove("access_token");
    ls.remove("refresh_token");
  }

  /**
   * Set Token On Header (deprecated - now handled by interceptors)
   * @param token
   */
  static setToken(token: string): void {
    console.warn('HttpService.setToken is deprecated. Token is now handled automatically.');
    // Keep for backward compatibility, but token is now handled by interceptors
    ls.set("access_token", token, { encrypt: true });
  }

  /**
   * Create a cancel token for a request
   * @param key Unique identifier for the request
   */
  private createCancelToken(key: string): CancelTokenSource {
    // Cancel any existing request with the same key
    const existing = this.cancelTokenSources.get(key);
    if (existing) {
      existing.cancel(`Request ${key} cancelled due to new request`);
    }

    const source = axios.CancelToken.source();
    this.cancelTokenSources.set(key, source);
    return source;
  }

  /**
   * Fetch data from server
   * @param url Endpoint link
   * @param params Query parameters
   * @param options Additional axios options
   * @return Promise
   */
  protected get = async <T = any>(
    url: string,
    params?: object,
    options: AxiosRequestConfig = {}
  ): Promise<T> => {
    try {
      const cancelToken = this.createCancelToken(`GET-${url}`);

      const response = await this.axiosInstance.get<T>(url, {
        params,
        cancelToken: cancelToken.token,
        ...options,
      });

      this.cancelTokenSources.delete(`GET-${url}`);
      return response?.data;
    } catch (error: any) {
      this.cancelTokenSources.delete(`GET-${url}`);
      throw error;
    }
  };

  /**
   * Write data over server
   * @param url Endpoint link
   * @param body Data to send over server
   * @param options Additional axios options
   * @return Promise
   */
  protected post = async <T = any>(
    url: string,
    body?: object,
    options: AxiosRequestConfig = {}
  ): Promise<T> => {
    try {
      const cancelToken = this.createCancelToken(`POST-${url}`);

      const response = await this.axiosInstance.post<T>(url, body, {
        cancelToken: cancelToken.token,
        ...options,
      });

      this.cancelTokenSources.delete(`POST-${url}`);
      return response.data;
    } catch (error: any) {
      this.cancelTokenSources.delete(`POST-${url}`);
      throw error;
    }
  };

  /**
   * Custom POST with full URL
   * @param url Full URL
   * @param body Data to send
   * @param options Additional axios options
   */
  protected custom_post = async <T = any>(
    url: string,
    body?: object,
    options: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> => {
    try {
      const cancelToken = this.createCancelToken(`CUSTOM-POST-${url}`);

      const response = await axios.post<T>(url, body, {
        cancelToken: cancelToken.token,
        ...options,
      });

      this.cancelTokenSources.delete(`CUSTOM-POST-${url}`);
      return response;
    } catch (error: any) {
      this.cancelTokenSources.delete(`CUSTOM-POST-${url}`);
      throw error;
    }
  };

  /**
   * Update data on server
   * @param url Endpoint link
   * @param body Data to send over server
   * @param options Additional axios options
   * @return Promise
   */
  protected put = async <T = any>(
    url: string,
    body?: object,
    options: AxiosRequestConfig = {}
  ): Promise<T> => {
    try {
      const cancelToken = this.createCancelToken(`PUT-${url}`);

      const response = await this.axiosInstance.put<T>(url, body, {
        cancelToken: cancelToken.token,
        ...options,
      });

      this.cancelTokenSources.delete(`PUT-${url}`);
      return response.data;
    } catch (error: any) {
      this.cancelTokenSources.delete(`PUT-${url}`);
      throw error;
    }
  };

  /**
   * Patch data on server
   * @param url Endpoint link
   * @param body Data to send over server
   * @param options Additional axios options
   * @return Promise
   */
  protected patch = async <T = any>(
    url: string,
    body?: object,
    options: AxiosRequestConfig = {}
  ): Promise<T> => {
    try {
      const cancelToken = this.createCancelToken(`PATCH-${url}`);

      const response = await this.axiosInstance.patch<T>(url, body, {
        cancelToken: cancelToken.token,
        ...options,
      });

      this.cancelTokenSources.delete(`PATCH-${url}`);
      return response.data;
    } catch (error: any) {
      this.cancelTokenSources.delete(`PATCH-${url}`);
      throw error;
    }
  };

  /**
   * Delete Data From Server
   * @param url Endpoint link
   * @param options Additional axios options
   * @return Promise
   */
  protected delete = async <T = any>(
    url: string,
    options: AxiosRequestConfig = {}
  ): Promise<T> => {
    try {
      const cancelToken = this.createCancelToken(`DELETE-${url}`);

      const response = await this.axiosInstance.delete<T>(url, {
        cancelToken: cancelToken.token,
        ...options,
      });

      this.cancelTokenSources.delete(`DELETE-${url}`);
      return response.data;
    } catch (error: any) {
      this.cancelTokenSources.delete(`DELETE-${url}`);
      throw error;
    }
  };

  /**
   * Cancel a specific request
   * @param key Request key to cancel
   */
  cancel = (key?: string): void => {
    if (key) {
      const source = this.cancelTokenSources.get(key);
      if (source) {
        source.cancel(`Request ${key} cancelled explicitly`);
        this.cancelTokenSources.delete(key);
      }
    } else {
      // Cancel all requests
      this.cancelTokenSources.forEach((source, key) => {
        source.cancel(`Request ${key} cancelled - all requests cancelled`);
      });
      this.cancelTokenSources.clear();
    }
  };

  /**
   * Get the axios instance for advanced usage
   */
  getInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Export a singleton instance
export const httpService = new HttpService();