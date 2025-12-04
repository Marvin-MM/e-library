// import api from "./axios";
// import type {
//   ApiResponse,
//   AuthTokens,
//   Course,
//   CreateCourseData,
//   CreateRequestData,
//   CreateResourceData,
//   DashboardMetrics,
//   ForgotPasswordData,
//   LoginCredentials,
//   PaginatedResponse,
//   ResetPasswordData,
//   Resource,
//   ResourceFilters,
//   ResourceRequest,
//   SearchSuggestion,
//   SignupData,
//   UpdateRequestData,
//   UpdateUserRoleData,
//   User,
//   VerifyEmailData,
//   AuditLog,
// } from "@/types/api";

// export const authApi = {
//   login: async (credentials: LoginCredentials) => {
//     const response = await api.post<ApiResponse<AuthTokens & { user: User }>>("/auth/login", credentials);
//     return response.data;
//   },

//   signup: async (data: SignupData) => {
//     const response = await api.post<ApiResponse<{ user: User }>>("/auth/register", data);
//     return response.data;
//   },

//   verifyEmail: async (data: VerifyEmailData) => {
//     const response = await api.post<ApiResponse>("/auth/verify-email", data);
//     return response.data;
//   },

//   forgotPassword: async (data: ForgotPasswordData) => {
//     const response = await api.post<ApiResponse>("/auth/forgot-password", data);
//     return response.data;
//   },

//   resetPassword: async (data: ResetPasswordData) => {
//     const response = await api.post<ApiResponse>("/auth/reset-password", data);
//     return response.data;
//   },

//   refreshToken: async (refreshToken: string) => {
//     const response = await api.post<ApiResponse<AuthTokens>>("/auth/refresh", { refreshToken });
//     return response.data;
//   },

//   logout: async () => {
//     const response = await api.post<ApiResponse>("/auth/logout");
//     return response.data;
//   },

//   getMe: async () => {
//     const response = await api.get<ApiResponse<User>>("/auth/me");
//     return response.data;
//   },
// };

// export const resourcesApi = {
//   list: async (filters?: ResourceFilters) => {
//     const response = await api.get<PaginatedResponse<Resource>>("/resources", { params: filters });
//     return response.data;
//   },

//   get: async (id: string) => {
//     const response = await api.get<ApiResponse<Resource>>(`/resources/${id}`);
//     return response.data;
//   },

//   create: async (data: CreateResourceData) => {
//     const formData = new FormData();
//     formData.append("title", data.title);
//     formData.append("description", data.description);
//     formData.append("type", data.type);
//     formData.append("category", data.category);
//     if (data.courseId) formData.append("courseId", data.courseId);
//     if (data.tags) formData.append("tags", JSON.stringify(data.tags));
//     if (data.isPublic !== undefined) formData.append("isPublic", String(data.isPublic));
//     formData.append("file", data.file);

//     const response = await api.post<ApiResponse<Resource>>("/resources", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return response.data;
//   },

//   update: async (id: string, data: Partial<CreateResourceData>) => {
//     const response = await api.put<ApiResponse<Resource>>(`/resources/${id}`, data);
//     return response.data;
//   },

//   delete: async (id: string) => {
//     const response = await api.delete<ApiResponse>(`/resources/${id}`);
//     return response.data;
//   },

//   download: async (id: string) => {
//     const response = await api.post<ApiResponse<{ url: string }>>(`/resources/${id}/download`);
//     return response.data;
//   },

//   getTrending: async () => {
//     const response = await api.get<ApiResponse<Resource[]>>("/resources/trending");
//     return response.data;
//   },

//   getLatest: async () => {
//     const response = await api.get<ApiResponse<Resource[]>>("/resources/latest");
//     return response.data;
//   },
// };

// export const coursesApi = {
//   list: async (filters?: { page?: number; limit?: number; search?: string }) => {
//     const response = await api.get<PaginatedResponse<Course>>("/courses", { params: filters });
//     return response.data;
//   },

//   get: async (id: string) => {
//     const response = await api.get<ApiResponse<Course>>(`/courses/${id}`);
//     return response.data;
//   },

//   create: async (data: CreateCourseData) => {
//     const response = await api.post<ApiResponse<Course>>("/courses", data);
//     return response.data;
//   },

//   update: async (id: string, data: Partial<CreateCourseData>) => {
//     const response = await api.put<ApiResponse<Course>>(`/courses/${id}`, data);
//     return response.data;
//   },

//   delete: async (id: string) => {
//     const response = await api.delete<ApiResponse>(`/courses/${id}`);
//     return response.data;
//   },
// };

// export const requestsApi = {
//   list: async (filters?: { page?: number; limit?: number; status?: string }) => {
//     const response = await api.get<PaginatedResponse<ResourceRequest>>("/requests", { params: filters });
//     return response.data;
//   },

