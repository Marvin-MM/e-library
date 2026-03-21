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

// UI Components
import { Card, CardContent } from "@/components/ui/card";
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
    Image as ImageIcon
} from "lucide-react";

interface ResourceDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function ResourceDetailPage({ params }: ResourceDetailPageProps) {
    const { id } = use(params);
    const { data: resource, isLoading, error } = useResource(id);
    const { mutate: download, isPending: isDownloading } = useDownloadResource();
    const { mutate: getPreview, isPending: isGettingPreview } = usePreviewResource();
    
    const { toggleFavourite } = useResourceStore();
    
    const [isFavorite, setIsFavorite] = useState(false);
    const [isCheckingFavorite, setIsCheckingFavorite] = useState(true);
    const { isStaffOrAdmin } = useRole();

    // Inline Preview State
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useEffect(() => {
        if (id) {
            resourcesApi.checkFavorite(id)
                .then(res => setIsFavorite(res.data?.isFavorite || false))
                .catch(() => setIsFavorite(false))
                .finally(() => setIsCheckingFavorite(false));
        }
    }, [id]);

    const handleToggleFavorite = async () => {
        const newState = await toggleFavourite(id, isFavorite);
        setIsFavorite(newState);
    };

    const handleDownload = () => {
        if (resource) download(resource.id);
    };

    const handlePreview = () => {
        if (!resource) return;
        
        getPreview(resource.id, {
            onSuccess: (data) => {
                let finalUrl = data.url;
                
                // If it's a DOCX file, route it through Google Docs Viewer for iframe rendering
                if (resource.fileType?.includes("wordprocessingml.document") || resource.fileType?.includes("officedocument")) {
                    finalUrl = `https://docs.google.com/gview?url=${encodeURIComponent(data.url)}&embedded=true`;
                }
                
                setPreviewUrl(finalUrl);
                setIsPreviewOpen(true);
            }
        });
    };

