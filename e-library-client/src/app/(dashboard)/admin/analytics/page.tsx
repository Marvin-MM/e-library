"use client";

import { useState, useEffect, useMemo } from "react";
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
    useRequestStats
} from "@/hooks/useAnalytics";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import {
    Users,
    FileText,
    Download,
    Activity,
    Calendar,
    PieChart as PieChartIcon,
    TrendingUp,
    Search,
    ChevronDown
} from "lucide-react";
import { format, subDays, endOfDay } from "date-fns";

const COLORS = ['#1e3a8a', '#3b82f6', '#93c5fd', '#bfdbfe', '#1d4ed8', '#60a5fa'];

export default function AnalyticsPage() {
    const router = useRouter();
    const { isAdmin } = useRole();
    const [dateRange, setDateRange] = useState("30"); // days
    const [activeTab, setActiveTab] = useState("trends");

    const dateParams = useMemo(() => {
        const now = new Date();
        const endDate = endOfDay(now);
        const startDate = subDays(endDate, parseInt(dateRange));
        return {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        };
    }, [dateRange]);

    const { data: overview, isLoading: isOverviewLoading } = useAnalyticsOverview();
    const { data: requestStats, isLoading: isRequestStatsLoading } = useRequestStats();

    const { data: downloadTrends, isLoading: isDownloadTrendsLoading } = useDownloadTrends(
        dateParams.startDate,
        dateParams.endDate,
        { enabled: activeTab === "trends" }
    );
    const { data: userTrends, isLoading: isUserTrendsLoading } = useUserTrends(
        dateParams.startDate,
        dateParams.endDate,
        { enabled: activeTab === "trends" }
    );

    const { data: topResources, isLoading: isTopResourcesLoading } = useTopResources(10, { enabled: activeTab === "content" });
    const { data: topSearchTerms, isLoading: isTopSearchTermsLoading } = useTopSearchTerms(10, { enabled: activeTab === "content" });

    const { data: userRoles, isLoading: isUserRolesLoading } = useUsersByRole({ enabled: activeTab === "distribution" });
    const { data: resourceCategories, isLoading: isResourceCategoriesLoading } = useResourcesByCategory({ enabled: activeTab === "distribution" });

    useEffect(() => {
        if (!isAdmin) {
            router.replace("/dashboard");
        }
    }, [isAdmin, router]);

    if (!isAdmin) return null;

    const overviewData = overview?.data;

    const downloadChartData = downloadTrends?.data?.map(d => ({
        date: format(new Date(d.date), 'MM/dd'),
        downloads: d.count
    })) || [];

    const userChartData = userTrends?.data?.map(d => ({
        date: format(new Date(d.date), 'MM/dd'),
        users: d.count
    })) || [];

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700 font-titillium">

            {/* TOP ROW: Z-Pattern Start */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div className="flex flex-col justify-center gap-1">
                    <h2 className="text-lg md:text-xl font-bold tracking-tight text-zinc-900 pl-3">
                        Analytics Dashboard
                    </h2>
                    <p className="text-xs text-zinc-500 pl-4 font-semibold uppercase tracking-widest text-[9px]">
                        Platform usage metrics and growth patterns
                    </p>
                </div>

                <div className="flex items-center gap-2 group px-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-zinc-100 rounded text-zinc-400 group-hover:border-zinc-300 transition-all">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Range</span>
                    </div>
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[160px] h-10 border-2 border-zinc-100 shadow-none bg-white rounded focus:ring-0 uppercase text-[10px] font-bold tracking-wider text-zinc-600 hover:border-zinc-300 transition-all cursor-pointer">
                            <SelectValue placeholder="SELECT RANGE" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-zinc-100 shadow-xl rounded">
                            <SelectItem value="7" className="text-xs font-bold uppercase tracking-widest py-3">Last 7 Days</SelectItem>
                            <SelectItem value="30" className="text-xs font-bold uppercase tracking-widest py-3">Last 30 Days</SelectItem>
                            <SelectItem value="90" className="text-xs font-bold uppercase tracking-widest py-3">Last 3 Months</SelectItem>
                            <SelectItem value="365" className="text-xs font-bold uppercase tracking-widest py-3">Last Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* MIDDLE BODY: Z-Pattern Diagonal Flow */}
            <ScrollArea className="flex-1 pr-4 -mr-4">
                <div className="flex flex-col gap-6 pb-8">

                    {/* OVERVIEW CARDS */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            { title: "Total Users", value: overviewData?.totalUsers, sub: `${overviewData?.activeUsers || 0} active`, icon: Users, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
                            { title: "Total Resources", value: overviewData?.totalResources, icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
                            { title: "Total Downloads", value: overviewData?.totalDownloads, icon: Download, color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
                            { title: "Requests Pending", value: requestStats?.data?.pending, sub: `${requestStats?.data?.resolved || 0} resolved`, icon: Activity, color: "text-orange-600", bg: "bg-orange-50 border-orange-100" }
                        ].map((card, i) => (
                            <Card key={i} className="border-2 border-zinc-100 shadow-none rounded overflow-hidden group hover:border-zinc-300 transition-all">
                                <CardContent className="p-5 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{card.title}</p>
                                        <div className={`p-2 rounded border-2 ${card.bg}`}>
                                            <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
                                        </div>
                                    </div>
                                    <div>
                                        {isOverviewLoading || isRequestStatsLoading ? (
                                            <Skeleton className="h-7 w-20" />
                                        ) : (
                                            <p className="text-2xl font-bold text-zinc-900 leading-none">{(card.value || 0).toLocaleString()}</p>
                                        )}
                                        {card.sub && (
                                            <p className="text-[9px] font-bold uppercase tracking-tight text-zinc-400 mt-1.5 opacity-80">{card.sub}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* TABS SECTION */}
                    <div className="flex flex-col bg-white border-2 border-zinc-100 rounded relative shadow-sm overflow-hidden">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="p-2 border-b-2 border-zinc-100 bg-zinc-50/50 flex items-center justify-center">
                                <TabsList className="bg-white border-2 border-zinc-200 h-10 p-1 rounded gap-1 shadow-none">
                                    <TabsTrigger value="trends" className="text-[9px] uppercase font-bold tracking-widest data-[state=active]:bg-blue-900 data-[state=active]:text-white transition-all h-full px-4 rounded">
                                        <TrendingUp className="h-3 w-3 mr-1.5" /> Trends
                                    </TabsTrigger>
                                    <TabsTrigger value="distribution" className="text-[9px] uppercase font-bold tracking-widest data-[state=active]:bg-blue-900 data-[state=active]:text-white transition-all h-full px-4 rounded">
                                        <PieChartIcon className="h-3 w-3 mr-1.5" /> Distribution
                                    </TabsTrigger>
                                    <TabsTrigger value="content" className="text-[9px] uppercase font-bold tracking-widest data-[state=active]:bg-blue-900 data-[state=active]:text-white transition-all h-full px-4 rounded">
                                        <FileText className="h-3 w-3 mr-1.5" /> Content
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="p-6">
                                <TabsContent value="trends" className="mt-0 outline-none">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="flex flex-col gap-4">
                                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 border-l-2 border-zinc-200 pl-2">Download Activity</h4>
                                            <div className="h-[280px] w-full bg-zinc-50/50 border-2 border-zinc-100 rounded p-4">
                                                {isDownloadTrendsLoading ? <Skeleton className="h-full w-full" /> : (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={downloadChartData}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} />
                                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} />
                                                            <Tooltip
                                                                contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', border: '2px solid #f4f4f5', boxShadow: 'none' }}
                                                                labelStyle={{ fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
                                                            />
                                                            <Line type="monotone" dataKey="downloads" stroke="#1e3a8a" strokeWidth={3} dot={{ r: 4, fill: '#1e3a8a', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 border-l-2 border-zinc-200 pl-2">User Growth</h4>
                                            <div className="h-[280px] w-full bg-zinc-50/50 border-2 border-zinc-100 rounded p-4">
                                                {isUserTrendsLoading ? <Skeleton className="h-full w-full" /> : (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={userChartData}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} />
                                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} />
                                                            <Tooltip
                                                                cursor={{ fill: '#f4f4f5' }}
                                                                contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', border: '2px solid #f4f4f5', boxShadow: 'none' }}
                                                                labelStyle={{ fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
                                                            />
                                                            <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="distribution" className="mt-0 outline-none">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="flex flex-col gap-4">
                                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 border-l-2 border-zinc-200 pl-2">User Roles Breakdown</h4>
                                            <div className="h-[320px] bg-zinc-50/50 border-2 border-zinc-100 rounded p-4">
                                                {isUserRolesLoading ? <Skeleton className="h-full w-full" /> : (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={userRoles?.data}
                                                                innerRadius={60}
                                                                outerRadius={90}
                                                                paddingAngle={5}
                                                                dataKey="count"
                                                                nameKey="role"
                                                            >
                                                                {userRoles?.data?.map((_, index) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip
                                                                contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', border: '2px solid #f4f4f5', boxShadow: 'none' }}
                                                            />
                                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 border-l-2 border-zinc-200 pl-2">Resource Categories</h4>
                                            <div className="h-[320px] bg-zinc-50/50 border-2 border-zinc-100 rounded p-4">
                                                {isResourceCategoriesLoading ? <Skeleton className="h-full w-full" /> : (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={resourceCategories?.data}
                                                                innerRadius={0}
                                                                outerRadius={90}
                                                                paddingAngle={2}
                                                                dataKey="count"
                                                                nameKey="category"
                                                            >
                                                                {resourceCategories?.data?.map((_, index) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip
                                                                contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', border: '2px solid #f4f4f5', boxShadow: 'none' }}
                                                            />
                                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="content" className="mt-0 outline-none">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="flex flex-col gap-4">
                                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 border-l-2 border-zinc-200 pl-2">Most Popular Resources</h4>
                                            <div className="bg-zinc-50/50 border-2 border-zinc-100 rounded divide-y divide-zinc-200/60 overflow-hidden">
                                                {isTopResourcesLoading ? (
                                                    [1, 2, 3, 4, 5].map(i => <div key={i} className="p-4"><Skeleton className="h-4 w-full" /></div>)
                                                ) : topResources?.data?.length ? (
                                                    topResources.data.map((resource, i) => (
                                                        <div key={resource.resourceId} className="flex items-center justify-between p-4 hover:bg-white transition-colors group">
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <span className="text-[10px] font-bold text-blue-900 bg-blue-50 w-6 h-6 flex items-center justify-center rounded border border-blue-100">{i + 1}</span>
                                                                <span className="text-xs font-bold text-zinc-700 truncate" title={resource.title}>{resource.title}</span>
                                                            </div>
                                                            <Badge className="bg-white border-2 border-zinc-100 text-zinc-900 group-hover:border-blue-200 transition-all font-bold text-[10px] h-6 shadow-none">
                                                                {resource.count} <span className="ml-1 text-[8px] text-zinc-400 uppercase tracking-tighter">Hits</span>
                                                            </Badge>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-12 text-center text-zinc-400 text-xs font-bold uppercase tracking-widest">No resource hits recorded</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 border-l-2 border-zinc-200 pl-2">Top Search Terms</h4>
                                            <div className="bg-white border-2 border-zinc-100 rounded overflow-hidden">
                                                <div className="grid grid-cols-12 gap-2 p-3 bg-zinc-50/50 border-b-2 border-zinc-100 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                                                    <div className="col-span-8 px-2">Knowledge query</div>
                                                    <div className="col-span-4 text-right pr-2">Volume</div>
                                                </div>
                                                <div className="divide-y divide-zinc-100/60 h-[320px] overflow-auto">
                                                    {isTopSearchTermsLoading ? (
                                                        [1, 2, 3, 4, 5].map(i => <div key={i} className="p-4"><Skeleton className="h-4 w-full" /></div>)
                                                    ) : topSearchTerms?.data?.length ? (
                                                        topSearchTerms.data.map((term, i) => (
                                                            <div key={term.item} className="grid grid-cols-12 gap-2 p-4 items-center hover:bg-zinc-50 transition-colors group">
                                                                <div className="col-span-8 flex items-center gap-2 min-w-0">
                                                                    <Search className="h-3.5 w-3.5 text-zinc-300 group-hover:text-blue-600 transition-colors" />
                                                                    <span className="text-xs font-bold text-zinc-700 truncate italic">&quot;{term.item}&quot;</span>
                                                                </div>
                                                                <div className="col-span-4 text-right pr-2 font-mono text-[11px] font-bold text-blue-900">
                                                                    {term.count.toLocaleString()}
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center h-full text-zinc-400 opacity-60">
                                                            <Search className="h-8 w-8 mb-3" />
                                                            <p className="text-[10px] font-bold uppercase tracking-widest">Waiting for search metrics</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}

// Minimal Badge replacement if not available in project or to ensure flat style
const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={`px-2 py-0.5 rounded flex items-center shrink-0 ${className}`}>
        {children}
    </div>
);