//   get: async (id: string) => {
//     const response = await api.get<ApiResponse<ResourceRequest>>(`/requests/${id}`);
//     return response.data;
//   },

//   create: async (data: CreateRequestData) => {
//     const response = await api.post<ApiResponse<ResourceRequest>>("/requests", data);
//     return response.data;
//   },

//   update: async (id: string, data: UpdateRequestData) => {
//     const response = await api.put<ApiResponse<ResourceRequest>>(`/requests/${id}`, data);
//     return response.data;
//   },

//   delete: async (id: string) => {
//     const response = await api.delete<ApiResponse>(`/requests/${id}`);
//     return response.data;
//   },

//   getMyRequests: async () => {
//     const response = await api.get<ApiResponse<ResourceRequest[]>>("/requests/my");
//     return response.data;
//   },
// };

// export const searchApi = {
//   suggestions: async (query: string) => {
//     const response = await api.get<ApiResponse<SearchSuggestion[]>>("/search/suggestions", {
//       params: { q: query },
//     });
//     return response.data;
//   },

//   search: async (query: string, filters?: ResourceFilters) => {
//     const response = await api.get<PaginatedResponse<Resource>>("/search", {
//       params: { q: query, ...filters },
//     });
//     return response.data;
//   },
// };

// export const adminApi = {
//   getUsers: async (filters?: { page?: number; limit?: number; role?: string; search?: string }) => {
//     const response = await api.get<PaginatedResponse<User>>("/admin/users", { params: filters });
//     return response.data;
//   },

//   getUser: async (id: string) => {
//     const response = await api.get<ApiResponse<User>>(`/admin/users/${id}`);
//     return response.data;
//   },

//   updateUserRole: async (id: string, data: UpdateUserRoleData) => {
//     const response = await api.put<ApiResponse<User>>(`/admin/users/${id}/role`, data);
//     return response.data;
//   },

//   deleteUser: async (id: string) => {
//     const response = await api.delete<ApiResponse>(`/admin/users/${id}`);
//     return response.data;
//   },

//   getMetrics: async () => {
//     const response = await api.get<ApiResponse<DashboardMetrics>>("/admin/metrics");
//     return response.data;
//   },

//   getAuditLogs: async (filters?: { page?: number; limit?: number; action?: string; userId?: string }) => {
//     const response = await api.get<PaginatedResponse<AuditLog>>("/admin/audit-logs", { params: filters });
//     return response.data;
//   },
// };


import api from "./axios";
import type {
  ApiResponse,
  AuthTokens,
  Course,
  CreateCourseData,
  CreateRequestData,
  CreateResourceData,
  DashboardMetrics,
  ForgotPasswordData,
  LoginCredentials,
  PaginatedResponse,
  ResetPasswordData,
  Resource,
  ResourceFilters,
  ResourceRequest,
  SearchSuggestion,
  SignupData,
  UpdateRequestData,
  UpdateUserRoleData,
  User,
  VerifyEmailData,
  AuditLog,
} from "@/types/api";

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<ApiResponse<AuthTokens & { user: User }>>("/auth/login", credentials);
    return response.data;
  },

  signup: async (data: SignupData) => {
    const response = await api.post<ApiResponse<{ user: User }>>("/auth/register", data);
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailData) => {
    const response = await api.post<ApiResponse>("/auth/verify-email", data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordData) => {
    const response = await api.post<ApiResponse>("/auth/forgot-password", data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData) => {
    const response = await api.post<ApiResponse>("/auth/reset-password", data);
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post<ApiResponse<AuthTokens>>("/auth/refresh", { refreshToken });
    return response.data;
  },

  logout: async () => {
    const response = await api.post<ApiResponse>("/auth/logout");
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<ApiResponse<User>>("/auth/me");
    return response.data;
  },
};

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
};

export const coursesApi = {
  list: async (filters?: { page?: number; limit?: number; search?: string }) => {
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
};

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

  getMyRequests: async () => {
    const response = await api.get<ApiResponse<ResourceRequest[]>>("/requests/my");
    return response.data;
  },
};

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

export const adminApi = {
  getUsers: async (filters?: { page?: number; limit?: number; role?: string; search?: string }) => {
    const response = await api.get<PaginatedResponse<User>>("/admin/users", { params: filters });
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await api.get<ApiResponse<User>>(`/admin/users/${id}`);
    return response.data;
  },

  updateUserRole: async (id: string, data: UpdateUserRoleData) => {
    const response = await api.put<ApiResponse<User>>(`/admin/users/${id}/role`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/admin/users/${id}`);
    return response.data;
  },

  getMetrics: async () => {
    const response = await api.get<ApiResponse<DashboardMetrics>>("/admin/metrics");
    return response.data;
  },

  getAuditLogs: async (filters?: { page?: number; limit?: number; action?: string; userId?: string }) => {
    const response = await api.get<PaginatedResponse<AuditLog>>("/admin/audit-logs", { params: filters });
    return response.data;
  },
};