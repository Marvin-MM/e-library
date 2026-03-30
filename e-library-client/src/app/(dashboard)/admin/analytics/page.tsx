"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useAuth";
import {
    useAnalyticsOverview,
    useDownloadTrends,
    useUserTrends,
    useTopResources,
    useTopSearchTerms,
    useUsersByRole,
    useResourcesByCategory,
    useRequestStats,
} from "@/hooks/useAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
    Users, FileText, Download, Activity, Calendar,
    PieChart as PieChartIcon, TrendingUp, Search,
    TrendingDown, Minus, ClipboardList,
} from "lucide-react";
import { format, subDays, endOfDay } from "date-fns";
import { motion } from "framer-motion";

// ── Constants ─────────────────────────────────────────────────────────────────
const PALETTE = ["#1e3a8a", "#3b82f6", "#93c5fd", "#1d4ed8", "#60a5fa", "#bfdbfe"];

const DATE_RANGES = [
    { value: "7",   label: "Last 7 Days"   },
    { value: "30",  label: "Last 30 Days"  },
    { value: "90",  label: "Last 3 Months" },
    { value: "365", label: "Last Year"     },
];

const CHART_TOOLTIP_STYLE = {
    contentStyle: {
        backgroundColor: "#fff",
        borderRadius: "8px",
        border: "2px solid #f4f4f5",
        boxShadow: "none",
        fontSize: "11px",
        fontFamily: "inherit",
    },
    labelStyle: {
        fontWeight: "800",
        fontSize: "9px",
        textTransform: "uppercase" as const,
        letterSpacing: "0.1em",
        marginBottom: "4px",
    },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
    initial: { y: 10, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] as const },
});

// ── Sparkline Component ────────────────────────────────────────────────────
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
            <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r={2}
                fill={trendColor}
            />
        </svg>
    );
}

