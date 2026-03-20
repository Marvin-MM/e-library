"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { useLogout } from "@/hooks/useAuth";
import { cn, getInitials } from "@/lib/utils";
import { adminNavigation } from "./navigation-config";

import {
    ChevronRight,
    ChevronsUpDown,
    LogOut,
    Moon,
    MoreVertical,
    Palette,
    Settings,
    Shield,
    Sun,
    User,
    X,
} from "lucide-react";

export function AdminSidebar() {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const { sidebarOpen, setSidebarOpen } = useUIStore();
    const logoutMutation = useLogout();

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

    const profileRef = useRef<HTMLDivElement>(null);

    const userName = user?.firstName || user?.name || "Admin";
    const userAvatar = user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
                setActiveSubMenu(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    const isActiveLink = (href: string) => {
        if (!pathname) return false;
        if (href === "/dashboard/admin") {
            return pathname === href;
        }
        return pathname === href || pathname.startsWith(href + "/");
    };

    const colors = [
        { name: 'red', color: '#ef4444' },
        { name: 'orange', color: '#f97316' },
        { name: 'amber', color: '#f59e0b' },
        { name: 'lime', color: '#84cc16' },
        { name: 'green', color: '#22c55e' },
        { name: 'teal', color: '#14b8a6' },
        { name: 'cyan', color: '#06b6d4' },
        { name: 'blue', color: '#3b82f6' },
        { name: 'indigo', color: '#6366f1' },
        { name: 'violet', color: '#8b5cf6' },
        { name: 'purple', color: '#a855f7' },
        { name: 'pink', color: '#ec4899' },
        { name: 'rose', color: '#f43f5e' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "flex flex-col h-screen border-r border-zinc-200 fixed inset-y-0 left-0 overflow-hidden transition-all duration-300 ease-in-out z-50 bg-white shadow-sm w-64",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Header — Brand */}
                <div className="p-3 relative">
                    <div className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-zinc-200">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center shrink-0">
                                <Shield className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-zinc-900 truncate leading-none">ResourceHub</span>
                                <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider leading-tight mt-0.5">{user.role} Portal</span>
                            </div>
                        </div>
                        {/* Mobile close */}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1 rounded hover:bg-zinc-100 transition-colors"
                        >
                            <X className="w-4 h-4 text-zinc-400" />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto scrollbar-hide py-6 px-3">
                    {adminNavigation.map((section, idx) => (
                        <div key={idx} className="mb-6">
                            {section.title && (
                                <h3 className="px-2 text-[14px] text-zinc-500 mb-2">
                                    {section.title}
                                </h3>
                            )}
                            <nav className="space-y-1.5">
                                {section.items.map((item) => {
                                    const isActive = isActiveLink(item.href);
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-2 py-2 rounded transition-all group",
                                                isActive
                                                    ? "bg-blue-800 text-white shadow-sm"
                                                    : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900"
                                            )}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <item.icon className={cn(
                                                    "w-4 h-4 shrink-0",
                                                    isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-700"
                                                )} />
                                                <span className="text-sm font-medium">{item.name}</span>
                                            </div>
                                            {item.badge && (
                                                <span className="text-[12px] font-medium px-1.5 py-0.5 rounded bg-white text-zinc-900 border border-zinc-200">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}
                </div>

                {/* Footer / User */}
                <div className="p-3 mt-auto border-t border-zinc-200 relative" ref={profileRef}>
                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute bottom-full left-3 right-3 mb-2 bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden z-50 py-1"
                            >
                                {/* User Header */}
                                <div className="px-3 py-2 flex items-center gap-2.5 border-b border-zinc-100 mb-1">
                                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-2">
                                        <img
                                            src={userAvatar}
                                            alt={userName}
                                            className="w-full h-full object-cover bg-zinc-100"
                                        />
                                    </div>
                                    <div className="flex flex-col mt-2">
                                        <span className="text-sm font-semibold text-zinc-900 leading-none">{userName}</span>
                                        {user?.email && <span className="text-[10px] text-zinc-500 mt-1">{user.email}</span>}
                                        <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wider mt-1">{user.role}</span>
                                    </div>
                                </div>

                                {/* Group 1: Navigation */}
                                <div className="px-1 space-y-0.5 border-b border-zinc-100 pb-1 mb-1">
                                    <Link
                                        href="/admin/settings"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                                    >
                                        <User className="w-4 h-4 text-zinc-400" />
                                        <span>Profile</span>
                                    </Link>
                                    <Link
                                        href="/admin/settings"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                                    >
                                        <Settings className="w-4 h-4 text-zinc-400" />
                                        <span>Settings</span>
                                    </Link>
                                </div>

                                {/* Group 2: Theme & Appearance */}
                                <div className="px-1 space-y-0.5 border-b border-zinc-100 pb-1 mb-1">
                                    <div className="relative group/submenu">
                                        <button
                                            onMouseEnter={() => setActiveSubMenu('theme')}
                                            className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <Palette className="w-4 h-4 text-zinc-400" />
                                                <span>Theme</span>
                                            </div>
                                            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                                        </button>

                                        <AnimatePresence>
                                            {(activeSubMenu === 'theme' || activeSubMenu === 'primary') && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -10 }}
                                                    className="absolute left-full bottom-0 ml-2 w-48 bg-white border border-zinc-200 rounded-xl shadow-xl py-1 z-50"
                                                    onMouseLeave={() => setActiveSubMenu(null)}
                                                >
                                                    <button
                                                        onMouseEnter={() => setActiveSubMenu('primary')}
                                                        className={cn(
                                                            "w-full flex items-center justify-between px-3 py-1.5 text-sm transition-colors",
                                                            activeSubMenu === 'primary' ? "bg-zinc-100 text-zinc-900" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-2 h-2 rounded-full border border-zinc-300" />
                                                            <span>Primary</span>
                                                        </div>
                                                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                                                    </button>
                                                    <button
                                                        onMouseEnter={() => setActiveSubMenu('theme')}
                                                        className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-2 h-2 rounded-full bg-zinc-500" />
                                                            <span>Neutral</span>
                                                        </div>
                                                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                                                    </button>

                                                    {/* Primary Colors Sub-menu */}
                                                    <AnimatePresence>
                                                        {activeSubMenu === 'primary' && (
                                                            <motion.div
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: -10 }}
                                                                className="absolute left-full top-0 ml-2 w-40 bg-white border border-zinc-200 rounded-xl shadow-xl py-1 z-50 max-h-80 overflow-y-auto scrollbar-hide"
                                                            >
                                                                {colors.map((c) => (
                                                                    <button key={c.name} className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900">
                                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                                                                        <span>{c.name}</span>
                                                                    </button>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <button
                                        onClick={() => setIsDarkMode(!isDarkMode)}
                                        className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            {isDarkMode ? <Moon className="w-4 h-4 text-zinc-400" /> : <Sun className="w-4 h-4 text-zinc-400" />}
                                            <span>Appearance</span>
                                        </div>
                                        <div className={cn(
                                            "w-8 h-4 rounded-full transition-colors relative shrink-0",
                                            isDarkMode ? "bg-zinc-900" : "bg-zinc-200"
                                        )}>
                                            <div className={cn(
                                                "w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all shadow-sm",
                                                isDarkMode ? "left-[18px]" : "left-[2px]"
                                            )} />
                                        </div>
                                    </button>
                                </div>

                                {/* Group 3: Logout */}
                                <div className="px-1 space-y-0.5">
                                    <button
                                        onClick={() => logoutMutation.mutate()}
                                        disabled={logoutMutation.isPending}
                                        className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors disabled:opacity-50"
                                    >
                                        <LogOut className="w-4 h-4 text-zinc-400" />
                                        <span>{logoutMutation.isPending ? 'Logging out...' : 'Log out'}</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className={cn(
                            "w-full flex items-center justify-between p-2 rounded-lg transition-colors",
                            isProfileOpen ? "bg-zinc-200/50" : "hover:bg-zinc-200/50"
                        )}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-200 shadow-sm shrink-0">
                                <img
                                    src={userAvatar}
                                    alt={userName}
                                    className="w-full h-full object-cover bg-zinc-100"
                                />
                            </div>
                            <span className="text-sm font-semibold text-zinc-900 truncate">{userName}</span>
                        </div>
                        <MoreVertical className="w-4 h-4 text-zinc-500" />
                    </button>
                </div>
            </aside>
        </>
    );
}
