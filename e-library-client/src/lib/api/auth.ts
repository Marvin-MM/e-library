import api from "../axios";
import { getRefreshToken } from "@/stores/authStore";
import type {
  ApiResponse,
  LoginCredentials,
  SignupData,
  User,
  VerifyEmailData,
  ForgotPasswordData,
  ResetPasswordData,
} from "@/types/api";

// ── Canonical backend response shapes ────────────────────────────────────────
//
// POST /auth/login → POST /auth/refresh
//   { success, data: { user, tokens: { accessToken, refreshToken } } }
//
// GET /auth/me
//   { success, data: <User> }
//
// All other auth endpoints
//   { success, message }

export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: User;
  tokens: AuthTokenPair;
}

export const authApi = {
  /**
   * Login — returns the unwrapped `data` payload directly so callers
   * get `{ user, tokens }` without having to peel off the ApiResponse wrapper.
   */
  login: async (credentials: LoginCredentials): Promise<AuthResult> => {
    const response = await api.post<ApiResponse<AuthResult>>(
      "/auth/login",
      credentials
    );
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.message || "Login failed");
    }
    return result.data;
  },

  signup: async (data: SignupData) => {
    const response = await api.post<ApiResponse<{ user: User }>>(
      "/auth/register",
      data
    );
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailData) => {
    const response = await api.post<ApiResponse>("/auth/verify-email", data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordData) => {
    const response = await api.post<ApiResponse>(
      "/auth/forgot-password",
      data
    );
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData) => {
    const response = await api.post<ApiResponse>("/auth/reset-password", data);
    return response.data;
  },

  /**
   * Logout — sends both access token (via Authorization header from interceptor)
   * AND the refresh token in the body so the backend can blacklist both.
   */
  logout: async () => {
    const refreshToken = getRefreshToken();
    const response = await api.post<ApiResponse>("/auth/logout", {
      ...(refreshToken ? { refreshToken } : {}),
    });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>("/auth/me");
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.message || "Failed to fetch user");
    }
    return result.data;
  },

  refreshToken: async (token: string): Promise<AuthResult> => {
    const response = await api.post<ApiResponse<AuthResult>>("/auth/refresh", {
      refreshToken: token,
    });
    const result = response.data;
    if (!result.success || !result.data) {
      throw new Error(result.message || "Refresh failed");
    }
    return result.data;
  },
};
