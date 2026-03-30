"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useBook } from "@/hooks/useCatalog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ArrowLeft,
    BookText,
    User,
    Hash,
    Info,
    MapPin,
    Layers,
    Library,
} from "lucide-react";

interface CatalogDetailProps {
    params: Promise<{ id: string }>;
}

export default function BookDetailPage({ params }: CatalogDetailProps) {
    const { id } = use(params);
    const { data: book, isLoading, error } = useBook(id);

    // ── Loading skeleton — matches the real page structure ─────────────────
    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 font-titillium pb-6">
                <Skeleton className="h-5 w-36 rounded" />
                <div className="flex flex-col md:flex-row gap-8">
                    <Skeleton className="w-32 md:w-48 aspect-[3/4] rounded-lg shrink-0" />
                    <div className="flex-1 flex flex-col gap-4 justify-center">
                        <div className="flex gap-2">
                            <Skeleton className="h-5 w-24 rounded" />
                            <Skeleton className="h-5 w-28 rounded" />
                        </div>
                        <Skeleton className="h-10 w-full rounded" />
                        <Skeleton className="h-10 w-3/4 rounded" />
                        <Skeleton className="h-4 w-48 rounded" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="lg:col-span-2 h-64 rounded" />
                    <Skeleton className="h-48 rounded" />
                </div>
            </div>
        );
    }

    // ── Error / 404 state ──────────────────────────────────────────────────
    if (error || !book) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] p-6 font-titillium">
                <div className="text-center bg-white border-2 border-zinc-100 p-12 rounded max-w-md w-full">
                    <BookText className="w-14 h-14 text-zinc-100 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-zinc-900 mb-2 uppercase tracking-tight">
                        Book Not Found
                    </h3>
                    <p className="text-xs font-bold text-zinc-400 uppercase mb-6">
                        This catalog record does not exist or has been removed.
                    </p>
                    <Button
                        asChild
                        className="bg-blue-900 hover:bg-zinc-900 text-white font-bold uppercase text-xs px-8 transition-colors"
                    >
                        <Link href="/admin/catalog">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Return to Library
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const totalAvailable =
        book.locations?.reduce((acc: number, curr: { availableCopies: number }) => acc + curr.availableCopies, 0) ?? 0;

    return (
        <div className="flex flex-col gap-6 font-titillium pb-6">

            {/* ── BACK NAV ── */}
            <Button
                variant="ghost"
                asChild
                className="w-fit p-0 h-auto gap-1 text-[10px] font-bold text-blue-900 hover:bg-transparent uppercase tracking-wider"
            >
                <Link href="/admin/catalog">
                    <ArrowLeft className="w-3 h-3" />
                    Back to Library Search
                </Link>
            </Button>

            {/* ── HERO HEADER ── */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                <motion.div
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-32 md:w-48 shrink-0"
                >
                    <div className="aspect-[3/4] bg-zinc-50 border-2 border-zinc-100 rounded-lg flex flex-col items-center justify-center text-zinc-200 shadow-sm">
                        <BookText className="w-10 h-10 mb-2" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-300">
                            Hardcopy
                        </span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ x: -12, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.05 }}
                    className="flex-1 flex flex-col justify-center gap-3"
                >
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-900 bg-blue-50 px-2 py-1 rounded">
                            Physical Book
                        </span>
                        <span
                            className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                                totalAvailable > 0
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-red-50 text-red-600"
                            }`}
                        >
                            {totalAvailable > 0
                                ? `${totalAvailable} ${totalAvailable === 1 ? "Copy" : "Copies"} Available`
                                : "Currently Unavailable"}
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 leading-tight tracking-tight">
                        {book.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            {book.author}
                        </span>
                        {book.isbn && (
                            <span className="flex items-center gap-1.5 border-l-2 border-zinc-200 pl-4">
                                <Hash className="h-3.5 w-3.5" />
                                ISBN: {book.isbn}
                            </span>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* ── MAIN CONTENT ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Synopsis */}
                <div className="lg:col-span-2 bg-white border-2 border-zinc-100 rounded overflow-hidden">
                    <div className="px-6 py-4 border-b-2 border-zinc-50">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <Info className="w-3.5 h-3.5" />
                            Synopsis
                        </h3>
                    </div>
                    <div className="p-6">
                        {book.description ? (
                            <p className="text-sm font-bold text-zinc-600 leading-relaxed">
                                {book.description}
                            </p>
                        ) : (
                            <p className="text-zinc-400 italic text-sm">
                                No description provided for this title.
                            </p>
                        )}
                    </div>
                </div>

                {/* Campus availability sidebar */}
                <div className="bg-white border-2 border-zinc-100 rounded overflow-hidden">
                    {/* Sidebar header — consistent with the rest of the system; no dark bg-blue-900 */}
                    <div className="px-5 py-4 border-b-2 border-zinc-50">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5" />
                            Campus Availability
                        </h4>
                    </div>

                    <div className="p-3 space-y-1.5">
                        {book.locations && book.locations.length > 0 ? (
                            book.locations.map(
                                (loc: {
                                    campusId: string;
                                    name: string;
                                    availableCopies: number;
                                    totalCopies: number;
                                    shelfLocation?: string;
                                }) => (
                                    <div
                                        key={loc.campusId}
                                        className="p-3.5 rounded bg-zinc-50 hover:bg-zinc-100 transition-colors border-2 border-transparent hover:border-zinc-100 flex flex-col gap-2"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-black uppercase text-blue-900 leading-tight">
                                                {loc.name}
                                            </span>
                                            <span
                                                className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded shrink-0 ${
                                                    loc.availableCopies > 0
                                                        ? "bg-emerald-100 text-emerald-800"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {loc.availableCopies}/{loc.totalCopies}
                                            </span>
                                        </div>
                                        {loc.shelfLocation && (
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                                <Layers className="w-3 h-3 shrink-0" />
                                                Shelf: {loc.shelfLocation}
                                            </div>
                                        )}
                                    </div>
                                )
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 gap-2 opacity-50">
                                <Library className="w-8 h-8 text-zinc-400" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">
                                    Not stocked in any campus library.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}