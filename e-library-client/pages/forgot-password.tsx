import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/hooks/useAuth";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/schemas/auth";
import { ArrowLeft, CheckCircle, Loader2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const { mutate: forgotPassword, isPending, isSuccess } = useForgotPassword();
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    setSubmittedEmail(data.email);
    forgotPassword(data.email);
  };

  if (isSuccess) {
    return (
      <AuthLayout title="Check your email" subtitle="We sent you a password reset link">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground">
              We&apos;ve sent a password reset link to:
            </p>
            <p className="font-medium">{submittedEmail}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Click the link in the email to reset your password. If you don&apos;t see it, check your spam folder.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot password?" subtitle="Enter your email to receive a reset link">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            {...register("email")}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send reset link
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
