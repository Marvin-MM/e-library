"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

import { useAdminMetrics } from "@/hooks/useAdmin";
import { useRole } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

import {
    ArrowRight,
    ClipboardList,
    Clock,
    Download,
    FileText,
    TrendingUp,
    Users,
    Search,
    Eye,
    Shield,
    GraduationCap,
    UserCog,
    BarChart3
} from "lucide-react";

export default function AdminDashboardPage() {
    const router = useRouter();
    const { isAdmin } = useRole();
    const { data: metrics, isLoading } = useAdminMetrics();

    useEffect(() => {
        if (!isAdmin) {
            router.replace("/dashboard");
        }
    }, [isAdmin, router]);

    if (!isAdmin) {
        return null;
    }

    // Map stats safely based on the new nested JSON structure
    const stats = [
        {
            name: "Total Users",
            value: metrics?.users?.total || 0,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50 border-blue-100",
            href: "/admin/users",
        },
        {
            name: "Total Resources",
            value: metrics?.resources?.total || 0,
            icon: FileText,
            color: "text-emerald-600",
            bg: "bg-emerald-50 border-emerald-100",
            href: "/resources",
        },
        {
            name: "Total Downloads",
            value: metrics?.downloads?.total || 0,
            icon: Download,
            color: "text-purple-600",
            bg: "bg-purple-50 border-purple-100",
            href: "/admin/analytics",
        },
        {
            name: "Pending Requests",
            value: metrics?.requests?.pending || 0,
            icon: ClipboardList,
            color: "text-orange-600",
            bg: "bg-orange-50 border-orange-100",
            href: "/admin/requests",
        },
    ];

    // Helper for mapping role icons
    const getRoleIcon = (role: string) => {
        switch (role.toUpperCase()) {
            case "ADMIN": return <Shield className="w-5 h-5 text-red-600" />;
            case "STAFF": return <UserCog className="w-5 h-5 text-blue-600" />;
            case "STUDENT": return <GraduationCap className="w-5 h-5 text-emerald-600" />;
            default: return <Users className="w-5 h-5 text-zinc-600" />;
        }
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700 font-titillium">

            {/* TOP ROW: Header & Generation Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                <div className="flex flex-col justify-center gap-2">
                    <h2 className="text-lg md:text-xl font-black tracking-tight text-zinc-900 pl-3 uppercase">
                        Command Center
                    </h2>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 pl-4 font-bold">
                        Overview of platform performance and key metrics
                    </p>
                </div>
                <div className="flex items-center justify-start md:justify-end px-4">
                    {!isLoading && metrics?.generatedAt && (
                        <div className="flex items-center gap-2 bg-zinc-50 border-2 border-zinc-100 px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                            <Clock className="w-3 h-3" />
                            Report Generated: {format(new Date(metrics.generatedAt), "MMM d, yyyy • HH:mm")}
                        </div>
                    )}
                </div>
            </div>

            <ScrollArea className="flex-1 pr-4 -mr-4 custom-scrollbar">
                <div className="flex flex-col gap-6 pb-6">

                    {/* KPI HIGHLIGHTS */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat) => (
                            <Link key={stat.name} href={stat.href} className="group outline-none">
                                <Card className="border-2 border-zinc-100 shadow-none rounded hover:border-blue-900 hover:bg-blue-50/10 transition-all h-full">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-start justify-between">
                                                <div className={`p-3 rounded border-2 ${stat.bg} group-hover:scale-110 transition-transform`}>
                                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                                </div>
                                            </div>
                                            <div>
                                                {isLoading ? (
                                                    <Skeleton className="h-8 w-16 mb-1 rounded" />
                                                ) : (
                                                    <p className="text-3xl font-black text-zinc-900">{stat.value.toLocaleString()}</p>
                                                )}
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">
                                                    {stat.name}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* MIDDLE WIDGETS: Roles & Searches */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        
                        {/* Users By Role Widget */}
                        <div className="flex flex-col bg-white border-2 border-zinc-100 rounded relative shadow-sm">
                            <div className="flex flex-row items-center justify-between p-4 border-b-2 border-zinc-100 bg-zinc-50/50">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-zinc-400" />
                                    Platform Demographics
                                </h3>
                                <Button variant="ghost" size="sm" asChild className="h-8 text-[10px] uppercase font-bold text-blue-600 hover:text-blue-900 hover:bg-blue-50">
                                    <Link href="/admin/users">
                                        Manage <ArrowRight className="ml-1 h-3 w-3" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="p-6 flex flex-col justify-center min-h-[180px]">
                                {isLoading ? (
                                    <div className="space-y-3 w-full">
                                        <Skeleton className="h-12 w-full rounded" />
                                        <Skeleton className="h-12 w-full rounded" />
                                        <Skeleton className="h-12 w-full rounded" />
                                    </div>
                                ) : metrics?.users?.byRole && Object.keys(metrics.users.byRole).length > 0 ? (
                                    <div className="grid grid-cols-1 gap-3 w-full">
                                        {Object.entries(metrics.users.byRole).map(([role, count]) => (
                                            <div key={role} className="flex items-center justify-between p-3 rounded border-2 border-zinc-100 bg-zinc-50/50 hover:border-zinc-300 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white rounded border border-zinc-200">
                                                        {getRoleIcon(role)}
                                                    </div>
                                                    <p className="text-xs font-black uppercase tracking-widest text-zinc-700">{role}</p>
                                                </div>
                                                <p className="text-lg font-black text-zinc-900 bg-white px-3 py-1 rounded border-2 border-zinc-100">{String(count)}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-zinc-400 opacity-60">
                                        <Users className="h-8 w-8 mb-2" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">No user data available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Top Searches Widget */}
                        <div className="flex flex-col bg-white border-2 border-zinc-100 rounded relative shadow-sm">
                            <div className="flex flex-row items-center justify-between p-4 border-b-2 border-zinc-100 bg-zinc-50/50">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                                    <Search className="h-4 w-4 text-zinc-400" />
                                    Trending Search Terms
                                </h3>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                    {metrics?.searches?.total || 0} Total Queries
                                </div>
                            </div>
                            <div className="p-6 flex items-center justify-center min-h-[180px]">
                                {isLoading ? (
                                    <div className="flex flex-wrap gap-2 w-full">
                                        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-20 rounded-full" />)}
                                    </div>
                                ) : metrics?.searches?.topTerms && metrics.searches.topTerms.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 w-full content-start h-full">
                                        {metrics.searches.topTerms.map((term: { query: string; count: number }, index: number) => (
                                            <div key={index} className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
                                                <span className="text-xs font-bold text-blue-900">{term.query}</span>
                                                <span className="text-[10px] font-black bg-white text-blue-600 px-1.5 rounded-full shadow-sm">{term.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-zinc-400 opacity-60">
                                        <Search className="h-8 w-8 mb-2" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">No search data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM WIDGET: Top Resources List */}
                    <div className="flex flex-col bg-white border-2 border-zinc-100 rounded relative shadow-sm">
                        <div className="flex flex-row items-center justify-between p-4 border-b-2 border-zinc-100 bg-zinc-50/50">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-zinc-400" />
                                Most Engaged Resources
                            </h3>
                            <Button variant="ghost" size="sm" asChild className="h-8 text-[10px] uppercase font-bold text-blue-600 hover:text-blue-900 hover:bg-blue-50">
                                <Link href="/resources">
                                    View Library <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                            </Button>
                        </div>
                        <div className="p-0">
                            {isLoading ? (
                                <div className="divide-y divide-zinc-100">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="flex items-center gap-4 p-4">
                                            <Skeleton className="h-10 w-10 rounded border-2 border-zinc-100" />
                                            <div className="flex flex-col gap-2 flex-1">
                                                <Skeleton className="h-4 w-1/3" />
                                                <Skeleton className="h-3 w-1/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : metrics?.resources?.topResources && metrics.resources.topResources.length > 0 ? (
                                <div className="divide-y divide-zinc-100/60">
                                    {metrics.resources.topResources.map((resource: any, index: number) => (
                                        <Link
                                            key={resource.id}
                                            href={`/resources/${resource.id}`}
                                            className="flex items-center gap-4 p-4 hover:bg-zinc-50 transition-colors group"
                                        >
                                            <div className="w-10 h-10 flex items-center justify-center border-2 border-zinc-100 bg-white rounded shrink-0 group-hover:border-blue-200">
                                                <span className="text-[10px] font-black text-zinc-400 group-hover:text-blue-600">#{index + 1}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-zinc-900 truncate group-hover:text-blue-900 transition-colors">
                                                    {resource.title}
                                                </p>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-emerald-600">
                                                        <Download className="w-3 h-3" /> {resource.downloadCount} Downloads
                                                    </span>
                                                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-zinc-400">
                                                        <Eye className="w-3 h-3" /> {resource.viewCount} Views
                                                    </span>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-blue-900 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-zinc-400 opacity-60">
                                    <FileText className="h-10 w-10 mb-4" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">No resource engagement data yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}