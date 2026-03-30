import "@/styles/globals.css";
import { Providers } from "./providers";
import type { Metadata, Viewport } from "next";
import { Titillium_Web } from "next/font/google";
import { cn } from "@/lib/utils";

const titilliumWeb = Titillium_Web({
    weight: ['200', '300', '400', '600', '700', '900'],
    subsets: ['latin'],
    variable: '--font-titillium',
    display: 'swap', // show fallback immediately, swap in when loaded
    preload: true,
});

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
};

export const metadata: Metadata = {
    title: {
        default: 'ResourceHub – University Digital Library',
        template: '%s | ResourceHub',
    },
    description: 'Browse, borrow, and access your university library resources — books, journals, dissertations, and course materials.',
    robots: { index: false, follow: false }, // private app, keep out of search engines
    icons: { icon: 'https://vu.ac.ug/favicon.png' },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={cn("min-h-screen bg-zinc-50 font-sans antialiased")}>
                {/* Skip to main content — critical for keyboard/screen reader accessibility */}
                <a href="#main-content" className="skip-nav">
                    Skip to main content
                </a>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
