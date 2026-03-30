"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

import { useAdminMetrics } from "@/hooks/useAdmin";
import { useRole } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
    ArrowRight,
    ClipboardList,
    Clock,
    Download,
    FileText,
    Users,
    Search,
    Eye,
    Shield,
    GraduationCap,
    UserCog,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Minus,
} from "lucide-react";

// ─── Sparkline Component ────────────────────────────────────────────────────
interface SparklineProps {
    data: number[];
    color?: string;
    width?: number;
    height?: number;
    strokeWidth?: number;
    filled?: boolean;
}

function Sparkline({
    data,
    color = "#2563eb",
    width = 80,
    height = 32,
    strokeWidth = 1.5,
    filled = true,
}: SparklineProps) {
    if (!data || data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pad = strokeWidth;

    const points = data.map((v, i) => ({
        x: pad + (i / (data.length - 1)) * (width - pad * 2),
        y: pad + ((1 - (v - min) / range) * (height - pad * 2)),
    }));

    const linePath = points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
        .join(" ");

    const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${height} L ${points[0].x.toFixed(2)} ${height} Z`;

    const lastVal = data[data.length - 1];
    const prevVal = data[data.length - 2];
    const trend = lastVal > prevVal ? "up" : lastVal < prevVal ? "down" : "flat";
    const trendColor = trend === "up" ? "#10b981" : trend === "down" ? "#ef4444" : color;
    const fillColor = trend === "up" ? "#10b981" : trend === "down" ? "#ef4444" : color;

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            fill="none"
            aria-hidden="true"
        >
            {filled && (
                <defs>
                    <linearGradient id={`sparkfill-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={fillColor} stopOpacity="0.15" />
                        <stop offset="100%" stopColor={fillColor} stopOpacity="0" />
                    </linearGradient>
                </defs>
            )}
            {filled && (
                <path
                    d={areaPath}
                    fill={`url(#sparkfill-${color.replace("#", "")})`}
                />
            )}
            <path
                d={linePath}
                stroke={trendColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Latest point dot */}
            <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r={2}
                fill={trendColor}
            />
        </svg>
    );
}

