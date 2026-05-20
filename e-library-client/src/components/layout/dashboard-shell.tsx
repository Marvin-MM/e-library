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
    Sun,
    ChevronDown,
    User as UserIcon,
    ShieldCheck,
    Database,
    Globe,
    Sparkles,
} from "lucide-react";
import { useTheme } from "next-themes";
import { AdminSidebar } from "./admin-sidebar";
import Sidebar from "./studsidebar";
import { DiscoverySearchModal } from "@/components/modals/DiscoverySearchModal";
import { useDiscoveryStore } from "@/stores/discoveryStore";
import { useDiscoverySources } from "@/hooks/useDiscovery";

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
    const [searchMode, setSearchMode] = useState<"others" | "scholar">("others");
    const [discoveryOpen, setDiscoveryOpen] = useState(false);

    const { setSelectedSources } = useDiscoveryStore();
    const { data: sourcesData } = useDiscoverySources();

    const handleSearchClick = () => {
        if (searchMode === "scholar") {
            setSelectedSources(["googleScholar"]);
            setDiscoveryOpen(true);
        } else {
            if (sourcesData?.data) {
                setSelectedSources(sourcesData.data.map(s => s.id).filter(id => id !== "googleScholar"));
            }
            setSearchOpen(true);
        }
    };

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
            {isAdmin ? <AdminSidebar /> : <Sidebar />}

            {/* Main Layout Area */}
            <div className={cn("flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 bg-zinc-100", "lg:pl-64")}>

                {/* Universal Header - Modern Search-First Redesign */}
                <header className="h-16 border-b bg-white dark:bg-zinc-950 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-50 shrink-0">
                    <div className="flex items-center gap-4 max-w-4xl w-full">
                        {/* Mobile Menu Trigger — shown for all roles on small screens */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            className="lg:hidden shrink-0"
                            aria-label="Open navigation menu"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>

                        {/* Integrated Search Bar Trigger — students only */}
                        {!isAdmin && (
                            <div className="relative group w-auto sm:max-w-md sm:w-full flex items-center flex-shrink-0 sm:flex-shrink">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 h-10 bg-zinc-50 border border-zinc-200 border-r-0 rounded-l text-[10px] font-bold uppercase tracking-wider text-zinc-600 hover:bg-zinc-100 hover:text-blue-900 transition-colors">
                                            {searchMode === "scholar" ? <Globe className="w-3.5 h-3.5" /> : <Database className="w-3.5 h-3.5" />}
                                            <span className="hidden sm:inline">{searchMode === "scholar" ? "Scholar" : "Others"}</span>
                                            <ChevronDown className="w-3 h-3 ml-0 sm:ml-0.5 opacity-50" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-40 rounded-xl border-2 border-zinc-100">
                                        <DropdownMenuItem onClick={() => setSearchMode("others")} className="text-[10px] font-bold uppercase tracking-wider cursor-pointer h-9">
                                            <Database className="w-3.5 h-3.5 mr-2 text-zinc-400" /> Others
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setSearchMode("scholar")} className="text-[10px] font-bold uppercase tracking-wider cursor-pointer h-9">
                                            <Globe className="w-3.5 h-3.5 mr-2 text-blue-500" /> Google Scholar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <button
                                    onClick={handleSearchClick}
                                    aria-label="Search resources, books, or courses"
                                    className="flex items-center justify-center sm:justify-start gap-3 px-0 sm:px-4 h-10 w-10 sm:w-auto sm:flex-1 bg-white border border-zinc-200 rounded-r text-zinc-400 hover:border-zinc-300 transition-all text-xs group"
                                >
                                    <Search className="w-4 h-4 text-zinc-400 group-hover:text-blue-900 transition-colors" />
                                    <span className="flex-1 text-left hidden lg:inline text-zinc-400 group-hover:text-zinc-600 truncate">Search resources, books, or courses...</span>
                                    <span className="flex-1 text-left hidden sm:inline lg:hidden text-zinc-400 truncate">Search...</span>
                                    <div className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded border border-zinc-200 bg-zinc-50 text-[10px] font-bold text-zinc-400 uppercase tracking-tighter group-hover:border-zinc-300 transition-colors">
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
                                        "hidden md:flex",
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
                                <div className="h-4 w-px bg-zinc-200 mx-1 hidden md:block" />
                            </>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-lg hover:bg-zinc-50 border border-zinc-100 text-zinc-500 hover:text-blue-600 transition-all flex items-center justify-center shrink-0"
                                    aria-label="AI Assistant"
                                >
                                    <Sparkles className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 p-4 rounded-xl border-2 border-zinc-100 bg-white text-center shadow-2xl">
                                <div className="flex flex-col items-center gap-1.5">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                                    </div>
                                    <p className="text-xs font-bold text-zinc-900 uppercase tracking-wide">AI Research Copilot</p>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100">Coming Soon</span>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <NotificationsPopover />
                        {/* User Profile Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="rounded-full hover:bg-zinc-50 border border-zinc-100 pl-1 pr-3 py-1 h-10 gap-2 transition-all group"
                                >
                                    <div className="relative">
                                        <Avatar className="h-8 w-8 border border-white shadow-sm ring-1 ring-zinc-100">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback className="bg-blue-50 text-blue-700 font-bold text-[10px] uppercase">
                                                {getInitials(`${user.name}`)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                                    </div>
                                    <div className="hidden sm:flex flex-col items-start gap-0">
                                        <span className="text-xs font-bold text-zinc-900 group-hover:text-blue-600 transition-colors truncate max-w-[100px]">
                                            {user.name.split(' ')[0]}
                                        </span>
                                        <span className="text-[10px] font-medium text-zinc-400 leading-none">
                                            {user.role.toLowerCase()}
                                        </span>
                                    </div>
                                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-data-[state=open]:rotate-180 transition-transform" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="end"
                                className="w-72 p-0 rounded-xl mt-2 border-2 border-zinc-100 bg-white shadow-2xl shadow-zinc-200/50 overflow-hidden animate-in slide-in-from-top-2 duration-300"
                            >
                                <div className="bg-gradient-to-br from-zinc-50 to-white px-5 py-2 border-b border-zinc-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
                                    <div className="flex items-center gap-4 relative z-10">
                                        <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback className="bg-zinc-100 text-zinc-900 font-bold uppercase text-sm">
                                                {getInitials(`${user.name}`)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col min-w-0">
                                            <p className="text-sm font-bold text-zinc-900 truncate tracking-tight">{user.name}</p>
                                            <p className="text-[11px] font-medium text-zinc-400 truncate">{user.email}</p>

                                            <div className="mt-2.5 flex">
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-zinc-100 rounded-full shadow-sm">
                                                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                                                        {user.role} Account
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-1.5">
                                    <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                        Manage Account
                                    </DropdownMenuLabel>

                                    {!isAdmin && (
                                        <DropdownMenuItem asChild className="rounded-lg h-11 cursor-pointer focus:bg-emerald-50 focus:text-emerald-700 transition-all">
                                            <Link href="/requests" className="flex items-center w-full px-2">
                                                <div className="w-8 h-8 rounded-md bg-zinc-50 flex items-center justify-center mr-3">
                                                    <GitPullRequest className="h-4 w-4 text-zinc-500" />
                                                </div>
                                                <div className="flex flex-col gap-0">
                                                    <span className="font-bold text-sm tracking-tight">My Requests</span>
                                                    <span className="text-[10px] text-zinc-400">View your requests</span>
                                                </div>
                                            </Link>
                                        </DropdownMenuItem>
                                    )}

                                    <DropdownMenuItem asChild className="rounded-lg h-11 cursor-pointer focus:bg-blue-50 focus:text-blue-700 transition-all">
                                        <Link href="/settings" className="flex items-center w-full px-2">
                                            <div className="w-8 h-8 rounded-md bg-zinc-50 flex items-center justify-center mr-3 group-focus:bg-blue-100/50 transition-colors">
                                                <Settings className="h-4 w-4 text-zinc-500 group-focus:text-blue-600" />
                                            </div>
                                            <div className="flex flex-col gap-0">
                                                <span className="font-bold text-sm tracking-tight">Account Settings</span>
                                                <span className="text-[10px] text-zinc-400">Security and preferences</span>
                                            </div>
                                        </Link>
                                    </DropdownMenuItem>

                                </div>

                                <div className="p-1.5 border-t border-zinc-50 bg-zinc-50/30">
                                    <DropdownMenuItem
                                        onClick={() => logout()}
                                        className="rounded-lg h-11 cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50 font-bold transition-all px-4"
                                    >
                                        <LogOut className="mr-3 h-4 w-4" />
                                        <span className="uppercase tracking-widest text-[11px]">Sign Out</span>
                                    </DropdownMenuItem>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
                    <DiscoverySearchModal open={discoveryOpen} onOpenChange={setDiscoveryOpen} />
                </header>


                {/* Main Content Area */}
                <main
                    id="main-content"
                    className="flex-1 overflow-y-auto scrollbar-hide w-full p-4 sm:p-6 lg:p-8"
                    aria-label="Main content"
                >
                    <div>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
