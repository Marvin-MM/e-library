import api from "../axios";
import type { ApiResponse, PaginatedResponse, Resource, ResourceFilters, CreateResourceData } from "@/types/api";

export const resourcesApi = {
  list: async (filters?: ResourceFilters) => {
    const response = await api.get<PaginatedResponse<Resource>>("/resources", { params: filters });
    return response.data;
  },
  get: async (id: string) => {
    const response = await api.get<ApiResponse<Resource>>(`/resources/${id}`);
    return response.data;
  },
  create: async (formData: FormData) => {
    const response = await api.post<ApiResponse<Resource>>("/resources", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  update: async (id: string, data: Partial<CreateResourceData>) => {
    const response = await api.put<ApiResponse<Resource>>(`/resources/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/resources/${id}`);
    return response.data;
  },
  download: async (id: string) => {
    const response = await api.post<ApiResponse<{ url: string }>>(`/resources/${id}/download`);
    return response.data;
  },
  getTrending: async () => {
    const response = await api.get<ApiResponse<Resource[]>>("/resources/trending");
    return response.data;
  },
  getLatest: async () => {
    const response = await api.get<ApiResponse<Resource[]>>("/resources/latest");
    return response.data;
  },
  getFavorites: async (filters?: ResourceFilters) => {
    const response = await api.get<PaginatedResponse<Resource>>("/resources/favorites", { params: filters });
    return response.data;
  },
  addFavorite: async (id: string) => {
    const response = await api.post<ApiResponse>(`/resources/${id}/favorite`);
    return response.data;
  },
  removeFavorite: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/resources/${id}/favorite`);
    return response.data;
  },
  checkFavorite: async (id: string) => {
    const response = await api.get<ApiResponse<{ isFavorite: boolean }>>(`/resources/${id}/is-favorite`);
    return response.data;
  },
};
