"use client";

import { use } from "react";
import Link from "next/link";
import { useBook } from "@/hooks/useCatalog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookText, User, Hash, Info, MapPin, Layers } from "lucide-react";

interface CatalogDetailProps {
    params: Promise<{ id: string }>;
}

export default function BookDetailPage({ params }: CatalogDetailProps) {
    const { id } = use(params);
    const { data: book, isLoading, error } = useBook(id);

    if (isLoading) return <div className="p-8 font-titillium font-bold uppercase text-zinc-400 animate-pulse">Loading Catalog Record...</div>;
    if (error || !book) return <div className="p-8">Book not found in registry.</div>;

    const totalAvailable = book.locations?.reduce((acc, curr) => acc + curr.availableCopies, 0) || 0;

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700 font-titillium">
            
            <div className="shrink-0">
                <Button variant="ghost" asChild className="p-0 h-auto text-[10px] font-bold text-blue-900 uppercase mb-4 tracking-widest hover:bg-transparent">
                    <Link href="/admin/catalog"><ArrowLeft className="w-3 h-3 mr-1" /> Back to Library Search</Link>
                </Button>
            </div>

            {/* HEADER */}
            <div className="flex flex-col md:flex-row gap-8 shrink-0 relative">
                <div className="w-32 md:w-48 shrink-0 z-10 aspect-[3/4] bg-zinc-50 border-2 border-zinc-100 rounded-lg flex flex-col items-center justify-center text-zinc-300 shadow-sm">
                    <BookText className="w-12 h-12 opacity-50 mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Hardcopy</span>
                </div>

                <div className="flex-1 flex flex-col justify-center gap-3">
                    <div className="flex gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-900 bg-blue-50 px-2 py-1 rounded">Physical Book</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${totalAvailable > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                            {totalAvailable > 0 ? `${totalAvailable} Copies Available` : 'Currently Unavailable'}
                        </span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-zinc-900 leading-tight tracking-tight">{book.title}</h1>
                    <div className="flex items-center gap-4 text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
                        <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> By {book.author}</span>
                        {book.isbn && <span className="flex items-center gap-1.5 border-l-2 border-zinc-200 pl-4"><Hash className="h-4 w-4" /> ISBN: {book.isbn}</span>}
                    </div>
                </div>
            </div>

            {/* CONTENT SPLIT */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                
                {/* Description */}
                <div className="lg:col-span-2 bg-white border-2 border-zinc-100 rounded flex flex-col overflow-hidden">
                    <div className="p-6 border-b-2 border-zinc-50 shrink-0">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Info className="w-4 h-4" /> Synopsis</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {book.description ? (
                            <p className="text-sm font-bold text-zinc-600 leading-relaxed">{book.description}</p>
                        ) : <p className="text-zinc-400 italic font-bold">No description provided for this title.</p>}
                    </div>
                </div>

                {/* Inventory / Campus Availability */}
                <div className="space-y-6 overflow-y-auto custom-scrollbar pb-6 pr-2">
                    <div className="bg-white border-2 border-zinc-100 rounded overflow-hidden">
                        <div className="bg-blue-900 p-4 border-b-2 border-zinc-50">
                            <h4 className="text-[10px] font-black tracking-widest uppercase text-blue-100 flex items-center gap-2"><MapPin className="w-3 h-3" /> Campus Availability</h4>
                        </div>
                        <div className="p-2 space-y-1">
                            {book.locations && book.locations.length > 0 ? (
                                book.locations.map((loc) => (
                                    <div key={loc.campusId} className="p-3 rounded bg-zinc-50/50 hover:bg-zinc-50 flex flex-col gap-2 transition-colors border border-transparent hover:border-zinc-100">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-black uppercase text-blue-900">{loc.name}</span>
                                            <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded ${loc.availableCopies > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                {loc.availableCopies} / {loc.totalCopies} Available
                                            </span>
                                        </div>
                                        {loc.shelfLocation && (
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 tracking-widest uppercase mt-1">
                                                <Layers className="w-3 h-3" /> Shelf: {loc.shelfLocation}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Not stocked in any campus library.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}