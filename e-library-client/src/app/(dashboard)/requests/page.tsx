"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateRequest, useMyRequests } from "@/hooks/useRequests";
import { formatDate } from "@/lib/utils";
import { createRequestSchema, priorityEnum, type CreateRequestFormData } from "@/schemas/requests";
import { categoryOptions } from "@/schemas/resources";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    ChevronRight,
    ClipboardList,
    Clock,
    Loader2,
    Plus,
    Search,
    Send,
    User,
    XCircle
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function RequestsPage() {
    const { data: requestsData, isLoading } = useMyRequests();
    const { mutate: createRequest, isPending } = useCreateRequest();
    const [isCreating, setIsCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const requests = requestsData || [];

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<CreateRequestFormData>({
        resolver: zodResolver(createRequestSchema),
        defaultValues: {
            priority: "LOW",
        }
    });

    const onSubmit = (data: CreateRequestFormData) => {
        const requestData = {
            title: data.title,
            authors: data.authors || undefined,
            reason: data.reason,
            category: data.category,
            priority: data.priority,
            dueDate: data.dueDate,
        };

        createRequest(requestData, {
            onSuccess: () => {
                setIsCreating(false);
                reset();
            },
        });
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "RESOLVED":
                return { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", label: "Resolved" };
            case "REJECTED":
                return { icon: XCircle, color: "text-red-600", bg: "bg-red-50", label: "Declined" };
            case "IN_PROGRESS":
                return { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "In Progress" };
            default:
                return { icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50", label: "Pending" };
        }
    };

    if (isCreating) {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-6xl mx-auto font-titillium"
            >
                <Button
                    variant="ghost"
                    onClick={() => setIsCreating(false)}
                    className="mb-8 hover:bg-transparent px-0 text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Requests
                </Button>

                <div className="bg-white dark:bg-zinc-900  dark:border-zinc-800 rounded p-4 shadow-sm">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Create New Request</h1>
                        <p className="text-zinc-500">Submit a resource request for the library team to review.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Z-Pattern Layout for Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            {/* Left Side */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-zinc-700">Resource Title</Label>
                                    <Input
                                        {...register("title")}
                                        placeholder="e.g. Advanced Thermodynamics 5th Ed"
                                        className="h-11 rounded border-zinc-200 shadow-none focus-visible:ring-1"
                                    />
                                    {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-zinc-700">Author(s)</Label>
                                    <Input
                                        {...register("authors")}
                                        placeholder="Optional"
                                        className="h-11 rounded border-zinc-200 shadow-none focus-visible:ring-1"
                                    />
                                </div>
                            </div>

                            {/* Right Side */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-zinc-700">Category</Label>
                                    <Select onValueChange={(v) => setValue("category", v as any)}>
                                        <SelectTrigger className="h-11 rounded border-zinc-200 shadow-none">
                                            <SelectValue placeholder="Select topic" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categoryOptions.map(opt => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-zinc-700">Priority</Label>
                                        <Select defaultValue="LOW" onValueChange={(v) => setValue("priority", v as any)}>
                                            <SelectTrigger className="h-11 rounded border-zinc-200 shadow-none">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {priorityEnum.options.map(p => (
                                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-zinc-700">Needed By</Label>
                                        <Input
                                            type="date"
                                            {...register("dueDate")}
                                            className="h-11 rounded border-zinc-200 shadow-none focus-visible:ring-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Full Width bottom */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-zinc-700">Detailed Reason</Label>
                            <Textarea
                                {...register("reason")}
                                placeholder="Explain why this resource is needed for your research..."
                                className="min-h-[120px] rounded border-zinc-200 shadow-none focus-visible:ring-1 resize-none"
                            />
                            {errors.reason && <p className="text-xs text-red-500">{errors.reason.message}</p>}
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreating(false)}
                                className="h-11 px-8 rounded border-zinc-200"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="h-11 px-10 rounded bg-blue-900 hover:bg-blue-800 text-white"
                            >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                Submit Request
                            </Button>
                        </div>
                    </form>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 py-6 animate-in fade-in duration-700 font-titillium">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-xl font-bold tracking-tight text-zinc-900">Resource Requests</h1>
                    <p className="text-zinc-500 text-sm">Track your custom library requests and acquisitions.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                        <Input
                            placeholder="Search requests..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-[260px] h-11 bg-white border-zinc-200 rounded shadow-none focus-visible:ring-1"
                        />
                    </div>
                    <Button
                        onClick={() => setIsCreating(true)}
                        className="h-11 px-6 rounded bg-blue-900 hover:bg-blue-800 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Request
                    </Button>
                </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 p-1 bg-white/50 border border-zinc-100 rounded">
                {[
                    { label: "My Total", value: requests.length, color: "text-zinc-900" },
                    { label: "Resolved", value: requests.filter(r => r.status?.toUpperCase() === "RESOLVED").length, color: "text-emerald-600" },
                    { label: "Pending", value: requests.filter(r => ["In Progress", "Pending"].includes(r.status)).length, color: "text-blue-600" },
                    { label: "Declined", value: requests.filter(r => ["REJECTED", "DECLINED"].includes(r.status)).length, color: "text-red-600" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-4 text-center">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">{stat.label}</p>
                        <p className={`text-xl font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* In-List Experience */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-sm font-semibold text-zinc-400 ">History Log</h2>
                    <span className="text-[12px] text-rose-600 font-medium">Last updated today at 10:45 AM</span>
                </div>

                <div className="grid gap-3">
                    {isLoading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-24 w-full bg-white/50 animate-pulse rounded border border-zinc-100" />)
                    ) : requests.length > 0 ? (
                        requests.filter(r =>
                            r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (r.authors && r.authors.toLowerCase().includes(searchQuery.toLowerCase()))
                        ).map((request) => {
                            const config = getStatusConfig(request.status);
                            const StatusIcon = config.icon;

                            return (
                                <motion.div
                                    key={request.id}
                                    whileHover={{ x: 4 }}
                                    className="group flex flex-col md:flex-row items-center gap-6 p-5 bg-white border border-zinc-200 rounded hover:border-blue-900 transition-all cursor-default"
                                >
                                    {/* Status Indicator */}
                                    <div className={`w-12 h-12 shrink-0 rounded flex items-center justify-center ${config.color}`}>
                                        <StatusIcon className="w-6 h-6" />
                                    </div>

                                    {/* Content Area */}
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-zinc-900 truncate group-hover:text-blue-900 transition-colors">
                                                {request.title}
                                            </h3>
                                            <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                                                {config.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-zinc-400 font-medium">
                                            <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {request.authors || "N/A"}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {formatDate(request.createdAt)}</span>
                                            {request.status === "DECLINED" && (
                                                <span className="text-red-600 font- animate-pulse">! Declined</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Side Info */}
                                    <div className="flex items-center gap-8 shrink-0">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Reason</p>
                                            <p className="text-xs text-zinc-600 max-w-[200px] truncate">"{request.reason}"</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-zinc-300 hover:text-blue-900">
                                            <ChevronRight className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <ClipboardList className="w-16 h-16 text-zinc-100 mb-4" />
                            <h3 className="text-lg font-bold text-zinc-900">No requests filed</h3>
                            <p className="text-zinc-500 text-sm max-w-xs mt-1">Can't find a specific book? Request it here and we'll source it for you.</p>
                            <Button onClick={() => setIsCreating(true)} className="mt-8 bg-zinc-900 text-white rounded">
                                Create Request
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
