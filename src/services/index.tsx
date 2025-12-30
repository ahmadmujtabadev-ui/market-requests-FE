/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  CancelTokenSource,
} from "axios";
import Config from "../config/index";
import ls from "localstorage-slim";

export class HttpService {
  private axiosInstance: AxiosInstance;
  private cancelTokenSources: Map<string, CancelTokenSource> = new Map();

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: Config.API_ENDPOINT,
      // IMPORTANT: Do NOT set Content-Type globally
      headers: {
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // ---- Auth token ----
        const token = ls.get("access_token", { decrypt: true });
        if (token) {
          config.headers = config.headers || {};
          (config.headers as any).Authorization = `Bearer ${token}`;
        }

        // ---- ngrok special header ----
        if (Config.API_ENDPOINT?.includes("ngrok")) {
          config.headers = config.headers || {};
          (config.headers as any)["ngrok-skip-browser-warning"] = "true";
        }

        // ---- CRITICAL FIX: FormData must NOT have JSON content-type ----
        const isFormData =
          typeof FormData !== "undefined" && config.data instanceof FormData;

        if (isFormData) {
          // Let browser/axios set: multipart/form-data; boundary=...
          config.headers = config.headers || {};
          delete (config.headers as any)["Content-Type"];
          delete (config.headers as any)["content-type"];
        } else {
          // For non-FormData, ensure JSON content-type (optional but safe)
          config.headers = config.headers || {};
          if (
            !(config.headers as any)["Content-Type"] &&
            !(config.headers as any)["content-type"]
          ) {
            (config.headers as any)["Content-Type"] = "application/json";
          }
        }

        if (Config.DEBUG) {
          console.log(`➡️ ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data,
            headers: config.headers,
          });
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        if (Config.DEBUG) {
          console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
          });
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        if (Config.DEBUG) {
          console.error(
            `❌ ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
            {
              status: error.response?.status,
              message: error.response?.data || error.message,
            }
          );
        }

        // Example: handle 401
        if (error.response?.status === 401 && !originalRequest?._retry) {
          originalRequest._retry = true;
          this.clearAuthData();
        }

        return Promise.reject(error);
      }
    );
  }

  private clearAuthData(): void {
    ls.remove("access_token");
    ls.remove("refresh_token");
  }

  // Keep if you use it elsewhere
  static setToken(token: string): void {
    // only for legacy compatibility
    ls.set("access_token", token, { encrypt: true });
  }

  private createCancelToken(key: string): CancelTokenSource {
    const existing = this.cancelTokenSources.get(key);
    if (existing) {
      existing.cancel(`Request ${key} cancelled due to new request`);
    }
    const source = axios.CancelToken.source();
    this.cancelTokenSources.set(key, source);
    return source;
  }

  protected get = async <T = any>(
    url: string,
    params?: object,
    options: AxiosRequestConfig = {}
  ): Promise<T> => {
    const key = `GET-${url}`;
    const cancelToken = this.createCancelToken(key);

    try {
      const response = await this.axiosInstance.get<T>(url, {
        params,
        cancelToken: cancelToken.token,
        ...options,
      });
      return response.data;
    } finally {
      this.cancelTokenSources.delete(key);
    }
  };

  protected post = async <T = any>(
    url: string,
    body?: any,
    options: AxiosRequestConfig = {}
  ): Promise<T> => {
    const key = `POST-${url}`;
    const cancelToken = this.createCancelToken(key);

    try {
      const response = await this.axiosInstance.post<T>(url, body, {
        cancelToken: cancelToken.token,
        ...options,
      });
      return response.data;
    } finally {
      this.cancelTokenSources.delete(key);
    }
  };

  protected put = async <T = any>(
    url: string,
    body?: any,
    options: AxiosRequestConfig = {}
  ): Promise<T> => {
    const response = await this.axiosInstance.put<T>(url, body, {
      ...options,
    });
    return response.data;
  };

  protected patch = async <T = any>(
    url: string,
    body?: any,
    options: AxiosRequestConfig = {}
  ): Promise<T> => {
    const response = await this.axiosInstance.patch<T>(url, body, {
      ...options,
    });
    return response.data;
  };

  protected delete = async <T = any>(
    url: string,
    options: AxiosRequestConfig = {}
  ): Promise<T> => {
    const response = await this.axiosInstance.delete<T>(url, {
      ...options,
    });
    return response.data;
  };

  cancel = (key?: string): void => {
    if (key) {
      const source = this.cancelTokenSources.get(key);
      if (source) {
        source.cancel(`Request ${key} cancelled explicitly`);
        this.cancelTokenSources.delete(key);
      }
      return;
    }

    this.cancelTokenSources.forEach((source, k) => {
      source.cancel(`Request ${k} cancelled - all requests cancelled`);
    });
    this.cancelTokenSources.clear();
  };

  getInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export const httpService = new HttpService();
