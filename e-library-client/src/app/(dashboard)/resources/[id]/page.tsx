"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import DOMPurify from "dompurify";
import { motion } from "framer-motion";

// Hooks
import { useResource, useDownloadResource, usePreviewResource } from "@/hooks/useResources";
import { useResourceStore } from "@/stores/resourceStore";
import { useRole } from "@/hooks/useAuth";
import { resourcesApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

// UI
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Icons
import {
    FileText,
    Download,
    ArrowLeft,
    User,
    Tag,
    BookOpen,
    Loader2,
    Eye,
    Info,
    Share2,
    MapPin,
    Heart,
    ShieldAlert,
    CheckCircle2,
    Clock,
    Library,
    Image as ImageIcon,
    AlertTriangle,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Converts SNAKE_CASE → "Snake Case" — handles all underscores, not just the first */
const toLabel = (s?: string | null) =>
    s ? s.split("_").map((w) => w[0] + w.slice(1).toLowerCase()).join(" ") : "—";

const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "Unknown";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

// ── Animation preset ──────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
    initial: { y: 12, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] as const },
});

// ── Metadata row ──────────────────────────────────────────────────────────────
function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 py-2.5 border-b border-zinc-50 last:border-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 shrink-0">{label}</span>
            <span className="text-xs font-bold text-zinc-900 text-right">{value}</span>
        </div>
    );
}

// ── Sidebar card ──────────────────────────────────────────────────────────────
function SideCard({
    title,
    icon: Icon,
    accent = false,
    children,
}: {
    title: string;
    icon: React.ElementType;
    accent?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white border-2 border-zinc-100 rounded-lg overflow-hidden">
            <div className={`flex items-center gap-2 px-4 py-3 border-b-2 border-zinc-100 ${accent ? "bg-blue-900" : "bg-zinc-50/70"}`}>
                <Icon className={`w-3.5 h-3.5 ${accent ? "text-blue-300" : "text-zinc-400"}`} />
                <h4 className={`text-[9px] font-black uppercase tracking-widest ${accent ? "text-blue-100" : "text-zinc-600"}`}>
                    {title}
                </h4>
            </div>
            <div className="px-4 py-1">{children}</div>
        </div>
    );
}

