import api from "../axios";
import type { ApiResponse, PaginatedResponse, ResourceRequest, CreateRequestData, UpdateRequestData } from "@/types/api";

export const requestsApi = {
  list: async (filters?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get<PaginatedResponse<ResourceRequest>>("/requests", { params: filters });
    return response.data;
  },
  get: async (id: string) => {
    const response = await api.get<ApiResponse<ResourceRequest>>(`/requests/${id}`);
    return response.data;
  },
  create: async (data: CreateRequestData) => {
    const response = await api.post<ApiResponse<ResourceRequest>>("/requests", data);
    return response.data;
  },
  update: async (id: string, data: UpdateRequestData) => {
    const response = await api.put<ApiResponse<ResourceRequest>>(`/requests/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/requests/${id}`);
    return response.data;
  },
  respond: async (id: string, data: UpdateRequestData) => {
    const response = await api.post<ApiResponse<ResourceRequest>>(`/requests/${id}/respond`, data);
    return response.data;
  },
  getMyRequests: async () => {
    const response = await api.get<ApiResponse<ResourceRequest[]>>("/requests/my");
    return response.data;
  },
};
