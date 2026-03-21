import api from "../axios";
import type { ApiResponse, PaginatedResponse, Resource } from "@/types/api";

export interface CourseUnitData {
    code: string;
    name: string;
    description?: string;
}

export const courseUnitsApi = {
    findByCourse: async (courseId: string, filters?: { page?: number; limit?: number; search?: string }) => {
        const response = await api.get(`/units/${courseId}/units`, { params: filters });
        return response.data;
    },
    findById: async (unitId: string) => {
        const response = await api.get(`/units/${unitId}`);
        return response.data;
    },
    getResources: async (unitId: string, filters?: { page?: number; limit?: number }) => {
        const response = await api.get<PaginatedResponse<Resource>>(`/units/${unitId}/resources`, { params: filters });
        return response.data;
    },
    create: async (courseId: string, data: CourseUnitData) => {
        const response = await api.post(`/units/${courseId}/units`, data);
        return response.data;
    },
    update: async (unitId: string, data: Partial<CourseUnitData>) => {
        const response = await api.put(`/units/${unitId}`, data);
        return response.data;
    },
    delete: async (unitId: string) => {
        const response = await api.delete(`/units/${unitId}`);
        return response.data;
    }
};