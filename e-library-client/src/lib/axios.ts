import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore, getRefreshToken } from "@/stores/authStore";
import { toast } from "sonner";

/**
 * API BASE URL Configuration
 * Prioritizes environment variable, then falls back to local dev if on localhost, 
 * finally uses the production Render deployment.
 */
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return "http://localhost:5000/api/v1";
  }
  
  return "http://localhost:5000/api/v1";
};

const API_BASE_URL = getBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // Increased to 60s to handle cold starts on free tier hosting
  withCredentials: true,
});

// Global state for token refresh
let isRefreshing = false;
let refreshSubscribers: Array<(error?: any) => void> = [];

function subscribeTokenRefresh(callback: (error?: any) => void) {
  refreshSubscribers.push(callback);
}

function onRefreshComplete(error?: any) {
  refreshSubscribers.forEach((callback) => callback(error));
  refreshSubscribers = [];
}

// Request interceptor: Inject Access Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle Errors & Token Refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle Timeouts explicitly
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      toast.error("Cloud backend is taking too long to respond. It might be waking up from sleep. Please try again in a few seconds.", {
        description: "Status: Connection Timeout (60s)",
        duration: 5000,
      });
    }

    // Handle 401 Unauthorized -> Refresh Flow
    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthEndpoint = originalRequest.url?.includes("/auth/");
      
      // If auth itself fails, don't loop
      if (isAuthEndpoint && !originalRequest.url?.includes("/auth/me")) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          isRefreshing = false;
          onRefreshComplete(error);
          useAuthStore.getState().logout();
          if (typeof window !== "undefined" && !window.location.pathname.includes('/login')) {
            window.location.href = "/login?session_expired=true";
          }
          return Promise.reject(error);
        }

        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken },
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          );

          if (response.data.success && response.data.data) {
            const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;
            useAuthStore.getState().setTokens(accessToken, newRefreshToken);
            if (user) useAuthStore.getState().setUser(user);
            
            isRefreshing = false;
            onRefreshComplete();

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return api(originalRequest);
          } else {
            throw new Error("Refresh failed");
          }
        } catch (refreshError: any) {
          isRefreshing = false;
          onRefreshComplete(refreshError);
          useAuthStore.getState().logout();
          if (typeof window !== "undefined" && !window.location.pathname.includes('/login')) {
            window.location.href = "/login?session_expired=true";
          }
          return Promise.reject(refreshError);
        }
      }

      // Queue requests while refreshing
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((err?: any) => {
          if (err) {
            reject(err);
          } else {
            const token = useAuthStore.getState().accessToken;
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          }
        });
      });
    }

    // Generic error handling
    if (error.response?.status === 403) {
      toast.error("Access Denied: You don't have permission for this.");
    }

    if (error.response?.status === 422) {
      const data = error.response.data as { errors?: Record<string, string[]>, message?: string };
      const msg = data?.message || (data?.errors ? Object.values(data.errors)[0]?.[0] : "Validation Error");
      toast.error(msg);
    }

    if (error.response?.status && error.response.status >= 500) {
      toast.error("Internal Server Error", { description: "The backend encountered an unhandled exception." });
    }

    // Attach metadata for easier hook consumption
    const apiError = error as any;
    apiError.status = error.response?.status;
    apiError.data = error.response?.data;

    return Promise.reject(apiError);
  }
);

export default api;