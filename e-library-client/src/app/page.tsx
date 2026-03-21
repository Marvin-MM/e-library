// app/page.tsx (or your entry file)
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { FullScreenLoader } from "@/components/FullScreenLoader";

export default function Home() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
        // Early return to do nothing while still loading
        if (isLoading) return;

        // Determine destination and route
        const destination = isAuthenticated ? "/dashboard" : "/login";
        router.replace(destination);
        
    }, [isAuthenticated, isLoading, router]);

    return <FullScreenLoader message="Authenticating..." delayMs={200} />;
}