import api from "../axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export interface Campus {
    id: string;
    name: string;
    code: string;
    address?: string;
}

export interface CampusLocation {
    campusId: string;
    name: string;
    code: string;
    totalCopies: number;
    availableCopies: number;
    shelfLocation?: string;
}

export interface Book {
    id: string;
    title: string;
    author: string;
    description?: string;
    isbn?: string;
    createdAt: string;
    locations?: CampusLocation[];
}

export interface CreateBookPayload {
    title: string;
    author: string;
    description?: string;
    isbn?: string;
    campusId: string;
    copies?: number;
}

export const catalogApi = {
    getCampuses: async () => {
        const response = await api.get<ApiResponse<Campus[]>>("/catalog/campuses");
        return response.data.data;
    },
    createCampus: async (data: { name: string; code: string; address?: string }) => {
        const response = await api.post<ApiResponse<Campus>>("/catalog/campuses", data);
        return response.data;
    },
    getBooks: async (filters?: { page?: number; limit?: number; search?: string; campusId?: string }) => {
        const response = await api.get<PaginatedResponse<Book>>("/catalog/books", { params: filters });
        return response.data;
    },
    getBookById: async (id: string) => {
        const response = await api.get<ApiResponse<Book>>(`/catalog/books/${id}`);
        return response.data;
    },
    createBook: async (data: CreateBookPayload) => {
        const response = await api.post<ApiResponse<Book>>("/catalog/books", data);
        return response.data;
    },
    updateBook: async (id: string, data: Partial<CreateBookPayload>) => {
        const response = await api.patch<ApiResponse<Book>>(`/catalog/books/${id}`, data);
        return response.data;
    },
    deleteBook: async (id: string) => {
        const response = await api.delete<ApiResponse>(`/catalog/books/${id}`);
        return response.data;
    }
};