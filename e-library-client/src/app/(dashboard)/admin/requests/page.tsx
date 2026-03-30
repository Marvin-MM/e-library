"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useAuth";
import { useRequests, useUpdateRequest, useRespondToRequest } from "@/hooks/useRequests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    ClipboardList, ChevronLeft, ChevronRight, Loader2,
    MessageSquare, Clock, ArrowRight, ExternalLink,
} from "lucide-react";
import { getInitials, formatDate } from "@/lib/utils";
import { statusOptions } from "@/schemas/requests";
import { motion } from "framer-motion";
import type { ResourceRequest, RequestStatus } from "@/types/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Converts SNAKE_CASE → "Snake Case" for all underscores */
const toLabel = (s?: string | null) =>
    s ? s.split("_").map((w) => w[0] + w.slice(1).toLowerCase()).join(" ") : "—";

const STATUS_STYLE: Record<string, string> = {
    RESOLVED:    "bg-emerald-50 text-emerald-700 border-emerald-100",
    REJECTED:    "bg-red-50 text-red-500 border-red-100",
    IN_PROGRESS: "bg-amber-50 text-amber-600 border-amber-100",
    PENDING:     "bg-zinc-50 text-zinc-500 border-zinc-200",
};

const PRIORITY_STYLE: Record<string, string> = {
    URGENT:  "bg-red-50 text-red-600 border-red-100",
    HIGH:    "bg-orange-50 text-orange-600 border-orange-100",
    MEDIUM:  "bg-amber-50 text-amber-500 border-amber-100",
    LOW:     "bg-zinc-50 text-zinc-400 border-zinc-200",
};

function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_STYLE[status] ?? STATUS_STYLE.PENDING}`}>
            {toLabel(status)}
        </span>
    );
}

function PriorityBadge({ priority }: { priority: string }) {
    return (
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${PRIORITY_STYLE[priority] ?? PRIORITY_STYLE.LOW}`}>
            {priority}
        </span>
    );
}

const ALL_STATUSES = "__ALL__";

const fadeUp = (delay = 0) => ({
    initial: { y: 10, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] as const },
});

