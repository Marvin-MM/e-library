import api from "../axios";
import type { ApiResponse, Notification, NotificationListResponse } from "@/types/api";

export const notificationsApi = {
  getAll: async (params?: { page?: number; limit?: number; unreadOnly?: boolean }) => {
    const response = await api.get<NotificationListResponse>("/notifications", { params });
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await api.get<ApiResponse<{ unreadCount: number }>>("/notifications/unread-count");
    return response.data;
  },
  markAsRead: async (id: string) => {
    const response = await api.put<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.put<ApiResponse<{ count: number }>>("/notifications/read-all");
    return response.data;
  },
  clearRead: async () => {
    const response = await api.delete<ApiResponse<{ count: number }>>("/notifications/clear-read");
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/notifications/${id}`);
    return response.data;
  },
};
