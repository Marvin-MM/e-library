"use client";

import { SearchModal } from "@/components/modals/SearchModal";
import { Button } from "@/components/ui/button";
import { useRole } from "@/hooks/useAuth";
import { useMyRequests } from "@/hooks/useRequests";
import { motion } from "framer-motion";
import {
    Activity,
    ChevronRight,
    GitPullRequest,
    Layers,
    MoveRight,
    Search
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Dynamic import for ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAdmin } = useRole();
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const { data: myRequests } = useMyRequests();

    useEffect(() => {
        if (isAdmin) {
            router.replace("/dashboard/admin");
        }
    }, [isAdmin, router]);

    // Heatmap Data Generation
    const generateHeatmapData = () => {
        const series = [];
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        for (let i = 0; i < 7; i++) {
            const data = [];
            for (let j = 0; j < 12; j++) {
                data.push({
                    x: `${j * 2}h`,
                    y: Math.floor(Math.random() * 60)
                });
            }
            series.push({ name: days[i], data });
        }
        return series;
    };

    const heatmapOptions: any = {
        chart: {
            toolbar: { show: false },
            fontFamily: 'inherit',
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        dataLabels: { enabled: false },
        colors: ["#1e3a8a"], // Blue-900 base
        plotOptions: {
            heatmap: {
                shadeIntensity: 0.5,
                radius: 4,
                useFillColorAsStroke: false,
                colorScale: {
                    ranges: [
                        { from: 0, to: 15, name: 'low', color: '#f4f4f5' },
                        { from: 16, to: 35, name: 'medium', color: '#dbeafe' },
                        { from: 36, to: 60, name: 'high', color: '#1e3a8a' },
                    ]
                }
            }
        },
        xaxis: { labels: { style: { colors: '#71717a', fontSize: '10px', fontWeight: 600 } } },
        yaxis: { labels: { style: { colors: '#71717a', fontSize: '10px', fontWeight: 600 } } },
        grid: { padding: { top: 0, right: 0, bottom: 0, left: 0 } },
        legend: { show: false }
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700 font-titillium">

            {/* TOP ROW: The start of the Z Pattern */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex flex-col justify-center gap-2"
                >
                    <h1 className="text-xl font-bold text-zinc-900 font-titillium">
                        Hello, {user?.name?.split(' ')[0]}
                    </h1>
                    <p className="text-zinc-500 text-sm max-w-sm">
                        Your academic control center is ready. Explore over 5M+ verified resources today.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center justify-end"
                >
                    <div className="bg-white border border-zinc-100 p-2 flex items-center gap-4 rounded">
                        <div className="px-6 py-2 border-r border-zinc-100 last:border-0 text-center">
                            <p className="text-[10px] uppercase font-bold text-zinc-400">Requests</p>
                            <p className="text-xl font-bold text-blue-900">{myRequests?.length || 0}</p>
                        </div>
                        <div className="px-6 py-2 border-r border-zinc-100 last:border-0 text-center">
                            <p className="text-[10px] uppercase font-bold text-zinc-400">Downloads</p>
                            <p className="text-xl font-bold text-zinc-900">24</p>
                        </div>
                        <Button onClick={() => setSearchModalOpen(true)} className="h-12 w-12 rounded bg-blue-900 hover:bg-zinc-900 text-white shrink-0">
                            <Search className="w-5 h-5" />
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* MIDDLE ROW: Activity & Discovery (The middle transition of the Z) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 shrink-0">
                <div className="lg:col-span-2 bg-white border border-zinc-100 p-6 rounded relative min-h-[300px]">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded  flex items-center justify-center">
                                <Activity className="w-4 h-4 text-zinc-900" />
                            </div>
                            <h2 className="text-sm font-bold text-zinc-900 tracking-tight">Request Threshold Activity</h2>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-bold ">Real-time Metrics</span>
                    </div>
                    <div className="h-72 w-full overflow-hidden">
                        <Chart
                            options={heatmapOptions}
                            series={generateHeatmapData()}
                            type="heatmap"
                            height="100%"
                        />
                    </div>
                </div>

                <div className="bg-white border border-zinc-100 p-6 rounded flex flex-col justify-between">
                    <div>
                        <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-tight mb-4 flex items-center gap-2">
                            <Layers className="w-4 h-4" />
                            Global Discovery
                        </h2>
                        <div className="space-y-2">
                            {[
                                { name: "OpenAlex", count: "2.3M", color: "text-blue-600" },
                                { name: "DOAJ Repository", count: "890K", color: "text-emerald-600" },
                                { name: "CORE Academic", count: "1.4M", color: "text-violet-600" }
                            ].map((source) => (
                                <div key={source.name} className="flex items-center justify-between p-3 bg-zinc-50 rounded group hover:bg-zinc-900 transition-all cursor-pointer">
                                    <span className="text-xs font-bold text-zinc-700 group-hover:text-white">{source.name}</span>
                                    <span className={`text-[12px]  ${source.color} group-hover:text-zinc-400`}>{source.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Button variant="ghost" className="w-full justify-between text-xs font-bold p-0 text-zinc-400 hover:text-zinc-900 group hover:bg-transparent" onClick={() => router.push('/students/library')}>
                        Explores all libraries
                        <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>

            {/* BOTTOM ROW: Final Step of the Z - Focus Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1 overflow-hidden">
                <div className="md:col-span-4 bg-white border border-zinc-100 rounded flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b border-zinc-50">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-tight flex items-center gap-2">
                            <GitPullRequest className="w-4 h-4" />
                            Recent Active Requests
                        </h3>
                        {(myRequests?.length || 0) > 3 && (
                            <Link href="/requests" className="text-[10px] font-bold text-blue-600 hover:underline px-2 py-1 bg-blue-50 rounded uppercase">
                                View full log
                            </Link>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-50 flex-1 h-full overflow-hidden">
                        {(myRequests || []).slice(0, 3).map((item: any) => (
                            <div key={item.id} className="bg-white p-6 flex flex-col justify-between hover:bg-zinc-50 transition-colors group cursor-default h-full min-h-[160px]">
                                <div>
                                    <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase text-blue-900">
                                        <span>{item.category}</span>
                                        <span className="px-2 py-0.5 bg-blue-50 rounded">{item.status}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-zinc-900 line-clamp-2 leading-tight group-hover:text-blue-900 transition-colors">
                                        {item.title}
                                    </h4>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-zinc-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                                    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <SearchModal open={searchModalOpen} onOpenChange={setSearchModalOpen} />
        </div>
    );
}
