"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useAuth";
import { useAuditLogs } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { ScrollText, ChevronLeft, ChevronRight, Clock, Activity, Target } from "lucide-react";
import { getInitials, formatDateTime } from "@/lib/utils";

export default function AuditLogsPage() {
    const router = useRouter();
    const { isAdmin } = useRole();
    const [page, setPage] = useState(1);
    const [action, setAction] = useState("all");

    const { data, isLoading } = useAuditLogs({
        page,
        limit: 20,
        action: action === "all" ? undefined : action,
    });

    const logs = data?.data || [];
    const pagination = data?.pagination;

    useEffect(() => {
        if (!isAdmin) {
            router.replace("/dashboard");
        }
    }, [isAdmin, router]);

    if (!isAdmin) {
        return null;
    }

    const getActionBadgeVariant = (action: string) => {
        if (action.includes("DELETE")) return "destructive";
        if (action.includes("CREATE")) return "success";
        if (action.includes("UPDATE")) return "default";
        return "secondary";
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700 font-titillium">

            {/* TOP ROW: Z-Pattern Start */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                <div className="flex flex-col justify-center gap-2">
                    <h2 className="text-lg md:text-xl font-bold tracking-tight text-zinc-900 pl-3">
                        Audit Logs
                    </h2>
                    <p className="text-xs text-zinc-500 pl-4 font-semibold">
                        Track all actions and changes across the platform securely
                    </p>
                </div>

                {/* Z-Pattern Top Right: Actions & Tools */}
                <div className="flex items-center justify-end gap-3 px-2">
                    <Select
                        value={action}
                        onValueChange={(value) => {
                            setAction(value);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[180px] h-11 border-2 border-zinc-100 shadow-none bg-white rounded focus:ring-0 uppercase text-[10px] font-bold tracking-wider text-zinc-600 hover:border-zinc-300 transition-all cursor-pointer">
                            <SelectValue placeholder="ALL ACTIONS" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-zinc-100 shadow-xl rounded">
                            <SelectItem value="all" className="text-xs uppercase font-bold tracking-widest py-3">All Actions</SelectItem>
                            <SelectItem value="CREATE" className="text-xs uppercase font-bold tracking-widest text-emerald-600 py-3">Create Events</SelectItem>
                            <SelectItem value="UPDATE" className="text-xs uppercase font-bold tracking-widest text-blue-600 py-3">Update Events</SelectItem>
                            <SelectItem value="DELETE" className="text-xs uppercase font-bold tracking-widest text-red-600 py-3">Delete Events</SelectItem>
                            <SelectItem value="LOGIN" className="text-xs uppercase font-bold tracking-widest text-zinc-600 py-3">Logins</SelectItem>
                            <SelectItem value="LOGOUT" className="text-xs uppercase font-bold tracking-widest text-zinc-600 py-3">Logouts</SelectItem>
                            <SelectItem value="DOWNLOAD" className="text-xs uppercase font-bold tracking-widest text-purple-600 py-3">Downloads</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* MIDDLE BODY: Z-Pattern Diagonal Flow -> Main Content */}
            <div className="flex-1 overflow-hidden flex flex-col bg-white border-2 border-zinc-100 rounded relative shadow-sm">

                {/* Header Row for Table */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b-2 border-zinc-100 bg-zinc-50/50 text-[10px] font-bold uppercase tracking-widest text-zinc-400 shrink-0">
                    <div className="col-span-4 pl-4">User Identity</div>
                    <div className="col-span-4">Action Taken</div>
                    <div className="col-span-4">Timestamp & Trace</div>
                </div>

                {/* Audit Logs List Wrapper */}
                <ScrollArea className="flex-1">
                    {isLoading ? (
                        <div className="divide-y divide-zinc-100">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center animate-pulse xl:pl-4">
                                    <div className="col-span-4 flex items-center gap-4">
                                        <Skeleton className="h-10 w-10 border-2 border-zinc-100 rounded-full shrink-0" />
                                        <div className="flex flex-col gap-2 w-full max-w-[150px]">
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                    </div>
                                    <div className="col-span-4">
                                        <Skeleton className="h-6 w-24 rounded-md" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : logs.length > 0 ? (
                        <div className="divide-y divide-zinc-100/60 pb-20">
                            {logs.map((log) => (
                                <div
                                    key={log.id}
                                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-blue-50/30 transition-all group"
                                >
                                    {/* User Block */}
                                    <div className="col-span-4 flex items-center gap-4 pl-2">
                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-2 ring-zinc-50 group-hover:ring-blue-100 transition-all shrink-0">
                                            <AvatarImage src={log.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(log.user?.firstName + ' ' + log.user?.lastName)}`} />
                                            <AvatarFallback className="bg-zinc-100 text-zinc-600 font-bold text-xs">
                                                {log.user ? getInitials(`${log.user.firstName} ${log.user.lastName}`) : "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col min-w-0 pr-2">
                                            <span className="font-bold text-zinc-900 text-sm truncate group-hover:text-blue-900 transition-colors">
                                                {log.user ? `${log.user.firstName} ${log.user.lastName}` : "Unknown System"}
                                            </span>
                                            {log.ipAddress && (
                                                <span className="text-[10px] font-semibold text-zinc-500 font-mono tracking-tight mt-0.5">
                                                    {log.ipAddress}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Block */}
                                    <div className="col-span-4 flex flex-col min-w-0 pr-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={getActionBadgeVariant(log.action)} className="text-[9px] uppercase tracking-widest font-bold shadow-none rounded shrink-0 h-5">
                                                {log.action.replace("_", " ")}
                                            </Badge>
                                            <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-2 border-zinc-100 shadow-none font-bold text-zinc-600 rounded shrink-0 h-5 bg-zinc-50">
                                                {log.entityType}
                                            </Badge>
                                        </div>
                                        <div className="flex mt-1 items-center gap-1.5 opacity-60 text-zinc-600 truncate">
                                            <Target className="h-3 w-3" />
                                            <span className="text-[10px] font-bold tracking-widest uppercase">ID: {log.entityId}</span>
                                        </div>
                                    </div>

                                    {/* Timestamp & Meta Block */}
                                    <div className="col-span-4 flex flex-col">
                                        <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <Clock className="h-3.5 w-3.5 text-zinc-400" />
                                            <p className="text-[11px] text-zinc-500 font-medium whitespace-nowrap">
                                                {formatDateTime(log.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <Activity className="h-16 w-16 text-zinc-300 mb-6" />
                            <h3 className="text-xl font-bold tracking-tight text-zinc-900 mb-2">No audit logs found</h3>
                            <p className="text-sm text-zinc-500 text-center max-w-sm">
                                {action !== "all"
                                    ? "0 logs match the specified action filter."
                                    : "The system has not recorded any activity trace logs yet."}
                            </p>
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* BOTTOM ROW: Z-Pattern End (Pagination) */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-auto mb-2 px-2 shrink-0 bg-white p-3 rounded border-2 border-zinc-100">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-2 hidden sm:block">
                        Showing Page <span className="text-zinc-800">{pagination.page}</span> of <span className="text-zinc-800">{pagination.totalPages}</span>
                    </span>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-2 border-zinc-100 shadow-none hover:bg-zinc-50 rounded h-9 px-4 text-xs font-bold transition-all"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={!pagination.hasPrev}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-2 border-zinc-100 shadow-none hover:bg-zinc-50 rounded h-9 px-4 text-xs font-bold transition-all bg-zinc-900 text-white hover:text-zinc-900 hover:border-zinc-300 border-zinc-900"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={!pagination.hasNext}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
