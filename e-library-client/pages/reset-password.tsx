import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPassword } from "@/hooks/useAuth";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/schemas/auth";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;
  const { mutate: resetPassword, isPending } = useResetPassword();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (token && typeof token === "string") {
      setValue("token", token);
    }
  }, [token, setValue]);

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPassword({
      token: data.token,
      password: data.password,
    });
  };

  if (!token) {
    return (
      <AuthLayout title="Invalid Reset Link" subtitle="The password reset link is invalid or expired">
        <div className="text-center space-y-6">
          <p className="text-muted-foreground">
            Please request a new password reset link.
          </p>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/forgot-password">Request New Link</Link>
            </Button>
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your new password below">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register("token")} />
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter new password"
            {...register("password")}
            className={errors.password ? "border-destructive" : ""}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            {...register("confirmPassword")}
            className={errors.confirmPassword ? "border-destructive" : ""}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reset password
        </Button>
      </form>
      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}
