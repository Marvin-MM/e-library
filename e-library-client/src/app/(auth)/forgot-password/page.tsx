"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForgotPassword } from "@/hooks/useAuth";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/schemas/auth";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";


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
            <div className="flex items-center justify-center px-4">
                <div className="w-full max-w-sm bg-white px-9 py-11">
                    <div className="text-center mb-8">
                        <h1 className="text-lg font-bold text-neutral-900 mb-1.5">Check your email</h1>
                        <p className="text-sm text-neutral-900 tracking-wide">We sent you a password reset link</p>
                    </div>

                    <div className="text-center flex flex-col items-center gap-6">
                        <div className="p-4 rounded-full bg-blue-50">
                            <CheckCircle className="h-10 w-10 text-blue-900" />
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm text-neutral-600 tracking-wide">
                                We&apos;ve sent a link to:
                            </p>
                            <p className="font-semibold text-neutral-900">{submittedEmail}</p>
                        </div>

                        <p className="text-xs text-neutral-500 tracking-relaxed">
                            Click the link in the email to reset your password. If you don&apos;t see it, check your spam folder.
                        </p>

                        <Link
                            href="/login"
                            className="inline-flex items-center text-sm font-semibold text-blue-900 border-b border-blue-900 pb-px hover:opacity-60 transition-opacity duration-150"
                        >
                            <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center px-4">
            <div className="w-full max-w-sm bg-white px-9 py-11">

                {/* Heading */}
                <div className="mb-8">
                    <h1 className="text-lg font-bold text-neutral-900 mb-1.5">
                        Forgot password?
                    </h1>
                    <p className="text-sm text-neutral-900 tracking-wide">
                        Enter your email to receive a reset link
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="email"
                            className="text-sm font-semibold text-neutral-600"
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

                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex h-11 w-full items-center justify-center gap-2 bg-blue-900 text-white text-sm font-semibold rounded transition-opacity duration-150 hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {isPending ? "Sending link…" : "Send reset link"}
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
