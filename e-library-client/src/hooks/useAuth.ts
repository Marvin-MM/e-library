import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import { toast } from "sonner";
import type { LoginCredentials, SignupData, User } from "@/types/api";

export function useUser() {
  const { accessToken, setUser, logout } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const response = await authApi.getMe();
      if (response.success && response.data) {
        setUser(response.data);
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch user");
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
    retry: false,
    meta: {
      onError: () => {
        logout();
      },
    },
  });
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setUser, setTokens } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authApi.login(credentials);
      if (!response.success) {
        throw new Error(response.message || "Login failed");
      }
      return response.data!;
    },
    onSuccess: (data) => {
      const anyData = data as any;

      const tokensSource = anyData.tokens ?? anyData;
      const accessToken =
        tokensSource?.accessToken ?? tokensSource?.access_token ?? null;
      const refreshToken =
        tokensSource?.refreshToken ?? tokensSource?.refresh_token ?? null;

      const user: User | undefined =
        anyData.user ?? anyData.data?.user ?? null;

      if (!accessToken || !refreshToken || !user) {
        toast.error("Login response did not contain valid authentication data.");
        return;
      }

      setTokens(accessToken, refreshToken);
      setUser(user);
      queryClient.setQueryData(queryKeys.auth.me, user);
      toast.success("Welcome back!");

      const redirectTo = (router.query.redirect as string) || "/dashboard";
      router.push(redirectTo);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Login failed");
    },
  });
}

export function useSignup() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: SignupData) => {
      const response = await authApi.signup(data);
      if (!response.success) {
        throw new Error(response.message || "Signup failed");
      }
      return response;
    },
    onSuccess: () => {
      toast.success("Account created! Please check your email to verify your account.");
      router.push("/verify-email");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Signup failed");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } catch {
        // Ignore logout API errors
      }
    },
    onSettled: () => {
      logout();
      queryClient.clear();
      router.push("/login");
      toast.success("Logged out successfully");
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await authApi.forgotPassword({ email });
      if (!response.success) {
        throw new Error(response.message || "Failed to send reset email");
      }
      return response;
    },
    onSuccess: () => {
      toast.success("Password reset email sent! Please check your inbox.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send reset email");
    },
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      const response = await authApi.resetPassword(data);
      if (!response.success) {
        throw new Error(response.message || "Failed to reset password");
      }
      return response;
    },
    onSuccess: () => {
      toast.success("Password reset successfully! Please login with your new password.");
      router.push("/login");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reset password");
    },
  });
}

export function useVerifyEmail() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (token: string) => {
      const response = await authApi.verifyEmail({ token });
      if (!response.success) {
        throw new Error(response.message || "Failed to verify email");
      }
      return response;
    },
    onSuccess: () => {
      toast.success("Email verified successfully! Please login.");
      router.push("/login");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to verify email");
    },
  });
}

export function useRole() {
  const { user } = useAuthStore();

  const isAdmin = user?.role === "ADMIN";
  const isStaff = user?.role === "STAFF";
  const isStudent = user?.role === "STUDENT";
  const isStaffOrAdmin = isAdmin || isStaff;

  const can = (action: string): boolean => {
    if (!user) return false;

    const permissions: Record<string, string[]> = {
      "upload-resource": ["ADMIN", "STAFF"],
      "manage-users": ["ADMIN"],
      "manage-courses": ["ADMIN", "STAFF"],
      "view-metrics": ["ADMIN"],
      "view-audit-logs": ["ADMIN"],
      "manage-requests": ["ADMIN", "STAFF"],
      "create-request": ["ADMIN", "STAFF", "STUDENT"],
      "view-resources": ["ADMIN", "STAFF", "STUDENT"],
      "download-resource": ["ADMIN", "STAFF", "STUDENT"],
    };

    return permissions[action]?.includes(user.role) || false;
  };

  return {
    user,
    isAdmin,
    isStaff,
    isStudent,
    isStaffOrAdmin,
    can,
    role: user?.role,
  };
}
