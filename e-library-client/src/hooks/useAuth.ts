import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import { toast } from "sonner";
import type { LoginCredentials, SignupData } from "@/types/api";

// ─── useUser ─────────────────────────────────────────────────────────────────
// Fetches the current user profile. Runs only when an access token exists.
// On error (e.g. 401 that could not be refreshed) — logs out.
export function useUser() {
  const { accessToken, setUser, logout } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const user = await authApi.getMe(); // throws on failure
      setUser(user);
      return user;
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // re-use cached data for 5 min
    retry: false,
    // TanStack Query v5: use throwOnError + the onError option on the query
    // meta.onError was removed in v5 — handle errors in the component or here:
    gcTime: 10 * 60 * 1000,
  });
}

// ─── useLogin ────────────────────────────────────────────────────────────────
export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { setUser, setTokens } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      // authApi.login now returns { user, tokens } directly — no wrapper
      authApi.login(credentials),

    onSuccess: ({ user, tokens }) => {
      const { accessToken, refreshToken } = tokens;

      setTokens(accessToken, refreshToken);
      setUser(user);
      queryClient.setQueryData(queryKeys.auth.me, user);

      toast.success(`Welcome back, ${user.name || user.email}!`);

      const redirect = searchParams?.get("redirect");
      router.push(redirect || "/dashboard");
    },

    onError: (error: any) => {
      if (error.status === 401) {
        toast.error("Invalid email or password.");
      } else if (error.status === 423) {
        // Account locked (some backends return 423)
        toast.error(error.data?.message || "Account is locked. Contact support.");
      } else if (error.status === 429) {
        toast.error("Too many login attempts. Please try again later.");
      } else if (error.message?.toLowerCase().includes("network")) {
        toast.error("Unable to connect. Check your internet connection.");
      } else {
        toast.error(error.data?.message || error.message || "Login failed. Please try again.");
      }
      console.warn("[Login] Error:", error.status, error.message);
    },
  });
}

// ─── useSignup ───────────────────────────────────────────────────────────────
export function useSignup() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: SignupData) => {
      const response = await authApi.signup(data);
      if (!response.success) {
        throw Object.assign(new Error(response.message || "Signup failed"), {
          data: response,
        });
      }
      return response;
    },
    onSuccess: () => {
      toast.success(
        "Account created! Please check your email to verify your account."
      );
      router.push("/verify-email");
    },
    onError: (error: any) => {
      if (error.status === 409) {
        toast.error("An account with this email already exists.");
      } else if (error.status === 422 && error.data?.errors) {
        const errors = error.data.errors as Record<string, string[]>;
        const firstError = Object.values(errors)[0]?.[0];
        toast.error(firstError || "Please check your input and try again.");
      } else {
        toast.error(
          error.data?.message || error.message || "Signup failed. Please try again."
        );
      }
      console.warn("[Signup] Error:", error.status, error.message);
    },
  });
}

// ─── useLogout ───────────────────────────────────────────────────────────────
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      // Tell the backend first (sends refresh token in body to blacklist it).
      // If the network call fails we still clear local state — best effort.
      try {
        await authApi.logout();
      } catch (err) {
        console.warn("[Logout] Server call failed, clearing local session anyway.", err);
      }

      // Clear local state and cache after the server call
      logout();
      queryClient.clear();
    },
    onSuccess: () => {
      toast.success("Logged out successfully.");
      router.replace("/login");
    },
    onError: () => {
      // Shouldn't reach here since we swallow the network error above,
      // but ensure the user still lands on the login page
      router.replace("/login");
    },
  });
}

// ─── useForgotPassword ───────────────────────────────────────────────────────
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
    onError: (error: any) => {
      if (error.status === 429) {
        toast.error("Too many requests. Please try again later.");
      } else {
        toast.error(
          error.data?.message || error.message || "Failed to send reset email."
        );
      }
      console.warn("[ForgotPassword] Error:", error.status, error.message);
    },
  });
}

// ─── useResetPassword ────────────────────────────────────────────────────────
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
      toast.success(
        "Password reset successfully! Please log in with your new password."
      );
      router.push("/login");
    },
    onError: (error: any) => {
      if (error.status === 400) {
        toast.error("Invalid or expired reset token. Please request a new one.");
      } else if (error.status === 422) {
        toast.error("Password does not meet the required criteria.");
      } else {
        toast.error(
          error.data?.message || error.message || "Failed to reset password."
        );
      }
      console.warn("[ResetPassword] Error:", error.status, error.message);
    },
  });
}

// ─── useVerifyEmail ──────────────────────────────────────────────────────────
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
      toast.success("Email verified successfully! You can now log in.");
      router.push("/login");
    },
    onError: (error: any) => {
      if (error.status === 400) {
        toast.error("Invalid or expired verification token. Please request a new one.");
      } else {
        toast.error(
          error.data?.message || error.message || "Failed to verify email."
        );
      }
      console.warn("[VerifyEmail] Error:", error.status, error.message);
    },
  });
}

// ─── useRole ─────────────────────────────────────────────────────────────────
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

    return permissions[action]?.includes(user.role) ?? false;
  };

  return { user, isAdmin, isStaff, isStudent, isStaffOrAdmin, can, role: user?.role };
}