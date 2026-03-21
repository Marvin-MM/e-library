"use client";

import { use, useState } from "react";
import Link from "next/link";
import DOMPurify from "dompurify";
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
    Share2,
    MapPin,
    Download,
    Image as ImageIcon
} from "lucide-react";

interface DissertationDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function DissertationDetailPage({ params }: DissertationDetailPageProps) {
    const { id } = use(params);
    const { data: resource, isLoading, error } = useResource(id);
    const { mutate: download, isPending: isDownloading } = useDownloadResource();
    const { mutate: getPreview, isPending: isGettingPreview } = usePreviewResource();

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    if (isLoading) return <div className="p-8">Loading dissertation...</div>;
    if (error || !resource) return <div className="p-8">Dissertation not found.</div>;

    const handleDownload = () => download(resource.id);

    const handlePreview = () => {
        getPreview(resource.id, {
            onSuccess: (data) => {
                let finalUrl = data.url;
                if (resource.fileType?.includes("document")) {
                    finalUrl = `https://docs.google.com/gview?url=${encodeURIComponent(data.url)}&embedded=true`;
                }
                setPreviewUrl(finalUrl);
                setIsPreviewOpen(true);
            }
        });
    };

    const isDownloadable = resource.accessType === "DOWNLOADABLE";
    const isCampusOnly = resource.accessType === "CAMPUS_ONLY";
    const hasDigitalFile = !!resource.s3Key || !!resource.cloudinaryUrl;

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700 font-titillium">
            
            {/* INLINE PREVIEW DIALOG */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 overflow-hidden font-titillium border-0 shadow-2xl">
                    <DialogHeader className="p-4 border-b-2 border-zinc-100 shrink-0 bg-white">
                        <DialogTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
                            <Eye className="w-5 h-5" /> Abstract & Text: {resource.title}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 w-full bg-zinc-100">
                        {previewUrl ? (
                            <iframe src={previewUrl} className="w-full h-full border-0" />
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <div className="shrink-0">
                <Button variant="ghost" asChild className="p-0 h-auto text-[10px] font-bold text-blue-900 uppercase mb-4">
                    <Link href="/admin/dissertations"><ArrowLeft className="w-3 h-3 mr-1" /> Back to Archive</Link>
                </Button>
            </div>

            {/* HEADER */}
            <div className="flex flex-col md:flex-row gap-8 shrink-0 relative">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-40 md:w-56 shrink-0 z-10">
                    <div className="aspect-[3/4] bg-zinc-50 border-2 border-zinc-100 rounded-lg overflow-hidden relative shadow-sm">
                        {resource.coverImageUrl ? (
                            <img src={resource.coverImageUrl} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-300"><ImageIcon className="w-12 h-12 opacity-50" /></div>
                        )}
                    </div>
                </motion.div>

                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex-1 flex flex-col justify-center gap-3">
                    <div className="flex gap-2">
                        <span className="text-[10px] font-black uppercase text-blue-900 bg-blue-50 px-2 py-1 rounded">Thesis</span>
                        <span className="text-[10px] font-bold uppercase text-zinc-400">{formatDate(resource.createdAt)}</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-zinc-900 leading-tight">{resource.title}</h1>
                    <div className="flex items-center gap-2 text-zinc-500 text-sm font-bold uppercase">
                        <User className="h-4 w-4" /> <span>Researcher: {resource.authors?.join(", ")}</span>
                    </div>
                </motion.div>
            </div>

            {/* ACTIONS */}
            <div className="bg-white border-2 border-zinc-100 p-4 rounded flex flex-wrap items-center gap-4 shrink-0 mt-4">
                {isDownloadable && hasDigitalFile && (
                    <Button onClick={handleDownload} disabled={isDownloading} className="bg-blue-900 text-white h-12 px-8 font-bold text-xs uppercase rounded">
                        {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} Download PDF
                    </Button>
                )}
                {hasDigitalFile && (
                    <Button onClick={handlePreview} disabled={isGettingPreview} variant="outline" className="h-12 px-8 font-bold text-xs uppercase rounded">
                        {isGettingPreview ? <Loader2 className="mr-2 animate-spin" /> : <Eye className="mr-2" />} Read Document
                    </Button>
                )}
                {isCampusOnly && (
                    <div className="flex items-center gap-4 bg-zinc-50 border-2 border-zinc-100 px-6 py-3 rounded">
                        <MapPin className="h-5 w-5 text-blue-900" />
                        <div>
                            <p className="text-[10px] font-black uppercase text-blue-900">Physical Archive</p>
                            <p className="text-sm font-bold text-zinc-900">{resource.physicalLocation}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border-2 border-zinc-100 rounded flex flex-col overflow-hidden">
                    <div className="p-6 border-b-2 border-zinc-50 shrink-0">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-2"><Info className="w-4 h-4" /> Research Abstract</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {resource.description ? (
                            <div className="prose prose-zinc max-w-none text-sm font-bold text-zinc-500" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(resource.description) }} />
                        ) : <p className="text-zinc-400 italic">No abstract available.</p>}
                        
                        {resource.tags && resource.tags.length > 0 && (
                            <div className="mt-8 pt-6 border-t-2 border-zinc-50">
                                <h4 className="text-[10px] font-black text-blue-900 uppercase mb-4 flex items-center gap-2"><Tag className="h-3 w-3" /> Keywords</h4>
                                <div className="flex gap-2 flex-wrap">
                                    {resource.tags.map(tag => <Badge key={tag} variant="secondary" className="bg-zinc-50 text-[10px] uppercase">{tag}</Badge>)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6 overflow-y-auto custom-scrollbar pb-6">
                    <div className="bg-white border-2 border-zinc-100 rounded p-4">
                        <h4 className="text-[10px] font-black uppercase text-zinc-900 border-b-2 border-zinc-50 pb-2 mb-4">Academic Details</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between"><span className="text-[10px] font-bold text-zinc-400 uppercase">Defense Year</span><span className="text-xs font-bold">{resource.publicationYear || "N/A"}</span></div>
                            <div className="flex justify-between"><span className="text-[10px] font-bold text-zinc-400 uppercase">Department</span><span className="text-xs font-bold">{resource.department || "N/A"}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}