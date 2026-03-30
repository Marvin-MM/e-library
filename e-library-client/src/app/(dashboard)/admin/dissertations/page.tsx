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
    FileText,
    BoxSelect,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Calendar,
    User,
} from "lucide-react";

export default function DissertationsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const { mutate: deleteResource } = useDeleteResource();

    const { data, isLoading } = useResources({
        resourceType: "DISSERTATION",
        page,
        search: search || undefined,
    });

    const dissertations = data?.data ?? [];
    const pagination = data?.pagination;

    return (
        <div className="flex flex-col gap-6 pb-6">

            {/* ── PAGE HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <motion.div
                    initial={{ y: -8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col gap-1.5"
                >
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-[10px] uppercase bg-blue-50 w-fit px-3 py-1 rounded tracking-wider">
                        <GraduationCap className="w-3 h-3" />
                        Research Archive
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                        Dissertations &amp; Theses
                    </h1>
                    <p className="text-zinc-500 text-sm max-w-sm">
                        Explore post-graduate research and final year doctoral defenses.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ y: -8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.05 }}
                    className="flex items-center gap-3 shrink-0"
                >
                    <div className="bg-white border-2 border-zinc-100 px-5 py-2.5 rounded text-center">
                        <p className="text-[10px] uppercase font-bold text-zinc-400">Total Records</p>
                        <p className="text-xl font-bold text-blue-900">{pagination?.total ?? 0}</p>
                    </div>
                    <CreateDissertationDialog />
                </motion.div>
            </div>

            {/* ── SEARCH ── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white border-2 border-zinc-100 rounded flex items-center gap-3 px-5 py-3.5"
            >
                <div className="w-9 h-9 rounded bg-zinc-50 flex items-center justify-center shrink-0 border-2 border-zinc-100">
                    <Search className="w-4 h-4 text-zinc-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Search</p>
                    <Input
                        placeholder="Search by topic, author, or keywords..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="border-0 p-0 h-auto focus-visible:ring-0 text-base font-bold placeholder:text-zinc-300 bg-transparent"
                    />
                </div>
                {search && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSearch(""); setPage(1); }}
                        className="text-[10px] font-bold text-zinc-400 hover:text-zinc-600 uppercase shrink-0"
                    >
                        Clear
                    </Button>
                )}
            </motion.div>

            {/* ── REPOSITORY GRID ── */}
            <div className="bg-white border-2 border-zinc-100 rounded overflow-hidden">
                {/* Grid header */}
                <div className="flex items-center justify-between px-6 py-4 border-b-2 border-zinc-50">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-tight flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5" />
                        Research Repository
                        {search && (
                            <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded normal-case tracking-normal ml-1">
                                &ldquo;{search}&rdquo;
                            </span>
                        )}
                    </h3>
                    {pagination && (
                        <span className="text-[10px] font-bold text-zinc-400">
                            {pagination.total} record{pagination.total !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>

                {/* Grid body */}
                <div className="p-6">
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="border-2 border-zinc-100 rounded p-4 flex flex-col gap-3">
                                    <Skeleton className="aspect-[4/3] w-full rounded" />
                                    <Skeleton className="h-3 w-1/2 rounded" />
                                    <Skeleton className="h-4 w-full rounded" />
                                    <Skeleton className="h-4 w-3/4 rounded" />
                                    <Skeleton className="h-3 w-2/3 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : dissertations.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                            {dissertations.map((doc, idx) => (
                                <motion.div
                                    key={doc.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03, duration: 0.25 }}
                                    className="relative bg-white border-2 border-zinc-100 rounded hover:border-blue-900 transition-colors group"
                                >
                                    {/* Full-card link */}
                                    <Link
                                        href={`/admin/dissertations/${doc.id}`}
                                        className="absolute inset-0 z-0 rounded"
                                        aria-label={`View dissertation: ${doc.title}`}
                                    />

                                    <div className="relative z-10 p-4 flex flex-col gap-3 pointer-events-none">
                                        {/* Cover image */}
                                        <div className="aspect-[4/3] bg-zinc-50 rounded border-2 border-zinc-100 overflow-hidden">
                                            {doc.coverImageUrl ? (
                                                <img
                                                    src={doc.coverImageUrl}
                                                    alt={`Cover for ${doc.title}`}
                                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-200 group-hover:text-blue-100 transition-colors">
                                                    <FileText className="w-10 h-10" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Meta */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase text-zinc-400 truncate max-w-[70%]">
                                                {doc.department ?? "General"}
                                            </span>
                                            <span className="text-[10px] font-bold text-blue-900 shrink-0">
                                                {doc.publicationYear}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h4 className="text-sm font-bold text-zinc-900 line-clamp-2 leading-snug group-hover:text-blue-900 transition-colors">
                                            {doc.title}
                                        </h4>

                                        {/* Author */}
                                        {doc.authors?.length > 0 && (
                                            <p className="text-[10px] font-bold text-zinc-400 flex items-center gap-1 truncate">
                                                <User className="w-3 h-3 shrink-0" />
                                                {doc.authors.join(", ")}
                                            </p>
                                        )}

                                        {/* Footer: delete */}
                                        <div className="pt-3 border-t-2 border-zinc-50 flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-zinc-300 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {doc.publicationYear}
                                            </span>
                                            <div className="pointer-events-auto">
                                                <DeleteConfirmationDialog
                                                    title="Delete Dissertation?"
                                                    description={`Permanently remove "${doc.title}". This action is irreversible.`}
                                                    onDelete={() => deleteResource(doc.id)}
                                                    trigger={
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-zinc-300 hover:text-red-600 hover:bg-red-50 transition-colors rounded"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            <span className="sr-only">Delete {doc.title}</span>
                                                        </Button>
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 gap-3 opacity-50">
                            <BoxSelect className="w-10 h-10 text-zinc-400" />
                            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">
                                No Dissertations Found
                            </h3>
                            {search && (
                                <Button
                                    variant="link"
                                    className="text-xs text-blue-600 font-bold p-0 h-auto uppercase"
                                    onClick={() => { setSearch(""); setPage(1); }}
                                >
                                    Clear search
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* ── PAGINATION — bottom of grid where it belongs ── */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t-2 border-zinc-50 bg-zinc-50/50">
                        <p className="text-[11px] font-bold text-zinc-400">
                            Page <span className="text-blue-900">{page}</span> of {pagination.totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={!pagination.hasPrev}
                                className="h-8 w-8 border-2 border-zinc-200 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all disabled:opacity-30 rounded"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span className="sr-only">Previous</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={!pagination.hasNext}
                                className="h-8 w-8 border-2 border-zinc-200 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all disabled:opacity-30 rounded"
                            >
                                <ChevronRight className="w-4 h-4" />
                                <span className="sr-only">Next</span>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}