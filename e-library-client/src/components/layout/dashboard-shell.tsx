"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import { SearchModal } from "@/components/modals/SearchModal";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogout, useRole, useUser } from "@/hooks/useAuth";
import { cn, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import {
    BookOpen,
    Command,
    GitPullRequest,
    LogOut,
    Menu,
    Moon,
    Search,
    Settings,
    Sun
} from "lucide-react";
import { useTheme } from "next-themes";
import { AdminSidebar } from "./admin-sidebar";
import Sidebar from "./studsidebar";

interface DashboardShellProps {
    children: ReactNode;
    title?: string; // Kept for compatibility, though sticking to Client Layout usually implies title is managed by page
}

export function DashboardShell({ children, title }: DashboardShellProps) {
    const router = useRouter();
    const { user, isAuthenticated, isHydrated } = useAuthStore();
    const pathname = usePathname();
    const { toggleSidebar } = useUIStore();
    const { isAdmin } = useRole();
    const { mutate: logout } = useLogout();
    const { theme, setTheme } = useTheme();
    const { isLoading: userLoading } = useUser();
    const [mounted, setMounted] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && isHydrated && !isAuthenticated) {
            router.push(`/login`);
        }
    }, [isHydrated, isAuthenticated, router, mounted]);

    // Optimized hydration: If we have user data, render immediately. 
    // Only show skeleton if we are truly loading initial state and have no user.
    if (!mounted) return null; // Prevent hydration mismatch

    if (isHydrated && !isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    if (userLoading && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="space-y-4 flex flex-col items-center">
                    <div className="relative">
                        <div className="h-16 w-16 rounded-2xl bg-primary/20 animate-pulse" />
                        <BookOpen className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="h-screen flex overflow-hidden bg-zinc-100 font-sans antialiased relative">
            {/* Sidebar Section */}
            {isAdmin ? <AdminSidebar /> : <Sidebar activeTab={pathname} setActiveTab={(tab) => router.push(tab)} />}

            {/* Main Layout Area */}
            <div className={cn("flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 bg-zinc-100", "lg:pl-64")}>

                {/* Universal Header - Modern Search-First Redesign */}
                <header className="h-16 border-b bg-white dark:bg-zinc-950 flex items-center px-4 sm:px-8 sticky top-0 z-50 shrink-0">
                    <div className="flex-1 flex items-center gap-6 max-w-4xl">
                        {/* Mobile Menu Trigger (Admin Only) */}
                        {isAdmin && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleSidebar}
                                className="lg:hidden"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        )}

                        {/* Integrated Search Bar Trigger */}
                        {!isAdmin && (
                            <div className="relative group max-w-md w-full">
                                <button
                                    onClick={() => setSearchOpen(true)}
                                    className="w-full flex items-center gap-3 px-4 h-10 bg-white border border-zinc-100 rounded text-zinc-400 hover:border-zinc-200 transition-all text-sm group"
                                >
                                    <Search className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
                                    <span className="flex-1 text-left hidden sm:inline">Search resources, books, or courses...</span>
                                    <span className="flex-1 text-left sm:hidden">Search...</span>
                                    <div className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded border border-zinc-200 bg-white text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                                        <Command className="w-2.5 h-2.5" />
                                        <span>K</span>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {!isAdmin && (
                            <>
                                <Button
                                    variant="ghost"
                                    asChild
                                    className={cn(
                                        "h-9 px-4 rounded flex items-center gap-2 font-semibold text-sm transition-all",
                                        pathname === "/requests"
                                            ? "bg-blue-50 text-blue-900 shadow-sm border border-blue-100/50"
                                            : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                                    )}
                                >
                                    <Link href="/requests">
                                        <GitPullRequest className="w-4 h-4" />
                                        <span className="hidden lg:inline">My Requests</span>
                                    </Link>
                                </Button>
                                <div className="h-4 w-px bg-zinc-200 mx-1 hidden sm:block" />
                            </>
                        )}

                        <NotificationsPopover />
                        {/* User Profile Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full border border-zinc-100 hover:border-zinc-300 p-0.5">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback className="bg-zinc-100 text-zinc-600 font-semibold text-xs text-titillium uppercase">
                                            {getInitials(`${user.name}`)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 p-2 rounded mt-2 border-zinc-100 bg-white">
                                <DropdownMenuLabel className="px-3 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 shrink-0">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback className="bg-zinc-100 text-zinc-900 uppercase">
                                                {getInitials(`${user.name}`)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col min-w-0">
                                            <p className="text-sm font-bold text-zinc-900 truncate">{user.name}</p>
                                            <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 inline-flex items-center px-2  text-blue-700 text-[10px] uppercase tracking-wide">
                                        {user.role}
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-zinc-50" />
                                <DropdownMenuItem asChild className="rounded h-10 cursor-pointer focus:bg-zinc-50">
                                    <Link href="/settings" className="flex items-center w-full">
                                        <Settings className="mr-3 h-4 w-4 text-zinc-500" />
                                        <span className="font-semibold text-zinc-700">Account Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-zinc-50" />
                                <DropdownMenuItem
                                    onClick={() => logout()}
                                    className="rounded h-10 cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50 font-bold"
                                >
                                    <LogOut className="mr-3 h-4 w-4" />
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
                </header>


                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto scrollbar-hide container mx-auto p-4 sm:p-6 lg:p-8 max-w-[1600px]">
                    <div>
                        {children}
                    </div>
                </main>
            </div>

            <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </div>
    );
}
