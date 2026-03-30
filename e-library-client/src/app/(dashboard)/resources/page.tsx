"use client";

import { useEffect } from "react";
import { useResourceStore } from "@/stores/resourceStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { CreateResourceDialog } from "@/components/resources/CreateResourceDialog";

import {
    FileText,
    Search,
    Filter,
    Download,
    ChevronLeft,
    ChevronRight,
    Layers,
    GraduationCap,
    BoxSelect,
    BookOpen,
    Heart,
    Trash2,
    X,
} from "lucide-react";
import { useRole } from "@/hooks/useAuth";
import { useDeleteResource } from "@/hooks/useResources";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { resourceTypeOptions, categoryOptions } from "@/schemas/resources";
import type { ResourceType } from "@/types/api";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Animation helper ─────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
    initial: { y: 12, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] as const },
});

// ── Resource card skeleton ───────────────────────────────────────────────────
function ResourceCardSkeleton() {
    return (
        <div className="bg-white border-2 border-zinc-100 rounded-lg p-4 flex flex-col gap-3">
            <Skeleton className="aspect-[4/3] w-full rounded-md" />
            <div className="space-y-1.5">
                <Skeleton className="h-2.5 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="pt-2 border-t-2 border-zinc-50 flex justify-between items-center">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-2.5 w-12" />
            </div>
        </div>
    );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function ResourcesPage() {
    const { isStaffOrAdmin, isAdmin } = useRole();
    const { mutate: deleteResource } = useDeleteResource();

    const {
        resources,
        resourcesPagination: pagination,
        isResourcesLoading: isLoading,
        filters,
        setFilters,
        resetFilters,
        fetchResources,
    } = useResourceStore();

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    const hasActiveFilters = !!(filters.search || filters.type || filters.category);
    const currentPage = filters.page || 1;

    return (
        <div className="flex flex-col gap-6 pb-8">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <motion.div
                {...fadeUp(0)}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
            >
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1.5 text-blue-900 font-black text-[10px] uppercase tracking-widest bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                            <FileText className="w-3 h-3" />
                            Knowledge Base
                        </span>
                        <Button
                            asChild
                            variant="outline"
                            className="h-6 px-3 text-[9px] font-black uppercase tracking-widest rounded-full border-2 border-zinc-100 text-zinc-400 hover:text-red-500 hover:border-red-100 transition-colors"
                        >
                            <Link href="/students/favourites">
                                <Heart className="w-3 h-3 mr-1" />
                                My Favourites
                            </Link>
                        </Button>
                    </div>
                    <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
                        Resource Library
                    </h1>
                    <p className="text-sm text-zinc-400 max-w-sm">
                        Academic materials, research journals, and verified resources.
                    </p>
                </div>

                <div className="flex items-center gap-3 self-start">
                    <div className="bg-white border-2 border-zinc-100 rounded-lg px-5 py-3 text-center shadow-sm">
                        <p className="text-[9px] uppercase font-black tracking-widest text-zinc-400">Total</p>
                        <p className="text-2xl font-black text-blue-900 tabular-nums leading-tight">
                            {isLoading ? "—" : (pagination?.total ?? 0).toLocaleString()}
                        </p>
                    </div>
                    {isStaffOrAdmin && <CreateResourceDialog />}
                </div>
            </motion.div>

            {/* ── Filters ────────────────────────────────────────────────── */}
            <motion.div
                {...fadeUp(0.07)}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
            >
                {/* Search */}
                <div className="sm:col-span-2 bg-white border-2 border-zinc-100 rounded-lg flex items-center gap-3 px-4 focus-within:border-zinc-300 transition-colors">
                    <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                    <Input
                        placeholder="Search by title, author, keyword…"
                        value={filters.search || ""}
                        onChange={(e) => setFilters({ search: e.target.value, page: 1 })}
                        className="border-0 p-0 h-12 focus-visible:ring-0 text-sm placeholder:text-zinc-300 bg-transparent shadow-none"
                    />
                    {filters.search && (
                        <button
                            onClick={() => setFilters({ search: undefined, page: 1 })}
                            className="text-zinc-300 hover:text-zinc-600 transition-colors shrink-0"
                            aria-label="Clear search"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Type filter */}
                <div className="bg-white border-2 border-zinc-100 rounded-lg">
                    <Select
                        value={filters.type || "all-types"}
                        onValueChange={(v) =>
                            setFilters({ type: v === "all-types" ? undefined : (v as ResourceType), page: 1 })
                        }
                    >
                        <SelectTrigger className="border-0 h-12 font-bold text-xs uppercase tracking-widest text-zinc-700 px-4 focus:ring-0 gap-2">
                            <Layers className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-zinc-100 shadow-none">
                            <SelectItem value="all-types" className="font-bold text-xs uppercase">All Types</SelectItem>
                            {resourceTypeOptions.map((o) => (
                                <SelectItem key={o.value} value={o.value} className="font-bold text-xs uppercase text-zinc-600">
                                    {o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Category filter */}
                <div className="bg-white border-2 border-zinc-100 rounded-lg">
                    <Select
                        value={filters.category || "all-categories"}
                        onValueChange={(v) =>
                            setFilters({ category: v === "all-categories" ? undefined : v, page: 1 })
                        }
                    >
                        <SelectTrigger className="border-0 h-12 font-bold text-xs uppercase tracking-widest text-zinc-700 px-4 focus:ring-0 gap-2">
                            <Filter className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-zinc-100 shadow-none">
                            <SelectItem value="all-categories" className="font-bold text-xs uppercase">All Categories</SelectItem>
                            {categoryOptions.map((o) => (
                                <SelectItem key={o.value} value={o.value} className="font-bold text-xs uppercase text-zinc-600">
                                    {o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </motion.div>

            {/* ── Active filter chips ─────────────────────────────────────── */}
            {hasActiveFilters && (
                <motion.div {...fadeUp(0.1)} className="flex items-center gap-2 flex-wrap -mt-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Filtering:</span>
                    {filters.search && (
                        <FilterChip label={`"${filters.search}"`} onRemove={() => setFilters({ search: undefined, page: 1 })} />
                    )}
                    {filters.type && (
                        <FilterChip label={filters.type} onRemove={() => setFilters({ type: undefined, page: 1 })} />
                    )}
                    {filters.category && (
                        <FilterChip label={filters.category} onRemove={() => setFilters({ category: undefined, page: 1 })} />
                    )}
                    <button
                        onClick={resetFilters}
                        className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                    >
                        Clear all
                    </button>
                </motion.div>
            )}

            {/* ── Resource grid ───────────────────────────────────────────── */}
            <motion.div {...fadeUp(0.13)} className="bg-white border-2 border-zinc-100 rounded-lg shadow-sm overflow-hidden">

                {/* Grid header + pagination */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-zinc-100 bg-zinc-50/50">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-600 flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                        {isLoading
                            ? "Loading…"
                            : `${resources.length} of ${pagination?.total ?? 0} resources`}
                    </h3>

                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setFilters({ page: Math.max(1, currentPage - 1) })}
                                disabled={!pagination.hasPrev}
                                className="h-7 w-7 border-2 border-zinc-100 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all disabled:opacity-30 rounded-md"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </Button>
                            <span className="text-[10px] font-black text-blue-900 px-2 tabular-nums">
                                {currentPage} / {pagination.totalPages}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setFilters({ page: currentPage + 1 })}
                                disabled={!pagination.hasNext}
                                className="h-7 w-7 border-2 border-zinc-100 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all disabled:opacity-30 rounded-md"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    )}
                </div>

                <div className="p-5">
                    {/* Loading */}
                    {isLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <ResourceCardSkeleton key={i} />
                            ))}
                        </div>
                    )}

                    {/* Populated */}
                    {!isLoading && resources.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                            {resources.map((resource, i) => (
                                <ResourceCard
                                    key={resource.id}
                                    resource={resource}
                                    index={i}
                                    isAdmin={isAdmin}
                                    onDelete={() => deleteResource(resource.id)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Empty */}
                    {!isLoading && resources.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-300">
                            <BoxSelect className="w-10 h-10" />
                            <div className="text-center">
                                <p className="text-sm font-black text-zinc-400 uppercase tracking-tight mb-1">No Records Found</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest max-w-[200px] mx-auto">
                                    {hasActiveFilters
                                        ? "Your filters didn't match anything."
                                        : "No resources have been added yet."}
                                </p>
                            </div>
                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-[10px] font-black uppercase tracking-widest border-2 border-zinc-100 text-zinc-500 hover:border-zinc-300 hover:text-zinc-900 h-8 px-4"
                                    onClick={resetFilters}
                                >
                                    Reset Filters
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Bottom pagination — repeated for long grids */}
                {!isLoading && pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 px-5 py-4 border-t-2 border-zinc-100 bg-zinc-50/50">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFilters({ page: Math.max(1, currentPage - 1) })}
                            disabled={!pagination.hasPrev}
                            className="h-8 px-3 text-[10px] font-black uppercase tracking-widest border-2 border-zinc-100 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 disabled:opacity-30 rounded-md"
                        >
                            <ChevronLeft className="w-3 h-3 mr-1" /> Prev
                        </Button>
                        <span className="text-[10px] font-black text-zinc-400 tabular-nums px-3">
                            Page {currentPage} of {pagination.totalPages}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFilters({ page: currentPage + 1 })}
                            disabled={!pagination.hasNext}
                            className="h-8 px-3 text-[10px] font-black uppercase tracking-widest border-2 border-zinc-100 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 disabled:opacity-30 rounded-md"
                        >
                            Next <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

// ── Filter chip ──────────────────────────────────────────────────────────────
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
            {label}
            <button onClick={onRemove} className="text-blue-400 hover:text-blue-700 transition-colors" aria-label="Remove filter">
                <X className="w-2.5 h-2.5" />
            </button>
        </span>
    );
}

// ── Resource card ────────────────────────────────────────────────────────────
function ResourceCard({
    resource,
    index,
    isAdmin,
    onDelete,
}: {
    resource: any;
    index: number;
    isAdmin: boolean;
    onDelete: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.03, ease: "easeOut" }}
            className="bg-white border-2 border-zinc-100 rounded-lg flex flex-col justify-between hover:border-blue-200 hover:shadow-md transition-all group relative overflow-hidden"
        >
            <Link href={`/resources/${resource.id}`} className="absolute inset-0 z-0" aria-label={resource.title} />

            <div className="z-10 pointer-events-none flex flex-col h-full">
                {/* Cover image */}
                <div className="aspect-[4/3] bg-zinc-50 border-b-2 border-zinc-100 overflow-hidden relative shrink-0">
                    {resource.coverImageUrl ? (
                        <img
                            src={resource.coverImageUrl}
                            alt={resource.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 group-hover:from-blue-50 group-hover:to-blue-100 transition-colors duration-300">
                            <FileText className="w-10 h-10 text-zinc-200 group-hover:text-blue-200 transition-colors" />
                        </div>
                    )}

                    {/* Type badge */}
                    <div className="absolute top-2 left-2">
                        <span className="text-[8px] font-black uppercase tracking-widest text-blue-900 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full border border-zinc-100 shadow-sm">
                            {resource.type ?? "DOC"}
                        </span>
                    </div>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col gap-3 flex-1">
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 truncate max-w-[110px]">
                                {resource.department}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                                {resource.category}
                            </span>
                        </div>
                        <h4 className="text-sm font-bold text-zinc-900 line-clamp-2 leading-snug group-hover:text-blue-900 transition-colors">
                            {resource.title}
                        </h4>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-3 border-t-2 border-zinc-50 flex items-center justify-between">
                        <div className="flex items-center gap-2 pointer-events-auto">
                            <div className="w-6 h-6 rounded-full bg-zinc-100 border-2 border-zinc-100 flex items-center justify-center overflow-hidden shrink-0">
                                {resource.uploadedBy?.avatar ? (
                                    <img src={resource.uploadedBy.avatar} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <GraduationCap className="w-3 h-3 text-zinc-400" />
                                )}
                            </div>
                            <span className="text-[9px] font-bold text-zinc-400 truncate max-w-[70px]">
                                {resource.uploadedBy?.name ?? "Staff"}
                            </span>
                        </div>

                        {isAdmin ? (
                            <div className="pointer-events-auto">
                                <DeleteConfirmationDialog
                                    title="Delete Resource?"
                                    description={`Permanently remove "${resource.title}". This is irreversible.`}
                                    onDelete={onDelete}
                                    trigger={
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-colors rounded-md"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    }
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-zinc-300 group-hover:text-blue-600 transition-colors">
                                <Download className="w-3 h-3" />
                                <span className="text-[9px] font-black tabular-nums">
                                    {resource.downloadCount}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}