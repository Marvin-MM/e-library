"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useAuth";
import { useRequests, useUpdateRequest, useRespondToRequest } from "@/hooks/useRequests";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { ClipboardList, ChevronLeft, ChevronRight, Loader2, User, MessageSquare, Clock, ArrowRight, ExternalLink } from "lucide-react";
import { getInitials, formatDate } from "@/lib/utils";
import { statusOptions } from "@/schemas/requests";
import type { ResourceRequest, RequestStatus } from "@/types/api";

export default function AdminRequestsPage() {
    const router = useRouter();
    const { isStaffOrAdmin } = useRole();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("__ALL_STATUSES__");
    const [selectedRequest, setSelectedRequest] = useState<ResourceRequest | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<RequestStatus>("PENDING");
    const [adminReply, setAdminNotes] = useState("");
    const [accessInstructions, setAccessInstructions] = useState("");
    const [externalSourceUrl, setExternalSourceUrl] = useState("");
    const [fulfilledResourceId, setFulfilledResourceId] = useState("");

    const { data, isLoading } = useRequests({
        page,
        limit: 20,
        status: statusFilter === "__ALL_STATUSES__" ? undefined : statusFilter,
    });
    const { mutate: updateRequest, isPending: isUpdatePending } = useUpdateRequest(selectedRequest?.id || "");
    const { mutate: respondToRequest, isPending: isRespondPending } = useRespondToRequest(selectedRequest?.id || "");

    const isPending = isUpdatePending || isRespondPending;

    const requests = data?.data || [];
    const pagination = data?.pagination;

    useEffect(() => {
        if (!isStaffOrAdmin) {
            router.replace("/dashboard");
        }
    }, [isStaffOrAdmin, router]);

    if (!isStaffOrAdmin) {
        return null;
    }

    const handleUpdateRequest = () => {
        if (selectedRequest) {
            if (newStatus === "RESOLVED") {
                respondToRequest(
                    {
                        status: newStatus,
                        adminReply,
                        accessInstructions,
                        externalSourceUrl,
                        fulfilledResourceId: fulfilledResourceId || undefined,
                    },
                    {
                        onSuccess: () => {
                            setDialogOpen(false);
                            setSelectedRequest(null);
                        },
                    }
                );
            } else {
                updateRequest(
                    { status: newStatus, adminReply },
                    {
                        onSuccess: () => {
                            setDialogOpen(false);
                            setSelectedRequest(null);
                        },
                    }
                );
            }
        }
    };

    const openUpdateDialog = (request: ResourceRequest) => {
        setSelectedRequest(request);
        setNewStatus(request.status);
        setAdminNotes(request.adminReply || "");
        setAccessInstructions(request.accessInstructions || "");
        setExternalSourceUrl(request.externalSourceUrl || "");
        setFulfilledResourceId(request.fulfilledResourceId || "");
        setDialogOpen(true);
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "RESOLVED":
                return "success";
            case "REJECTED":
                return "destructive";
            case "IN_PROGRESS":
                return "warning";
            default:
                return "secondary";
        }
    };

    const getPriorityVariant = (priority: string) => {
        switch (priority) {
            case "URGENT":
                return "destructive";
            case "HIGH":
                return "warning";
            default:
                return "outline";
        }
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700 font-titillium">

            {/* TOP ROW: Z-Pattern Start */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div className="flex flex-col justify-center gap-1">
                    <h2 className="text-lg md:text-xl font-bold tracking-tight text-zinc-900 pl-3">
                        Material Requests
                    </h2>
                    <p className="text-xs text-zinc-500 pl-4 font-semibold uppercase tracking-widest text-[9px]">
                        Review and fulfill student and staff requests
                    </p>
                </div>

                <div className="flex items-center gap-2 group px-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-zinc-100 rounded text-zinc-400 group-hover:border-zinc-300 transition-all">
                        <ClipboardList className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Filter Status</span>
                    </div>
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => {
                            setStatusFilter(value);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[180px] h-10 border-2 border-zinc-100 shadow-none bg-white rounded focus:ring-0 uppercase text-[10px] font-bold tracking-wider text-zinc-600 hover:border-zinc-300 transition-all cursor-pointer">
                            <SelectValue placeholder="ALL STATUSES" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-zinc-100 shadow-xl rounded">
                            <SelectItem value="__ALL_STATUSES__" className="text-xs font-bold uppercase tracking-widest py-3">All Statuses</SelectItem>
                            {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="text-xs font-bold uppercase tracking-widest py-3">
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* MIDDLE BODY: Grid List instead of just cards */}
            <div className="flex-1 overflow-hidden flex flex-col bg-white border-2 border-zinc-100 rounded relative shadow-sm">
                <div className="grid grid-cols-12 gap-4 p-4 border-b-2 border-zinc-100 bg-zinc-50/50 text-[10px] font-bold uppercase tracking-widest text-zinc-400 shrink-0">
                    <div className="col-span-5 pl-4">Request Detail</div>
                    <div className="col-span-2 hidden md:block">Priority</div>
                    <div className="col-span-2 hidden md:block">Status</div>
                    <div className="col-span-2 hidden md:block">Requested On</div>
                    <div className="col-span-1 text-right pr-4">Handle</div>
                </div>

                <ScrollArea className="flex-1">
                    {isLoading ? (
                        <div className="divide-y divide-zinc-100">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="grid grid-cols-12 gap-4 p-6 items-center">
                                    <div className="col-span-5 flex gap-4 pl-4">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="flex-1"><Skeleton className="h-4 w-3/4 mb-2" /><Skeleton className="h-3 w-1/2" /></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : requests.length > 0 ? (
                        <div className="divide-y divide-zinc-100/60 pb-20">
                            {requests.map((request) => (
                                <div key={request.id} className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-zinc-50 transition-all group border-b border-transparent">
                                    {/* Info Block */}
                                    <div className="col-span-11 md:col-span-5 flex items-start gap-4 pl-2">
                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-2 ring-zinc-50 group-hover:ring-blue-100 transition-all shrink-0">
                                            <AvatarImage src={request.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(request.user?.firstName + ' ' + request.user?.lastName)}`} />
                                            <AvatarFallback className="bg-zinc-100 text-zinc-600 font-bold text-xs">{getInitials(`${request.user?.firstName} ${request.user?.lastName}`)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col min-w-0">
                                            <h3 className="font-bold text-zinc-900 text-sm truncate uppercase tracking-tight group-hover:text-blue-900 transition-all">{request.title}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">{request.user?.firstName} {request.user?.lastName}</span>
                                                <span className="text-[9px] text-zinc-300">•</span>
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-1 rounded">{request.category}</span>
                                            </div>
                                            {request.adminReply && (
                                                <div className="mt-2 text-[10px] text-zinc-500 italic flex items-center gap-1.5 line-clamp-1 opacity-70 group-hover:opacity-100 transition-all">
                                                    <MessageSquare className="h-3 w-3" />
                                                    Admin notes responded
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Priority */}
                                    <div className="col-span-2 hidden md:flex items-center">
                                        <Badge variant={getPriorityVariant(request.priority)} className="text-[9px] font-black uppercase tracking-widest border-2 shadow-none rounded h-5">
                                            {request.priority}
                                        </Badge>
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-2 hidden md:flex items-center">
                                        <Badge variant={getStatusVariant(request.status)} className="text-[9px] font-bold uppercase tracking-widest border-2 shadow-none rounded h-5">
                                            {request.status.replace("_", " ")}
                                        </Badge>
                                    </div>

                                    {/* Date */}
                                    <div className="col-span-2 hidden md:flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                        <Clock className="h-3.5 w-3.5" />
                                        {formatDate(request.createdAt)}
                                    </div>

                                    {/* Action */}
                                    <div className="col-span-1 flex justify-end pr-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => openUpdateDialog(request)}
                                            className="h-9 w-9 p-0 rounded-lg hover:bg-blue-900 hover:text-white border-2 border-transparent hover:border-blue-800 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <ClipboardList className="h-16 w-16 text-zinc-300 mb-6" />
                            <h3 className="text-xl font-bold tracking-tight text-zinc-900 mb-2">No resource requests</h3>
                            <p className="text-sm text-zinc-500 text-center max-w-sm">
                                No student has submitted a request that matches your current filter status.
                            </p>
                        </div>
                    )}
                </ScrollArea>

                {/* BOTTOM ROW: Z-Pattern End (Pagination) */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-auto mx-4 mb-4 bg-white p-3 rounded border-2 border-zinc-100 shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-2">
                            Page <span className="text-zinc-800">{pagination.page}</span> of <span className="text-zinc-800">{pagination.totalPages}</span>
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

            {/* MODALS remain focused but styled */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-xl border-2 border-zinc-100 shadow-2xl rounded-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-6 bg-zinc-50/80 border-b-2 border-zinc-100">
                        <DialogTitle className="text-xl font-bold text-zinc-900">Manage Material Request</DialogTitle>
                        <DialogDescription className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-1">
                            Set resolution status and provide student access instructions
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="max-h-[70vh]">
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Current Status</Label>
                                    <Select value={newStatus} onValueChange={(v) => setNewStatus(v as RequestStatus)}>
                                        <SelectTrigger className="h-11 border-2 border-zinc-100 shadow-none bg-white rounded focus:ring-0 uppercase text-xs font-bold tracking-wider text-zinc-700 hover:border-zinc-300 transition-all">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="border-2 border-zinc-100 shadow-xl rounded">
                                            {statusOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value} className="text-xs font-bold uppercase tracking-widest py-3">
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-2 sm:col-span-1 p-3 bg-blue-50/50 rounded border-2 border-blue-100/50">
                                    <p className="text-[9px] font-bold text-blue-900 uppercase tracking-widest mb-1">Requestor</p>
                                    <p className="font-bold text-xs text-blue-950 uppercase">{selectedRequest?.user?.firstName} {selectedRequest?.user?.lastName}</p>
                                    <p className="text-[9px] font-medium text-blue-800/60 mt-0.5">{selectedRequest?.category}</p>
                                </div>
                            </div>

                            {newStatus === "RESOLVED" && (
                                <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Access Instructions</Label>
                                        <Textarea
                                            placeholder="Provide instructions for the student (e.g. download link, bookshelf location)..."
                                            value={accessInstructions}
                                            onChange={(e) => setAccessInstructions(e.target.value)}
                                            rows={3}
                                            className="resize-none border-2 border-zinc-100 rounded focus-visible:ring-0 focus-visible:border-blue-900 transition-all font-medium text-sm p-4"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">External Source URL</Label>
                                            <div className="relative">
                                                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                                <Input
                                                    placeholder="https://..."
                                                    value={externalSourceUrl}
                                                    onChange={(e) => setExternalSourceUrl(e.target.value)}
                                                    className="pl-9 h-11 border-2 border-zinc-100 rounded focus-visible:ring-0 focus-visible:border-blue-900 transition-all font-medium text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Fulfilled ID</Label>
                                            <Input
                                                placeholder="Internal Resource UUID"
                                                value={fulfilledResourceId}
                                                onChange={(e) => setFulfilledResourceId(e.target.value)}
                                                className="h-11 border-2 border-zinc-100 rounded focus-visible:ring-0 focus-visible:border-blue-900 transition-all font-medium text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Internal Admin Notes</Label>
                                <Textarea
                                    placeholder="Private staff notes about this request processing..."
                                    value={adminReply}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    rows={4}
                                    className="resize-none border-2 border-zinc-100 rounded focus-visible:ring-0 focus-visible:border-blue-900 transition-all font-medium text-sm p-4"
                                />
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="p-6 bg-zinc-50/50 border-t-2 border-zinc-100">
                        <Button variant="ghost" className="rounded-xl font-bold text-zinc-500 hover:bg-zinc-100 h-11 px-6 shadow-none" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateRequest} disabled={isPending} className="rounded-xl font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors h-11 px-8 shadow-none border-2 border-transparent">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Commit Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
