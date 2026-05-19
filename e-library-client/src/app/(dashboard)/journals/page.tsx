"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useDepartmentStore } from "@/stores/departmentStore";
import { useCourses, useCourseResources } from "@/hooks/useCourses";
import { useRole } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Download,
  FileText,
  BoxSelectIcon,
  Building2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { CreateResourceDialog } from "@/components/resources/CreateResourceDialog";

// ─── Animation Variants ──────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { y: 16, opacity: 0 },
  show: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" },
  }),
};

// ─── Journal Card ────────────────────────────────────────────────────────
function JournalCard({ doc, index }: { doc: any; index: number }) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="group relative bg-white border border-zinc-100 rounded-xl overflow-hidden
                 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300"
    >
      {/* Clickable overlay */}
      <Link href={`/resources/${doc.id}`} className="absolute inset-0 z-10" aria-label={`View ${doc.title}`} />

      {/* Cover Image */}
      <div className="aspect-[4/3] bg-zinc-50 overflow-hidden border-b border-zinc-100 relative">
        {doc.coverImageUrl ? (
          <img
            src={doc.coverImageUrl}
            alt={`Cover for ${doc.title}`}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 group-hover:from-blue-50 group-hover:to-blue-100 transition-colors duration-300">
            <FileText className="w-10 h-10 text-zinc-200 group-hover:text-blue-200 transition-colors duration-300" />
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2 z-20">
          <span className="text-[8px] font-bold uppercase tracking-widest text-blue-900 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full border border-zinc-100 shadow-sm">
            {doc.resourceType?.replace(/_/g, ' ') ?? "DOC"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 truncate max-w-[70%]">
            {doc.department}
          </span>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
            {doc.publicationYear}
          </span>
        </div>

        <h4 className="text-sm font-bold text-zinc-900 line-clamp-2 leading-snug group-hover:text-blue-900 transition-colors">
          {doc.title}
        </h4>

        <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wide truncate">
          {doc.authors?.join(", ")}
        </p>

        {/* Footer */}
        <div className="mt-2 pt-3 border-t border-zinc-50 flex items-center gap-1.5 text-zinc-300 group-hover:text-blue-400 transition-colors">
          <Download className="w-3 h-3" />
          <span className="text-[10px] font-bold">{doc.downloadCount ?? 0} downloads</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Skeleton Cards ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-zinc-100 rounded-xl overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

import { useResources } from "@/hooks/useResources";

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function JournalsPage() {
  const { selectedDepartment } = useDepartmentStore();
  const { isStaffOrAdmin } = useRole();

  const [page, setPage] = useState(1);

  const { data: resourcesData, isLoading: isLoadingResources } = useResources({
    department: selectedDepartment || undefined,
    resourceType: "JOURNAL",
    page,
  });

  const journals = resourcesData?.data ?? [];
  const pagination = resourcesData?.pagination;

  return (
    <div className="flex flex-col gap-6 min-h-0 animate-in fade-in duration-500 pb-8">

      {/* ── Header ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <motion.div
          initial={{ x: -16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center gap-1.5 text-blue-900 font-bold text-[10px] uppercase bg-blue-50 w-fit px-3 py-1.5 rounded-full tracking-wider">
            <BookOpen className="w-3 h-3" />
            Academic Journals
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight leading-tight">
            Department Journals
          </h1>
          {selectedDepartment && (
            <p className="text-zinc-400 text-sm flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>Showing:</span>
              <span className="font-bold text-zinc-700">{selectedDepartment}</span>
            </p>
          )}
        </motion.div>

        {/* Right side actions */}
        <motion.div
          initial={{ x: 16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 w-full justify-start md:justify-end items-start sm:items-center"
        >
          {/* Staff/Admin Upload Button */}
          {isStaffOrAdmin && (
            <div className="mt-3 sm:mt-0 flex shrink-0 self-stretch items-center">
              <CreateResourceDialog forcedType="JOURNAL" forcedCategory="JOURNAL" />
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Content Panel ── */}
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">

        {/* Panel Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-50">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Journals
            {pagination && (
              <span className="text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full ml-1">
                {pagination.total ?? journals.length}
              </span>
            )}
          </h3>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev}
                aria-label="Previous page"
                className="border border-zinc-100 h-8 w-8 rounded-lg hover:bg-zinc-900 hover:text-white disabled:opacity-40 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-[10px] font-bold text-blue-900 tabular-nums min-w-[3rem] text-center">
                {page} / {pagination.totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNext}
                aria-label="Next page"
                className="border border-zinc-100 h-8 w-8 rounded-lg hover:bg-zinc-900 hover:text-white disabled:opacity-40 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Grid Content */}
        <div className="p-6">
          {isLoadingResources ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : journals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {journals.map((doc, i) => (
                <JournalCard key={doc.id} doc={doc} index={i} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-50 border-2 border-dashed border-zinc-200 flex items-center justify-center">
                <BoxSelectIcon className="w-7 h-7 text-zinc-300" />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-bold text-zinc-700 mb-1">No Records Found</h3>
                <p className="text-xs text-zinc-400 max-w-xs">
                  No journals have been published yet.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Pagination (mobile-friendly) */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-50 sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrev}
              className="text-xs font-bold"
            >
              <ChevronLeft className="w-3 h-3 mr-1" /> Prev
            </Button>
            <span className="text-xs font-bold text-zinc-500">
              Page {page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNext}
              className="text-xs font-bold"
            >
              Next <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
