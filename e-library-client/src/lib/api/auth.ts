import api from "../axios";
import type { ApiResponse, AuthTokens, LoginCredentials, SignupData, User, VerifyEmailData, ForgotPasswordData, ResetPasswordData } from "@/types/api";

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<ApiResponse<AuthTokens & { user: User }>>("/auth/login", credentials);
    return response.data;
  },
  signup: async (data: SignupData) => {
    const response = await api.post<ApiResponse<{ user: User }>>("/auth/register", data);
    return response.data;
  },
  verifyEmail: async (data: VerifyEmailData) => {
    const response = await api.post<ApiResponse>("/auth/verify-email", data);
    return response.data;
  },
  forgotPassword: async (data: ForgotPasswordData) => {
    const response = await api.post<ApiResponse>("/auth/forgot-password", data);
    return response.data;
  },
  resetPassword: async (data: ResetPasswordData) => {
    const response = await api.post<ApiResponse>("/auth/reset-password", data);
    return response.data;
  },
  refreshToken: async (refreshToken: string) => {
    const response = await api.post<ApiResponse<AuthTokens>>("/auth/refresh", { refreshToken });
    return response.data;
  },
  logout: async () => {
    const response = await api.post<ApiResponse>("/auth/logout");
    return response.data;
  },
  getMe: async () => {
    const response = await api.get<ApiResponse<User>>("/auth/me");
    return response.data;
  },
};
