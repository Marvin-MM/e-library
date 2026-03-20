import api from "../axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

// Assuming types for Catalog will be added later to types/api.ts
// For now, using broadly typed interfaces that can handle the backend structure

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  isbn?: string;
  createdAt: string;
  updatedAt: string;
  inventory?: any[]; // Replaced with proper type later if needed
}

export interface Campus {
  id: string;
  name: string;
  code: string;
  address?: string;
}

export interface BorrowRecord {
  id: string;
  userId: string;
  bookId: string;
  campusId: string;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string;
  returnedById?: string;
  book?: Book;
  campus?: Campus;
}

export const catalogApi = {
  // Public
  getCampuses: async () => {
    const response = await api.get<ApiResponse<Campus[]>>("/catalog/campuses");
    return response.data;
  },
  getBooks: async (params?: Record<string, any>) => {
    const response = await api.get<PaginatedResponse<Book>>("/catalog/books", { params });
    return response.data;
  },
  getBookById: async (id: string) => {
    const response = await api.get<ApiResponse<Book>>(`/catalog/books/${id}`);
    return response.data;
  },

  // Authenticated User
  borrowBook: async (data: { bookId: string; campusId: string }) => {
    const response = await api.post<ApiResponse<BorrowRecord>>("/catalog/borrow", data);
    return response.data;
  },
  getMyBorrows: async () => {
    const response = await api.get<ApiResponse<BorrowRecord[]>>("/catalog/borrow/my");
    return response.data;
  },

  // Admin / Staff
  createCampus: async (data: { name: string; code: string; address?: string }) => {
    const response = await api.post<ApiResponse<Campus>>("/catalog/campuses", data);
    return response.data;
  },
  createBook: async (data: { title: string; author: string; description?: string; isbn?: string }) => {
    const response = await api.post<ApiResponse<Book>>("/catalog/books", data);
    return response.data;
  },
  updateBook: async (id: string, data: Partial<Book>) => {
    const response = await api.patch<ApiResponse<Book>>(`/catalog/books/${id}`, data);
    return response.data;
  },
  deleteBook: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/catalog/books/${id}`);
    return response.data;
  },
  upsertInventory: async (data: { bookId: string; campusId: string; totalCopies: number; shelfLocation?: string }) => {
    const response = await api.put<ApiResponse>("/catalog/inventory", data);
    return response.data;
  },
  getBorrowRecords: async (params?: Record<string, any>) => {
    const response = await api.get<PaginatedResponse<BorrowRecord>>("/catalog/borrow-records", { params });
    return response.data;
  },
  processReturn: async (id: string) => {
    const response = await api.post<ApiResponse<BorrowRecord>>(`/catalog/borrow-records/${id}/return`);
    return response.data;
  },
};