// ── Trend Badge ────────────────────────────────────────────────────────────
function TrendBadge({ value, label }: { value: number; label?: string }) {
    const isUp = value > 0;
    const isFlat = value === 0;
    return (
        <div
            className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                isFlat
                    ? "bg-zinc-50 border-zinc-200 text-zinc-400"
                    : isUp
                    ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                    : "bg-red-50 border-red-100 text-red-500"
            }`}
        >
            {isFlat ? (
                <Minus className="w-2.5 h-2.5" />
            ) : isUp ? (
                <TrendingUp className="w-2.5 h-2.5" />
            ) : (
                <TrendingDown className="w-2.5 h-2.5" />
            )}
            {Math.abs(value)}% {label ?? "7d"}
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function ChartShell({ title, children, loading }: { title: string; children: React.ReactNode; loading: boolean }) {
    return (
        <div className="flex flex-col gap-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 border-l-2 border-zinc-300 pl-2.5">
                {title}
            </h4>
            <div className="h-[260px] w-full bg-zinc-50/50 border-2 border-zinc-100 rounded-lg p-4">
                {loading ? <Skeleton className="h-full w-full rounded" /> : children}
            </div>
        </div>
    );
}

function KpiCard({
    title, value, sub, icon: Icon, color, bg, spark, delta, loading,
}: {
    title: string; value?: number; sub?: string;
    icon: React.ElementType; color: string; bg: string; 
    spark?: number[]; delta?: number; loading: boolean;
}) {
    return (
        <div className="bg-white border-2 border-zinc-100 rounded-lg p-5 flex flex-col gap-3 hover:border-zinc-200 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{title}</p>
                <div className={`p-2 rounded-lg border-2 ${bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                </div>
            </div>
            
            <div className="flex items-end justify-between">
                <div className="space-y-1">
                    {loading ? (
                        <Skeleton className="h-7 w-20 rounded" />
                    ) : (
                        <p className="text-2xl font-black text-zinc-900 leading-none tabular-nums">
                            {(value ?? 0).toLocaleString()}
                        </p>
                    )}
                    {sub && (
                        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">{sub}</p>
                    )}
                </div>
                {!loading && spark && (
                    <Sparkline data={spark} color={color.replace("text-", "#").replace("blue-600", "#2563eb").replace("emerald-600", "#10b981").replace("purple-600", "#9333ea").replace("orange-600", "#ea580c")} />
                )}
            </div>

            {!loading && typeof delta === 'number' && (
                <div className="pt-2 border-t border-zinc-50 flex items-center justify-between">
                    <TrendBadge value={delta} />
                    <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">vs prev period</span>
                </div>
            )}
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
    const router = useRouter();
    const { isAdmin } = useRole();
    const [dateRange, setDateRange] = useState("30");
    const [activeTab, setActiveTab] = useState("trends");

    useEffect(() => {
        if (!isAdmin) router.replace("/dashboard");
    }, [isAdmin, router]);

    if (!isAdmin) return null;

    const dateParams = useMemo(() => {
        const end = endOfDay(new Date());
        const start = subDays(end, parseInt(dateRange));
        return { startDate: start.toISOString(), endDate: end.toISOString() };
    }, [dateRange]);

    const { data: overview,      isLoading: overviewLoading }      = useAnalyticsOverview();
    const { data: requestStats,  isLoading: requestStatsLoading }  = useRequestStats();
    const { data: dlTrends,      isLoading: dlLoading }            = useDownloadTrends(dateParams.startDate, dateParams.endDate, { enabled: activeTab === "trends" });
    const { data: userTrends,    isLoading: userTrendsLoading }     = useUserTrends(dateParams.startDate, dateParams.endDate, { enabled: activeTab === "trends" });
    const { data: topResources,  isLoading: topResourcesLoading }  = useTopResources(10, { enabled: activeTab === "content" });
    const { data: topSearches,   isLoading: topSearchesLoading }   = useTopSearchTerms(10, { enabled: activeTab === "content" });
    const { data: userRoles,     isLoading: rolesLoading }         = useUsersByRole({ enabled: activeTab === "distribution" });
    const { data: resCats,       isLoading: catsLoading }          = useResourcesByCategory({ enabled: activeTab === "distribution" });

    const overviewData = overview?.data;

    const dlChartData = dlTrends?.data?.map((d: any) => ({
        date: format(new Date(d.date), "MM/dd"),
        downloads: d.count,
    })) ?? [];

    const userChartData = userTrends?.data?.map((d: any) => ({
        date: format(new Date(d.date), "MM/dd"),
        users: d.count,
    })) ?? [];

    const kpiCards = [
        { 
            title: "Total Users",       
            value: overviewData?.totalUsers,       
            sub: `${overviewData?.activeUsers ?? 0} active`,   
            icon: Users,     
            color: "text-blue-600",   
            bg: "bg-blue-50 border-blue-100",     
            loading: overviewLoading,
            spark: userChartData.map(d => d.users),
            delta: 12
        },
        { 
            title: "Total Resources",   
            value: overviewData?.totalResources,   
            icon: FileText,  
            color: "text-emerald-600", 
            bg: "bg-emerald-50 border-emerald-100", 
            loading: overviewLoading,
            spark: [80, 84, 88, 85, 92, 98, 100],
            delta: 5
        },
        { 
            title: "Total Downloads",    
            value: overviewData?.totalDownloads,   
            icon: Download,  
            color: "text-purple-600",  
            bg: "bg-purple-50 border-purple-100",   
            loading: overviewLoading,
            spark: dlChartData.map(d => d.downloads),
            delta: -3
        },
        { 
            title: "Requests Balance",  
            value: requestStats?.data?.pending,    
            sub: `${requestStats?.data?.resolved ?? 0} resolved`, 
            icon: ClipboardList, 
            color: "text-orange-600", 
            bg: "bg-orange-50 border-orange-100", 
            loading: requestStatsLoading,
            spark: [5, 8, 3, 12, 7, 9, 6],
            delta: 8
        },
    ];

    return (
        <div className="flex flex-col gap-6 pb-8">

            {/* ── Header ── */}
            <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black tracking-tight text-zinc-900 uppercase">Analytics</h2>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mt-0.5">
                        Platform usage metrics &amp; growth patterns
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-white border-2 border-zinc-100 rounded-lg">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Range</span>
                    </div>
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[150px] h-10 border-2 border-zinc-100 bg-white rounded-lg focus:ring-0 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:border-zinc-200 transition-colors">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-zinc-100 shadow-xl rounded-lg">
                            {DATE_RANGES.map((r) => (
                                <SelectItem key={r.value} value={r.value} className="text-[10px] font-bold uppercase tracking-widest py-3">
                                    {r.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </motion.div>

            {/* ── KPI Cards ── */}
            <motion.div {...fadeUp(0.06)} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {kpiCards.map((card) => (
                    <KpiCard key={card.title} {...card} />
                ))}
            </motion.div>

            {/* ── Tabbed charts ── */}
            <motion.div {...fadeUp(0.12)} className="bg-white border-2 border-zinc-100 rounded-lg shadow-sm overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab}>

                    {/* Tab bar */}
                    <div className="flex items-center justify-between px-5 py-3 border-b-2 border-zinc-100 bg-zinc-50/50 flex-wrap gap-3">
                        <TabsList className="bg-white border-2 border-zinc-200 h-9 p-1 rounded-lg gap-0.5 shadow-none">
                            {[
                                { value: "trends",       icon: TrendingUp,   label: "Trends"       },
                                { value: "distribution", icon: PieChartIcon, label: "Distribution" },
                                { value: "content",      icon: FileText,     label: "Content"      },
                            ].map(({ value, icon: Icon, label }) => (
                                <TabsTrigger
                                    key={value}
                                    value={value}
                                    className="text-[9px] uppercase font-black tracking-widest data-[state=active]:bg-blue-900 data-[state=active]:text-white transition-all h-full px-3.5 rounded-md gap-1.5"
                                >
                                    <Icon className="h-3 w-3" /> {label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <div className="p-5">

                        {/* ── Trends ── */}
                        <TabsContent value="trends" className="mt-0 outline-none">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ChartShell title="Download Activity" loading={dlLoading}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={dlChartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#a1a1aa", fontWeight: 700 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#a1a1aa", fontWeight: 700 }} />
                                            <Tooltip {...CHART_TOOLTIP_STYLE} />
                                            <Line
                                                type="monotone" dataKey="downloads" stroke="#1e3a8a" strokeWidth={2.5}
                                                dot={{ r: 3, fill: "#1e3a8a", strokeWidth: 2, stroke: "#fff" }}
                                                activeDot={{ r: 5 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </ChartShell>

                                <ChartShell title="User Growth" loading={userTrendsLoading}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={userChartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#a1a1aa", fontWeight: 700 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#a1a1aa", fontWeight: 700 }} />
                                            <Tooltip cursor={{ fill: "#f4f4f5" }} {...CHART_TOOLTIP_STYLE} />
                                            <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={18} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartShell>
                            </div>
                        </TabsContent>

                        {/* ── Distribution ── */}
                        <TabsContent value="distribution" className="mt-0 outline-none">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ChartShell title="User Roles Breakdown" loading={rolesLoading}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={userRoles?.data} innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="count" nameKey="role">
                                                {userRoles?.data?.map((_: any, i: number) => (
                                                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip {...CHART_TOOLTIP_STYLE} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8}
                                                formatter={(v) => <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{v}</span>}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartShell>

                                <ChartShell title="Resource Categories" loading={catsLoading}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={resCats?.data} innerRadius={0} outerRadius={85} paddingAngle={2} dataKey="count" nameKey="category">
                                                {resCats?.data?.map((_: any, i: number) => (
                                                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip {...CHART_TOOLTIP_STYLE} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8}
                                                formatter={(v) => <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{v}</span>}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartShell>
                            </div>
                        </TabsContent>

                        {/* ── Content ── */}
                        <TabsContent value="content" className="mt-0 outline-none">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Top resources */}
                                <div className="flex flex-col gap-3">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 border-l-2 border-zinc-300 pl-2.5">
                                        Most Popular Resources
                                    </h4>
                                    <div className="bg-zinc-50/50 border-2 border-zinc-100 rounded-lg overflow-hidden divide-y divide-zinc-100/60">
                                        {topResourcesLoading ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <div key={i} className="p-4"><Skeleton className="h-4 w-full rounded" /></div>
                                            ))
                                        ) : topResources?.data?.length ? (
                                            topResources.data.map((resource: any, i: number) => (
                                                <div
                                                    key={resource.resourceId || i}
                                                    className="flex items-center justify-between px-4 py-3.5 hover:bg-white transition-colors group"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <span className="text-[9px] font-black text-blue-900 bg-blue-50 border border-blue-100 w-6 h-6 flex items-center justify-center rounded-md shrink-0">
                                                            {i + 1}
                                                        </span>
                                                        <span className="text-xs font-bold text-zinc-700 truncate">{resource.title}</span>
                                                    </div>
                                                    <span className="text-[10px] font-black text-zinc-900 bg-white border-2 border-zinc-100 px-2 py-0.5 rounded-md ml-3 shrink-0 tabular-nums group-hover:border-blue-200 transition-colors">
                                                        {resource.count} <span className="text-[8px] text-zinc-400">hits</span>
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <EmptyState icon={FileText} label="No resource hits recorded" />
                                        )}
                                    </div>
                                </div>

                                {/* Top searches */}
                                <div className="flex flex-col gap-3">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 border-l-2 border-zinc-300 pl-2.5">
                                        Top Search Terms
                                    </h4>
                                    <div className="bg-white border-2 border-zinc-100 rounded-lg overflow-hidden">
                                        <div className="grid grid-cols-12 px-4 py-2.5 bg-zinc-50/70 border-b-2 border-zinc-100 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                            <div className="col-span-8">Query</div>
                                            <div className="col-span-4 text-right">Volume</div>
                                        </div>
                                        <div className="divide-y divide-zinc-100/60 max-h-[340px] overflow-y-auto">
                                            {topSearchesLoading ? (
                                                Array.from({ length: 5 }).map((_, i) => (
                                                    <div key={i} className="p-4"><Skeleton className="h-4 w-full rounded" /></div>
                                                ))
                                            ) : topSearches?.data?.length ? (
                                                topSearches.data.map((term: any, i: number) => (
                                                    <div key={term.item || i} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-zinc-50 transition-colors group">
                                                        <div className="col-span-8 flex items-center gap-2 min-w-0">
                                                            <Search className="h-3 w-3 text-zinc-300 group-hover:text-blue-600 transition-colors shrink-0" />
                                                            <span className="text-xs font-bold text-zinc-700 truncate italic">
                                                                &ldquo;{term.item}&rdquo;
                                                            </span>
                                                        </div>
                                                        <div className="col-span-4 text-right font-mono text-[11px] font-black text-blue-900 tabular-nums">
                                                            {term.count.toLocaleString()}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <EmptyState icon={Search} label="Waiting for search metrics" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </motion.div>
        </div>
    );
}

function EmptyState({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-zinc-300">
            <Icon className="h-7 w-7" />
            <p className="text-[9px] font-black uppercase tracking-widest">{label}</p>
        </div>
    );
}