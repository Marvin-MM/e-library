"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminMetrics } from "@/hooks/useAdmin";
import { useRole } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
    ArrowRight,
    ClipboardList,
    Clock,
    Download,
    FileText,
    TrendingUp,
    UserPlus,
    Users,
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

    const stats = [
        {
            name: "Total Users",
            value: metrics?.totalUsers || 0,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50 border-blue-100",
            href: "/admin/users",
        },
        {
            name: "Total Resources",
            value: metrics?.totalResources || 0,
            icon: FileText,
            color: "text-emerald-600",
            bg: "bg-emerald-50 border-emerald-100",
            href: "/resources",
        },
        {
            name: "Total Downloads",
            value: metrics?.totalDownloads || 0,
            icon: Download,
            color: "text-purple-600",
            bg: "bg-purple-50 border-purple-100",
            href: "/admin/analytics",
        },
        {
            name: "Pending Requests",
            value: metrics?.pendingRequests || 0,
            icon: ClipboardList,
            color: "text-orange-600",
            bg: "bg-orange-50 border-orange-100",
            href: "/admin/requests",
        },
    ];

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700 font-titillium">

            {/* TOP ROW: Z-Pattern Start */}
            <div className="grid grid-cols-1 gap-6 shrink-0">
                <div className="flex flex-col justify-center gap-2">
                    <h2 className="text-lg md:text-xl font-bold tracking-tight text-zinc-900 pl-3">
                        Admin Dashboard
                    </h2>
                    <p className="text-xs text-zinc-500 pl-4 font-semibold">
                        Overview of platform performance and key metrics
                    </p>
                </div>
            </div>

            {/* MIDDLE BODY: Z-Pattern Diagonal Flow */}
            <ScrollArea className="flex-1 pr-4 -mr-4">
                <div className="flex flex-col gap-6 pb-6">

                    {/* STATS HIGHLIGHTS */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat) => (
                            <Link key={stat.name} href={stat.href} className="group outline-none">
                                <Card className="border-2 border-zinc-100 shadow-none rounded hover:border-zinc-300 hover:bg-zinc-50/50 transition-all">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-start justify-between">
                                                <div className={`p-3 rounded border-2 ${stat.bg} group-hover:scale-110 transition-transform`}>
                                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                                </div>
                                            </div>
                                            <div>
                                                {isLoading ? (
                                                    <Skeleton className="h-8 w-16 mb-1" />
                                                ) : (
                                                    <p className="text-3xl font-bold text-zinc-900">{stat.value.toLocaleString()}</p>
                                                )}
                                                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">
                                                    {stat.name}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* SECOND ROW WIDGETS */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* New Users Widget */}
                        <div className="flex flex-col bg-white border-2 border-zinc-100 rounded relative shadow-sm">
                            <div className="flex flex-row items-center justify-between p-4 border-b-2 border-zinc-100 bg-zinc-50/50">
                                <div className="flex flex-col">
                                    <h3 className="text-[12px] font-bold uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                                        <UserPlus className="h-4 w-4 text-zinc-400" />
                                        New Users This Month
                                    </h3>
                                </div>
                                <Button variant="ghost" size="sm" asChild className="h-8 text-[10px] uppercase font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                                    <Link href="/admin/users">
                                        View all <ArrowRight className="ml-1 h-3 w-3" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="p-6 flex items-center justify-center min-h-[140px]">
                                {isLoading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Skeleton className="h-12 w-16" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                ) : (
                                    <div className="text-center flex flex-col items-center">
                                        <div className="bg-blue-50 border-2 border-blue-100 text-blue-600 px-6 py-4 rounded-xl mb-3">
                                            <p className="text-5xl font-bold">
                                                {metrics?.newUsersThisMonth || 0}
                                            </p>
                                        </div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">students & staff joined</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Resources By Type Widget */}
                        <div className="flex flex-col bg-white border-2 border-zinc-100 rounded relative shadow-sm">
                            <div className="flex flex-row items-center justify-between p-4 border-b-2 border-zinc-100 bg-zinc-50/50">
                                <h3 className="text-[12px] font-bold uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-zinc-400" />
                                    Resources by Category
                                </h3>
                            </div>
                            <div className="p-6 flex items-center justify-center min-h-[140px]">
                                {isLoading ? (
                                    <div className="grid grid-cols-2 gap-4 w-full">
                                        <Skeleton className="h-16 w-full" />
                                        <Skeleton className="h-16 w-full" />
                                    </div>
                                ) : metrics?.resourcesByType && Object.keys(metrics.resourcesByType).length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                                        {Object.entries(metrics.resourcesByType).map(([type, count]) => (
                                            <div key={type} className="flex flex-col items-center justify-center py-3 px-2 rounded border-2 border-zinc-100 bg-zinc-50/50 hover:border-zinc-300 transition-colors">
                                                <p className="text-xl font-bold text-zinc-900">{count}</p>
                                                <p className="text-[9px] uppercase tracking-widest text-zinc-500 mt-1 truncate w-full text-center">{type}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-zinc-400 opacity-60">
                                        <FileText className="h-8 w-8 mb-2" />
                                        <p className="text-xs font-bold uppercase tracking-widest">No data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RECENT ACTIVITY LIST */}
                    <div className="flex flex-col bg-white border-2 border-zinc-100 rounded relative shadow-sm">
                        <div className="flex flex-row items-center justify-between p-4 border-b-2 border-zinc-100 bg-zinc-50/50">
                            <h3 className="text-[12px] font-bold uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-zinc-400" />
                                Recent Activity Log
                            </h3>
                            <Button variant="ghost" size="sm" asChild className="h-8 text-[10px] uppercase font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                                <Link href="/admin/audit-logs">
                                    View Audit Logs <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                            </Button>
                        </div>
                        <div className="p-0">
                            {isLoading ? (
                                <div className="divide-y divide-zinc-100">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center gap-4 p-4">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <div className="flex flex-col gap-2 flex-1">
                                                <Skeleton className="h-4 w-1/3" />
                                                <Skeleton className="h-3 w-1/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
                                <div className="divide-y divide-zinc-100/60">
                                    {metrics.recentActivity.slice(0, 5).map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="flex items-center gap-4 p-4 hover:bg-zinc-50 transition-colors"
                                        >
                                            <div className="p-2 border-2 border-zinc-100 bg-white rounded shrink-0">
                                                <Clock className="h-4 w-4 text-zinc-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-zinc-700">
                                                    <span className="font-bold text-zinc-900 mr-1">
                                                        {activity.user?.firstName} {activity.user?.lastName}
                                                    </span>
                                                    {activity.action.toLowerCase().replace(/_/g, " ")}
                                                </p>
                                                <p className="text-[10px] uppercase tracking-widest text-zinc-400 mt-1 font-bold">
                                                    {new Date(activity.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-zinc-400 opacity-60">
                                    <Clock className="h-10 w-10 mb-4" />
                                    <p className="text-xs font-bold uppercase tracking-widest">No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
