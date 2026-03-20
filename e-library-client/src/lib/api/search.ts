import api from "../axios";
import type { ApiResponse, PaginatedResponse, SearchSuggestion, ResourceFilters, Resource } from "@/types/api";

export const searchApi = {
  suggestions: async (query: string) => {
    const response = await api.get<ApiResponse<SearchSuggestion[]>>("/search/suggestions", {
      params: { q: query },
    });
    return response.data;
  },
  search: async (query: string, filters?: ResourceFilters) => {
    const response = await api.get<PaginatedResponse<Resource>>("/search", {
      params: { q: query, ...filters },
    });
    return response.data;
  },
};
