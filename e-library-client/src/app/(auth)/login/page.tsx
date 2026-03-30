"use client";

import { useEffect, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { loginSchema, type LoginFormData } from "@/schemas/auth";
import { Loader2, Eye, EyeOff } from "lucide-react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated } = useAuthStore();
    const { mutate: login, isPending } = useLogin();
    const [showPassword, setShowPassword] = useState(false);
    const [stayLoggedIn, setStayLoggedIn] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    useEffect(() => {
        if (isAuthenticated) {
            const redirectTo = searchParams?.get("redirect") || "/dashboard";
            router.replace(redirectTo);
        }
    }, [isAuthenticated, router, searchParams]);

    const onSubmit = (data: LoginFormData) => {
        login(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor="email"
                    className="text-sm font-semibold  text-neutral-600"
                >
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    {...register("email")}
                    autoComplete="email"
                    className={`h-11 w-full border-0 border-b bg-neutral-50 px-3 text-sm font-normal text-neutral-900 placeholder:text-neutral-300 placeholder:font-light outline-none transition-all duration-200 focus:bg-white focus:border-blue-800 ${errors.email
                        ? "border-red-400 bg-red-50"
                        : "border-neutral-200"
                        }`}
                />
                {errors.email && (
                    <p className="text-[11px] text-red-500 tracking-wide">{errors.email.message}</p>
                )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor="password"
                    className="text-sm font-semibold  text-neutral-600"
                >
                    Password
                </label>
                <div className="relative">
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...register("password")}
                        autoComplete="current-password"
                        className={`h-11 w-full border-0 border-b bg-neutral-50 px-3 pr-10 text-sm font-normal text-neutral-900 placeholder:text-neutral-300 placeholder:font-light outline-none transition-all duration-200 focus:bg-white focus:border-blue-800 ${errors.password
                            ? "border-red-400 bg-red-50"
                            : "border-neutral-200"
                            }`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        aria-label="Toggle password visibility"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-900 hover:text-blue-600 transition-colors duration-150"
                    >
                        {showPassword
                            ? <EyeOff className="w-[15px] h-[15px]" />
                            : <Eye className="w-[15px] h-[15px]" />
                        }
                    </button>
                </div>
                {errors.password && (
                    <p className="text-[11px] text-red-500 tracking-wide">{errors.password.message}</p>
                )}
            </div>

            {/* Stay logged in + Forgot */}
            <div className="flex items-center justify-between">
                <label
                    htmlFor="stayLoggedIn"
                    className="flex items-center gap-2 cursor-pointer group"
                >
                    <button
                        type="button"
                        id="stayLoggedIn"
                        role="checkbox"
                        aria-checked={stayLoggedIn}
                        onClick={() => setStayLoggedIn(!stayLoggedIn)}
                        className={`w-3.5 h-3.5 flex items-center justify-center border rounded-sm transition-all duration-150 flex-shrink-0 ${stayLoggedIn
                            ? "bg-blue-900 border-blue-900"
                            : "bg-white border-neutral-300 group-hover:border-blue-900"
                            }`}
                    >
                        {stayLoggedIn && (
                            <svg className="w-2 h-2" viewBox="0 0 8 8" fill="none">
                                <path d="M1 4L3 6L7 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                    <span className="text-sm text-neutral-500 font-normal tracking-wide">
                        Stay logged in
                    </span>
                </label>

                <Link
                    href="/forgot-password"
                    className="text-sm text-blue-400 hover:text-blue-900 border-b border-blue-400 hover:border-blue-900 pb-px tracking-wide transition-colors duration-150"
                >
                    Forgot password?
                </Link>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isPending}
                className="flex h-11 w-full items-center justify-center gap-2 bg-blue-900 text-white text-sm font-semibold rounded transition-opacity duration-150 hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isPending ? "Logging in…" : "Log in"}
            </button>
        </form>
    );
}

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center px-4">
            <div className="w-full max-w-sm bg-white px-9 py-11">

                {/* Heading */}
                <div className="mb-8">
                    <h1 className="text-lg font-bold text-neutral-900 leading-none mb-1.5">
                        Welcome back
                    </h1>
                    <p className="text-sm text-neutral-900 tracking-wide">
                        Enter your credentials to continue
                    </p>
                </div>

                {/* Form */}
                <Suspense
                    fallback={
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-5 h-5 text-neutral-300 animate-spin" />
                        </div>
                    }
                >
                    <LoginForm />
                </Suspense>

                {/* Divider */}
                <div className="my-7 h-px bg-neutral-100" />

                {/* Sign up */}
                <p className="text-center text-xs text-neutral-600 tracking-wide">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/signup"
                        className="font-semibold text-blue-900 cursor-alias border-b border-blue-900 pb-px hover:opacity-60 transition-opacity duration-150"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}