    // --- Loading State ---
    if (isLoading) {
        return (
            <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700 font-titillium">
                {/* Header Loading */}
                <div className="flex flex-col md:flex-row gap-6 shrink-0">
                    <Skeleton className="w-40 md:w-56 aspect-[3/4] rounded-lg shrink-0" />
                    <div className="flex-1 space-y-4 pt-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-3/4 max-w-xl" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="hidden lg:flex flex-col items-end pt-4 space-y-2">
                        <Skeleton className="h-16 w-48 rounded" />
                    </div>
                </div>
                {/* Content Loading */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
                    <Skeleton className="lg:col-span-2 h-20 rounded" />
                    <Skeleton className="h-20 rounded" />
                </div>
                <div className="flex-1 bg-white border-2 border-zinc-100 rounded p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                        <Skeleton className="lg:col-span-2 h-full rounded w-full" />
                        <Skeleton className="h-full rounded w-full" />
                    </div>
                </div>
            </div>
        );
    }

    // --- Error State ---
    if (error || !resource) {
        return (
            <div className="max-w-5xl mx-auto py-12">
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="bg-muted/30 p-6 rounded-full mb-4">
                            <FileText className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Resource not found</h3>
                        <p className="text-muted-foreground mb-6 text-center max-w-md">
                            The resource you&apos;re looking for doesn&apos;t exist, has been removed, or requires specific permissions.
                        </p>
                        <Button asChild>
                            <Link href="/resources">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Resources
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // --- Derived State ---
    const isDownloadable = resource.accessType === "DOWNLOADABLE";
    const isCampusOnly = resource.accessType === "CAMPUS_ONLY";
    const isViewOnly = resource.accessType === "VIEW_ONLY";
    const hasDigitalFile = !!resource.cloudinaryUrl || !!resource.s3Key;

    const formatFileSize = (bytes?: number | null) => {
        if (!bytes) return "Unknown Size";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700 font-titillium">

            {/* INLINE PREVIEW DIALOG */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 overflow-hidden font-titillium border-0 shadow-2xl">
                    <DialogHeader className="p-4 border-b-2 border-zinc-100 shrink-0 bg-white z-10">
                        <DialogTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
                            <Eye className="w-5 h-5" />
                            Preview: {resource.title}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 w-full bg-zinc-100 relative">
                        {previewUrl ? (
                            <iframe 
                                src={previewUrl} 
                                className="w-full h-full border-0"
                                title={`Preview of ${resource.title}`}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full gap-4">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
                                <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest animate-pulse">
                                    Decrypting & Loading Secure Viewer...
                                </p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* TOP ACTIONS ROW */}
            <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
                <Button variant="ghost" asChild className="w-fit p-0 h-auto gap-1 text-[10px] font-bold text-blue-900 hover:bg-transparent uppercase">
                    <Link href="/resources">
                        <ArrowLeft className="w-3 h-3" />
                        Back to Library
                    </Link>
                </Button>

                <div className="flex items-center gap-2">
                    {isStaffOrAdmin && (
                        <Button className="h-8 px-4 rounded bg-zinc-900 hover:bg-blue-900 text-white shrink-0 font-bold text-[10px] uppercase tracking-wider transition-all">
                            <FileText className="w-3 h-3 mr-2" />
                            Edit Metadata
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        onClick={handleToggleFavorite}
                        disabled={isCheckingFavorite}
                        className={`h-8 px-4 rounded shrink-0 font-bold text-[10px] uppercase tracking-wider transition-all border-2 ${isFavorite ? 'border-red-600 text-red-600 bg-red-50 hover:bg-white' : 'border-zinc-100 text-zinc-500 hover:text-red-600 hover:border-red-100'}`}
                    >
                        <Heart className={`w-3 h-3 mr-2 ${isFavorite ? 'fill-red-600' : ''}`} />
                        {isFavorite ? 'Saved' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* HEADER: Cover Image & Title Layout */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 shrink-0 relative">
                
                {/* 1. Cover Image */}
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-40 md:w-56 shrink-0 z-10">
                    <div className="aspect-[3/4] bg-zinc-50 border-2 border-zinc-100 rounded-lg overflow-hidden relative shadow-sm group">
                        {resource.coverImageUrl ? (
                            <img src={resource.coverImageUrl} alt={`Cover for ${resource.title}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300">
                                <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">No Cover</span>
                            </div>
                        )}
                        {/* Access Type Badge overlay on Cover */}
                        <div className="absolute top-2 right-2">
                            <span className="text-[9px] font-black uppercase text-blue-900 bg-white/90 backdrop-blur px-2 py-1 rounded shadow-sm border border-zinc-100">
                                {resource.accessType?.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Title & Meta */}
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex-1 flex flex-col justify-center gap-3 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-blue-900 bg-blue-50 px-2 py-1 rounded">
                            {resource.category?.replace('_', ' ') || 'GENERAL'}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-zinc-400">
                            {formatDate(resource.createdAt)}
                        </span>
                        
                        {/* Admin Approval Status */}
                        {isStaffOrAdmin && resource.approvalStatus && (
                            <Badge variant={resource.approvalStatus === 'APPROVED' ? 'default' : resource.approvalStatus === 'PENDING' ? 'secondary' : 'destructive'} 
                                   className="h-6 text-[9px] uppercase font-black tracking-widest rounded ml-auto">
                                {resource.approvalStatus === 'APPROVED' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                {resource.approvalStatus === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                                {resource.approvalStatus === 'REJECTED' && <ShieldAlert className="w-3 h-3 mr-1" />}
                                {resource.approvalStatus}
                            </Badge>
                        )}
                    </div>

                    <h1 className="text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight leading-tight">
                        {resource.title}
                    </h1>

                    {resource.authors && resource.authors.length > 0 && (
                        <div className="flex items-center gap-2 text-zinc-500 text-sm font-bold uppercase tracking-wide">
                            <User className="h-4 w-4" />
                            <span>By {resource.authors.join(", ")}</span>
                        </div>
                    )}
                </motion.div>

                {/* 3. Stats (Right Aligned on large screens) */}
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="hidden lg:flex flex-col items-end py-2">
                    <div className="bg-white border-2 border-zinc-100 p-2 flex items-center gap-4 rounded">
                        <div className="px-6 py-2 border-r-2 border-zinc-100 last:border-0 text-center">
                            <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Downloads</p>
                            <p className="text-2xl font-black text-blue-900">{resource.downloadCount || 0}</p>
                        </div>
                        <div className="px-6 py-2 border-r-2 border-zinc-100 last:border-0 text-center">
                            <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Views</p>
                            <p className="text-2xl font-black text-zinc-900">{resource.viewCount || 0}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* MIDDLE ROW: Primary Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0 mt-2">
                <div className="lg:col-span-2 bg-white border-2 border-zinc-100 p-4 lg:p-6 rounded flex flex-wrap items-center gap-4">
                    
                    {isDownloadable && hasDigitalFile && (
                        <Button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="bg-blue-900 hover:bg-zinc-900 text-white h-12 px-8 font-bold text-xs uppercase tracking-wider rounded transition-all"
                        >
                            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Download File
                        </Button>
                    )}

                    {(isViewOnly || isDownloadable) && hasDigitalFile && (
                        <Button
                            onClick={handlePreview}
                            disabled={isGettingPreview}
                            variant="outline"
                            className="border-2 border-zinc-100 h-12 px-8 font-bold text-xs uppercase rounded transition-all text-zinc-600 hover:text-blue-900"
                        >
                            {isGettingPreview ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Eye className="mr-2 h-4 w-4" />
                            )}
                            Preview Document
                        </Button>
                    )}

                    {isCampusOnly && (
                        <div className="flex items-center gap-4 bg-zinc-50 border-2 border-zinc-100 px-6 py-3 rounded w-full sm:w-auto">
                            <Library className="h-5 w-5 text-blue-900" />
                            <div>
                                <p className="text-[10px] font-black uppercase text-blue-900 leading-none">Physical Asset</p>
                                <p className="text-sm font-bold text-zinc-900">Visit {resource.physicalLocation}</p>
                            </div>
                        </div>
                    )}

                    <Button variant="ghost" size="icon" className="h-12 w-12 border-2 border-zinc-100 rounded text-zinc-400 hover:text-blue-900 ml-auto sm:ml-0 shrink-0">
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>

                <div className="bg-white border-2 border-zinc-100 p-4 rounded flex items-center gap-4">
                    <div className="w-12 h-12 rounded bg-zinc-50 border-2 border-zinc-100 flex items-center justify-center overflow-hidden shrink-0">
                        {resource.uploadedBy?.avatar ? (
                            <img src={resource.uploadedBy.avatar} className="w-full h-full object-cover" alt="Uploader avatar" />
                        ) : (
                            <User className="w-6 h-6 text-zinc-300" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase text-blue-900 leading-none mb-1 tracking-widest">Contributed By</p>
                        <p className="text-sm font-bold text-zinc-900 truncate">{resource.uploadedBy?.name || 'Staff Member'}</p>
                        <p className="text-[10px] font-bold text-zinc-400 truncate">{resource.uploadedBy?.email || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* BOTTOM ROW: Content & Metadata */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Content Pane */}
                <div className="lg:col-span-2 bg-white border-2 border-zinc-100 rounded flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b-2 border-zinc-50 shrink-0">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-tight flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Executive Summary
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {resource.description ? (
                            <div
                                className="prose prose-zinc max-w-none text-sm font-bold text-zinc-500 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(resource.description) }}
                            />
                        ) : (
                            <p className="text-sm font-bold text-zinc-400 italic">No synopsis provided for this material.</p>
                        )}

                        {resource.tags && resource.tags.length > 0 && (
                            <div className="mt-8 pt-6 border-t-2 border-zinc-50">
                                <h4 className="text-[10px] font-black tracking-widest text-blue-900 uppercase mb-4 flex items-center gap-2">
                                    <Tag className="h-3 w-3" />
                                    Knowledge Markers
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {resource.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="px-3 py-1 bg-zinc-50 text-zinc-600 border-none font-bold text-[10px] uppercase tracking-wider">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Metadata Sidebar */}
                <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar pb-6">
                    
                    {/* Conditional: Show Physical Location Details OR Digital File Details */}
                    {isCampusOnly ? (
                        <div className="bg-white border-2 border-zinc-100 rounded overflow-hidden">
                            <div className="bg-blue-900 p-4 border-b-2 border-zinc-50">
                                <h4 className="text-[10px] font-black tracking-widest uppercase text-blue-100 flex items-center gap-2">
                                    <MapPin className="w-3 h-3" />
                                    Location Details
                                </h4>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Campus Area</span>
                                    <span className="text-xs font-black text-blue-900 text-right">{resource.physicalLocation || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Shelf</span>
                                    <span className="text-xs font-bold text-zinc-900">{resource.shelfNumber || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Copies</span>
                                    <span className="text-xs font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                                        {resource.copies || 1}
                                    </span>
                                </div>
                                {resource.availabilityNotes && (
                                    <div className="pt-3 mt-1 border-t-2 border-dashed border-zinc-50">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Librarian Notes</span>
                                        <p className="text-[11px] font-bold text-zinc-600 leading-tight">{resource.availabilityNotes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : hasDigitalFile ? (
                        <div className="bg-white border-2 border-zinc-100 rounded">
                            <div className="p-4 border-b-2 border-zinc-50">
                                <h4 className="text-[10px] font-black tracking-widest uppercase text-zinc-900">Digital Asset</h4>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Format</span>
                                    <span className="text-xs font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                                        {resource.fileType?.includes("pdf") ? "PDF" : resource.fileType?.includes("document") ? "DOCX" : "FILE"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Size</span>
                                    <span className="text-xs font-bold text-zinc-900">{formatFileSize(resource.fileSize)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Storage</span>
                                    <span className="text-[10px] font-black text-zinc-500 uppercase">{resource.storageType || "SECURE"}</span>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Common Identifiers */}
                    {(resource.isbn || resource.issn || resource.publicationYear) && (
                        <div className="bg-white border-2 border-zinc-100 rounded p-4 space-y-4">
                            {resource.publicationYear && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Published</span>
                                    <span className="text-xs font-bold text-zinc-900">{resource.publicationYear}</span>
                                </div>
                            )}
                            {resource.isbn && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">ISBN</span>
                                    <span className="text-[11px] font-mono font-bold text-zinc-900">{resource.isbn}</span>
                                </div>
                            )}
                            {resource.issn && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">ISSN</span>
                                    <span className="text-[11px] font-mono font-bold text-zinc-900">{resource.issn}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Associated Courses */}
                    {resource.courses && resource.courses.length > 0 && (
                        <div className="bg-white border-2 border-zinc-100 rounded">
                            <div className="p-4 border-b-2 border-zinc-50">
                                <h4 className="text-[10px] font-black tracking-widest uppercase text-zinc-900">Academic Context</h4>
                            </div>
                            <div className="p-2 space-y-1">
                                {resource.courses.map((cr: any) => (
                                    <Link key={cr.course.id} href={`/courses/${cr.course.id}`}>
                                        <div className="p-3 rounded hover:bg-zinc-50 flex items-center gap-3 transition-colors group">
                                            <div className="w-8 h-8 rounded bg-white border-2 border-zinc-100 flex items-center justify-center shrink-0 group-hover:border-blue-900 transition-colors">
                                                <BookOpen className="w-4 h-4 text-zinc-300 group-hover:text-blue-900" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black tracking-widest uppercase text-blue-900 leading-none mb-1">{cr.course.code}</p>
                                                <p className="text-xs font-bold text-zinc-900 truncate group-hover:text-blue-900 transition-colors">{cr.course.name}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}