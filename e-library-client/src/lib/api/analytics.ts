import api from "../axios";
import type { ApiResponse, AnalyticsOverview, DateTrend, ResourceTrend, ItemCount, UserRoleDistribution, ResourceCategoryDistribution, RequestStats, AnalyticsReport } from "@/types/api";

export const analyticsApi = {
  getOverview: async () => {
    const response = await api.get<ApiResponse<AnalyticsOverview>>("/analytics/overview");
    return response.data;
  },
  getDownloadTrends: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get<ApiResponse<DateTrend[]>>("/analytics/trends/downloads", { params });
    return response.data;
  },
  getUserTrends: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get<ApiResponse<DateTrend[]>>("/analytics/trends/users", { params });
    return response.data;
  },
  getTopResources: async (limit = 10) => {
    const response = await api.get<ApiResponse<ResourceTrend[]>>("/analytics/top/resources", { params: { limit } });
    return response.data;
  },
  getTopSearchTerms: async (limit = 20) => {
    const response = await api.get<ApiResponse<ItemCount[]>>("/analytics/top/search-terms", { params: { limit } });
    return response.data;
  },
  getUsersByRole: async () => {
    const response = await api.get<ApiResponse<UserRoleDistribution[]>>("/analytics/distribution/users-by-role");
    return response.data;
  },
  getResourcesByCategory: async () => {
    const response = await api.get<ApiResponse<ResourceCategoryDistribution[]>>("/analytics/distribution/resources-by-category");
    return response.data;
  },
  getRequestStats: async () => {
    const response = await api.get<ApiResponse<RequestStats>>("/analytics/requests");
    return response.data;
  },
  generateReport: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get<ApiResponse<AnalyticsReport>>("/analytics/report", { params });
    return response.data;
  },
};