// ── Default dialog state ──────────────────────────────────────────────────────
const DIALOG_DEFAULTS = {
    newStatus:          "PENDING" as RequestStatus,
    adminReply:         "",
    accessInstructions: "",
    externalSourceUrl:  "",
    fulfilledResourceId:"",
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminRequestsPage() {
    const router = useRouter();
    const { isStaffOrAdmin } = useRole();
    const [page, setPage]               = useState(1);
    const [statusFilter, setStatusFilter] = useState(ALL_STATUSES);
    const [selectedRequest, setSelectedRequest] = useState<ResourceRequest | null>(null);
    const [dialogOpen, setDialogOpen]   = useState(false);
    const [form, setForm]               = useState(DIALOG_DEFAULTS);

    useEffect(() => {
        if (!isStaffOrAdmin) router.replace("/dashboard");
    }, [isStaffOrAdmin, router]);

    if (!isStaffOrAdmin) return null;

    const { data, isLoading } = useRequests({
        page, limit: 20,
        status: statusFilter === ALL_STATUSES ? undefined : statusFilter,
    });

    const { mutate: updateRequest,   isPending: updatePending }  = useUpdateRequest(selectedRequest?.id ?? "");
    const { mutate: respondToRequest, isPending: respondPending } = useRespondToRequest(selectedRequest?.id ?? "");
    const isPending = updatePending || respondPending;

    const requests  = data?.data ?? [];
    const pagination = data?.pagination;

    const openDialog = (req: ResourceRequest) => {
        setSelectedRequest(req);
        setForm({
            newStatus:           req.status as RequestStatus,
            adminReply:          req.adminReply          ?? "",
            accessInstructions:  req.accessInstructions  ?? "",
            externalSourceUrl:   req.externalSourceUrl   ?? "",
            fulfilledResourceId: req.fulfilledResourceId ?? "",
        });
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        // Reset after animation completes
        setTimeout(() => { setSelectedRequest(null); setForm(DIALOG_DEFAULTS); }, 200);
    };

    const handleSubmit = () => {
        if (!selectedRequest) return;
        const onSuccess = () => closeDialog();

        if (form.newStatus === "RESOLVED") {
            respondToRequest({
                status: form.newStatus,
                adminReply: form.adminReply,
                accessInstructions: form.accessInstructions,
                externalSourceUrl: form.externalSourceUrl,
                fulfilledResourceId: form.fulfilledResourceId || undefined,
            }, { onSuccess });
        } else {
            updateRequest({ status: form.newStatus, adminReply: form.adminReply }, { onSuccess });
        }
    };

    const setField = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((prev) => ({ ...prev, [key]: e.target.value }));

    return (
        <>
            <div className="flex flex-col gap-6 font-titillium pb-8">

                {/* ── Header ── */}
                <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-zinc-900 uppercase">Material Requests</h2>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mt-0.5">
                            Review and fulfill student &amp; staff requests
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-white border-2 border-zinc-100 rounded-lg">
                            <ClipboardList className="h-3.5 w-3.5 text-zinc-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Status</span>
                        </div>
                        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                            <SelectTrigger className="w-[160px] h-10 border-2 border-zinc-100 bg-white rounded-lg focus:ring-0 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:border-zinc-200 transition-colors shadow-none">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent className="border-2 border-zinc-100 shadow-xl rounded-lg font-titillium">
                                <SelectItem value={ALL_STATUSES} className="text-[10px] font-bold uppercase tracking-widest py-2.5">
                                    All Statuses
                                </SelectItem>
                                {statusOptions.map((o) => (
                                    <SelectItem key={o.value} value={o.value} className="text-[10px] font-bold uppercase tracking-widest py-2.5">
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </motion.div>

                {/* ── Table ── */}
                <motion.div {...fadeUp(0.08)} className="bg-white border-2 border-zinc-100 rounded-lg shadow-sm overflow-hidden">

                    {/* Header */}
                    <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b-2 border-zinc-100 bg-zinc-50/70 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                        <div className="col-span-7 md:col-span-5">Request</div>
                        <div className="col-span-2 hidden md:block">Priority</div>
                        <div className="col-span-2 hidden md:block">Status</div>
                        <div className="col-span-2 hidden md:block">Date</div>
                        <div className="col-span-5 md:col-span-1 text-right pr-1">Action</div>
                    </div>

                    {/* Rows */}
                    {isLoading ? (
                        <div className="divide-y divide-zinc-100">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4 px-5 py-4">
                                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                                    <div className="flex flex-col gap-2 flex-1">
                                        <Skeleton className="h-3.5 w-2/5 rounded" />
                                        <Skeleton className="h-2.5 w-1/4 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : requests.length > 0 ? (
                        <div className="divide-y divide-zinc-100/60">
                            {requests.map((req) => (
                                <div
                                    key={req.id}
                                    className="grid grid-cols-12 gap-3 px-5 py-4 items-center hover:bg-zinc-50/60 transition-colors group"
                                >
                                    {/* Info */}
                                    <div className="col-span-7 md:col-span-5 flex items-start gap-3 min-w-0">
                                        <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-2 ring-zinc-100 group-hover:ring-blue-100 transition-all shrink-0">
                                            <AvatarImage src={req.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(`${req.user?.firstName} ${req.user?.lastName}`)}`} />
                                            <AvatarFallback className="bg-zinc-100 text-zinc-500 text-xs font-bold">
                                                {getInitials(`${req.user?.firstName} ${req.user?.lastName}`)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-bold text-zinc-900 truncate group-hover:text-blue-900 transition-colors leading-tight">
                                                {req.title}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                                                    {req.user?.firstName} {req.user?.lastName}
                                                </span>
                                                <span className="text-zinc-300 text-[9px]">•</span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full">
                                                    {req.category}
                                                </span>
                                            </div>
                                            {/* Mobile: show status + priority inline */}
                                            <div className="flex items-center gap-2 mt-1.5 md:hidden">
                                                <PriorityBadge priority={req.priority} />
                                                <StatusBadge status={req.status} />
                                            </div>
                                            {req.adminReply && (
                                                <div className="hidden sm:flex items-center gap-1 mt-1.5 text-[9px] font-bold text-zinc-400 italic">
                                                    <MessageSquare className="h-2.5 w-2.5 shrink-0" />
                                                    Admin notes added
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Priority */}
                                    <div className="col-span-2 hidden md:flex">
                                        <PriorityBadge priority={req.priority} />
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-2 hidden md:flex">
                                        <StatusBadge status={req.status} />
                                    </div>

                                    {/* Date */}
                                    <div className="col-span-2 hidden md:flex items-center gap-1.5 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                                        <Clock className="h-3 w-3 shrink-0" />
                                        {formatDate(req.createdAt)}
                                    </div>

                                    {/* Action */}
                                    <div className="col-span-5 md:col-span-1 flex justify-end">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => openDialog(req)}
                                            className="h-8 w-8 p-0 rounded-lg hover:bg-blue-900 hover:text-white border-2 border-zinc-100 hover:border-blue-900 transition-all"
                                            aria-label="Manage request"
                                        >
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-300">
                            <ClipboardList className="h-10 w-10" />
                            <div className="text-center">
                                <p className="text-sm font-black uppercase tracking-tight text-zinc-400 mb-1">No requests found</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-300 max-w-xs mx-auto">
                                    {statusFilter !== ALL_STATUSES
                                        ? "No requests match this status filter."
                                        : "No resource requests have been submitted yet."}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && (
                        <div className="flex items-center justify-between px-5 py-3.5 border-t-2 border-zinc-100 bg-zinc-50/50">
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                Page <span className="text-zinc-700">{pagination.page}</span> of <span className="text-zinc-700">{pagination.totalPages}</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                                <Button variant="outline" size="icon"
                                    className="h-8 w-8 border-2 border-zinc-100 rounded-lg hover:bg-zinc-900 hover:text-white hover:border-zinc-900 disabled:opacity-30 transition-all"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={!pagination.hasPrev}
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="outline" size="icon"
                                    className="h-8 w-8 border-2 border-zinc-100 rounded-lg hover:bg-zinc-900 hover:text-white hover:border-zinc-900 disabled:opacity-30 transition-all"
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={!pagination.hasNext}
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* ── Manage dialog ── */}
            <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) closeDialog(); else setDialogOpen(true); }}>
                <DialogContent className="sm:max-w-xl border-2 border-zinc-100 shadow-2xl rounded-2xl p-0 overflow-hidden font-titillium">

                    <DialogHeader className="px-6 py-5 bg-zinc-50/80 border-b-2 border-zinc-100">
                        <DialogTitle className="text-lg font-black text-zinc-900">Manage Request</DialogTitle>
                        <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-0.5">
                            Set status and provide access instructions
                        </DialogDescription>
                    </DialogHeader>

                    <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Status */}
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Status</Label>
                                <Select value={form.newStatus} onValueChange={(v) => setForm((p) => ({ ...p, newStatus: v as RequestStatus }))}>
                                    <SelectTrigger className="h-11 border-2 border-zinc-100 bg-zinc-50 rounded-lg focus:ring-0 text-xs font-black uppercase tracking-widest hover:border-zinc-200 transition-colors">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-2 border-zinc-100 shadow-xl rounded-lg font-titillium">
                                        {statusOptions.map((o) => (
                                            <SelectItem key={o.value} value={o.value} className="text-[10px] font-bold uppercase tracking-widest py-2.5">
                                                {o.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Requestor info */}
                            <div className="flex items-center gap-3 bg-blue-50/50 border-2 border-blue-100/50 rounded-lg p-3">
                                <Avatar className="h-9 w-9 shrink-0">
                                    <AvatarImage src={selectedRequest?.user?.avatar} />
                                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">
                                        {getInitials(`${selectedRequest?.user?.firstName} ${selectedRequest?.user?.lastName}`)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-900 leading-none mb-0.5">Requestor</p>
                                    <p className="text-xs font-bold text-zinc-800 truncate">
                                        {selectedRequest?.user?.firstName} {selectedRequest?.user?.lastName}
                                    </p>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-white border border-blue-100 px-1.5 py-0.5 rounded-full">
                                        {selectedRequest?.category}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Resolved-only fields */}
                        {form.newStatus === "RESOLVED" && (
                            <div className="space-y-4 animate-in slide-in-from-top-2 duration-250">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Access Instructions</Label>
                                    <Textarea
                                        placeholder="Provide instructions for the student…"
                                        value={form.accessInstructions}
                                        onChange={setField("accessInstructions")}
                                        rows={3}
                                        className="resize-none border-2 border-zinc-100 rounded-lg focus-visible:ring-0 focus-visible:border-blue-200 transition-colors text-sm bg-zinc-50"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">External URL</Label>
                                        <div className="relative">
                                            <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                                            <Input
                                                placeholder="https://…"
                                                value={form.externalSourceUrl}
                                                onChange={setField("externalSourceUrl")}
                                                className="pl-9 h-10 border-2 border-zinc-100 rounded-lg focus-visible:ring-0 focus-visible:border-blue-200 bg-zinc-50 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Fulfilled Resource ID</Label>
                                        <Input
                                            placeholder="Internal UUID"
                                            value={form.fulfilledResourceId}
                                            onChange={setField("fulfilledResourceId")}
                                            className="h-10 border-2 border-zinc-100 rounded-lg focus-visible:ring-0 focus-visible:border-blue-200 bg-zinc-50 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Admin notes */}
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Internal Admin Notes</Label>
                            <Textarea
                                placeholder="Private staff notes about this request…"
                                value={form.adminReply}
                                onChange={setField("adminReply")}
                                rows={4}
                                className="resize-none border-2 border-zinc-100 rounded-lg focus-visible:ring-0 focus-visible:border-blue-200 transition-colors text-sm bg-zinc-50"
                            />
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 bg-zinc-50/50 border-t-2 border-zinc-100">
                        <Button variant="ghost" onClick={closeDialog}
                            className="font-black text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 border-2 border-zinc-100 hover:border-zinc-200 h-10 px-5">
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={isPending}
                            className="bg-zinc-900 hover:bg-blue-900 text-white font-black text-[10px] uppercase tracking-widest h-10 px-7 transition-colors">
                            {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                            Commit Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}