// ── Approval badge ────────────────────────────────────────────────────────────
function ApprovalBadge({ status }: { status: string }) {
    const map: Record<string, { icon: React.ElementType; cls: string }> = {
        APPROVED: { icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
        PENDING:  { icon: Clock,        cls: "bg-amber-50  text-amber-600  border-amber-100"  },
        REJECTED: { icon: ShieldAlert,  cls: "bg-red-50    text-red-500    border-red-100"    },
    };
    const { icon: Icon, cls } = map[status] ?? map.PENDING;
    return (
        <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${cls}`}>
            <Icon className="w-3 h-3" />
            {status}
        </span>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
interface ResourceDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function ResourceDetailPage({ params }: ResourceDetailPageProps) {
    const { id } = use(params);
    const { data: resource, isLoading, error } = useResource(id);
    const { mutate: download, isPending: isDownloading } = useDownloadResource();
    const { mutate: getPreview, isPending: isGettingPreview } = usePreviewResource();
    const { toggleFavourite } = useResourceStore();
    const { isStaffOrAdmin } = useRole();

    const [isFavorite, setIsFavorite]             = useState(false);
    const [isCheckingFavorite, setIsCheckingFavorite] = useState(true);
    const [previewUrl, setPreviewUrl]             = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen]       = useState(false);

    useEffect(() => {
        if (!id) return;
        resourcesApi
            .checkFavorite(id)
            .then((res) => setIsFavorite(res.data?.isFavorite ?? false))
            .catch(() => setIsFavorite(false))
            .finally(() => setIsCheckingFavorite(false));
    }, [id]);

    const handleToggleFavorite = async () => {
        const next = await toggleFavourite(id, isFavorite);
        setIsFavorite(next);
    };

    const handleDownload = () => { if (resource) download(resource.id); };

    const handlePreview = () => {
        if (!resource) return;
        getPreview(resource.id, {
            onSuccess: (data) => {
                const isDocx =
                    resource.fileType?.includes("wordprocessingml") ||
                    resource.fileType?.includes("officedocument");
                setPreviewUrl(
                    isDocx
                        ? `https://docs.google.com/gview?url=${encodeURIComponent(data.url)}&embedded=true`
                        : data.url
                );
                setIsPreviewOpen(true);
            },
        });
    };

    // ── Loading ──────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 font-titillium pb-8 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row gap-6">
                    <Skeleton className="w-36 sm:w-48 aspect-[3/4] rounded-lg shrink-0" />
                    <div className="flex-1 space-y-4 pt-2">
                        <Skeleton className="h-3 w-28 rounded-full" />
                        <Skeleton className="h-9 w-3/4 rounded" />
                        <Skeleton className="h-9 w-1/2 rounded" />
                        <Skeleton className="h-4 w-40 rounded" />
                    </div>
                </div>
                <Skeleton className="h-16 w-full rounded-lg" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="lg:col-span-2 h-64 rounded-lg" />
                    <div className="space-y-4">
                        <Skeleton className="h-32 rounded-lg" />
                        <Skeleton className="h-24 rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────────────────────
    if (error || !resource) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-300 font-titillium">
                <div className="w-14 h-14 rounded-xl bg-zinc-50 border-2 border-zinc-100 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-zinc-300" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-black uppercase tracking-tight text-zinc-400 mb-1">Resource Not Found</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-300 max-w-xs mx-auto">
                        This resource doesn't exist, was removed, or requires specific permissions.
                    </p>
                </div>
                <Button
                    asChild
                    variant="outline"
                    className="h-9 px-5 text-[10px] font-black uppercase tracking-widest border-2 border-zinc-100 hover:border-zinc-300 text-zinc-500 hover:text-zinc-900"
                >
                    <Link href="/resources">
                        <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                        Back to Library
                    </Link>
                </Button>
            </div>
        );
    }

    // ── Derived state ────────────────────────────────────────────────────────
    const isDownloadable = resource.accessType === "DOWNLOADABLE";
    const isCampusOnly   = resource.accessType === "CAMPUS_ONLY";
    const isViewOnly     = resource.accessType === "VIEW_ONLY";
    const hasDigitalFile = !!(resource.cloudinaryUrl || resource.s3Key);
    const fileFormat     = resource.fileType?.includes("pdf")
        ? "PDF"
        : resource.fileType?.includes("document")
        ? "DOCX"
        : "FILE";

    return (
        <>
            {/* ── Preview dialog ─────────────────────────────────────────── */}
            <Dialog open={isPreviewOpen} onOpenChange={(o) => { setIsPreviewOpen(o); if (!o) setPreviewUrl(null); }}>
                <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 overflow-hidden font-titillium border-0 shadow-2xl">
                    <DialogHeader className="px-5 py-3.5 border-b-2 border-zinc-100 shrink-0 bg-white z-10">
                        <DialogTitle className="text-sm font-black text-blue-900 flex items-center gap-2 truncate">
                            <Eye className="w-4 h-4 shrink-0" />
                            {resource.title}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 w-full bg-zinc-100 relative overflow-hidden">
                        {previewUrl ? (
                            <iframe
                                src={previewUrl}
                                className="w-full h-full border-0"
                                title={`Preview of ${resource.title}`}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full gap-3">
                                <Loader2 className="w-7 h-7 animate-spin text-blue-900" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 animate-pulse">
                                    Loading secure viewer…
                                </p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Page ──────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-6 font-titillium pb-8 animate-in fade-in duration-500">

                {/* Back + actions */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button
                        variant="ghost"
                        asChild
                        className="p-0 h-auto gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-900 hover:bg-transparent hover:text-zinc-900"
                    >
                        <Link href="/resources">
                            <ArrowLeft className="w-3 h-3" />
                            Back to Library
                        </Link>
                    </Button>

                    <div className="flex items-center gap-2">
                        {isStaffOrAdmin && (
                            <Button className="h-8 px-4 rounded-lg bg-zinc-900 hover:bg-blue-900 text-white font-black text-[9px] uppercase tracking-widest transition-colors gap-1.5">
                                <FileText className="w-3 h-3" />
                                Edit Metadata
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={handleToggleFavorite}
                            disabled={isCheckingFavorite}
                            className={`h-8 px-4 rounded-lg font-black text-[9px] uppercase tracking-widest border-2 transition-all ${
                                isFavorite
                                    ? "border-red-200 text-red-600 bg-red-50 hover:bg-white"
                                    : "border-zinc-100 text-zinc-400 hover:text-red-500 hover:border-red-100"
                            }`}
                        >
                            <Heart className={`w-3 h-3 mr-1.5 ${isFavorite ? "fill-red-500" : ""}`} />
                            {isFavorite ? "Saved" : "Save"}
                        </Button>
                    </div>
                </div>

                {/* Cover + title + stats */}
                <div className="flex flex-col sm:flex-row gap-5 sm:gap-8">

                    {/* Cover */}
                    <motion.div {...fadeUp(0)} className="w-32 sm:w-44 shrink-0">
                        <div className="aspect-[3/4] bg-zinc-50 border-2 border-zinc-100 rounded-lg overflow-hidden relative shadow-sm group">
                            {resource.coverImageUrl ? (
                                <img
                                    src={resource.coverImageUrl}
                                    alt={`Cover for ${resource.title}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-200">
                                    <ImageIcon className="w-10 h-10 mb-1.5" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">No Cover</span>
                                </div>
                            )}
                            {/* Access type badge */}
                            <div className="absolute top-2 left-2">
                                <span className="text-[8px] font-black uppercase tracking-widest text-blue-900 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full border border-zinc-100 shadow-sm">
                                    {toLabel(resource.accessType)}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Title block */}
                    <motion.div {...fadeUp(0.06)} className="flex-1 flex flex-col justify-center gap-3 py-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-900 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                                {toLabel(resource.category) || "General"}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                                {formatDate(resource.createdAt)}
                            </span>
                            {isStaffOrAdmin && resource.approvalStatus && (
                                <ApprovalBadge status={resource.approvalStatus} />
                            )}
                        </div>

                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight leading-tight">
                            {resource.title}
                        </h1>

                        {resource.authors?.length > 0 && (
                            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                                <User className="h-3.5 w-3.5 shrink-0" />
                                By {resource.authors.join(", ")}
                            </div>
                        )}

                        {/* Stats — visible on all screens here, not hidden on mobile */}
                        <div className="flex items-center gap-3 mt-1">
                            <div className="bg-white border-2 border-zinc-100 rounded-lg px-4 py-2.5 text-center">
                                <p className="text-[9px] uppercase font-black tracking-widest text-zinc-400">Downloads</p>
                                <p className="text-xl font-black text-blue-900 tabular-nums leading-tight">
                                    {(resource.downloadCount ?? 0).toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-white border-2 border-zinc-100 rounded-lg px-4 py-2.5 text-center">
                                <p className="text-[9px] uppercase font-black tracking-widest text-zinc-400">Views</p>
                                <p className="text-xl font-black text-zinc-900 tabular-nums leading-tight">
                                    {(resource.viewCount ?? 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Primary action bar */}
                <motion.div
                    {...fadeUp(0.1)}
                    className="bg-white border-2 border-zinc-100 rounded-lg p-4 flex flex-wrap items-center gap-3"
                >
                    {isDownloadable && hasDigitalFile && (
                        <Button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="bg-blue-900 hover:bg-zinc-900 text-white h-10 px-6 font-black text-[10px] uppercase tracking-widest rounded-lg transition-colors gap-2"
                        >
                            {isDownloading
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <Download className="h-3.5 w-3.5" />}
                            Download File
                        </Button>
                    )}

                    {(isViewOnly || isDownloadable) && hasDigitalFile && (
                        <Button
                            onClick={handlePreview}
                            disabled={isGettingPreview}
                            variant="outline"
                            className="border-2 border-zinc-100 h-10 px-6 font-black text-[10px] uppercase tracking-widest rounded-lg text-zinc-600 hover:text-blue-900 hover:border-blue-200 transition-all gap-2"
                        >
                            {isGettingPreview
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <Eye className="h-3.5 w-3.5" />}
                            Preview
                        </Button>
                    )}

                    {isCampusOnly && (
                        <div className="flex items-center gap-3 bg-zinc-50 border-2 border-zinc-100 rounded-lg px-4 py-2.5">
                            <Library className="h-4 w-4 text-blue-900 shrink-0" />
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-blue-900 leading-none">
                                    Physical Asset
                                </p>
                                <p className="text-xs font-bold text-zinc-700 mt-0.5">
                                    {resource.physicalLocation || "Contact library"}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Uploader — inline in action bar on mobile, sidebar on lg */}
                    <div className="flex items-center gap-3 ml-auto lg:hidden">
                        <div className="w-8 h-8 rounded-lg bg-zinc-50 border-2 border-zinc-100 flex items-center justify-center overflow-hidden shrink-0">
                            {resource.uploadedBy?.avatar
                                ? <img src={resource.uploadedBy.avatar} className="w-full h-full object-cover" alt="" />
                                : <User className="w-4 h-4 text-zinc-300" />}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] font-black uppercase tracking-widest text-blue-900 leading-none mb-0.5">
                                Contributor
                            </p>
                            <p className="text-xs font-bold text-zinc-700 truncate max-w-[120px]">
                                {resource.uploadedBy?.name ?? "Staff"}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 border-2 border-zinc-100 rounded-lg text-zinc-300 hover:text-blue-900 hover:border-blue-200 transition-all shrink-0 hidden sm:flex"
                    >
                        <Share2 className="h-4 w-4" />
                    </Button>
                </motion.div>

                {/* Content + sidebar */}
                <motion.div
                    {...fadeUp(0.14)}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                    {/* ── Description pane ── */}
                    <div className="lg:col-span-2 bg-white border-2 border-zinc-100 rounded-lg overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-3.5 border-b-2 border-zinc-100 bg-zinc-50/50">
                            <Info className="w-3.5 h-3.5 text-zinc-400" />
                            <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-600">
                                Summary
                            </h3>
                        </div>

                        <div className="p-5">
                            {resource.description ? (
                                <div
                                    className="prose prose-zinc prose-sm max-w-none text-zinc-500 leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(resource.description),
                                    }}
                                />
                            ) : (
                                <p className="text-sm font-bold text-zinc-300 italic">
                                    No description provided.
                                </p>
                            )}

                            {resource.tags?.length > 0 && (
                                <div className="mt-6 pt-5 border-t-2 border-zinc-50">
                                    <h4 className="text-[9px] font-black tracking-widest text-blue-900 uppercase mb-3 flex items-center gap-1.5">
                                        <Tag className="h-3 h-3" />
                                        Tags
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {resource.tags.map((tag: string) => (
                                            <span
                                                key={tag}
                                                className="px-2.5 py-1 bg-zinc-50 border-2 border-zinc-100 text-zinc-500 font-bold text-[9px] uppercase tracking-widest rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="flex flex-col gap-4">

                        {/* Contributor — lg only (mobile version is in action bar) */}
                        <div className="hidden lg:flex items-center gap-3 bg-white border-2 border-zinc-100 rounded-lg p-4">
                            <div className="w-11 h-11 rounded-lg bg-zinc-50 border-2 border-zinc-100 flex items-center justify-center overflow-hidden shrink-0">
                                {resource.uploadedBy?.avatar
                                    ? <img src={resource.uploadedBy.avatar} className="w-full h-full object-cover" alt="" />
                                    : <User className="w-5 h-5 text-zinc-300" />}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-widest text-blue-900 leading-none mb-1">
                                    Contributed By
                                </p>
                                <p className="text-sm font-bold text-zinc-900 truncate">
                                    {resource.uploadedBy?.name ?? "Staff Member"}
                                </p>
                                <p className="text-[9px] font-bold text-zinc-400 truncate">
                                    {resource.uploadedBy?.email ?? "N/A"}
                                </p>
                            </div>
                        </div>

                        {/* Campus-only: location details */}
                        {isCampusOnly && (
                            <SideCard title="Location Details" icon={MapPin} accent>
                                <MetaRow label="Campus Area" value={resource.physicalLocation ?? "N/A"} />
                                <MetaRow label="Shelf"       value={resource.shelfNumber ?? "N/A"} />
                                <MetaRow
                                    label="Copies"
                                    value={
                                        <span className="text-[9px] font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                            {resource.copies ?? 1}
                                        </span>
                                    }
                                />
                                {resource.availabilityNotes && (
                                    <div className="py-2.5 border-t border-zinc-50 mt-1">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1">
                                            Librarian Notes
                                        </span>
                                        <p className="text-[11px] font-bold text-zinc-600 leading-snug">
                                            {resource.availabilityNotes}
                                        </p>
                                    </div>
                                )}
                            </SideCard>
                        )}

                        {/* Digital file details */}
                        {!isCampusOnly && hasDigitalFile && (
                            <SideCard title="Digital Asset" icon={FileText}>
                                <MetaRow
                                    label="Format"
                                    value={
                                        <span className="text-[9px] font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                            {fileFormat}
                                        </span>
                                    }
                                />
                                <MetaRow label="Size"    value={formatFileSize(resource.fileSize)} />
                                <MetaRow label="Storage" value={
                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                                        {resource.storageType ?? "Secure"}
                                    </span>
                                } />
                            </SideCard>
                        )}

                        {/* Identifiers */}
                        {(resource.isbn || resource.issn || resource.publicationYear) && (
                            <SideCard title="Identifiers" icon={Info}>
                                {resource.publicationYear && (
                                    <MetaRow label="Published" value={resource.publicationYear} />
                                )}
                                {resource.isbn && (
                                    <MetaRow
                                        label="ISBN"
                                        value={<span className="font-mono">{resource.isbn}</span>}
                                    />
                                )}
                                {resource.issn && (
                                    <MetaRow
                                        label="ISSN"
                                        value={<span className="font-mono">{resource.issn}</span>}
                                    />
                                )}
                            </SideCard>
                        )}

                        {/* Associated courses */}
                        {(resource.courses?.length ?? 0) > 0 && (
                            <SideCard title="Academic Context" icon={BookOpen}>
                                <div className="-mx-4">
                                    {resource.courses?.map((cr: any) => (
                                        <Link
                                            key={cr.course.id}
                                            href={`/courses/${cr.course.id}`}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors group border-b border-zinc-50 last:border-0"
                                        >
                                            <div className="w-7 h-7 rounded-md bg-white border-2 border-zinc-100 flex items-center justify-center shrink-0 group-hover:border-blue-200 transition-colors">
                                                <BookOpen className="w-3.5 h-3.5 text-zinc-300 group-hover:text-blue-600 transition-colors" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-black tracking-widest uppercase text-blue-900 leading-none mb-0.5">
                                                    {cr.course.code}
                                                </p>
                                                <p className="text-xs font-bold text-zinc-700 truncate group-hover:text-blue-900 transition-colors">
                                                    {cr.course.name}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </SideCard>
                        )}
                    </div>
                </motion.div>
            </div>
        </>
    );
}