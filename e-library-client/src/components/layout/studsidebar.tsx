"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { useLogout } from "@/hooks/useAuth";
import { useDepartments } from "@/hooks/useCourses";
import { useDepartmentStore } from "@/stores/departmentStore";
import { cn } from "@/lib/utils";

import {
    BookOpen,
    BoxSelectIcon,
    Building2,
    ChevronsUpDown,
    Film,
    HandCoins,
    Heart,
    Library,
    Loader2,
    LogOut,
    MoreVertical,
    Settings,
    User,
    X,
} from "lucide-react";

const menuGroups = [
    {
        title: "Home",
        items: [
            { id: "/dashboard", label: "Discover", icon: Film },
            { id: "/students/library", label: "My Library", icon: Library },
        ],
    },
    {
        title: "Resources",
        items: [
            { id: "/course-dissertations", label: "Course Dissertations", icon: HandCoins },
            { id: "/resources", label: "Resources", icon: BoxSelectIcon },
            { id: "/students/favourites", label: "Favourites", icon: Heart },
        ],
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const { sidebarOpen, setSidebarOpen } = useUIStore();
    const logoutMutation = useLogout();

    const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const { data: departments, isLoading: isDeptsLoading } = useDepartments();
    const { selectedDepartment, setSelectedDepartment } = useDepartmentStore();

    const workspaceRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const userName = user?.firstName || user?.name || "Student";
    const userAvatar =
        user?.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`;

    // Auto-select first department if none is selected
    useEffect(() => {
        if (departments && departments.length > 0 && !selectedDepartment) {
            setSelectedDepartment(departments[0]);
        }
    }, [departments, selectedDepartment, setSelectedDepartment]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (workspaceRef.current && !workspaceRef.current.contains(e.target as Node)) {
                setIsWorkspaceOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    const isActiveLink = (href: string) => {
        if (!pathname) return false;
        if (href === "/dashboard") return pathname === href;
        return pathname === href || pathname.startsWith(href + "/");
    };

    return (
        <>
            {/* Mobile overlay — tap to close */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/20 lg:hidden"
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                aria-label="Student navigation"
                className={cn(
                    "flex flex-col h-screen border-r border-zinc-200 fixed inset-y-0 left-0 overflow-hidden z-50 bg-white shadow-sm w-64",
                    "transition-transform duration-200 ease-in-out",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Header — Brand + close button on mobile */}
                <div className="p-3 shrink-0">
                    <div className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-zinc-200">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 flex items-center justify-center shrink-0">
                                <img 
                                    src="https://vu.ac.ug/favicon.png" 
                                    alt="VU Logo" 
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-zinc-900 truncate leading-none">
                                    ResourceHub
                                </span>
                                <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider leading-tight mt-0.5">
                                    Student Portal
                                </span>
                            </div>
                        </div>
                        {/* Close button — mobile only */}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            aria-label="Close navigation"
                            className="lg:hidden p-1 rounded hover:bg-zinc-100 transition-colors"
                        >
                            <X className="w-4 h-4 text-zinc-400" />
                        </button>
                    </div>
                </div>

                {/* Department / Workspace Switcher */}
                <div className="px-3 pb-2 shrink-0 relative" ref={workspaceRef}>
                    <button
                        onClick={() => setIsWorkspaceOpen((v) => !v)}
                        disabled={isDeptsLoading}
                        aria-expanded={isWorkspaceOpen}
                        aria-haspopup="listbox"
                        aria-label="Switch department"
                        className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors disabled:opacity-60"
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center shrink-0">
                                {isDeptsLoading ? (
                                    <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                                ) : (
                                    <Building2 className="w-3.5 h-3.5 text-white" />
                                )}
                            </div>
                            <span className="text-sm font-semibold text-zinc-900 truncate">
                                {selectedDepartment ?? "Select department"}
                            </span>
                        </div>
                        <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    </button>

                    {/* Dropdown — pure CSS visibility, no framer-motion */}
                    {isWorkspaceOpen && departments && departments.length > 0 && (
                        <div
                            role="listbox"
                            aria-label="Department list"
                            className="absolute top-full left-3 right-3 mt-1 bg-white border border-zinc-200 rounded-xl overflow-hidden z-50 py-1 shadow-xl max-h-60 overflow-y-auto scrollbar-hide"
                        >
                            {departments.map((dept) => (
                                <button
                                    key={dept}
                                    role="option"
                                    aria-selected={selectedDepartment === dept}
                                    onClick={() => {
                                        setSelectedDepartment(dept);
                                        setIsWorkspaceOpen(false);
                                    }}
                                    className={cn(
                                        "w-full flex items-center gap-2.5 px-2 py-1.5 text-sm transition-colors text-left",
                                        selectedDepartment === dept
                                            ? "bg-zinc-100 text-zinc-900 font-semibold"
                                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "w-5 h-5 rounded flex items-center justify-center shrink-0",
                                            selectedDepartment === dept ? "bg-blue-800" : "bg-zinc-200"
                                        )}
                                    >
                                        <Building2
                                            className={cn(
                                                "w-3 h-3",
                                                selectedDepartment === dept ? "text-white" : "text-zinc-500"
                                            )}
                                        />
                                    </div>
                                    <span className="truncate">{dept}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Navigation links */}
                <div className="flex-1 overflow-y-auto scrollbar-hide py-4 px-3">
                    {menuGroups.map((group) => (
                        <div key={group.title} className="mb-6">
                            <h3 className="px-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                                {group.title}
                            </h3>
                            <nav className="space-y-1" aria-label={group.title}>
                                {group.items.map((item) => {
                                    const isActive = isActiveLink(item.id);
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.id}
                                            onClick={() => setSidebarOpen(false)}
                                            aria-current={isActive ? "page" : undefined}
                                            className={cn(
                                                "flex items-center gap-2.5 px-2 py-2 rounded transition-colors group",
                                                isActive
                                                    ? "bg-blue-800 text-white shadow-sm"
                                                    : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900"
                                            )}
                                        >
                                            <item.icon
                                                className={cn(
                                                    "w-4 h-4 shrink-0",
                                                    isActive
                                                        ? "text-white"
                                                        : "text-zinc-500 group-hover:text-zinc-700"
                                                )}
                                            />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}
                </div>

                {/* Footer — User profile popover */}
                <div className="p-3 mt-auto border-t border-zinc-200 relative" ref={profileRef}>
                    {/* Profile popover — pure CSS, no framer-motion */}
                    {isProfileOpen && (
                        <div className="absolute bottom-full left-3 right-3 mb-2 bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden z-50 py-1">
                            {/* User Header */}
                            <div className="px-3 py-3 flex items-center gap-2.5 border-b border-zinc-100 mb-1">
                                <img
                                    src={userAvatar}
                                    alt={userName}
                                    width={32}
                                    height={32}
                                    className="rounded-full border border-zinc-200 shrink-0 object-cover bg-zinc-100"
                                />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-semibold text-zinc-900 truncate leading-none">
                                        {userName}
                                    </span>
                                    {user?.email && (
                                        <span className="text-[10px] text-zinc-500 truncate mt-0.5">
                                            {user.email}
                                        </span>
                                    )}
                                    <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wider mt-0.5">
                                        {user.role}
                                    </span>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="px-1 space-y-0.5 border-b border-zinc-100 pb-1 mb-1">
                                <Link
                                    href="/settings"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                                >
                                    <User className="w-4 h-4 text-zinc-400" />
                                    <span>Profile</span>
                                </Link>
                                <Link
                                    href="/settings"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                                >
                                    <Settings className="w-4 h-4 text-zinc-400" />
                                    <span>Settings</span>
                                </Link>
                            </div>

                            {/* Logout */}
                            <div className="px-1">
                                <button
                                    onClick={() => logoutMutation.mutate()}
                                    disabled={logoutMutation.isPending}
                                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors disabled:opacity-50"
                                >
                                    <LogOut className="w-4 h-4 text-zinc-400" />
                                    <span>{logoutMutation.isPending ? "Logging out…" : "Log out"}</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Profile trigger button */}
                    <button
                        onClick={() => setIsProfileOpen((v) => !v)}
                        aria-expanded={isProfileOpen}
                        aria-haspopup="true"
                        aria-label="Open profile menu"
                        className={cn(
                            "w-full flex items-center justify-between p-2 rounded-lg transition-colors",
                            isProfileOpen ? "bg-zinc-200/50" : "hover:bg-zinc-200/50"
                        )}
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <img
                                src={userAvatar}
                                alt={userName}
                                width={32}
                                height={32}
                                className="rounded-full border border-zinc-200 shadow-sm shrink-0 object-cover bg-zinc-100"
                            />
                            <span className="text-sm font-semibold text-zinc-900 truncate">
                                {userName}
                            </span>
                        </div>
                        <MoreVertical className="w-4 h-4 text-zinc-500 shrink-0" />
                    </button>
                </div>
            </aside>
        </>
    );
}