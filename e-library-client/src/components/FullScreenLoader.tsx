// components/ui/FullScreenLoader.tsx
import { useEffect, useState } from "react";

interface FullScreenLoaderProps {
    message?: string;
    delayMs?: number;
}

export function FullScreenLoader({ 
    message = "Loading...", 
    delayMs = 250 // Wait 250ms before showing to prevent UI flashing
}: FullScreenLoaderProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setShow(true), delayMs);
        return () => clearTimeout(timeout);
    }, [delayMs]);

    // Render nothing for the first 250ms for a seamless transition
    if (!show) return null;

    return (
        <div 
            className="min-h-screen flex flex-col items-center justify-center bg-background"
            role="status"
            aria-label={message}
        >
            <div className="relative flex items-center justify-center">
                {/* Subtle static background ring */}
                <div className="absolute inset-0 rounded-full border-4 border-gray-100 dark:border-gray-800"></div>
                {/* Active spinning ring */}
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
            
            {message && (
                <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">
                    {message}
                </p>
            )}
            
            {/* Screen-reader only text */}
            <span className="sr-only">{message}</span>
        </div>
    );
}