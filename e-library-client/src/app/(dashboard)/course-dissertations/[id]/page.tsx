"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { useResource, useDownloadResource, usePreviewResource } from "@/hooks/useResources";
import { formatDate } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

import {
  ArrowLeft,
  User,
  Tag,
  Loader2,
  Eye,
  Info,
  MapPin,
  Download,
  Image as ImageIcon,
  BookOpen,
  Calendar,
  Building2,
  FileWarning,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CourseRef {
  course: {
    id: string;
    code: string;
    name: string;
  };
}

interface CourseDissertationDetailProps {
  params: Promise<{ id: string }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Safely sanitize HTML only in the browser (DOMPurify is browser-only).
 * Returns an empty string on the server to avoid hydration mismatches.
 */
function useSanitizedHtml(html: string | undefined | null): string {
  const [sanitized, setSanitized] = useState("");

  useEffect(() => {
    if (!html) {
      setSanitized("");
      return;
    }
    // Dynamic import ensures DOMPurify is never bundled for SSR
    import("dompurify").then(({ default: DOMPurify }) => {
      setSanitized(DOMPurify.sanitize(html));
    });
  }, [html]);

  return sanitized;
}

// ─── Metadata Row ─────────────────────────────────────────────────────────────
function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | undefined | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-zinc-50 last:border-0">
      <div className="flex items-center gap-2 text-zinc-400 shrink-0">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-xs font-bold text-zinc-900 text-right truncate max-w-[55%]">{value}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CourseDissertationDetail({ params }: CourseDissertationDetailProps) {
  const { id } = use(params);
  const { data: resource, isLoading, error } = useResource(id);
  const { mutate: download, isPending: isDownloading } = useDownloadResource();
  const { mutate: getPreview, isPending: isGettingPreview } = usePreviewResource();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // ✅ FIX: DOMPurify is browser-only — use the safe hook
  const sanitizedAbstract = useSanitizedHtml(resource?.description);

  const handleDownload = useCallback(() => {
    if (resource?.id) download(resource.id);
  }, [download, resource?.id]);

  const handlePreview = useCallback(() => {
    if (!resource?.id) return;
    getPreview(resource.id, {
      onSuccess: (data) => {
        const isOfficeDoc =
          resource.fileType?.includes("document") ||
          resource.fileType?.includes("officedocument");

        const finalUrl = isOfficeDoc
          ? `https://docs.google.com/gview?url=${encodeURIComponent(data.url)}&embedded=true`
          : data.url;

        setPreviewUrl(finalUrl);
        setIsPreviewOpen(true);
      },
    });
  }, [getPreview, resource]);

  // Reset preview URL when dialog closes to avoid stale iframe
  const handlePreviewOpenChange = (open: boolean) => {
    setIsPreviewOpen(open);
    if (!open) setPreviewUrl(null);
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse font-titillium pb-8">
        <Skeleton className="h-4 w-40" />
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="w-40 md:w-56 aspect-[3/4] rounded-xl shrink-0" />
          <div className="flex-1 space-y-3 pt-2">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-48 mt-4" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !resource) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 font-titillium">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
          <FileWarning className="w-7 h-7 text-red-300" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-zinc-800 mb-1">Record Not Found</h3>
          <p className="text-sm text-zinc-400">This dissertation record could not be loaded.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/course-dissertations">
            <ArrowLeft className="w-3 h-3 mr-1.5" /> Back to Archive
          </Link>
        </Button>
      </div>
    );
  }

  const isDownloadable = resource.accessType === "DOWNLOADABLE";
  const isCampusOnly = resource.accessType === "CAMPUS_ONLY";
  const hasDigitalFile = !!(resource.s3Key || resource.cloudinaryUrl);
  const hasActions = (isDownloadable && hasDigitalFile) || hasDigitalFile || isCampusOnly;

  return (
    <div className="flex flex-col gap-6 font-titillium animate-in fade-in duration-500 pb-8">

      {/* ── Preview Dialog ── */}
      <Dialog open={isPreviewOpen} onOpenChange={handlePreviewOpenChange}>
        <DialogContent className="w-[95vw] max-w-6xl h-[90vh] flex flex-col p-0 overflow-hidden font-titillium border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="px-5 py-4 border-b border-zinc-100 shrink-0 bg-white">
            <DialogTitle className="text-base font-bold text-blue-900 flex items-center gap-2 leading-tight">
              <Eye className="w-4 h-4 shrink-0" />
              <span className="truncate">{resource.title}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 bg-zinc-100 min-h-0">
            {previewUrl ? (
              <iframe
                src={previewUrl}
                title={`Preview of ${resource.title}`}
                className="w-full h-full border-0"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Back Link ── */}
      <div>
        <Button variant="ghost" asChild className="p-0 h-auto text-[11px] font-bold text-blue-900 uppercase tracking-wider hover:text-blue-700 group">
          <Link href="/course-dissertations">
            <ArrowLeft className="w-3 h-3 mr-1.5 transition-transform group-hover:-translate-x-0.5" />
            Back to Course Archive
          </Link>
        </Button>
      </div>

      {/* ── Hero Header ── */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
        {/* Cover */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-36 sm:w-48 md:w-56 shrink-0"
        >
          <div className="aspect-[3/4] bg-zinc-50 border border-zinc-100 rounded-xl overflow-hidden shadow-md">
            {resource.coverImageUrl ? (
              <img
                src={resource.coverImageUrl}
                alt={`Cover image for ${resource.title}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100">
                <ImageIcon className="w-10 h-10 opacity-60" />
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">No Cover</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ x: -16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex-1 flex flex-col justify-center gap-3 min-w-0"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-50 px-3 py-1 rounded-full">
              {resource.category}
            </span>
            <span className="text-[10px] font-bold text-zinc-400">
              {formatDate(resource.createdAt)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 leading-tight tracking-tight">
            {resource.title}
          </h1>

          {resource.authors && resource.authors.length > 0 && (
            <div className="flex items-start gap-2 text-zinc-500 text-sm font-semibold">
              <User className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{resource.authors.join(", ")}</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Action Bar ── */}
      {hasActions && (
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-white border border-zinc-100 rounded-xl p-4 flex flex-wrap items-center gap-3 shadow-sm"
        >
          {isDownloadable && hasDigitalFile && (
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-blue-900 hover:bg-zinc-900 transition-colors text-white h-11 px-6 font-bold text-xs uppercase tracking-widest rounded-lg"
            >
              {isDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download Source
            </Button>
          )}

          {hasDigitalFile && (
            <Button
              onClick={handlePreview}
              disabled={isGettingPreview}
              variant="outline"
              className="border-2 border-zinc-100 h-11 px-6 font-bold text-xs uppercase tracking-widest rounded-lg hover:border-blue-200 hover:text-blue-900 transition-all"
            >
              {isGettingPreview ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Eye className="mr-2 h-4 w-4" />
              )}
              Inspect Document
            </Button>
          )}

          {isCampusOnly && resource.physicalLocation && (
            <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-100 px-5 py-3 rounded-lg ml-auto">
              <MapPin className="h-4 w-4 text-blue-900 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-900 leading-none mb-0.5">
                  Physical Hardcopy
                </p>
                <p className="text-sm font-bold text-zinc-900 leading-tight">{resource.physicalLocation}</p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Body ── */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Abstract */}
        <div className="lg:col-span-2 bg-white border border-zinc-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-50">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Info className="w-4 h-4" /> Defense Abstract
            </h3>
          </div>

          <div className="p-6">
            {sanitizedAbstract ? (
              <div
                className="prose prose-sm prose-zinc max-w-none text-zinc-600 leading-relaxed
                           prose-headings:font-bold prose-headings:text-zinc-800
                           prose-a:text-blue-700 prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: sanitizedAbstract }}
              />
            ) : (
              <p className="text-zinc-400 italic text-sm">No abstract provided for this research.</p>
            )}

            {resource.tags && resource.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-zinc-50">
                <h4 className="text-[10px] font-black tracking-widest text-blue-900 uppercase mb-3 flex items-center gap-2">
                  <Tag className="h-3 w-3" /> Core Competencies
                </h4>
                <div className="flex gap-2 flex-wrap">
                  {resource.tags.map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-zinc-50 border border-zinc-100 text-[10px] font-bold uppercase tracking-wider text-zinc-600 hover:bg-blue-50 hover:text-blue-900 hover:border-blue-100 transition-colors cursor-default"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          {/* Metadata */}
          <div className="bg-white border border-zinc-100 rounded-xl shadow-sm p-5">
            <h4 className="text-[10px] font-black tracking-widest uppercase text-zinc-500 mb-3 pb-2 border-b border-zinc-50">
              Defense Metadata
            </h4>
            <MetaRow icon={Calendar} label="Year" value={resource.publicationYear} />
            <MetaRow icon={Building2} label="Department" value={resource.department} />
          </div>

          {/* Courses Attached */}
          {resource.courses && resource.courses.length > 0 && (
            <div className="bg-white border border-zinc-100 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-50">
                <h4 className="text-[10px] font-black tracking-widest uppercase text-zinc-500">
                  Academic Context
                </h4>
              </div>
              <div className="p-2">
                {(resource.courses as CourseRef[]).map((cr) => (
                  <Link key={cr.course.id} href={`/courses/${cr.course.id}`}>
                    <div className="p-3 rounded-lg hover:bg-zinc-50 flex items-center gap-3 transition-colors group">
                      <div className="w-9 h-9 rounded-lg bg-white border border-zinc-100 flex items-center justify-center shrink-0 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
                        <BookOpen className="w-4 h-4 text-zinc-300 group-hover:text-blue-700 transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black tracking-widest uppercase text-blue-900 leading-none mb-0.5">
                          {cr.course.code}
                        </p>
                        <p className="text-xs font-bold text-zinc-800 truncate group-hover:text-blue-900 transition-colors">
                          {cr.course.name}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}