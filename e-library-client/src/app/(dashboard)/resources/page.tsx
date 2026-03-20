"use client";

import { useEffect, useState } from "react";
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

import {
    FileText,
    Search,
    Filter,
    Download,
    ChevronLeft,
    ChevronRight,
    CloudUpload,
    Layers,
    GraduationCap,
    BoxSelectIcon,
    BookOpen,
    Heart,
} from "lucide-react";
import { useRole } from "@/hooks/useAuth";
import { resourceTypeOptions, categoryOptions } from "@/schemas/resources";
import type { ResourceType } from "@/types/api";
import { motion } from "framer-motion";

export default function ResourcesPage() {
    const { isStaffOrAdmin } = useRole();
    
    const { 
        resources, 
        resourcesPagination: pagination, 
        isResourcesLoading: isLoading,
        filters,
        setFilters,
        resetFilters,
        fetchResources
    } = useResourceStore();

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    if (isLoading && resources.length === 0) {
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
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 shrink-0">
                    <Skeleton className="lg:col-span-2 h-16 rounded" />
                    <Skeleton className="h-16 rounded" />
                    <Skeleton className="h-16 rounded" />
                </div>
                <div className="flex-1 bg-white border-2 border-zinc-100 rounded p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <Skeleton key={i} className="h-40 rounded w-full" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700 font-titillium">

            {/* TOP ROW: Z-Pattern Start */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex flex-col justify-center gap-2"
                >
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase bg-blue-50 w-fit px-3 py-1 rounded">
                            <FileText className="w-3 h-3" />
                            Knowledge Base
                        </div>
                        <Button asChild variant="outline" className="h-6 px-2 text-[10px] font-bold uppercase rounded border-2 border-zinc-100 text-zinc-500 hover:text-red-500 hover:border-red-100 transition-colors">
                            <Link href="/students/favourites">
                                <Heart className="w-3 h-3 mr-1" />
                                My Favourites
                            </Link>
                        </Button>
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
                        Resource Library
                    </h1>
                    <p className="text-zinc-500 text-sm max-w-sm">
                        Access a comprehensive collection of academic materials and research journals.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center justify-end"
                >
                    <div className="bg-white border-2 border-zinc-100 p-2 flex items-center gap-4 rounded">
                        <div className="px-6 py-2 border-r-2 border-zinc-100 last:border-0 text-center">
                            <p className="text-[10px] uppercase font-bold text-zinc-400">Total</p>
                            <p className="text-2xl font-bold text-blue-900">{pagination?.total || 0}</p>
                        </div>
                        {isStaffOrAdmin && (
                            <Button asChild className="h-12 px-6 rounded bg-blue-900 hover:bg-zinc-900 text-white shrink-0 font-bold text-xs uppercase tracking-wider">
                                <Link href="/resources/upload">
                                    <CloudUpload className="w-4 h-4 mr-2" />
                                    Upload New
                                </Link>
                            </Button>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* MIDDLE ROW: Search & Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 shrink-0">
                <div className="lg:col-span-2 bg-white border-2 border-zinc-100 p-4 rounded-none flex items-center gap-4">
                    <Search className="w-5 h-5 text-zinc-900 ml-2" />
                    <Input
                        placeholder="Search by title, author, or keyword..."
                        value={filters.search || ""}
                        onChange={(e) => {
                            setFilters({ search: e.target.value, page: 1 });
                        }}
                        className="border-0 p-0 h-auto focus-visible:ring-0 text-base focus:border-b-black rounded-none shadow-sm placeholder:text-zinc-300 bg-transparent"
                    />
                </div>

                <div className="bg-white border-2 border-zinc-100 rounded">
                    <Select
                        value={filters.type || "all-types"}
                        onValueChange={(value) => {
                            setFilters({ type: value === "all-types" ? undefined : (value as ResourceType), page: 1 });
                        }}
                    >
                        <SelectTrigger className="border-0 h-14 font-bold text-xs uppercase text-zinc-900 px-4 focus:ring-0">
                            <div className="flex items-center gap-2">
                                <Layers className="h-4 w-4 text-zinc-400" />
                                <SelectValue placeholder="All Types" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="border-2 border-zinc-100 shadow-none font-titillium">
                            <SelectItem value="all-types" className="font-bold text-xs uppercase">All Types</SelectItem>
                            {resourceTypeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="font-bold text-xs uppercase text-zinc-600">
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="bg-white border-2 border-zinc-100 rounded">
                    <Select
                        value={filters.category || "all-categories"}
                        onValueChange={(value) => {
                            setFilters({ category: value === "all-categories" ? undefined : value, page: 1 });
                        }}
                    >
                        <SelectTrigger className="border-0 h-14 font-bold text-xs uppercase text-zinc-900 px-4 focus:ring-0">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-zinc-400" />
                                <SelectValue placeholder="All Categories" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="border-2 border-zinc-100 shadow-none font-titillium">
                            <SelectItem value="all-categories" className="font-bold text-xs uppercase">All Categories</SelectItem>
                            {categoryOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="font-bold text-xs uppercase text-zinc-600">
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* BOTTOM ROW: Resource Grid */}
            <div className="flex-1 overflow-hidden">
                <div className="bg-white border-2 border-zinc-100 rounded flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b-2 border-zinc-50 shrink-0">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-tight flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Resource Library
                        </h3>
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setFilters({ page: Math.max(1, (filters.page || 1) - 1) })}
                                    disabled={!pagination.hasPrev}
                                    className="border-2 border-zinc-100 h-8 w-8 hover:bg-zinc-900 hover:text-white transition-all disabled:opacity-20"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="text-[10px] font-bold text-blue-900 px-2">
                                    {filters.page || 1} / {pagination.totalPages}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setFilters({ page: (filters.page || 1) + 1 })}
                                    disabled={!pagination.hasNext}
                                    className="border-2 border-zinc-100 h-8 w-8 hover:bg-zinc-900 hover:text-white transition-all disabled:opacity-20"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <span className="text-zinc-500 font-bold uppercase text-xs animate-pulse">Loading resources...</span>
                            </div>
                        ) : resources.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {resources.map((resource) => (
                                    <Link key={resource.id} href={`/resources/${resource.id}`}>
                                        <div className="bg-white border-2 border-zinc-100 p-4 rounded flex flex-col justify-between hover:border-blue-900 transition-all group h-full relative">
                                            <div className="space-y-3">
                                                <div className="aspect-[4/3] bg-zinc-50 rounded border-2 border-zinc-100 overflow-hidden relative">
                                                    {resource.coverImageUrl ? (
                                                        <img
                                                            src={resource.coverImageUrl}
                                                            alt={resource.title}
                                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-100 group-hover:text-blue-50 transition-colors">
                                                            <FileText className="w-12 h-12" />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-2 right-2">
                                                        <span className="text-[8px] font-black uppercase text-blue-900 bg-white/90 backdrop-blur px-2 py-0.5 rounded border border-zinc-100 shadow-sm">
                                                            {resource.type || 'DOC'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[10px] font-bold uppercase text-zinc-400 truncate max-w-[120px]">
                                                            {resource.department}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-blue-900">
                                                            {resource.category}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-sm font-bold text-zinc-900 line-clamp-2 leading-tight group-hover:text-blue-900 transition-colors">
                                                        {resource.title}
                                                    </h4>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-3 border-t-2 border-zinc-50 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center overflow-hidden">
                                                        {resource.uploadedBy?.avatar ? (
                                                            <img src={resource.uploadedBy.avatar} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <GraduationCap className="w-3 h-3 text-zinc-300" />
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-zinc-400 group-hover:text-zinc-600 truncate max-w-[80px]">
                                                        {resource.uploadedBy?.name || 'Staff'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-zinc-300 group-hover:text-blue-900 transition-colors">
                                                    <Download className="w-3 h-3" />
                                                    <span className="text-[10px] font-black">{resource.downloadCount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-20 grayscale opacity-50">
                                <div className="w-20 h-20 flex items-center justify-center mb-6">
                                    <BoxSelectIcon className="w-10 h-10 text-zinc-400" />
                                </div>
                                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight mb-2">No Records Found</h3>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase max-w-[200px] text-center mb-6">Your search criteria did not match any resources in our database.</p>
                                {(filters.search || filters.type || filters.category) && (
                                    <Button variant="link" className="text-xs text-blue-600 font-bold p-0 uppercase" onClick={resetFilters}>Reset Filters</Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
