"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Search,
    Bell,
    MessageCircle,
    GitPullRequest,
    Plus,
    Command
} from "lucide-react";

import { cn } from "@/lib/utils";
import { getNavigation } from "./navigation-config";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { SearchModal } from "@/components/modals/SearchModal";

export function StudentStaffTopbar() {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const [searchOpen, setSearchOpen] = useState(false);

    if (!user) return null;

    return (
        <div className="h-16 border-b bg-white flex items-center px-6 sticky top-0 z-50 font-sans">
            <div className="flex-1 flex items-center gap-8">
                {/* Visual Branding placeholder if needed, otherwise just start with content */}

                {/* Integrated Search Trigger */}
                <div className="relative group max-w-md w-full">
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="w-full flex items-center gap-3 px-4 h-11 bg-zinc-50 border border-zinc-100 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:border-zinc-200 transition-all text-sm group"
                    >
                        <Search className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
                        <span className="flex-1 text-left">Search resources, books, or courses...</span>
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-zinc-200 bg-white text-[10px] font-bold text-zinc-400 shadow-sm uppercase tracking-tighter">
                            <Command className="w-2.5 h-2.5" />
                            <span>K</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    asChild
                    className={cn(
                        "h-10 px-4 rounded-lg flex items-center gap-2 font-semibold text-sm transition-all",
                        pathname === "/students/requests"
                            ? "bg-blue-50 text-blue-900 shadow-sm border border-blue-100/50"
                            : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                    )}
                >
                    <Link href="/students/requests">
                        <GitPullRequest className="w-4 h-4" />
                        My Requests
                    </Link>
                </Button>

                <div className="h-4 w-px bg-zinc-200 mx-2" />

                <button className="w-10 h-10 flex items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                </button>

                <button className="w-10 h-10 flex items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {/* Global Search Modal */}
            <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
        </div>
    );
}
