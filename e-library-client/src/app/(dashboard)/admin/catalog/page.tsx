"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRole } from "@/hooks/useAuth";
import { useBooks, useCampuses, useDeleteBook } from "@/hooks/useCatalog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ManageBookDialog } from "@/components/catalog/ManageBookDialog";
import { CreateCampusDialog } from "@/components/catalog/CreateCampusDialog";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Library,
    Search,
    MapPin,
    ChevronLeft,
    ChevronRight,
    BookText,
    Trash2,
} from "lucide-react";

export default function CatalogPage() {
    const { isAdmin } = useRole();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    // "all" means no campus filter — campus pills act as the filter control
    const [campusId, setCampusId] = useState<string>("all");

    const { data: campusesData, isLoading: isLoadingCampuses } = useCampuses();
    const campuses = Array.isArray(campusesData) ? campusesData : [];

    const { data: booksData, isLoading: isLoadingBooks } = useBooks({
        page,
        search: search || undefined,
        campusId: campusId === "all" ? undefined : campusId,
    });
    const { mutate: deleteBook } = useDeleteBook();

    const books = booksData?.data ?? [];
    const pagination = booksData?.pagination;

    const handleCampusClick = (id: string) => {
        setCampusId((prev) => (prev === id ? "all" : id));
        setPage(1);
    };

    return (
        <div className="flex flex-col gap-6 pb-6">

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <motion.div
                    initial={{ y: -8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col gap-1.5"
                >
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-[10px] uppercase bg-blue-50 w-fit px-3 py-1 rounded tracking-wider">
                        <Library className="w-3 h-3" />
                        Physical Library Catalog
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                        University Library
                    </h1>
                    <p className="text-zinc-500 text-sm max-w-sm">
                        Browse, search, and locate physical books across all campus branches.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ y: -8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.05 }}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0"
                >
                    <div className="bg-white border-2 border-zinc-100 flex items-center justify-between sm:flex-col sm:justify-center px-4 py-2 sm:px-5 sm:py-2.5 rounded text-center">
                        <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Total Books</p>
                        <p className="text-xl font-black text-blue-900">{pagination?.total ?? 0}</p>
                    </div>
                    {isAdmin && (
                        <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2 w-full sm:w-auto">
                            <div className="w-full"><CreateCampusDialog /></div>
                            <div className="w-full"><ManageBookDialog /></div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* ── CAMPUS FILTER ──
                Interactive controls to filter the book grid by campus. */}
            
            {/* Mobile Select Dropdown */}
            <div className="block md:hidden mb-1">
                <Select value={campusId} onValueChange={(val) => { setCampusId(val); setPage(1); }}>
                    <SelectTrigger className="w-full h-11 bg-white border-2 border-zinc-100 font-bold text-xs uppercase tracking-widest text-zinc-700">
                        <SelectValue placeholder="Select Campus" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-zinc-100 rounded-lg">
                        <SelectItem value="all" className="font-bold text-xs uppercase tracking-widest cursor-pointer py-3 focus:bg-blue-50 focus:text-blue-900">
                            <div className="flex items-center gap-2">
                                <Library className="w-3.5 h-3.5" /> All Campuses
                            </div>
                        </SelectItem>
                        {campuses.map(campus => (
                            <SelectItem key={campus.id} value={campus.id} className="font-bold text-xs uppercase tracking-widest cursor-pointer py-3 focus:bg-blue-50 focus:text-blue-900">
                                <div className="flex items-center justify-between w-full min-w-[200px] pr-2">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" /> {campus.name}
                                    </div>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded font-black bg-zinc-100 text-zinc-400">{campus.code}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Desktop / Tablet Pills */}
            <div className="hidden md:flex gap-3 overflow-x-auto pb-1 custom-scrollbar">
                {/* "All" pill */}
                <button
                    onClick={() => { setCampusId("all"); setPage(1); }}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded border-2 text-xs font-black uppercase tracking-wider transition-colors ${
                        campusId === "all"
                            ? "bg-blue-900 border-blue-900 text-white"
                            : "bg-white border-zinc-100 text-zinc-600 hover:border-blue-900 hover:text-blue-900"
                    }`}
                >
                    <Library className="w-3.5 h-3.5" />
                    All Campuses
                </button>

                {isLoadingCampuses
                    ? Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-10 w-40 rounded shrink-0" />
                      ))
                    : campuses.map((campus) => (
                          <button
                              key={campus.id}
                              onClick={() => handleCampusClick(campus.id)}
                              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded border-2 text-xs font-black uppercase tracking-wider transition-colors ${
                                  campusId === campus.id
                                      ? "bg-blue-900 border-blue-900 text-white"
                                      : "bg-white border-zinc-100 text-zinc-600 hover:border-blue-900 hover:text-blue-900"
                              }`}
                          >
                              <MapPin className="w-3.5 h-3.5" />
                              {campus.name}
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${campusId === campus.id ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-400"}`}>
                                  {campus.code}
                              </span>
                          </button>
                      ))}
            </div>

            {/* ── SEARCH BAR ── */}
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
                        placeholder="Search by title, author, or keyword..."
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

            {/* ── BOOK GRID ── */}
            <div className="bg-white border-2 border-zinc-100 rounded overflow-hidden">
                {/* Grid header */}
                <div className="flex items-center justify-between px-6 py-4 border-b-2 border-zinc-50">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <BookText className="w-3.5 h-3.5" />
                        Hardcopy Archives
                        {(search || campusId !== "all") && (
                            <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded normal-case tracking-normal ml-1 text-[10px]">
                                Filtered
                            </span>
                        )}
                    </h3>
                    {pagination && (
                        <span className="text-[10px] font-bold text-zinc-400">
                            {pagination.total} title{pagination.total !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>

                {/* Grid body */}
                <div className="p-6">
                    {isLoadingBooks ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="border-2 border-zinc-100 rounded p-5 flex flex-col gap-4">
                                    <div className="flex items-start justify-between">
                                        <Skeleton className="w-10 h-10 rounded" />
                                        <Skeleton className="w-20 h-5 rounded" />
                                    </div>
                                    <Skeleton className="w-full h-4 rounded" />
                                    <Skeleton className="w-2/3 h-3 rounded" />
                                    <div className="pt-3 border-t-2 border-zinc-50">
                                        <Skeleton className="w-24 h-4 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : books.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {books.map((book, idx) => (
                                <motion.div
                                    key={book.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03, duration: 0.25 }}
                                    className="relative bg-white border-2 border-zinc-100 rounded hover:border-blue-900 transition-colors group"
                                >
                                    <Link
                                        href={`/admin/catalog/${book.id}`}
                                        className="absolute inset-0 z-0 rounded"
                                        aria-label={`View ${book.title}`}
                                    />
                                    <div className="relative z-10 p-5 flex flex-col gap-3 pointer-events-none">
                                        <div className="flex items-start justify-between">
                                            <div className="w-10 h-10 rounded bg-zinc-50 border-2 border-zinc-100 flex items-center justify-center shrink-0 group-hover:border-blue-100 group-hover:bg-blue-50 transition-colors">
                                                <BookText className="w-5 h-5 text-zinc-400 group-hover:text-blue-900 transition-colors" />
                                            </div>
                                            {isAdmin && (
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                                                    <ManageBookDialog initialData={book} triggerType="icon" />
                                                    <DeleteConfirmationDialog
                                                        title="Remove from Catalog?"
                                                        description={`Remove "${book.title}" from the physical library catalog?`}
                                                        onDelete={() => deleteBook(book.id)}
                                                        trigger={
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-zinc-300 hover:text-red-600 border-2 border-transparent hover:border-red-100 rounded transition-colors"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                <span className="sr-only">Delete {book.title}</span>
                                                            </Button>
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <h4 className="text-sm font-black text-zinc-900 line-clamp-2 leading-snug group-hover:text-blue-900 transition-colors">
                                                {book.title}
                                            </h4>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1">
                                                By {book.author}
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t-2 border-zinc-50">
                                            <span
                                                className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                                                    (book.locations?.length ?? 0) > 0
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-red-50 text-red-600"
                                                }`}
                                            >
                                                {(book.locations?.length ?? 0) > 0 ? "Stocked on Campus" : "Out of Stock"}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 gap-3 opacity-50">
                            <BookText className="w-10 h-10 text-zinc-400" />
                            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">No Books Found</h3>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                Adjust your search or campus filter.
                            </p>
                            {(search || campusId !== "all") && (
                                <Button
                                    variant="link"
                                    className="text-xs text-blue-600 font-bold p-0 h-auto uppercase"
                                    onClick={() => { setSearch(""); setCampusId("all"); setPage(1); }}
                                >
                                    Clear all filters
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* ── PAGINATION — bottom of grid ── */}
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