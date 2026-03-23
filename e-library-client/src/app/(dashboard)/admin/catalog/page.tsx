"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRole } from "@/hooks/useAuth";
import { useBooks, useCampuses, useDeleteBook } from "@/hooks/useCatalog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ManageBookDialog } from "@/components/catalog/ManageBookDialog";
import { CreateCampusDialog } from "@/components/catalog/CreateCampusDialog";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";

import { Library, Search, MapPin, ChevronLeft, ChevronRight, BookText, Trash2 } from "lucide-react";

export default function CatalogPage() {
    const { isAdmin } = useRole();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [campusId, setCampusId] = useState<string>("all");

    const { data: campusesData, isLoading: isLoadingCampuses } = useCampuses();
    const campuses = Array.isArray(campusesData) ? campusesData : [];

    const { data: booksData, isLoading: isLoadingBooks } = useBooks({
        page,
        search: search || undefined,
        campusId: campusId === "all" ? undefined : campusId
    });
    
    const { mutate: deleteBook } = useDeleteBook();

    const books = booksData?.data || [];
    const pagination = booksData?.pagination;

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700 font-titillium">
            
            {/* Header & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col justify-center gap-2">
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase bg-blue-50 w-fit px-3 py-1 rounded tracking-widest">
                        <Library className="w-3 h-3" /> Physical Library Catalog
                    </div>
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tight">University Library</h1>
                    <p className="text-zinc-500 text-sm max-w-sm">Browse, search, and locate physical books across all campus branches.</p>
                </motion.div>

                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center justify-end">
                    <div className="bg-white border-2 border-zinc-100 p-2 flex items-center gap-4 rounded">
                        <div className="px-6 py-2 border-r-2 border-zinc-100 last:border-0 text-center">
                            <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Total Books</p>
                            <p className="text-2xl font-black text-blue-900">{pagination?.total || 0}</p>
                        </div>
                        {isAdmin && (
                            <div className="flex gap-2 mr-2">
                                <CreateCampusDialog />
                                <ManageBookDialog />
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* CAMPUS DIRECTORY */}
            <div className="shrink-0 flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                {isLoadingCampuses ? (
                    [...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-48 rounded shrink-0" />)
                ) : campuses.map(campus => (
                    <div key={campus.id} className="bg-white border-2 border-zinc-100 p-3 rounded shrink-0 w-48 flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-blue-900" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-black text-zinc-900 truncate">{campus.name}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{campus.code}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Discovery Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0">
                <div className="lg:col-span-2 bg-white border-2 border-zinc-100 px-4 rounded flex items-center h-14 w-full">
                    <Search className="w-5 h-5 text-zinc-400 shrink-0" />
                    <Input
                        placeholder="Search books by title, author, or keyword..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="border-0 focus-visible:ring-0 shadow-none font-bold text-base placeholder:text-zinc-300"
                    />
                </div>
                <div className="bg-white border-2 border-zinc-100 rounded h-14">
                    <Select value={campusId} onValueChange={(v) => { setCampusId(v); setPage(1); }}>
                        <SelectTrigger className="border-0 h-full font-bold text-xs uppercase tracking-widest text-zinc-600 px-4 focus:ring-0">
                            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-zinc-400" /> <SelectValue placeholder="All Campuses" /></div>
                        </SelectTrigger>
                        <SelectContent className="font-titillium">
                            <SelectItem value="all" className="font-bold text-xs uppercase tracking-widest">All Campuses</SelectItem>
                            {campuses.map(c => <SelectItem key={c.id} value={c.id} className="font-bold text-xs uppercase tracking-widest">{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Grid Area */}
            <div className="flex-1 overflow-hidden">
                <div className="bg-white border-2 border-zinc-100 rounded flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b-2 border-zinc-50 shrink-0">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <BookText className="w-4 h-4" /> Hardcopy Archives
                        </h3>
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => setPage(Math.max(1, page - 1))} disabled={!pagination.hasPrev} className="border-2 border-zinc-100 h-8 w-8 hover:bg-zinc-900 hover:text-white transition-all"><ChevronLeft className="w-4 h-4" /></Button>
                                <span className="text-[10px] font-bold text-blue-900 px-2">{page} / {pagination.totalPages}</span>
                                <Button variant="ghost" size="icon" onClick={() => setPage(page + 1)} disabled={!pagination.hasNext} className="border-2 border-zinc-100 h-8 w-8 hover:bg-zinc-900 hover:text-white transition-all"><ChevronRight className="w-4 h-4" /></Button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {isLoadingBooks ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-48 rounded w-full" />)}
                            </div>
                        ) : books.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {books.map((book) => (
                                    <div key={book.id} className="bg-white border-2 border-zinc-100 p-5 rounded hover:border-blue-900 transition-all group flex flex-col justify-between h-full relative">
                                        <Link href={`/admin/catalog/${book.id}`} className="absolute inset-0 z-0" />
                                        
                                        <div className="z-10 pointer-events-none">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-10 h-10 rounded bg-zinc-50 border-2 border-zinc-100 flex items-center justify-center shrink-0">
                                                    <BookText className="w-5 h-5 text-zinc-400" />
                                                </div>
                                                {isAdmin && (
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                                                        <ManageBookDialog initialData={book} triggerType="icon" />
                                                        <DeleteConfirmationDialog 
                                                            title="Delete from Catalog?"
                                                            description={`Are you sure you want to remove "${book.title}" from the physical library catalog?`}
                                                            onDelete={() => deleteBook(book.id)}
                                                            trigger={
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-8 w-8 text-zinc-400 hover:text-red-600 border-2 border-transparent hover:border-red-100 transition-colors"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <h4 className="text-sm font-black text-zinc-900 line-clamp-2 leading-tight group-hover:text-blue-900 transition-colors">{book.title}</h4>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">By {book.author}</p>
                                        </div>
                                        <div className="mt-4 pt-4 border-t-2 border-zinc-50 z-10 pointer-events-none">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${book.locations && book.locations.length > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                                {book.locations && book.locations.length > 0 ? 'Stocked on Campus' : 'Out of Stock'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center grayscale opacity-50 py-20">
                                <BookText className="w-12 h-12 text-zinc-400 mb-4" />
                                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight mb-1">No Books Found</h3>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Adjust your search or campus filter.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}