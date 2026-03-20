"use client";

import { useEffect, Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignup } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { signupSchema, type SignupFormData } from "@/schemas/auth";
import { Loader2, Eye, EyeOff } from "lucide-react";


function SignupForm() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const { mutate: signup, isPending } = useSignup();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
    });

    useEffect(() => {
        if (isAuthenticated) {
            router.replace("/dashboard");
        }
    }, [isAuthenticated, router]);

    const onSubmit = (data: SignupFormData) => {
        if (!acceptedTerms) return;
        signup({
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            {/* Name Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="firstName" className="text-sm font-semibold text-neutral-600">
                        First name
                    </label>
                    <input
                        id="firstName"
                        placeholder="John"
                        {...register("firstName")}
                        className={`h-11 w-full border-0 border-b bg-neutral-50 px-3 text-sm font-normal text-neutral-900 placeholder:text-neutral-300 placeholder:font-light outline-none transition-all duration-200 focus:bg-white focus:border-blue-800 ${errors.firstName ? "border-red-400 bg-red-50" : "border-neutral-200"}`}
                    />
                    {errors.firstName && (
                        <p className="text-[11px] text-red-500 tracking-wide">{errors.firstName.message}</p>
                    )}
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="lastName" className="text-sm font-semibold text-neutral-600">
                        Last name
                    </label>
                    <input
                        id="lastName"
                        placeholder="Doe"
                        {...register("lastName")}
                        className={`h-11 w-full border-0 border-b bg-neutral-50 px-3 text-sm font-normal text-neutral-900 placeholder:text-neutral-300 placeholder:font-light outline-none transition-all duration-200 focus:bg-white focus:border-blue-800 ${errors.lastName ? "border-red-400 bg-red-50" : "border-neutral-200"}`}
                    />
                    {errors.lastName && (
                        <p className="text-[11px] text-red-500 tracking-wide">{errors.lastName.message}</p>
                    )}
                </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-neutral-600">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    {...register("email")}
                    className={`h-11 w-full border-0 border-b bg-neutral-50 px-3 text-sm font-normal text-neutral-900 placeholder:text-neutral-300 placeholder:font-light outline-none transition-all duration-200 focus:bg-white focus:border-blue-800 ${errors.email ? "border-red-400 bg-red-50" : "border-neutral-200"}`}
                />
                {errors.email && (
                    <p className="text-[11px] text-red-500 tracking-wide">{errors.email.message}</p>
                )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-neutral-600">
                    Password
                </label>
                <div className="relative">
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
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
                    Confirm password
                </label>
                <div className="relative">
                    <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
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

            {/* Terms */}
            <div className="flex items-start gap-2 pt-1 group cursor-pointer" onClick={() => setAcceptedTerms(!acceptedTerms)}>
                <button
                    type="button"
                    role="checkbox"
                    aria-checked={acceptedTerms}
                    className={`w-3.5 h-3.5 mt-0.5 flex items-center justify-center border rounded-sm transition-all duration-150 flex-shrink-0 ${acceptedTerms ? "bg-blue-900 border-blue-900" : "bg-white border-neutral-300 group-hover:border-blue-900"}`}
                >
                    {acceptedTerms && (
                        <svg className="w-2 h-2" viewBox="0 0 8 8" fill="none">
                            <path d="M1 4L3 6L7 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </button>
                <span className="text-xs text-neutral-500 leading-relaxed tracking-wide">
                    By creating an account, you agree to our{" "}
                    <Link href="/terms" className="text-blue-900 font-semibold hover:opacity-60">Terms</Link> and{" "}
                    <Link href="/privacy" className="text-blue-900 font-semibold hover:opacity-60">Privacy Policy</Link>.
                </span>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isPending || !acceptedTerms}
                className="flex h-11 w-full items-center justify-center gap-2 bg-blue-900 text-white text-sm font-semibold rounded mt-2 transition-opacity duration-150 hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isPending ? "Creating account…" : "Create account"}
            </button>
        </form>
    );
}

export default function SignupPage() {
    return (
        <div className="flex items-center justify-center px-4 font-titillium">
            <div className="w-full max-w-sm bg-white px-9">

                {/* Heading */}
                <div className="mb-6">
                    <h1 className="text-lg font-bold text-neutral-900 mb-1.5">Create an account</h1>
                    <p className="text-sm text-neutral-900 tracking-wide">Enter your details to get started</p>
                </div>
                {/* Form */}
                <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-neutral-300 animate-spin" /></div>}>
                    <SignupForm />
                </Suspense>

                {/* Divider */}
                <div className="my-5 h-px bg-neutral-100" />

                {/* Sign in */}
                <p className="text-center text-xs text-neutral-600 tracking-wide">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-semibold text-blue-900 border-b border-blue-900 pb-px hover:opacity-60 transition-opacity duration-150"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}