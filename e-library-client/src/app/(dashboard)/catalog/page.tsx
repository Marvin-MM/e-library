"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBooks, useBook } from "@/hooks/useCatalog";
import { Book, CampusLocation } from "@/lib/api/catalog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  BookOpen,
  Search,
  MapPin,
  Copy,
  BookMarked,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Hash,
  Building2,
  CheckCircle2,
  XCircle,
  Layers,
  X,
} from "lucide-react";

// Typings come from @/lib/api/catalog

// ─── Availability Badge ────────────────────────────────────────────────────────
function AvailabilityBadge({ available, total }: { available: number; total: number }) {
  if (total === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-full">
        <XCircle className="w-2.5 h-2.5" /> No copies
      </span>
    );
  }
  if (available === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
        <XCircle className="w-2.5 h-2.5" /> Checked out
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
      <CheckCircle2 className="w-2.5 h-2.5" /> {available} available
    </span>
  );
}

// ─── Book Detail Dialog ────────────────────────────────────────────────────────
function BookDetailDialog({
  bookId,
  open,
  onClose,
}: {
  bookId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { data: book, isLoading, error } = useBook(bookId);

  const totalCopies = book?.locations?.reduce((s: number, l: CampusLocation) => s + l.totalCopies, 0) ?? 0;
  const totalAvailable = book?.locations?.reduce((s: number, l: CampusLocation) => s + l.availableCopies, 0) ?? 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="w-[95vw] max-w-2xl p-0 overflow-hidden border-0 shadow-2xl rounded-2xl font-titillium gap-0"
        aria-describedby="book-detail-description"
      >
        {/* ── Dialog Header ── */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 px-6 pt-6 pb-8 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-blue-800/20 pointer-events-none" />
          <div className="absolute -bottom-12 -left-6 w-32 h-32 rounded-full bg-blue-700/10 pointer-events-none" />

          <DialogHeader className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                    <BookMarked className="w-3.5 h-3.5 text-blue-300" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">
                    Library Catalog
                  </span>
                </div>

                <DialogTitle className="text-xl font-black text-white leading-tight tracking-tight mb-1">
                  {isLoading ? (
                    <Skeleton className="h-7 w-3/4 bg-white/10" />
                  ) : (
                    book?.title
                  )}
                </DialogTitle>

                {isLoading ? (
                  <Skeleton className="h-4 w-1/2 bg-white/10 mt-2" />
                ) : (
                  <p className="text-sm font-semibold text-blue-200/80">{book?.author}</p>
                )}
              </div>

              {/* Availability summary pill */}
              {!isLoading && book && totalCopies > 0 && (
                <div className="shrink-0 text-center bg-white/10 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                  <p className="text-2xl font-black text-white leading-none">{totalAvailable}</p>
                  <p className="text-[10px] font-bold text-blue-200/70 uppercase tracking-wider mt-0.5">of {totalCopies}</p>
                  <p className="text-[10px] font-bold text-blue-200/70 uppercase tracking-wider">available</p>
                </div>
              )}
            </div>
          </DialogHeader>
        </div>

        {/* ── Dialog Body ── */}
        <div className="p-6 flex flex-col gap-5 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <div className="pt-2 space-y-3">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <AlertCircle className="w-8 h-8 text-red-300" />
              <p className="text-sm font-bold text-zinc-500">Failed to load book details.</p>
            </div>
          ) : book ? (
            <>
              {/* ISBN */}
              {book.isbn && (
                <div className="flex items-center gap-2 text-zinc-400">
                  <Hash className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-widest">ISBN:</span>
                  <span className="text-xs font-mono text-zinc-600">{book.isbn}</span>
                </div>
              )}

              {/* Description */}
              <div id="book-detail-description">
                {book.description && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">About this book</p>
                    <p className="text-sm text-zinc-600 leading-relaxed">
                      {book.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Campus Locations */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> Campus Availability
                </p>

                {book.locations && book.locations.length > 0 ? (
                  <div className="space-y-2.5">
                    {book.locations.map((loc: CampusLocation) => (
                      <div
                        key={loc.campusId}
                        className="flex items-center justify-between gap-4 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 hover:border-blue-100 hover:bg-blue-50/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-white border border-zinc-100 flex items-center justify-center shrink-0">
                            <Building2 className="w-3.5 h-3.5 text-blue-700" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-zinc-900 truncate">{loc.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{loc.code}</span>
                              {loc.shelfLocation && (
                                <>
                                  <span className="text-zinc-200">·</span>
                                  <span className="text-[10px] font-bold text-zinc-400">
                                    Shelf: {loc.shelfLocation}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right hidden sm:block">
                            <p className="text-xs font-black text-zinc-900">
                              {loc.availableCopies}
                              <span className="text-zinc-300 font-bold">/{loc.totalCopies}</span>
                            </p>
                            <p className="text-[10px] text-zinc-400 font-bold">copies</p>
                          </div>
                          <AvailabilityBadge
                            available={loc.availableCopies}
                            total={loc.totalCopies}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-zinc-50 border border-dashed border-zinc-200 rounded-xl px-4 py-4">
                    <Layers className="w-4 h-4 text-zinc-300 shrink-0" />
                    <p className="text-xs font-bold text-zinc-400">
                      No campus inventory records for this title.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* ── Dialog Footer ── */}
        <div className="px-6 py-4 border-t border-zinc-50 bg-zinc-50/60 flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs font-bold uppercase tracking-wider border-zinc-200 hover:bg-zinc-100"
          >
            <X className="w-3 h-3 mr-1.5" /> Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Book Card ─────────────────────────────────────────────────────────────────
function BookCard({ book, index, onSelect }: { book: Book; index: number; onSelect: (id: string) => void }) {
  const totalAvailable = book.locations?.reduce((s, l) => s + l.availableCopies, 0) ?? 0;
  const totalCopies = book.locations?.reduce((s, l) => s + l.totalCopies, 0) ?? 0;
  const hasLocations = (book.locations?.length ?? 0) > 0;

  return (
    <motion.button
      onClick={() => onSelect(book.id)}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: "easeOut" }}
      className="text-left w-full group bg-white border border-zinc-100 rounded-xl p-5 flex flex-col gap-3
                 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50/80 transition-all duration-200
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      aria-label={`View details for ${book.title}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-100 group-hover:border-blue-200 transition-colors">
          <BookOpen className="w-5 h-5 text-blue-700" />
        </div>
        {hasLocations ? (
          <AvailabilityBadge available={totalAvailable} total={totalCopies} />
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-full">
            No inventory
          </span>
        )}
      </div>

      {/* Title & Author */}
      <div className="flex-1 min-w-0 space-y-1">
        <h3 className="text-sm font-bold text-zinc-900 leading-snug group-hover:text-blue-900 transition-colors line-clamp-2">
          {book.title}
        </h3>
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide truncate">{book.author}</p>
      </div>

      {/* Description */}
      {book.description && (
        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{book.description}</p>
      )}

      {/* Footer */}
      <div className="pt-2 border-t border-zinc-50 flex items-center justify-between">
        {book.isbn ? (
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Hash className="w-3 h-3" />
            <span className="text-[10px] font-mono">{book.isbn}</span>
          </div>
        ) : (
          <span />
        )}
        {hasLocations && (
          <div className="flex items-center gap-1 text-zinc-400 group-hover:text-blue-600 transition-colors">
            <MapPin className="w-3 h-3" />
            <span className="text-[10px] font-bold">{book.locations?.length} campus{book.locations?.length !== 1 ? "es" : ""}</span>
          </div>
        )}
      </div>
    </motion.button>
  );
}

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonBookCard() {
  return (
    <div className="bg-white border border-zinc-100 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="pt-2 border-t border-zinc-50">
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const { data, isLoading, error } = useBooks({ search: search || undefined, page, limit: 20 });

  const books: Book[] = data?.data ?? [];
  const pagination = data?.pagination;

  const handleSelect = useCallback((id: string) => setSelectedBookId(id), []);
  const handleClose = useCallback(() => setSelectedBookId(null), []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6 font-titillium animate-in fade-in duration-500 pb-8">

      {/* ── Detail Dialog ── */}
      {selectedBookId && (
        <BookDetailDialog
          bookId={selectedBookId}
          open={!!selectedBookId}
          onClose={handleClose}
        />
      )}

      {/* ── Page Header ── */}
      <motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-blue-900 font-bold text-[10px] uppercase tracking-widest bg-blue-50 w-fit px-3 py-1.5 rounded-full">
            <BookMarked className="w-3 h-3" />
            Library System
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight leading-tight">
            Book Catalog
          </h1>
          <p className="text-zinc-400 text-sm">
            Browse and locate books across all campus libraries.
          </p>
        </div>

        {/* Stats */}
        {pagination && (
          <div className="shrink-0 flex items-center gap-1.5 bg-white border border-zinc-100 rounded-xl px-4 py-2.5 shadow-sm self-start sm:self-auto">
            <Copy className="w-3.5 h-3.5 text-blue-700" />
            <span className="text-xs font-bold text-zinc-900">{pagination.total}</span>
            <span className="text-xs font-semibold text-zinc-400">titles indexed</span>
          </div>
        )}
      </motion.div>

      {/* ── Search Bar ── */}
      <motion.div
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        <Input
          value={search}
          onChange={handleSearch}
          placeholder="Search by title, author, or ISBN…"
          className="pl-11 h-11 bg-white border border-zinc-200 rounded-xl text-sm font-medium
                     focus-visible:ring-1 focus-visible:ring-blue-300 focus-visible:border-blue-300
                     placeholder:text-zinc-300 shadow-sm"
        />
        {search && (
          <button
            onClick={() => { setSearch(""); setPage(1); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>

      {/* ── Grid ── */}
      {error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-300" />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-bold text-zinc-700 mb-1">Failed to load catalog</h3>
            <p className="text-xs text-zinc-400">Please check your connection and try again.</p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonBookCard key={i} />)}
        </div>
      ) : books.length > 0 ? (
        <AnimatePresence mode="wait">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {books.map((book, i) => (
              <BookCard key={book.id} book={book} index={i} onSelect={handleSelect} />
            ))}
          </div>
        </AnimatePresence>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-50 border-2 border-dashed border-zinc-200 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-zinc-200" />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-bold text-zinc-700 mb-1">No books found</h3>
            <p className="text-xs text-zinc-400">
              {search ? `No results for "${search}". Try a different term.` : "The catalog is empty."}
            </p>
          </div>
          {search && (
            <Button variant="outline" size="sm" onClick={() => setSearch("")} className="text-xs font-bold">
              Clear search
            </Button>
          )}
        </div>
      )}

      {/* ── Pagination ── */}
      {pagination && pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between pt-2"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPrev}
            className="text-xs font-bold border-zinc-200 disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
          </Button>

          <span className="text-xs font-bold text-zinc-400 tabular-nums">
            Page <span className="text-zinc-900">{pagination.page}</span> of{" "}
            <span className="text-zinc-900">{pagination.totalPages}</span>
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination.hasNext}
            className="text-xs font-bold border-zinc-200 disabled:opacity-40"
          >
            Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}