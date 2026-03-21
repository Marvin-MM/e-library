"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/queryClient";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { FullScreenLoader } from "@/components/FullScreenLoader";

function AuthHydration({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const isHydrated = useAuthStore((state) => state.isHydrated);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isHydrated) {
        return <FullScreenLoader message="Authenticating..." delayMs={200} />;
    }

    return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider
                attribute="class"
                defaultTheme="light"  
                disableTransitionOnChange
            >
                <AuthHydration>{children}</AuthHydration>
                <Toaster
                    position="top-right"
                    richColors
                    closeButton
                    toastOptions={{
                        duration: 4000,
                    }}
                />
            </ThemeProvider>
        </QueryClientProvider>
    );
}
