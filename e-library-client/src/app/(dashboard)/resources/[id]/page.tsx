"use client";


import { useResource, useDownloadResource } from "@/hooks/useResources";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
    FileText,
    Download,
    ArrowLeft,
    User,
    Tag,
    BookOpen,
    Loader2,
    Eye,
    ExternalLink,
    Info,
    FileType,
    HardDrive,
    Share2,
    Clock,
    MapPin,
    Hash,
    Heart,
} from "lucide-react";
import Link from "next/link";
import { formatDate, getInitials } from "@/lib/utils";
import DOMPurify from "dompurify";
import Image from "next/image";
import { use, useEffect, useState } from "react";
import { useRole } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { useResourceStore } from "@/stores/resourceStore";
import { resourcesApi } from "@/lib/api";

interface ResourceDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function ResourceDetailPage({ params }: ResourceDetailPageProps) {
    // Unwrap the params with use() (Next.js 15)
    const { id } = use(params);
    const { data: resource, isLoading, error } = useResource(id);
    const { mutate: download, isPending: isDownloading } = useDownloadResource();
    const { toggleFavourite } = useResourceStore();
    const [isFavorite, setIsFavorite] = useState(false);
    const [isCheckingFavorite, setIsCheckingFavorite] = useState(true);
    const { isStaffOrAdmin } = useRole();

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

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700 font-titillium">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-full max-w-sm" />
                    </div>
                    <div className="flex justify-end items-center">
                        <Skeleton className="h-20 w-48 rounded" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
                    <Skeleton className="lg:col-span-2 h-20 rounded" />
                    <Skeleton className="h-20 rounded" />
                </div>
                <div className="flex-1 bg-white border-2 border-zinc-100 rounded p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-32 rounded w-full" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

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
                            The resource you&apos;re looking for doesn&apos;t exist or has been removed.
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

    const handleDownload = () => {
        download(resource.id);
    };

    const isDownloadable = resource.accessType === "DOWNLOADABLE";
    const isCampusOnly = resource.accessType === "CAMPUS_ONLY";
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700 font-titillium">

