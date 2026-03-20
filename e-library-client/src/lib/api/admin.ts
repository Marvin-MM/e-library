import api from "../axios";
import type { ApiResponse, PaginatedResponse, User, UpdateUserRoleData, DashboardMetrics, AuditLog } from "@/types/api";

export const adminApi = {
  getUsers: async (filters?: { page?: number; limit?: number; role?: string; search?: string }) => {
    const response = await api.get<PaginatedResponse<User>>("/admin/users", { params: filters });
    return response.data;
  },
  getUser: async (id: string) => {
    const response = await api.get<ApiResponse<User>>(`/admin/users/${id}`);
    return response.data;
  },
  updateUserRole: async (id: string, data: UpdateUserRoleData) => {
    const response = await api.put<ApiResponse<User>>(`/admin/users/${id}/role`, data);
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/admin/users/${id}`);
    return response.data;
  },
  getMetrics: async () => {
    const response = await api.get<ApiResponse<DashboardMetrics>>("/admin/metrics");
    return response.data;
  },
  getAuditLogs: async (filters?: { page?: number; limit?: number; action?: string; userId?: string }) => {
    const response = await api.get<PaginatedResponse<AuditLog>>("/admin/audit-logs", { params: filters });
    return response.data;
  },
};