// ─── Trend Badge ────────────────────────────────────────────────────────────
function TrendBadge({ value, label }: { value: number; label?: string }) {
    const isUp = value > 0;
    const isFlat = value === 0;
    return (
        <div
            className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                isFlat
                    ? "bg-zinc-50 border-zinc-200 text-zinc-400"
                    : isUp
                    ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                    : "bg-red-50 border-red-100 text-red-500"
            }`}
        >
            {isFlat ? (
                <Minus className="w-3 h-3" />
            ) : isUp ? (
                <TrendingUp className="w-3 h-3" />
            ) : (
                <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(value)}% {label ?? "24h"}
        </div>
    );
}

// ─── Role Icon Helper ────────────────────────────────────────────────────────
function RoleIcon({ role }: { role: string }) {
    switch (role.toUpperCase()) {
        case "ADMIN":
            return <Shield className="w-4 h-4 text-red-500" />;
        case "STAFF":
            return <UserCog className="w-4 h-4 text-blue-500" />;
        case "STUDENT":
            return <GraduationCap className="w-4 h-4 text-emerald-500" />;
        default:
            return <Users className="w-4 h-4 text-zinc-400" />;
    }
}

// ─── Role color map ──────────────────────────────────────────────────────────
const ROLE_META: Record<string, { bar: string; bg: string; border: string }> = {
    ADMIN:   { bar: "bg-red-400",     bg: "bg-red-50",     border: "border-red-100" },
    STAFF:   { bar: "bg-blue-400",    bg: "bg-blue-50",    border: "border-blue-100" },
    STUDENT: { bar: "bg-emerald-400", bg: "bg-emerald-50", border: "border-emerald-100" },
};

// ─── Page ───────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
    const router = useRouter();
    const { isAdmin } = useRole();
    const { data: metrics, isLoading } = useAdminMetrics();

    useEffect(() => {
        if (!isAdmin) router.replace("/dashboard");
    }, [isAdmin, router]);

    if (!isAdmin) return null;

    // Fake sparkline seeds — replace with real time-series from your API
    // e.g. metrics?.users?.trend — an array of daily counts for the last 7 days
    const sparkData = {
        users:     metrics?.users?.trend     ?? [120, 132, 128, 145, 139, 160, metrics?.users?.total ?? 160],
        resources: metrics?.resources?.trend ?? [80, 84, 90, 87, 95, 100, metrics?.resources?.total ?? 100],
        downloads: metrics?.downloads?.trend ?? [200, 215, 190, 240, 260, 230, metrics?.downloads?.total ?? 230],
        requests:  metrics?.requests?.trend  ?? [5, 8, 3, 12, 7, 9, metrics?.requests?.pending ?? 9],
    };

    const stats = [
        {
            name: "Total Users",
            value: metrics?.users?.total ?? 0,
            delta: metrics?.users?.delta ?? 0,
            spark: sparkData.users,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100",
            sparkColor: "#2563eb",
            href: "/admin/users",
        },
        {
            name: "Total Resources",
            value: metrics?.resources?.total ?? 0,
            delta: metrics?.resources?.delta ?? 0,
            spark: sparkData.resources,
            icon: FileText,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
            sparkColor: "#10b981",
            href: "/resources",
        },
        {
            name: "Total Downloads",
            value: metrics?.downloads?.total ?? 0,
            delta: metrics?.downloads?.delta ?? 0,
            spark: sparkData.downloads,
            icon: Download,
            color: "text-purple-600",
            bg: "bg-purple-50",
            border: "border-purple-100",
            sparkColor: "#9333ea",
            href: "/admin/analytics",
        },
        {
            name: "Pending Requests",
            value: metrics?.requests?.pending ?? 0,
            delta: metrics?.requests?.delta ?? 0,
            spark: sparkData.requests,
            icon: ClipboardList,
            color: "text-orange-600",
            bg: "bg-orange-50",
            border: "border-orange-100",
            sparkColor: "#ea580c",
            href: "/admin/requests",
        },
    ];

    const totalByRole = Object.values(metrics?.users?.byRole ?? {}).reduce(
        (s, v) => s + Number(v),
        0
    );

    return (
        <div className="min-h-0 flex flex-col gap-6 font-titillium">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
                <div>
                    <h2 className="text-xl font-black tracking-tight text-zinc-900 uppercase">
                        Command Center
                    </h2>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mt-0.5">
                        Platform performance &amp; key metrics
                    </p>
                </div>

                {!isLoading && metrics?.generatedAt && (
                    <div className="flex items-center gap-2 bg-zinc-50 border-2 border-zinc-100 px-3 py-2 rounded text-[10px] font-bold uppercase tracking-widest text-zinc-400 self-start sm:self-auto whitespace-nowrap">
                        <Clock className="w-3 h-3 shrink-0" />
                        {format(new Date(metrics.generatedAt), "MMM d, yyyy · HH:mm")}
                    </div>
                )}
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Link key={stat.name} href={stat.href} className="group outline-none">
                        <Card className="border-2 border-zinc-100 shadow-none rounded-lg hover:border-blue-200 hover:shadow-md transition-all duration-200 h-full">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`p-2.5 rounded-lg border-2 ${stat.bg} ${stat.border} group-hover:scale-105 transition-transform duration-200`}>
                                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                    </div>
                                    {/* Sparkline */}
                                    <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                                        <Sparkline
                                            data={stat.spark}
                                            color={stat.sparkColor}
                                            width={72}
                                            height={28}
                                        />
                                    </div>
                                </div>

                                {isLoading ? (
                                    <>
                                        <Skeleton className="h-7 w-20 mb-1.5 rounded" />
                                        <Skeleton className="h-3 w-14 rounded" />
                                    </>
                                ) : (
                                    <>
                                        <p className="text-2xl font-black text-zinc-900 leading-none mb-1">
                                            {stat.value.toLocaleString()}
                                        </p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                                            {stat.name}
                                        </p>
                                        <TrendBadge value={stat.delta} />
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* ── Middle Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Platform Demographics */}
                <div className="flex flex-col bg-white border-2 border-zinc-100 rounded-lg shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b-2 border-zinc-100 bg-zinc-50/50">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 text-zinc-400" />
                            Platform Demographics
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-7 text-[10px] uppercase font-bold tracking-widest text-blue-600 hover:text-blue-900 hover:bg-blue-50 px-2"
                        >
                            <Link href="/admin/users">
                                Manage <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </Button>
                    </div>

                    <div className="p-5 flex flex-col gap-3">
                        {isLoading ? (
                            [1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)
                        ) : metrics?.users?.byRole && Object.keys(metrics.users.byRole).length > 0 ? (
                            Object.entries(metrics.users.byRole).map(([role, count]) => {
                                const pct = totalByRole > 0
                                    ? Math.round((Number(count) / totalByRole) * 100)
                                    : 0;
                                const meta = ROLE_META[role.toUpperCase()] ?? {
                                    bar: "bg-zinc-400",
                                    bg: "bg-zinc-50",
                                    border: "border-zinc-100",
                                };
                                return (
                                    <div
                                        key={role}
                                        className={`flex flex-col gap-2 p-3.5 rounded-lg border-2 ${meta.bg} ${meta.border} transition-colors`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-1.5 bg-white rounded border border-zinc-200 shadow-sm">
                                                    <RoleIcon role={role} />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-widest text-zinc-700">
                                                    {role}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-zinc-400">{pct}%</span>
                                                <span className="text-base font-black text-zinc-900 tabular-nums">
                                                    {Number(count).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="h-1 bg-white/70 rounded-full overflow-hidden border border-white">
                                            <div
                                                className={`h-full ${meta.bar} rounded-full transition-all duration-700`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <EmptyState icon={Users} label="No user data available" />
                        )}
                    </div>
                </div>

                {/* Top Searches */}
                <div className="flex flex-col bg-white border-2 border-zinc-100 rounded-lg shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b-2 border-zinc-100 bg-zinc-50/50">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 flex items-center gap-2">
                            <Search className="h-3.5 w-3.5 text-zinc-400" />
                            Trending Search Terms
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 tabular-nums">
                            {(metrics?.searches?.total ?? 0).toLocaleString()} queries
                        </span>
                    </div>

                    <div className="p-5 flex-1">
                        {isLoading ? (
                            <div className="flex flex-wrap gap-2">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <Skeleton key={i} className="h-7 w-20 rounded-full" />
                                ))}
                            </div>
                        ) : metrics?.searches?.topTerms && metrics.searches.topTerms.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {metrics.searches.topTerms.map(
                                    (term: { query: string; count: number }, i: number) => {
                                        // Largest gets most opacity/scale
                                        const max = metrics.searches.topTerms[0]?.count ?? 1;
                                        const weight = term.count / max;
                                        const size =
                                            weight > 0.8
                                                ? "text-sm px-3 py-1.5"
                                                : weight > 0.5
                                                ? "text-xs px-2.5 py-1"
                                                : "text-[10px] px-2 py-1";
                                        return (
                                            <div
                                                key={i}
                                                className={`inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-full font-bold text-blue-900 ${size} transition-all`}
                                                style={{ opacity: 0.5 + weight * 0.5 }}
                                            >
                                                {term.query}
                                                <span className="text-[9px] font-black bg-white text-blue-500 px-1.5 py-0.5 rounded-full border border-blue-100">
                                                    {term.count}
                                                </span>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        ) : (
                            <EmptyState icon={Search} label="No search data available" />
                        )}
                    </div>
                </div>
            </div>

            {/* ── Most Engaged Resources ── */}
            <div className="flex flex-col bg-white border-2 border-zinc-100 rounded-lg shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b-2 border-zinc-100 bg-zinc-50/50">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 flex items-center gap-2">
                        <BarChart3 className="h-3.5 w-3.5 text-zinc-400" />
                        Most Engaged Resources
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-7 text-[10px] uppercase font-bold tracking-widest text-blue-600 hover:text-blue-900 hover:bg-blue-50 px-2"
                    >
                        <Link href="/resources">
                            View Library <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                    </Button>
                </div>

                {isLoading ? (
                    <div className="divide-y divide-zinc-100">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-4">
                                <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <Skeleton className="h-3.5 w-1/3" />
                                    <Skeleton className="h-2.5 w-1/5" />
                                </div>
                                <Skeleton className="h-2.5 w-16 hidden sm:block" />
                            </div>
                        ))}
                    </div>
                ) : metrics?.resources?.topResources && metrics.resources.topResources.length > 0 ? (
                    <div className="divide-y divide-zinc-100/60">
                        {metrics.resources.topResources.map((resource: any, index: number) => (
                            <Link
                                key={resource.id}
                                href={`/resources/${resource.id}`}
                                className="flex items-center gap-4 px-4 py-3.5 hover:bg-zinc-50/70 transition-colors group"
                            >
                                {/* Rank badge */}
                                <div className="w-9 h-9 flex items-center justify-center border-2 border-zinc-100 bg-white rounded-lg shrink-0 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
                                    <span className="text-[10px] font-black text-zinc-400 group-hover:text-blue-600">
                                        #{index + 1}
                                    </span>
                                </div>

                                {/* Title + meta */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-zinc-900 truncate group-hover:text-blue-900 transition-colors">
                                        {resource.title}
                                    </p>
                                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                        <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-emerald-600">
                                            <Download className="w-3 h-3" />
                                            {Number(resource.downloadCount).toLocaleString()} downloads
                                        </span>
                                        <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-zinc-400">
                                            <Eye className="w-3 h-3" />
                                            {Number(resource.viewCount).toLocaleString()} views
                                        </span>
                                    </div>
                                </div>

                                {/* Download bar — visible sm+ */}
                                <div className="hidden sm:flex items-center gap-2 shrink-0">
                                    <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-400 rounded-full"
                                            style={{
                                                width: `${Math.min(
                                                    100,
                                                    Math.round(
                                                        (resource.downloadCount /
                                                            (metrics.resources.topResources[0]?.downloadCount || 1)) *
                                                            100
                                                    )
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150 shrink-0" />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-14">
                        <EmptyState icon={FileText} label="No resource engagement data yet" />
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Shared Empty State ──────────────────────────────────────────────────────
function EmptyState({
    icon: Icon,
    label,
}: {
    icon: React.ElementType;
    label: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-10 text-zinc-300 gap-2">
            <Icon className="h-8 w-8" />
            <p className="text-[10px] font-bold uppercase tracking-widest">{label}</p>
        </div>
    );
}