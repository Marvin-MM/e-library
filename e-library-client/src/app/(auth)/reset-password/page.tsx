"use client";

import { useEffect, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResetPassword } from "@/hooks/useAuth";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/schemas/auth";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";


function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const { mutate: resetPassword, isPending } = useResetPassword();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    useEffect(() => {
        if (token) {
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
            <div className="flex items-center justify-center px-4 font-titillium">
                <div className="w-full max-w-sm bg-white px-9 py-11 text-center">
                    <div className="mb-8">
                        <h1 className="text-lg font-bold text-neutral-900 mb-1.5">Invalid Reset Link</h1>
                        <p className="text-sm text-neutral-900 tracking-wide">The password reset link is invalid or expired</p>
                    </div>

                    <div className="flex flex-col gap-6">
                        <p className="text-sm text-neutral-600 tracking-wide">
                            Please request a new password reset link to continue.
                        </p>

                        <div className="flex flex-col gap-4">
                            <Link
                                href="/forgot-password"
                                className="flex h-11 w-full items-center justify-center bg-blue-900 text-white text-sm font-semibold rounded transition-opacity duration-150 hover:opacity-80"
                            >
                                Request New Link
                            </Link>

                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center text-xs font-semibold text-blue-900 border-b border-blue-900 pb-px self-center hover:opacity-60 transition-opacity duration-150"
                            >
                                <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                                Back to login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center px-4 font-titillium">
            <div className="w-full max-w-sm bg-white px-9 py-11">

                {/* Heading */}
                <div className="mb-8">
                    <h1 className="text-lg font-bold text-neutral-900 mb-1.5">
                        Reset password
                    </h1>
                    <p className="text-sm text-neutral-900 tracking-wide">
                        Enter your new password below
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                    <input type="hidden" {...register("token")} />

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="password" className="text-sm font-semibold text-neutral-600">
                            New password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter new password"
                                {...register("password")}
                                className={`h-11 w-full border-0 border-b bg-neutral-50 px-3 pr-10 text-sm font-normal text-neutral-900 placeholder:text-neutral-300 placeholder:font-light outline-none transition-all duration-200 focus:bg-white focus:border-blue-800 ${errors.password ? "border-red-400 bg-red-50" : "border-neutral-200"}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-900 hover:text-blue-600 transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="w-[15px] h-[15px]" /> : <Eye className="w-[15px] h-[15px]" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-[11px] text-red-500 tracking-wide">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="confirmPassword" className="text-sm font-semibold text-neutral-600">
                            Confirm new password
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm new password"
                                {...register("confirmPassword")}
                                className={`h-11 w-full border-0 border-b bg-neutral-50 px-3 pr-10 text-sm font-normal text-neutral-900 placeholder:text-neutral-300 placeholder:font-light outline-none transition-all duration-200 focus:bg-white focus:border-blue-800 ${errors.confirmPassword ? "border-red-400 bg-red-50" : "border-neutral-200"}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-900 hover:text-blue-600 transition-colors"
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? <EyeOff className="w-[15px] h-[15px]" /> : <Eye className="w-[15px] h-[15px]" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-[11px] text-red-500 tracking-wide">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex h-11 w-full items-center justify-center gap-2 bg-blue-900 text-white text-sm font-semibold rounded mt-2 transition-opacity duration-150 hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {isPending ? "Resetting…" : "Reset password"}
                    </button>
                </form>

                {/* Divider */}
                <div className="my-7 h-px bg-neutral-100" />

                {/* Back to login */}
                <div className="text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center text-xs font-semibold text-blue-900 border-b border-blue-900 pb-px hover:opacity-60 transition-opacity duration-150"
                    >
                        <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-neutral-300 animate-spin" /></div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
