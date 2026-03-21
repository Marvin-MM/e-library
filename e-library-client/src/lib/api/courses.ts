import api from "../axios";
import type { ApiResponse, PaginatedResponse, Course, CreateCourseData, ResourceFilters, Resource } from "@/types/api";

export const coursesApi = {
  // NEW: Fetch distinct departments
  getDepartments: async () => {
    const response = await api.get<ApiResponse<string[]>>("/courses/departments");
    return response.data;
  },
  list: async (filters?: { page?: number; limit?: number; search?: string; department?: string }) => {
    const response = await api.get<PaginatedResponse<Course>>("/courses", { params: filters });
    return response.data;
  },
  get: async (id: string) => {
    const response = await api.get<ApiResponse<Course>>(`/courses/${id}`);
    return response.data;
  },
  create: async (data: CreateCourseData) => {
    const response = await api.post<ApiResponse<Course>>("/courses", data);
    return response.data;
  },
  update: async (id: string, data: Partial<CreateCourseData>) => {
    const response = await api.put<ApiResponse<Course>>(`/courses/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/courses/${id}`);
    return response.data;
  },
  getResources: async (id: string, filters?: ResourceFilters) => {
    const response = await api.get<PaginatedResponse<Resource>>(`/courses/${id}/resources`, {
      params: filters,
    });
    return response.data;
  },
};