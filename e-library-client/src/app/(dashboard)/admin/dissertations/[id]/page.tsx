"use client";

import { use, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { useResource, useDownloadResource, usePreviewResource } from "@/hooks/useResources";
import { formatDate } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import {
    ArrowLeft,
    User,
    Tag,
    Loader2,
    Eye,
    Info,
    MapPin,
    Download,
    Image as ImageIcon,
    GraduationCap,
    AlertTriangle,
    ExternalLink,
} from "lucide-react";

interface DissertationDetailPageProps {
    params: Promise<{ id: string }>;
}

// Inline preview can fail for two reasons:
// 1. The URL itself is unavailable / expired
// 2. The server sends X-Frame-Options: DENY (common with S3/Cloudinary direct links)
// We track both and show a fallback "Open in new tab" button.
type PreviewState =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "ready"; url: string }
    | { status: "error"; fallbackUrl: string };

export default function DissertationDetailPage({ params }: DissertationDetailPageProps) {
    const { id } = use(params);

    const { data: resource, isLoading, error } = useResource(id);
    const { mutate: download, isPending: isDownloading } = useDownloadResource();
    const { mutate: getPreview, isPending: isGettingPreview } = usePreviewResource();

    const [previewState, setPreviewState] = useState<PreviewState>({ status: "idle" });
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // ── Loading state ──────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 font-titillium pb-6">
                <Skeleton className="h-6 w-32 rounded" />
                <div className="flex flex-col md:flex-row gap-8">
                    <Skeleton className="w-44 md:w-56 aspect-[3/4] rounded-lg shrink-0" />
                    <div className="flex-1 flex flex-col gap-4 justify-center">
                        <Skeleton className="h-4 w-24 rounded" />
                        <Skeleton className="h-10 w-full rounded" />
                        <Skeleton className="h-10 w-3/4 rounded" />
                        <Skeleton className="h-4 w-40 rounded" />
                    </div>
                </div>
                <Skeleton className="h-16 w-full rounded" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="lg:col-span-2 h-64 rounded" />
                    <Skeleton className="h-40 rounded" />
                </div>
            </div>
        );
    }

    // ── Error / 404 state ──────────────────────────────────────────────────
    if (error || !resource) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] p-6 font-titillium">
                <div className="text-center bg-white border-2 border-zinc-100 p-12 rounded max-w-md w-full">
                    <GraduationCap className="w-14 h-14 text-zinc-100 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-zinc-900 mb-2 uppercase tracking-tight">
                        Dissertation Not Found
                    </h3>
                    <p className="text-xs font-bold text-zinc-400 uppercase mb-6">
                        The record you are looking for does not exist or has been removed.
                    </p>
                    <Button
                        asChild
                        className="bg-blue-900 hover:bg-zinc-900 text-white font-bold uppercase text-xs px-8 transition-colors"
                    >
                        <Link href="/admin/dissertations">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Return to Archive
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    // ── Derived state ──────────────────────────────────────────────────────
    const isDownloadable = resource.accessType === "DOWNLOADABLE";
    const isCampusOnly = resource.accessType === "CAMPUS_ONLY";
    const hasDigitalFile = !!(resource.s3Key || resource.cloudinaryUrl);

    const handleDownload = () => download(resource.id);

    const handlePreview = () => {
        setPreviewState({ status: "loading" });
        setIsPreviewOpen(true);

        getPreview(resource.id, {
            onSuccess: (data) => {
                // Use Google Docs viewer for Word documents to avoid iframe embedding issues
                const isDoc = resource.fileType?.includes("document");
                const url = isDoc
                    ? `https://docs.google.com/gview?url=${encodeURIComponent(data.url)}&embedded=true`
                    : data.url;
                setPreviewState({ status: "ready", url });
            },
            onError: () => {
                setPreviewState({ status: "error", fallbackUrl: "" });
            },
        });
    };

    const handlePreviewClose = () => {
        setIsPreviewOpen(false);
        // Reset after close animation
        setTimeout(() => setPreviewState({ status: "idle" }), 300);
    };

    // ── Sanitize description server-safely ────────────────────────────────
    // DOMPurify requires the browser DOM. Render description only on client.
    // We use a dangerouslySetInnerHTML wrapper that conditionally imports DOMPurify.
    const SafeDescription = ({ html }: { html: string }) => {
        if (typeof window === "undefined") return null;
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const DOMPurify = require("dompurify");
        return (
            <div
                className="prose prose-zinc max-w-none text-sm text-zinc-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
            />
        );
    };

    return (
        <div className="flex flex-col gap-6 font-titillium pb-6">

            {/* ── DOCUMENT PREVIEW DIALOG ── */}
            <Dialog open={isPreviewOpen} onOpenChange={handlePreviewClose}>
                <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden font-titillium border-0 shadow-2xl">
                    <DialogHeader className="p-4 border-b-2 border-zinc-100 shrink-0 bg-white">
                        <DialogTitle className="text-sm font-bold text-blue-900 flex items-center gap-2 truncate">
                            <Eye className="w-4 h-4 shrink-0" />
                            {resource.title}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 w-full bg-zinc-100 relative">
                        {previewState.status === "loading" && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
                            </div>
                        )}

                        {previewState.status === "ready" && (
                            <iframe
                                src={previewState.url}
                                className="w-full h-full border-0"
                                title={`Preview: ${resource.title}`}
                                // If the iframe fails to load (X-Frame-Options), show error fallback
                                onError={() =>
                                    setPreviewState({
                                        status: "error",
                                        fallbackUrl: previewState.url,
                                    })
                                }
                            />
                        )}

                        {previewState.status === "error" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
                                <AlertTriangle className="w-10 h-10 text-zinc-300" />
                                <p className="text-sm font-bold text-zinc-500">
                                    Preview blocked by the document host.
                                </p>
                                {previewState.fallbackUrl && (
                                    <Button
                                        asChild
                                        className="bg-blue-900 hover:bg-zinc-900 text-white font-bold uppercase text-xs px-6"
                                    >
                                        <a href={previewState.fallbackUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="w-3.5 h-3.5 mr-2" />
                                            Open in New Tab
                                        </a>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── BACK NAV ── */}
            <Button
                variant="ghost"
                asChild
                className="w-fit p-0 h-auto gap-1 text-[10px] font-bold text-blue-900 hover:bg-transparent uppercase tracking-wider"
            >
                <Link href="/admin/dissertations">
                    <ArrowLeft className="w-3 h-3" />
                    Back to Archive
                </Link>
            </Button>

            {/* ── HERO HEADER ── */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                <motion.div
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-36 md:w-52 shrink-0"
                >
                    <div className="aspect-[3/4] bg-zinc-50 border-2 border-zinc-100 rounded-lg overflow-hidden shadow-sm">
                        {resource.coverImageUrl ? (
                            <img
                                src={resource.coverImageUrl}
                                alt={`Cover for "${resource.title}"`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-200">
                                <ImageIcon className="w-10 h-10" />
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ x: -12, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.05 }}
                    className="flex flex-col justify-center gap-3"
                >
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase text-blue-900 bg-blue-50 px-2 py-1 rounded">
                            Thesis
                        </span>
                        <span className="text-[10px] font-bold uppercase text-zinc-400">
                            {formatDate(resource.createdAt)}
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 leading-tight">
                        {resource.title}
                    </h1>

                    {resource.authors?.length > 0 && (
                        <div className="flex items-center gap-2 text-zinc-500 text-sm font-bold">
                            <User className="h-4 w-4 shrink-0" />
                            <span>{resource.authors.join(", ")}</span>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* ── ACTION BAR ── */}
            <div className="bg-white border-2 border-zinc-100 rounded px-5 py-4 flex flex-wrap items-center gap-3">
                {isDownloadable && hasDigitalFile && (
                    <Button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="bg-blue-900 text-white h-11 px-6 font-bold text-xs uppercase rounded transition-colors hover:bg-zinc-900"
                    >
                        {isDownloading
                            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            : <Download className="mr-2 h-4 w-4" />}
                        Download PDF
                    </Button>
                )}

                {hasDigitalFile && (
                    <Button
                        onClick={handlePreview}
                        disabled={isGettingPreview}
                        variant="outline"
                        className="h-11 px-6 font-bold text-xs uppercase rounded border-2 border-zinc-200 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white transition-colors"
                    >
                        {isGettingPreview
                            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            : <Eye className="mr-2 h-4 w-4" />}
                        Read Document
                    </Button>
                )}

                {isCampusOnly && (
                    <div className="flex items-center gap-3 bg-zinc-50 border-2 border-zinc-100 px-5 py-3 rounded">
                        <MapPin className="h-4 w-4 text-blue-900 shrink-0" />
                        <div>
                            <p className="text-[10px] font-black uppercase text-blue-900">Physical Archive</p>
                            <p className="text-sm font-bold text-zinc-900">{resource.physicalLocation}</p>
                        </div>
                    </div>
                )}

                {!hasDigitalFile && !isCampusOnly && (
                    <p className="text-xs font-bold text-zinc-400 uppercase">
                        No digital file available for this record.
                    </p>
                )}
            </div>

            {/* ── MAIN CONTENT ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Abstract panel */}
                <div className="lg:col-span-2 bg-white border-2 border-zinc-100 rounded overflow-hidden">
                    <div className="px-6 py-4 border-b-2 border-zinc-50">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <Info className="w-3.5 h-3.5" />
                            Research Abstract
                        </h3>
                    </div>
                    <div className="p-6 space-y-6">
                        {resource.description ? (
                            <SafeDescription html={resource.description} />
                        ) : (
                            <p className="text-zinc-400 italic text-sm">No abstract available.</p>
                        )}

                        {resource.tags && resource.tags.length > 0 && (
                            <div className="pt-6 border-t-2 border-zinc-50">
                                <h4 className="text-[10px] font-black text-blue-900 uppercase mb-3 flex items-center gap-2">
                                    <Tag className="h-3 h-3" /> Keywords
                                </h4>
                                <div className="flex gap-2 flex-wrap">
                                    {resource.tags.map((tag: string) => (
                                        <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="bg-zinc-50 text-[10px] font-bold uppercase border border-zinc-100"
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Academic details sidebar */}
                <div className="space-y-4">
                    <div className="bg-white border-2 border-zinc-100 rounded overflow-hidden">
                        <div className="px-5 py-4 border-b-2 border-zinc-50">
                            <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                                Academic Details
                            </h4>
                        </div>
                        <div className="p-5 space-y-4">
                            {[
                                { label: "Defense Year", value: resource.publicationYear },
                                { label: "Department", value: resource.department },
                                { label: "Access Type", value: resource.accessType?.replace(/_/g, " ") },
                                resource.shelfNumber
                                    ? { label: "Shelf Number", value: resource.shelfNumber }
                                    : null,
                            ]
                                .filter(Boolean)
                                .map((row) => (
                                    <div key={row!.label} className="flex items-start justify-between gap-3">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase shrink-0">
                                            {row!.label}
                                        </span>
                                        <span className="text-xs font-bold text-zinc-900 text-right">
                                            {row!.value ?? "N/A"}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}