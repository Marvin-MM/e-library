import api from "../axios";
import type { ApiResponse, SystemSetting, EmailSettings } from "@/types/api";

export const adminSettingsApi = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Record<string, any>>>("/admin/settings");
    return response.data;
  },
  getEmailSettings: async () => {
    const response = await api.get<ApiResponse<EmailSettings>>("/admin/settings/email");
    return response.data;
  },
  setEmailProvider: async (provider: string) => {
    const response = await api.put<ApiResponse<EmailSettings>>("/admin/settings/email/provider", { provider });
    return response.data;
  },
  getSetting: async (key: string) => {
    const response = await api.get<ApiResponse<SystemSetting>>(`/admin/settings/${key}`);
    return response.data;
  },
  updateSetting: async (key: string, value: any) => {
    const response = await api.put<ApiResponse<SystemSetting>>(`/admin/settings/${key}`, { value });
    return response.data;
  },
  initialize: async () => {
    const response = await api.post<ApiResponse<any>>("/admin/settings/initialize");
    return response.data;
  },
};
