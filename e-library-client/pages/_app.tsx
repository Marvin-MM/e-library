import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClientProvider, HydrationBoundary } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/queryClient";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import ErrorBoundary from "@/components/layout/ErrorBoundary";

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={pageProps.dehydratedState}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <AnimatePresence mode="wait" initial={false}>
                <Component {...pageProps} key={router.asPath} />
              </AnimatePresence>
            </AuthProvider>
            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                duration: 4000,
              }}
            />
          </ThemeProvider>
        </HydrationBoundary>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
