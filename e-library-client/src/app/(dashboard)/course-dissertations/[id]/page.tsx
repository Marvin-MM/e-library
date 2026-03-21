"use client";

import { use, useState } from "react";
import Link from "next/link";
import DOMPurify from "dompurify";
import { motion } from "framer-motion";

import { useResource, useDownloadResource, usePreviewResource } from "@/hooks/useResources";
import { formatDate } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { ArrowLeft, User, Tag, Loader2, Eye, Info, MapPin, Download, Image as ImageIcon, BookOpen } from "lucide-react";

interface CourseDissertationDetailProps {
    params: Promise<{ id: string }>;
}

export default function CourseDissertationDetail({ params }: CourseDissertationDetailProps) {
    const { id } = use(params);
    const { data: resource, isLoading, error } = useResource(id);
    const { mutate: download, isPending: isDownloading } = useDownloadResource();
    const { mutate: getPreview, isPending: isGettingPreview } = usePreviewResource();

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    if (isLoading) return <div className="p-8 font-titillium font-bold uppercase text-zinc-400 animate-pulse">Loading Thesis Record...</div>;
    if (error || !resource) return <div className="p-8">Record not found.</div>;

    const handleDownload = () => download(resource.id);

    const handlePreview = () => {
        getPreview(resource.id, {
            onSuccess: (data) => {
                let finalUrl = data.url;
                if (resource.fileType?.includes("document") || resource.fileType?.includes("officedocument")) {
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
            
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 overflow-hidden font-titillium border-0 shadow-2xl">
                    <DialogHeader className="p-4 border-b-2 border-zinc-100 shrink-0 bg-white">
                        <DialogTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
                            <Eye className="w-5 h-5" /> Thesis Viewer: {resource.title}
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
                    <Link href="/course-dissertations"><ArrowLeft className="w-3 h-3 mr-1" /> Back to Course Archive</Link>
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
                        <span className="text-[10px] font-black uppercase text-blue-900 bg-blue-50 px-2 py-1 rounded">{resource.category}</span>
                        <span className="text-[10px] font-bold uppercase text-zinc-400">{formatDate(resource.createdAt)}</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-zinc-900 leading-tight">{resource.title}</h1>
                    <div className="flex items-center gap-2 text-zinc-500 text-sm font-bold uppercase tracking-widest">
                        <User className="h-4 w-4" /> <span>Researcher: {resource.authors?.join(", ")}</span>
                    </div>
                </motion.div>
            </div>

            {/* ACTIONS */}
            <div className="bg-white border-2 border-zinc-100 p-4 rounded flex flex-wrap items-center gap-4 shrink-0 mt-4">
                {isDownloadable && hasDigitalFile && (
                    <Button onClick={handleDownload} disabled={isDownloading} className="bg-blue-900 hover:bg-zinc-900 transition-colors text-white h-12 px-8 font-bold text-xs uppercase rounded tracking-widest">
                        {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} Download Source
                    </Button>
                )}
                {hasDigitalFile && (
                    <Button onClick={handlePreview} disabled={isGettingPreview} variant="outline" className="border-2 border-zinc-100 h-12 px-8 font-bold text-xs uppercase rounded tracking-widest hover:text-blue-900">
                        {isGettingPreview ? <Loader2 className="mr-2 animate-spin" /> : <Eye className="mr-2" />} Inspect Document
                    </Button>
                )}
                {isCampusOnly && (
                    <div className="flex items-center gap-4 bg-zinc-50 border-2 border-zinc-100 px-6 py-3 rounded">
                        <MapPin className="h-5 w-5 text-blue-900" />
                        <div>
                            <p className="text-[10px] font-black uppercase text-blue-900">Physical Hardcopy</p>
                            <p className="text-sm font-bold text-zinc-900">{resource.physicalLocation}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border-2 border-zinc-100 rounded flex flex-col overflow-hidden">
                    <div className="p-6 border-b-2 border-zinc-50 shrink-0">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Info className="w-4 h-4" /> Defense Abstract</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {resource.description ? (
                            <div className="prose prose-zinc max-w-none text-sm font-bold text-zinc-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(resource.description) }} />
                        ) : <p className="text-zinc-400 italic font-bold">No abstract provided for this research.</p>}
                        
                        {resource.tags && resource.tags.length > 0 && (
                            <div className="mt-8 pt-6 border-t-2 border-zinc-50">
                                <h4 className="text-[10px] font-black tracking-widest text-blue-900 uppercase mb-4 flex items-center gap-2"><Tag className="h-3 w-3" /> Core Competencies</h4>
                                <div className="flex gap-2 flex-wrap">
                                    {resource.tags.map(tag => <Badge key={tag} variant="secondary" className="bg-zinc-50 text-[10px] font-bold uppercase tracking-widest">{tag}</Badge>)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6 overflow-y-auto custom-scrollbar pb-6 pr-2">
                    <div className="bg-white border-2 border-zinc-100 rounded p-4">
                        <h4 className="text-[10px] font-black tracking-widest uppercase text-zinc-900 border-b-2 border-zinc-50 pb-2 mb-4">Defense Metadata</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Year</span><span className="text-xs font-black bg-zinc-50 px-2 py-0.5 rounded text-zinc-900">{resource.publicationYear || "N/A"}</span></div>
                            <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Department</span><span className="text-xs font-bold text-zinc-900 truncate ml-4">{resource.department || "N/A"}</span></div>
                        </div>
                    </div>
                    
                    {/* Courses Attached */}
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