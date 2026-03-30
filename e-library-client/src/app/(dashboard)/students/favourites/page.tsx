"use client";

import { useEffect } from "react";
import { useResourceStore } from "@/stores/resourceStore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    FileText,
    Download,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    Heart,
    HeartOff,
    BookOpen
} from "lucide-react";

export default function FavouritesPage() {
    const {
        favourites,
        favouritesPagination: pagination,
        isFavouritesLoading: isLoading,
        filters,
        setFilters,
        fetchFavourites,
        toggleFavourite
    } = useResourceStore();

    useEffect(() => {
        fetchFavourites();
    }, [fetchFavourites]);

    if (isLoading && favourites.length === 0) {
        return (
            <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-full max-w-sm" />
                    </div>
                </div>
                <div className="flex-1 bg-white border-2 border-zinc-100 rounded p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-40 rounded w-full" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700">

            {/* TOP ROW: Z-Pattern Start */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex flex-col justify-center gap-2"
                >
                    <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase bg-red-50 w-fit px-3 py-1 rounded">
                        <Heart className="w-3 h-3 fill-red-600" />
                        My Favourites
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
                        Saved Resources
                    </h1>
                    <p className="text-zinc-500 text-sm max-w-sm">
                        Access your personally curated collection of academic materials.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center justify-end"
                >
                    <div className="bg-white border-2 border-zinc-100 p-2 flex items-center gap-4 rounded">
                        <div className="px-6 py-2 text-center">
                            <p className="text-[10px] uppercase font-bold text-zinc-400">Total Saved</p>
                            <p className="text-2xl font-bold text-red-600">{pagination?.total || favourites.length}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* BOTTOM ROW: Resource Grid */}
            <div className="flex-1 overflow-hidden">
                <div className="bg-white border-2 border-zinc-100 rounded flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b-2 border-zinc-50 shrink-0">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-tight flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Saved Items
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
                                <span className="text-zinc-500 font-bold uppercase text-xs animate-pulse">Loading favourites...</span>
                            </div>
                        ) : favourites.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {favourites.map((resource) => (
                                    <div key={resource.id} className="relative group">
                                        <Link href={`/resources/${resource.id}`}>
                                            <div className="bg-white border-2 border-zinc-100 p-4 rounded flex flex-col justify-between hover:border-red-600 transition-all group-hover:border-red-600 h-full relative">
                                                <div className="space-y-3">
                                                    <div className="aspect-[4/3] bg-zinc-50 rounded border-2 border-zinc-100 overflow-hidden relative">
                                                        {resource.coverImageUrl ? (
                                                            <img
                                                                src={resource.coverImageUrl}
                                                                alt={resource.title}
                                                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-zinc-100 group-hover:text-red-50 transition-colors">
                                                                <FileText className="w-12 h-12" />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-2 right-2">
                                                            <span className="text-[8px] font-black uppercase text-red-600 bg-white/90 backdrop-blur px-2 py-0.5 rounded border border-zinc-100 shadow-sm">
                                                                {resource.type || 'DOC'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-[10px] font-bold uppercase text-zinc-400 truncate max-w-[120px]">
                                                                {resource.department}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-red-600">
                                                                {resource.category}
                                                            </span>
                                                        </div>
                                                        <h4 className="text-sm font-bold text-zinc-900 line-clamp-2 leading-tight group-hover:text-red-600 transition-colors">
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
                                                    <div className="flex items-center gap-1.5 text-zinc-300 group-hover:text-red-600 transition-colors">
                                                        <Download className="w-3 h-3" />
                                                        <span className="text-[10px] font-black">{resource.downloadCount}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleFavourite(resource.id, true);
                                            }}
                                            className="absolute top-2 left-2 z-10 w-8 h-8 rounded bg-white/90 backdrop-blur border-2 border-zinc-100 flex items-center justify-center text-red-600 hover:bg-red-50 hover:border-red-200 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm"
                                        >
                                            <HeartOff className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-20 grayscale opacity-50">
                                <div className="w-20 h-20 flex items-center justify-center mb-6">
                                    <Heart className="w-10 h-10 text-zinc-400" />
                                </div>
                                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight mb-2">No Favourites Yet</h3>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase max-w-[200px] text-center mb-6">You haven't saved any resources to your favourites list.</p>
                                <Button asChild variant="outline" className="border-2 border-zinc-100 text-xs font-bold uppercase tracking-wider">
                                    <Link href="/resources">Browse Library</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
