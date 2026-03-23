"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useResources, useDeleteResource } from "@/hooks/useResources";
import { CreateDissertationDialog } from "@/components/dissertations/CreateDissertationDialog";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import {
    GraduationCap,
    Search,
    BookOpen,
    Download,
    FileText,
    BoxSelectIcon,
    ChevronLeft,
    ChevronRight,
    Trash2,
} from "lucide-react";

export default function DissertationsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const { mutate: deleteResource } = useDeleteResource();

    // Fetch ONLY Dissertations using your existing API hook
    const { data, isLoading } = useResources({ 
        resourceType: "DISSERTATION", 
        page, 
        search: search || undefined 
    });

    const dissertations = data?.data || [];
    const pagination = data?.pagination;

    if (isLoading && dissertations.length === 0) {
        return (
            <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700 font-titillium">
                <Skeleton className="h-32 w-full rounded" />
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-40 rounded" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700 font-titillium">
            
            {/* Header section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col justify-center gap-2">
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase bg-blue-50 w-fit px-3 py-1 rounded">
                        <GraduationCap className="w-3 h-3" />
                        Research Archive
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
                        Dissertations & Theses
                    </h1>
                    <p className="text-zinc-500 text-sm max-w-sm">
                        Explore post-graduate research and final year doctoral defenses.
                    </p>
                </motion.div>

                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center justify-end">
                    <div className="bg-white border-2 border-zinc-100 p-2 flex items-center gap-4 rounded">
                        <div className="px-6 py-2 border-r-2 border-zinc-100 last:border-0 text-center">
                            <p className="text-[10px] uppercase font-bold text-zinc-400">Total Records</p>
                            <p className="text-2xl font-bold text-blue-900">{pagination?.total || 0}</p>
                        </div>
                        <CreateDissertationDialog />
                    </div>
                </motion.div>
            </div>

            {/* Search Bar */}
            <div className="bg-white border-2 border-zinc-100 p-4 rounded flex items-center gap-4 shrink-0">
                <Search className="w-5 h-5 text-zinc-400 ml-2" />
                <Input
                    placeholder="Search by research topic, author, or keywords..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1); // Reset to page 1 on search
                    }}
                    className="border-0 p-0 h-auto focus-visible:ring-0 text-base focus:border-b-black rounded-none shadow-sm placeholder:text-zinc-300 bg-transparent"
                />
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-hidden">
                <div className="bg-white border-2 border-zinc-100 rounded flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b-2 border-zinc-50 shrink-0">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-tight flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Research Repository
                        </h3>
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost" size="icon"
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={!pagination.hasPrev}
                                    className="border-2 border-zinc-100 h-8 w-8 hover:bg-zinc-900 hover:text-white transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="text-[10px] font-bold text-blue-900 px-2">{page} / {pagination.totalPages}</span>
                                <Button
                                    variant="ghost" size="icon"
                                    onClick={() => setPage(page + 1)}
                                    disabled={!pagination.hasNext}
                                    className="border-2 border-zinc-100 h-8 w-8 hover:bg-zinc-900 hover:text-white transition-all"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {dissertations.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {dissertations.map((doc) => (
                                    <div key={doc.id} className="bg-white border-2 border-zinc-100 p-4 rounded flex flex-col justify-between hover:border-blue-900 transition-all group h-full relative">
                                        <Link href={`/admin/dissertations/${doc.id}`} className="absolute inset-0 z-0" />
                                        <div className="z-10 pointer-events-none flex-1 flex flex-col justify-between">
                                            <div className="space-y-3">
                                                <div className="aspect-[4/3] bg-zinc-50 rounded border-2 border-zinc-100 overflow-hidden relative">
                                                    {doc.coverImageUrl ? (
                                                        <img src={doc.coverImageUrl} alt={doc.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-100 group-hover:text-blue-50 transition-colors">
                                                            <FileText className="w-12 h-12" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[10px] font-bold uppercase text-zinc-400 truncate">{doc.department || 'General'}</span>
                                                        <span className="text-[10px] font-bold text-blue-900">{doc.publicationYear}</span>
                                                    </div>
                                                    <h4 className="text-sm font-bold text-zinc-900 line-clamp-2 leading-tight group-hover:text-blue-900">{doc.title}</h4>
                                                    <p className="text-xs text-zinc-500 mt-1 truncate">By {doc.authors?.join(", ")}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-3 border-t-2 border-zinc-50 flex items-center justify-between text-zinc-300">
                                                <DeleteConfirmationDialog 
                                                    title="Delete Dissertation?"
                                                    description={`You are about to permanently remove "${doc.title}". This action is irreversible.`}
                                                    onDelete={() => deleteResource(doc.id)}
                                                    trigger={
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50/50 transition-colors pointer-events-auto"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-20 grayscale opacity-50">
                                <BoxSelectIcon className="w-10 h-10 text-zinc-400 mb-6" />
                                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight mb-2">No Dissertations Found</h3>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}