"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyEmail } from "@/hooks/useAuth";
import { CheckCircle, Loader2, Mail } from "lucide-react";


function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const { mutate: verifyEmail, isPending, isSuccess } = useVerifyEmail();
    const [manualToken, setManualToken] = useState("");

    useEffect(() => {
        if (token) {
            verifyEmail(token);
        }
    }, [token, verifyEmail]);

    const handleManualVerify = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualToken.trim()) {
            verifyEmail(manualToken.trim());
        }
    };

    if (isSuccess) {
        return (
            <div className="flex items-center justify-center px-4 font-titillium">
                <div className="w-full max-w-sm bg-white px-9 py-11 text-center">
                    <div className="mb-8">
                        <h1 className="text-lg font-bold text-neutral-900 mb-1.5">Email Verified</h1>
                        <p className="text-sm text-neutral-900 tracking-wide">Your email has been successfully verified</p>
                    </div>

                    <div className="flex flex-col items-center gap-6">
                        <div className="p-4 rounded-full bg-blue-50">
                            <CheckCircle className="h-10 w-10 text-blue-900" />
                        </div>

                        <p className="text-sm text-neutral-600 tracking-wide px-2">
                            You can now sign in to your account with your credentials.
                        </p>

                        <button
                            onClick={() => router.push("/login")}
                            className="flex h-11 w-full items-center justify-center bg-blue-900 text-white text-sm font-semibold rounded transition-opacity duration-150 hover:opacity-80"
                        >
                            Continue to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (token) {
        return (
            <div className="flex items-center justify-center px-4 font-titillium">
                <div className="w-full max-w-sm bg-white px-9 py-11 text-center">
                    <div className="mb-8">
                        <h1 className="text-lg font-bold text-neutral-900 mb-1.5">Verifying Email</h1>
                        <p className="text-sm text-neutral-900 tracking-wide">Please wait while we verify your email</p>
                    </div>

                    <div className="flex flex-col items-center gap-6 py-4">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-900" />
                        <p className="text-sm text-neutral-600 tracking-wide">Verifying your email address...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center px-4 font-titillium">
            <div className="w-full max-w-sm bg-white px-9 py-11">

                {/* Heading */}
                <div className="mb-8 text-center">
                    <h1 className="text-lg font-bold text-neutral-900 mb-1.5">Check your email</h1>
                    <p className="text-sm text-neutral-900 tracking-wide">We sent you a verification link</p>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-full bg-blue-50">
                                <Mail className="h-10 w-10 text-blue-900" />
                            </div>
                        </div>
                        <p className="text-xs text-neutral-500 tracking-relaxed px-2">
                            Click the link in your email to verify your account. If you don&apos;t see it, check your spam folder.
                        </p>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-neutral-100" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                            <span className="bg-white px-3 text-neutral-400">Or enter code manually</span>
                        </div>
                    </div>

                    <form onSubmit={handleManualVerify} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="token" className="text-sm font-semibold text-neutral-600">
                                Verification Code
                            </label>
                            <input
                                id="token"
                                placeholder="Enter verification code"
                                value={manualToken}
                                onChange={(e) => setManualToken(e.target.value)}
                                className="h-11 w-full border-0 border-b bg-neutral-50 px-3 text-sm font-normal text-neutral-900 placeholder:text-neutral-300 placeholder:font-light outline-none transition-all duration-200 focus:bg-white focus:border-blue-800 border-neutral-200"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isPending || !manualToken.trim()}
                            className="flex h-11 w-full items-center justify-center gap-2 bg-blue-900 text-white text-sm font-semibold rounded transition-opacity duration-150 hover:opacity-80 disabled:opacity-40"
                        >
                            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Verify Email
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-neutral-300 animate-spin" /></div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
