"use client";

import { SearchModal } from "@/components/modals/SearchModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRole } from "@/hooks/useAuth";
import { useMyRequests } from "@/hooks/useRequests";
import { motion } from "framer-motion";
import {
    Activity,
    ChevronRight,
    GitPullRequest,
    Layers,
    MoveRight,
    Search,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// ── Dynamic import: avoids SSR crash ─────────────────────────────────────────
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// ── Stagger animation variants ───────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
    initial: { y: 16, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] as const },
});

// ── Status badge styling ─────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const upper = status?.toUpperCase();
    const map: Record<string, string> = {
        PENDING:   "bg-amber-50 text-amber-600 border-amber-100",
        APPROVED:  "bg-emerald-50 text-emerald-600 border-emerald-100",
        REJECTED:  "bg-red-50 text-red-500 border-red-100",
        FULFILLED: "bg-blue-50 text-blue-600 border-blue-100",
    };
    return (
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${map[upper] ?? "bg-zinc-50 text-zinc-400 border-zinc-100"}`}>
            {status}
        </span>
    );
}

// ── Discovery sources ────────────────────────────────────────────────────────
const SOURCES = [
    { name: "OpenAlex",       count: "2.3M", accent: "bg-blue-600"   },
    { name: "DOAJ Repository", count: "890K", accent: "bg-emerald-500" },
    { name: "CORE Academic",   count: "1.4M", accent: "bg-violet-500"  },
];

// ── Heatmap config ───────────────────────────────────────────────────────────
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function buildHeatmapSeries() {
    return DAYS.map((day) => ({
        name: day,
        data: Array.from({ length: 12 }, (_, j) => ({
            x: `${j * 2}h`,
            y: Math.floor(Math.random() * 60),
        })),
    }));
}

const HEATMAP_OPTIONS: ApexCharts.ApexOptions = {
    chart: {
        toolbar:    { show: false },
        fontFamily: "inherit",
        animations: { enabled: true, speed: 700 },
    },
    dataLabels: { enabled: false },
    plotOptions: {
        heatmap: {
            shadeIntensity: 0.5,
            radius: 3,
            useFillColorAsStroke: false,
            colorScale: {
                ranges: [
                    { from: 0,  to: 15, name: "low",    color: "#f4f4f5" },
                    { from: 16, to: 35, name: "medium", color: "#dbeafe" },
                    { from: 36, to: 60, name: "high",   color: "#1e3a8a" },
                ],
            },
        },
    },
    xaxis: {
        labels: { style: { colors: "#a1a1aa", fontSize: "9px", fontWeight: "700" } },
        axisBorder: { show: false },
        axisTicks:  { show: false },
    },
    yaxis: {
        labels: { style: { colors: "#a1a1aa", fontSize: "9px", fontWeight: "700" } },
    },
    grid:   { padding: { top: 0, right: 0, bottom: 0, left: -8 } },
    legend: { show: false },
    tooltip: {
        theme: "light",
        style: { fontSize: "11px", fontFamily: "inherit" },
    },
};

// ────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const router = useRouter();
    const { user, isAdmin } = useRole();
    const [searchOpen, setSearchOpen] = useState(false);
    const { data: myRequests, isLoading: requestsLoading } = useMyRequests();

    // Redirect admins — keep consistent with your auth guard pattern
    useEffect(() => {
        if (isAdmin) router.replace("/dashboard/admin");
    }, [isAdmin, router]);

    // Stable heatmap data — generated once on mount, not every render
    const heatmapSeries = useMemo(() => buildHeatmapSeries(), []);

    const firstName = user?.name?.split(" ")[0] ?? "there";
    const requestCount = myRequests?.length ?? 0;
    // TODO: replace 0 with real download count from API (e.g. useMyDownloads)
    const downloadCount = user?.downloadCount ?? 0;
    const recentRequests = (myRequests ?? []).slice(0, 3);

    return (
        <>
            <div className="flex flex-col gap-6 font-titillium pb-8">

                {/* ── Header row ─────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                    <motion.div {...fadeUp(0)}>
                        <h1 className="text-xl font-black text-zinc-900 tracking-tight">
                            Hello, {firstName} 👋
                        </h1>
                        <p className="text-sm text-zinc-400 mt-0.5 max-w-xs">
                            Your academic control center. 5M+ verified resources await.
                        </p>
                    </motion.div>

                    <motion.div {...fadeUp(0.07)} className="flex items-center gap-3 self-start sm:self-auto">
                        {/* Stats pill */}
                        <div className="flex items-stretch bg-white border-2 border-zinc-100 rounded-lg overflow-hidden shadow-sm">
                            <div className="px-4 py-2.5 border-r-2 border-zinc-100 text-center">
                                <p className="text-[9px] uppercase font-black tracking-widest text-zinc-400">Requests</p>
                                <p className="text-lg font-black text-blue-900 tabular-nums leading-tight">
                                    {requestsLoading ? "—" : requestCount}
                                </p>
                            </div>
                            <div className="px-4 py-2.5 text-center">
                                <p className="text-[9px] uppercase font-black tracking-widest text-zinc-400">Downloads</p>
                                <p className="text-lg font-black text-zinc-900 tabular-nums leading-tight">
                                    {downloadCount}
                                </p>
                            </div>
                        </div>

                        {/* Search trigger */}
                        <Button
                            onClick={() => setSearchOpen(true)}
                            className="h-12 w-12 rounded-lg bg-blue-900 hover:bg-zinc-900 text-white shrink-0 transition-colors"
                            aria-label="Open search"
                        >
                            <Search className="w-4 h-4" />
                        </Button>
                    </motion.div>
                </div>

                {/* ── Activity + Discovery ────────────────────────────────── */}
                <motion.div
                    {...fadeUp(0.12)}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-4"
                >
                    {/* Heatmap */}
                    <div className="lg:col-span-2 bg-white border-2 border-zinc-100 rounded-lg p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-md bg-zinc-50 border-2 border-zinc-100 flex items-center justify-center">
                                    <Activity className="w-3.5 h-3.5 text-zinc-600" />
                                </div>
                                <div>
                                    <h2 className="text-xs font-black text-zinc-900 tracking-tight">
                                        Request Activity
                                    </h2>
                                    <p className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">
                                        Weekly threshold heatmap
                                    </p>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="hidden sm:flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                                <span className="flex items-center gap-1">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-zinc-100 inline-block" /> Low
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-200 inline-block" /> Mid
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-900 inline-block" /> High
                                </span>
                            </div>
                        </div>

                        {/* Chart — fixed height, no overflow conflict */}
                        <div className="h-52 sm:h-64 w-full">
                            <Chart
                                options={HEATMAP_OPTIONS}
                                series={heatmapSeries}
                                type="heatmap"
                                height="100%"
                                width="100%"
                            />
                        </div>
                    </div>

                    {/* Global Discovery */}
                    <div className="bg-white border-2 border-zinc-100 rounded-lg p-5 shadow-sm flex flex-col justify-between gap-5">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-md bg-zinc-50 border-2 border-zinc-100 flex items-center justify-center">
                                    <Layers className="w-3.5 h-3.5 text-zinc-600" />
                                </div>
                                <div>
                                    <h2 className="text-xs font-black text-zinc-900 tracking-tight">
                                        Global Discovery
                                    </h2>
                                    <p className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">
                                        Live source index
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                {SOURCES.map((src) => (
                                    <div
                                        key={src.name}
                                        className="flex items-center justify-between p-3 bg-zinc-50 border-2 border-zinc-100 rounded-lg group hover:border-zinc-900 hover:bg-zinc-900 transition-all duration-200 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className={`w-1.5 h-6 rounded-full ${src.accent} opacity-80 group-hover:opacity-100`} />
                                            <span className="text-xs font-bold text-zinc-700 group-hover:text-white transition-colors">
                                                {src.name}
                                            </span>
                                        </div>
                                        <span className="text-xs font-black text-zinc-400 group-hover:text-zinc-300 tabular-nums transition-colors">
                                            {src.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            className="w-full justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 group hover:bg-zinc-50 px-0 h-8 border-t-2 border-zinc-100 rounded-none"
                            onClick={() => router.push("/students/library")}
                        >
                            Explore all libraries
                            <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </motion.div>

                {/* ── Recent Requests ─────────────────────────────────────── */}
                <motion.div
                    {...fadeUp(0.18)}
                    className="bg-white border-2 border-zinc-100 rounded-lg shadow-sm overflow-hidden"
                >
                    <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-zinc-100 bg-zinc-50/50">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 flex items-center gap-2">
                            <GitPullRequest className="w-3.5 h-3.5 text-zinc-400" />
                            Recent Active Requests
                        </h3>
                        {requestCount > 3 && (
                            <Link
                                href="/requests"
                                className="text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-900 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
                            >
                                View all {requestCount}
                            </Link>
                        )}
                    </div>

                    {/* Loading state */}
                    {requestsLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-100">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-5 flex flex-col gap-3">
                                    <Skeleton className="h-3 w-16 rounded" />
                                    <Skeleton className="h-4 w-full rounded" />
                                    <Skeleton className="h-4 w-3/4 rounded" />
                                    <Skeleton className="h-2.5 w-12 rounded mt-2" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Populated state */}
                    {!requestsLoading && recentRequests.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x-2 divide-zinc-100">
                            {recentRequests.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="p-5 flex flex-col justify-between gap-4 hover:bg-zinc-50/60 transition-colors group cursor-default"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2.5">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                                {item.category}
                                            </span>
                                            <StatusBadge status={item.status} />
                                        </div>
                                        <h4 className="text-sm font-bold text-zinc-900 line-clamp-2 leading-snug group-hover:text-blue-900 transition-colors">
                                            {item.title}
                                        </h4>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-zinc-300 tabular-nums">
                                            {new Date(item.createdAt).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-zinc-200 group-hover:text-blue-600 -translate-x-1 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-150" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {!requestsLoading && recentRequests.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-14 gap-3 text-zinc-300">
                            <GitPullRequest className="w-8 h-8" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No requests yet</p>
                            <Button
                                size="sm"
                                variant="outline"
                                className="mt-1 text-[10px] font-black uppercase tracking-widest border-2 border-zinc-100 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 h-8 px-4"
                                onClick={() => setSearchOpen(true)}
                            >
                                Find a resource
                            </Button>
                        </div>
                    )}
                </motion.div>
            </div>

            <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
        </>
    );
}