            {/* TOP ROW: Z-Pattern Start */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                <div className="flex flex-col justify-center gap-2">
                    <div className="flex items-center justify-between mb-2">
                        <Button variant="ghost" asChild className="w-fit p-0 h-auto gap-1 text-[10px] font-bold text-blue-900 hover:bg-transparent uppercase">
                            <Link href="/resources">
                                <ArrowLeft className="w-3 h-3" />
                                Back to Library
                            </Link>
                        </Button>
                        {isStaffOrAdmin && (
                            <Button className="h-8 px-4 rounded bg-zinc-900 hover:bg-blue-900 text-white shrink-0 font-bold text-[10px] uppercase tracking-wider transition-all">
                                <FileText className="w-3 h-3 mr-2" />
                                Modify Resource
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={handleToggleFavorite}
                            disabled={isCheckingFavorite}
                            className={`h-8 px-4 rounded shrink-0 font-bold text-[10px] uppercase tracking-wider transition-all border-2 ${isFavorite ? 'border-red-600 text-red-600 bg-red-50 hover:bg-white' : 'border-zinc-100 text-zinc-500 hover:text-red-600 hover:border-red-200'} ml-2`}
                        >
                            <Heart className={`w-3 h-3 mr-2 ${isFavorite ? 'fill-red-600' : ''}`} />
                            {isFavorite ? 'Saved' : 'Save'}
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-blue-900 bg-blue-50 px-2 py-1 rounded">
                            {resource.category}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-zinc-400">
                            {formatDate(resource.updatedAt)}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight leading-tight">
                        {resource.title}
                    </h1>
                    {resource.authors && resource.authors.length > 0 && (
                        <div className="flex items-center gap-2 text-zinc-400 text-sm font-bold mt-1">
                            <User className="h-4 w-4" />
                            <span>by {resource.authors.join(", ")}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end">
                    <div className="bg-white border-2 border-zinc-100 p-2 flex items-center gap-4 rounded">
                        <div className="px-6 py-2 border-r-2 border-zinc-100 last:border-0 text-center">
                            <p className="text-[10px] uppercase font-bold text-zinc-400">Downloads</p>
                            <p className="text-2xl font-bold text-blue-900">{resource.downloadCount}</p>
                        </div>
                        <div className="px-6 py-2 border-r-2 border-zinc-100 last:border-0 text-center">
                            <p className="text-[10px] uppercase font-bold text-zinc-400">Views</p>
                            <p className="text-2xl font-bold text-zinc-900">{resource.viewCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* MIDDLE ROW: Primary Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
                <div className="lg:col-span-2 bg-white border-2 border-zinc-100 p-6 rounded flex flex-wrap items-center gap-4">
                    {isDownloadable ? (
                        <Button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="bg-blue-900 hover:bg-zinc-900 text-white h-12 px-8 font-bold text-xs uppercase tracking-wider rounded transition-all"
                        >
                            {isDownloading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="mr-2 h-4 w-4" />
                            )}
                            Download Repository
                        </Button>
                    ) : isCampusOnly ? (
                        <div className="flex items-center gap-4 bg-zinc-50 border-2 border-zinc-100 px-6 py-3 rounded">
                            <MapPin className="h-5 w-5 text-zinc-900" />
                            <div>
                                <p className="text-[10px] font-black uppercase text-blue-900 leading-none">Campus Only</p>
                                <p className="text-sm font-bold text-zinc-900">Shelf {resource.shelfNumber}</p>
                            </div>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            className="border-2 border-zinc-100 h-12 px-8 font-bold text-xs uppercase rounded transition-all"
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            View in Library
                        </Button>
                    )}

                    {resource.cloudinaryUrl && (
                        <Button
                            asChild
                            variant="outline"
                            className="border-2 border-zinc-100 h-12 px-8 font-bold text-xs uppercase rounded transition-all hidden sm:flex"
                        >
                            <a
                                href={resource.cloudinaryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Preview
                            </a>
                        </Button>
                    )}

                    <Button variant="ghost" size="icon" className="h-12 w-12 border-2 border-zinc-100 rounded text-zinc-400 hover:text-blue-900">
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>

                <div className="bg-white border-2 border-zinc-100 p-4 rounded flex items-center gap-4">
                    <div className="w-12 h-12 rounded bg-zinc-50 border-2 border-zinc-100 flex items-center justify-center overflow-hidden shrink-0">
                        {resource.uploadedBy?.avatar ? (
                            <img src={resource.uploadedBy.avatar} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-6 h-6 text-zinc-300" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase text-blue-900 leading-none mb-1">Uploaded By</p>
                        <p className="text-sm font-bold text-zinc-900 truncate">{resource.uploadedBy?.name || 'Academic Staff'}</p>
                        <p className="text-[10px] font-bold text-zinc-400 truncate">{resource.uploadedBy?.email}</p>
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
                        <div
                            className="prose prose-zinc max-w-none text-sm font-bold text-zinc-500 leading-relaxed"
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(resource.description || ""),
                            }}
                        />

                        {resource.tags && resource.tags.length > 0 && (
                            <div className="mt-8 pt-6 border-t-2 border-zinc-50">
                                <h4 className="text-[10px] font-bold text-blue-900 uppercase mb-4 flex items-center gap-2">
                                    <Tag className="h-3 w-3" />
                                    Knowledge Markers
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {resource.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="px-3 py-1 bg-zinc-50 text-zinc-600 border-none font-bold text-[10px] uppercase">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Metadata & Related Actions */}
                <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                    {/* File Info */}
                    <div className="bg-white border-2 border-zinc-100 rounded">
                        <div className="p-4 border-b-2 border-zinc-50">
                            <h4 className="text-[10px] font-black uppercase text-zinc-900">Repository Details</h4>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase">Format</span>
                                <span className="text-xs font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                                    {resource.fileType?.split("/")[1]?.toUpperCase() || "PDF"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase">Size</span>
                                <span className="text-xs font-bold text-zinc-900">{formatFileSize(resource.fileSize || 0)}</span>
                            </div>
                            {(resource.isbn || resource.issn) && (
                                <div className="flex items-center justify-between pt-2 border-t-2 border-dashed border-zinc-50">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Identifier</span>
                                    <span className="text-[10px] font-mono font-bold text-zinc-900">{resource.isbn || resource.issn}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Associated Courses */}
                    {resource.courses && resource.courses.length > 0 && (
                        <div className="bg-white border-2 border-zinc-100 rounded">
                            <div className="p-4 border-b-2 border-zinc-50">
                                <h4 className="text-[10px] font-black uppercase text-zinc-900">Academic Context</h4>
                            </div>
                            <div className="p-2 space-y-1">
                                {resource.courses.map((course: any) => (
                                    <Link key={course.id} href={`/courses/${course.id}`}>
                                        <div className="p-3 rounded hover:bg-zinc-50 flex items-center gap-3 transition-colors group">
                                            <div className="w-8 h-8 rounded bg-white border-2 border-zinc-100 flex items-center justify-center shrink-0 group-hover:border-blue-900">
                                                <BookOpen className="w-4 h-4 text-zinc-300 group-hover:text-blue-900" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black uppercase text-blue-900 leading-none mb-1">{course.code}</p>
                                                <p className="text-xs font-bold text-zinc-900 truncate group-hover:text-blue-900 transition-colors">{course.name}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Access Alert */}
                    {isCampusOnly && (
                        <div className="bg-blue-900 p-6 rounded text-white flex flex-col gap-3">
                            <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <h4 className="text-sm font-bold uppercase tracking-tight">On-Campus Availability</h4>
                            <p className="text-[10px] leading-relaxed text-blue-200 font-bold uppercase">
                                This resource is restricted to physical campus access only. Visit the Research Hub at {resource.physicalLocation || "Desk 01"}.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
