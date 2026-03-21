import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore, getRefreshToken } from "@/stores/authStore";
import { toast } from "sonner";

/**
 * API BASE URL Configuration
 */
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  return "https://e-library-xbt1.onrender.com/api/v1";
};

export const API_BASE_URL = getBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
  withCredentials: true,
});

// ─── Token Refresh Queue ─────────────────────────────────────────────────────
// Holds pending requests while a token refresh is in flight.
// When refresh completes: callbacks receive (null) → they retry.
// When refresh fails:     callbacks receive (error) → they reject.

let isRefreshing = false;
let pendingRequests: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function enqueueRequest(
  resolve: (token: string) => void,
  reject: (err: unknown) => void
) {
  pendingRequests.push({ resolve, reject });
}

function flushQueue(newToken: string) {
  pendingRequests.forEach(({ resolve }) => resolve(newToken));
  pendingRequests = [];
}

function rejectQueue(err: unknown) {
  pendingRequests.forEach(({ reject }) => reject(err));
  pendingRequests = [];
}

// ─── Request interceptor — inject access token ───────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor — handle errors and token refresh ──────────────────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // ── Connection timeout ──────────────────────────────────────────────────
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      toast.error(
        "The server is taking too long to respond. It may be waking up from sleep — please try again in a few seconds.",
        { duration: 5000 }
      );
    }

    // ── 401 → Token refresh flow ────────────────────────────────────────────
    // Skip refresh for auth endpoints (except /auth/me which requires a valid token)
    const isAuthEndpoint = originalRequest.url?.includes("/auth/");
    const isRefreshEndpoint = originalRequest.url?.includes("/auth/refresh");
    const isLoginEndpoint = originalRequest.url?.includes("/auth/login");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshEndpoint &&
      !isLoginEndpoint
    ) {
      // If we're already refreshing, queue this request and wait
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          enqueueRequest(resolve, reject);
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        isRefreshing = false;
        rejectQueue(error);
        useAuthStore.getState().logout();
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          window.location.href = "/login?session_expired=true";
        }
        return Promise.reject(error);
      }

      try {
        // Use a raw axios call (NOT the `api` instance) to avoid interceptor loops
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        // Backend shape: { success: true, data: { user, tokens: { accessToken, refreshToken } } }
        if (!data?.success || !data?.data?.tokens) {
          throw new Error("Refresh response did not contain tokens");
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          data.data.tokens;
        const user = data.data.user;

        useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);
        if (user) useAuthStore.getState().setUser(user);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        isRefreshing = false;
        flushQueue(newAccessToken);

        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        rejectQueue(refreshError);

        useAuthStore.getState().logout();
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          window.location.href = "/login?session_expired=true";
        }
        return Promise.reject(refreshError);
      }
    }

    // ── Other HTTP errors ───────────────────────────────────────────────────
    if (error.response?.status === 403) {
      toast.error("Access Denied: You don't have permission for this action.");
    }

    if (error.response?.status === 422) {
      const errData = error.response.data as {
        errors?: Record<string, string[]>;
        message?: string;
      };
      const msg =
        errData?.message ||
        (errData?.errors
          ? Object.values(errData.errors)[0]?.[0]
          : "Validation error");
      toast.error(msg);
    }

    if (error.response?.status && error.response.status >= 500) {
      toast.error("Internal Server Error", {
        description: "The server encountered an unexpected error.",
      });
    }

    // Attach metadata so hook onError handlers can check error.status / error.data
    const apiError = error as any;
    apiError.status = error.response?.status;
    apiError.data = error.response?.data;

    return Promise.reject(apiError);
  }
);

export default api;