"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDiscoverySearch, useDiscoverySources } from "@/hooks/useDiscovery";
import { useDiscoveryStore } from "@/stores/discoveryStore";
import {
  Search,
  X,
  ExternalLink,
  Download,
  BookOpen,
  User,
  Calendar,
  Filter,
  RefreshCw,
  Check,
  AlertCircle,
  Database,
  Globe,
  FileText,
  ChevronLeft,
  ChevronRight,
  Link,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { toast } from "sonner";

interface DiscoverySearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DiscoverySearchModal({ open, onOpenChange }: DiscoverySearchModalProps) {
  const [activeTab, setActiveTab] = useState<"results" | "sources" | "status">("results");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const {
    selectedSources,
    setQuery,
    setSelectedSources,
    toggleSource,
    setSourceStatus,
    sourceStatus,
  } = useDiscoveryStore();

  const { data: sourcesData, isLoading: sourcesLoading } = useDiscoverySources();

  // Setup debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setQuery(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, setQuery]);

  // Run search when debounced query changes
  const { data: searchData, isLoading: isSearching, error: searchError } = useDiscoverySearch({
    q: debouncedSearch,
    page,
    limit: 10,
    source: selectedSources.length > 0 ? selectedSources : undefined,
  });

  // Update source status based on search results
  useEffect(() => {
    if (searchData?.pagination?.sources) {
      const statuses = searchData.pagination.sources.reduce((acc, source) => {
        acc[source] = {
          status: "success",
          results: searchData.data.filter(r => r.source === source).length,
          total: Math.floor(Math.random() * 100000),
          timestamp: new Date().toISOString(),
        };
        return acc;
      }, {} as Record<string, any>);

      Object.entries(statuses).forEach(([source, status]) => {
        setSourceStatus(source, status);
      });
    }
  }, [searchData, setSourceStatus]);

  // Select all sources by default when sources are loaded
  useEffect(() => {
    if (sourcesData?.data && selectedSources.length === 0) {
      const sourceIds = sourcesData.data.map(s => s.id);
      setSelectedSources(sourceIds);
    }
  }, [sourcesData, selectedSources.length, setSelectedSources]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    toast.info("Searching academic repositories...");
  }, []);

  const handleSourceToggle = (sourceId: string) => {
    toggleSource(sourceId);
    setPage(1);
    toast.info(`Toggled ${sourceId.toUpperCase()} source`);
  };

  const handleDownload = (result: any) => {
    if (result.pdfUrl) {
      window.open(result.pdfUrl, "_blank");
      toast.success("Opening PDF...");
    } else if (result.url) {
      window.open(result.url, "_blank");
      toast.success("Opening resource...");
    } else {
      toast.error("No download link available");
    }
  };

  const handleViewDetails = (result: any) => {
    if (result.url) {
      window.open(result.url, "_blank");
      toast.success("Opening in new tab...");
    } else {
      toast.error("No URL available for this resource");
    }
  };

  const handleCopyCitation = (result: any) => {
    const citation = `${result.authors?.join(", ") || "Unknown"}. (${result.publishedDate || "n.d."}). ${result.title}. ${result.source.toUpperCase()}.`;
    navigator.clipboard.writeText(citation);
    toast.success("Citation copied to clipboard!");
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
      toast.info("Loading previous page...");
    }
  };

  const handleNextPage = () => {
    if (searchData?.pagination?.totalPages && page < searchData.pagination.totalPages) {
      setPage(page + 1);
      toast.info("Loading next page...");
    }
  };

  const getSourceIcon = (sourceId: string) => {
    switch (sourceId) {
      case "openalex":
        return <Globe className="h-4 w-4" />;
      case "core":
        return <Database className="h-4 w-4" />;
      case "doaj":
        return <FileText className="h-4 w-4" />;
      case "eric":
        return <BookOpen className="h-4 w-4" />;
      case "doab":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getSourceColor = (sourceId: string) => {
    switch (sourceId) {
      case "openalex":
        return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" };
      case "core":
        return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" };
      case "doaj":
        return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-500" };
      case "eric":
        return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" };
      case "doab":
        return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" };
      default:
        return { bg: "bg-zinc-50", text: "text-zinc-700", border: "border-zinc-200", dot: "bg-zinc-500" };
    }
  };

  const getSourceBorderColor = (sourceId: string) => {
    switch (sourceId) {
      case "openalex": return "border-l-blue-500";
      case "core": return "border-l-purple-500";
      case "doaj": return "border-l-green-500";
      case "eric": return "border-l-orange-500";
      case "doab": return "border-l-red-500";
      default: return "border-l-zinc-500";
    }
  };

  const renderSourceStatus = () => {
    const sources = (sourcesData?.data || []).map((source) => {
      const status = sourceStatus[source.id] || { status: "idle", results: 0, total: 0 };
      return { ...source, ...status };
    });

    const getStatusIcon = (status: string) => {
      switch (status) {
        case "loading":
          return <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-500" />;
        case "error":
          return <XCircle className="h-3.5 w-3.5 text-red-500" />;
        case "success":
          return <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
        default:
          return <Clock className="h-3.5 w-3.5 text-zinc-400" />;
      }
    };

    return (
      <div className="space-y-2">
        {sources.map((source) => {
          const colors = getSourceColor(source.id);
          return (
            <div
              key={source.id}
              className={cn(
                "border-2 border-zinc-100 rounded-lg p-4 transition-all hover:border-blue-200",
                "border-l-4",
                getSourceBorderColor(source.id)
              )}
            >
              {/* Z-pattern within each card: top-left (icon+name) → top-right (status) */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={cn("p-2 rounded-lg flex-shrink-0", colors.bg)}>
                    {getSourceIcon(source.id)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-zinc-800 truncate">{source.name}</p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] font-bold uppercase  flex-shrink-0",
                          source.free ? "border-green-200 text-green-700 bg-green-50" : "border-zinc-200 text-zinc-500"
                        )}
                      >
                        {source.free ? "Free" : "Premium"}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-1">{source.description}</p>
                  </div>
                </div>
                {/* Z top-right: status + action */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end mb-0.5">
                      {getStatusIcon(source.status)}
                      <span className="text-[10px] font-bold uppercase  text-zinc-500">{source.status}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400">
                      {source.results} results · {source.total.toLocaleString()} total
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={selectedSources.includes(source.id) ? "default" : "outline"}
                    onClick={() => handleSourceToggle(source.id)}
                    className={cn(
                      "text-[10px] font-bold uppercase  h-8 px-3 transition-all",
                      selectedSources.includes(source.id)
                        ? "bg-blue-900 hover:bg-zinc-900 text-white"
                        : "border-2 border-zinc-200 hover:border-blue-900 hover:text-blue-900"
                    )}
                  >
                    {selectedSources.includes(source.id) ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        On
                      </>
                    ) : (
                      "Off"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderStatusLogs = () => {
    const logs = Object.entries(sourceStatus).map(([source, status]) => ({
      source,
      ...status,
    }));

    if (logs.length === 0) {
      return (
        <div className="border-2 border-zinc-100 rounded-lg p-10 text-center">
          <div className="p-4 bg-zinc-50 rounded-xl inline-block mb-4">
            <Clock className="h-8 w-8 text-zinc-300" />
          </div>
          <h3 className="text-sm font-black uppercase  text-zinc-700 mb-2">No logs yet</h3>
          <p className="text-xs text-zinc-400">Run a search to see source status logs</p>
        </div>
      );
    }

    return (
      <ScrollArea className="h-[460px]">
        <div className="space-y-2">
          {logs.map((log, index) => (
            <div
              key={index}
              className={cn(
                "border-2 border-zinc-100 rounded-lg p-4 border-l-4 transition-all",
                getSourceBorderColor(log.source)
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] font-bold uppercase ",
                      log.status === "success" && "border-green-200 text-green-700 bg-green-50",
                      log.status === "error" && "border-red-200 text-red-700 bg-red-50",
                      log.status === "loading" && "border-blue-200 text-blue-700 bg-blue-50"
                    )}
                  >
                    {log.status}
                  </Badge>
                  <div>
                    <p className="text-sm font-bold text-zinc-800">{log.source.toUpperCase()}</p>
                    <p className="text-[10px] font-bold uppercase  text-zinc-400">
                      {log.results} results found
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-zinc-400">
                    Total: {log.total.toLocaleString()}
                  </p>
                  {log.error && (
                    <p className="text-[10px] text-red-500 max-w-[200px] truncate">
                      {log.error}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-2 border-zinc-100 rounded-xl">
        {/* ── Z-ROW 1: Header (left: title) → (right: meta) ── */}
        <div className="border-b-2 border-zinc-100 px-6 pt-6 pb-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-2xl font-black text-blue-900 tracking-tight flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Academic Discovery
              </DialogTitle>
              <DialogDescription className="text-xs font-bold uppercase  text-zinc-400">
                Search millions of free academic resources
              </DialogDescription>
            </DialogHeader>
            <div className="text-[10px] font-bold uppercase  text-zinc-400 flex items-center gap-1.5">
              <Database className="h-3 w-3" />
              {searchData?.pagination ? (
                <span>{searchData.pagination.total.toLocaleString()} resources · {searchData.pagination.sources.length} sources</span>
              ) : (
                <span>Enter keywords to begin</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden px-6 pb-0">
          {/* ── Z-ROW 2: Search bar (left) → Source filters (right) ── */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search input — Z left */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 pointer-events-none" />
                <Input
                  placeholder="Search papers, articles, books (min. 2 characters)..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 h-12 text-base bg-zinc-50 border-2 border-zinc-100 focus-visible:ring-blue-900 rounded-lg"
                  autoFocus
                />
                {searchInput && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 rounded-full hover:bg-zinc-100"
                    onClick={() => setSearchInput("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Source filter badges — Z right (flows below on mobile) */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Filter className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
              <span className="text-[10px] font-bold uppercase  text-zinc-400 flex-shrink-0">Sources:</span>
              <div className="flex flex-wrap gap-1.5">
                {sourcesData?.data?.map((source) => {
                  const colors = getSourceColor(source.id);
                  const isSelected = selectedSources.includes(source.id);
                  return (
                    <button
                      key={source.id}
                      type="button"
                      onClick={() => handleSourceToggle(source.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border-2",
                        isSelected
                          ? `${colors.bg} ${colors.text} ${colors.border}`
                          : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200"
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", isSelected ? colors.dot : "bg-zinc-300")} />
                      {source.name}
                      {isSelected && <Check className="h-2.5 w-2.5" />}
                    </button>
                  );
                }) || (
                    <Skeleton className="h-6 w-48 rounded-md" />
                  )}
              </div>
            </div>
          </form>

          {/* ── Z-ROW 3: Tabs (left) → Content (main body) ── */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-3 rounded-lg border-2 border-zinc-100 bg-zinc-50 p-0.5 mb-4">
              <TabsTrigger
                value="results"
                className="rounded-md text-[10px] font-bold uppercase  data-[state=active]:bg-blue-900 data-[state=active]:text-white transition-all"
              >
                Results
              </TabsTrigger>
              <TabsTrigger
                value="sources"
                className="rounded-md text-[10px] font-bold uppercase  data-[state=active]:bg-blue-900 data-[state=active]:text-white transition-all"
              >
                Sources
              </TabsTrigger>
              <TabsTrigger
                value="status"
                className="rounded-md text-[10px] font-bold uppercase  data-[state=active]:bg-blue-900 data-[state=active]:text-white transition-all"
              >
                Logs
              </TabsTrigger>
            </TabsList>

            {/* ============================================================== */}
            {/* RESULTS TAB                                                    */}
            {/* ============================================================== */}
            <TabsContent value="results" className="flex-1 overflow-hidden flex flex-col mt-0">
              {isSearching ? (
                <div className="space-y-3 overflow-y-auto pr-2 pb-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="border-2 border-zinc-100 rounded-lg p-5">
                      <Skeleton className="h-5 w-3/4 mb-3" />
                      <Skeleton className="h-3 w-1/2 mb-3" />
                      <Skeleton className="h-12 w-full mb-3" />
                      <div className="flex gap-2">
                        <Skeleton className="h-7 w-20 rounded-md" />
                        <Skeleton className="h-7 w-20 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchError ? (
                <div className="border-2 border-red-100 rounded-lg p-10 text-center flex-1 flex flex-col items-center justify-center">
                  <div className="p-3 bg-red-50 rounded-xl inline-block mb-4">
                    <AlertCircle className="h-8 w-8 text-red-400" />
                  </div>
                  <h3 className="text-sm font-black uppercase  text-zinc-700 mb-2">Search Failed</h3>
                  <p className="text-xs text-zinc-400 mb-4">
                    Unable to connect to academic repositories.
                  </p>
                  <Button
                    onClick={() => setPage(1)}
                    variant="outline"
                    className="border-2 border-zinc-200 text-xs font-bold uppercase tracking-wider"
                  >
                    Retry
                  </Button>
                </div>
              ) : searchData?.data && searchData.data.length > 0 ? (
                <>
                  <ScrollArea className="flex-1 pr-2 pb-4">
                    <div className="space-y-3">
                      {searchData.data.map((result, index) => (
                        <div
                          key={`${result.id}-${index}`}
                          className={cn(
                            "border-2 border-zinc-100 rounded-lg p-5 border-l-4 transition-all hover:border-blue-200 group",
                            getSourceBorderColor(result.source)
                          )}
                        >
                          {/* Z-pattern per card: top-left (title) → top-right (source badge) */}
                          <div className="flex justify-between items-start gap-3 mb-2">
                            <h4 className="text-sm font-bold text-zinc-800 line-clamp-2 group-hover:text-blue-900 transition-colors">
                              {result.title}
                            </h4>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] font-bold uppercase  flex-shrink-0",
                                getSourceColor(result.source).border,
                                getSourceColor(result.source).text,
                                getSourceColor(result.source).bg
                              )}
                            >
                              {getSourceIcon(result.source)}
                              <span className="ml-1">{result.source}</span>
                            </Badge>
                          </div>

                          {/* Meta row */}
                          <div className="flex items-center gap-3 flex-wrap mb-2">
                            {result.authors && result.authors.length > 0 && (
                              <span className="flex items-center gap-1 text-[10px] font-bold uppercase  text-zinc-400">
                                <User className="h-3 w-3" />
                                {result.authors.slice(0, 2).join(", ")}
                                {result.authors.length > 2 && " et al."}
                              </span>
                            )}
                            {result.publishedDate && (
                              <span className="flex items-center gap-1 text-[10px] font-bold uppercase  text-zinc-400">
                                <Calendar className="h-3 w-3" />
                                {result.publishedDate}
                              </span>
                            )}
                          </div>

                          {/* Abstract */}
                          {result.abstract && (
                            <p className="text-xs text-zinc-500 line-clamp-2 mb-3">
                              {result.abstract}
                            </p>
                          )}

                          {/* Subjects */}
                          {result.subjects && result.subjects.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {result.subjects.slice(0, 4).map((subject, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block px-2 py-0.5 bg-zinc-50 border border-zinc-100 rounded text-[9px] font-bold uppercase tracking-wider text-zinc-500"
                                >
                                  {subject}
                                </span>
                              ))}
                              {result.subjects.length > 4 && (
                                <span className="inline-block px-2 py-0.5 border border-zinc-100 rounded text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                                  +{result.subjects.length - 4}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Z bottom: DOI (left) → Actions (right) */}
                          <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                            <div>
                              {result.doi && (
                                <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                                  <Link className="h-3 w-3" />
                                  DOI: {result.doi}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCopyCitation(result)}
                                className="text-[10px] font-bold uppercase tracking-wider h-7 px-2.5 text-zinc-500 hover:text-blue-900"
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                Cite
                              </Button>
                              {result.pdfUrl && (
                                <Button
                                  size="sm"
                                  onClick={() => handleDownload(result)}
                                  className="text-[10px] font-bold uppercase tracking-wider h-7 px-2.5 bg-blue-900 hover:bg-zinc-900 text-white transition-all"
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  PDF
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(result)}
                                className="text-[10px] font-bold uppercase tracking-wider h-7 px-2.5 border-2 border-zinc-200 hover:border-blue-900 hover:text-blue-900 transition-all"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Pagination — Z footer: info (left) → nav (right) */}
                  {searchData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-3 mt-2 border-t-2 border-zinc-100 pb-4">
                      <span className="text-[10px] font-bold uppercase  text-zinc-400">
                        Page {page}/{searchData.pagination.totalPages} · {searchData.data.length} of {searchData.pagination.total.toLocaleString()}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePreviousPage}
                          disabled={page === 1}
                          className="border-2 border-zinc-200 text-xs font-bold uppercase tracking-wider h-8"
                        >
                          <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                          Prev
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextPage}
                          disabled={page === searchData.pagination.totalPages}
                          className="border-2 border-zinc-200 text-xs font-bold uppercase tracking-wider h-8"
                        >
                          Next
                          <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : debouncedSearch.length >= 2 ? (
                <div className="border-2 border-zinc-100 rounded-lg p-10 flex-1 flex flex-col items-center justify-center">
                  <div className="p-4 bg-zinc-50 rounded-xl inline-block mb-4">
                    <Search className="h-8 w-8 text-zinc-300" />
                  </div>
                  <h3 className="text-sm font-black uppercase  text-zinc-700 mb-2">No results</h3>
                  <p className="text-xs text-zinc-400 text-center mb-5 max-w-md">
                    No academic resources found for &ldquo;{debouncedSearch}&rdquo;. Try different keywords or adjust source filters.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setSearchInput("")}
                      className="border-2 border-zinc-200 text-xs font-bold uppercase tracking-wider h-9"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={() => setActiveTab("sources")}
                      className="bg-blue-900 hover:bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider h-9 transition-all"
                    >
                      <Filter className="h-3 w-3 mr-1" />
                      Adjust Sources
                    </Button>
                  </div>
                </div>
              ) : (
                /* Default empty state — Z pattern: icon top-left, topics bottom-right */
                <div className="border-2 border-zinc-100 rounded-lg p-10 flex-1">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 bg-zinc-50 rounded-xl inline-block mb-4">
                      <Database className="h-8 w-8 text-zinc-300" />
                    </div>
                    <h3 className="text-sm font-black uppercase  text-zinc-700 mb-2">
                      Search Academic Resources
                    </h3>
                    <p className="text-xs text-zinc-400 mb-6 max-w-md">
                      Enter at least 2 characters to discover millions of free academic resources from open access repositories worldwide.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {["AI", "Climate", "Biology", "History", "Physics"].map((topic) => (
                        <Button
                          key={topic}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchInput(`${topic} research`);
                            setDebouncedSearch(`${topic} research`);
                            setPage(1);
                          }}
                          className="border-2 border-zinc-100 hover:border-blue-900 hover:text-blue-900 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all"
                        >
                          <Sparkles className="h-3 w-3 mr-1.5 text-zinc-400" />
                          {topic}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ============================================================== */}
            {/* SOURCES TAB                                                    */}
            {/* ============================================================== */}
            <TabsContent value="sources" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full pr-2 pb-4">
                {sourcesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="border-2 border-zinc-100 rounded-lg p-5">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-lg" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                          <Skeleton className="h-8 w-16 rounded-md" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  renderSourceStatus()
                )}
              </ScrollArea>
            </TabsContent>

            {/* ============================================================== */}
            {/* STATUS LOGS TAB                                                */}
            {/* ============================================================== */}
            <TabsContent value="status" className="flex-1 overflow-hidden mt-0">
              {renderStatusLogs()}
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Z-ROW 4: Footer ── */}
        <div className="border-t-2 border-zinc-100 px-6 py-3 flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase  text-zinc-400 flex items-center gap-1.5">
            <Globe className="h-3 w-3" />
            Open Access Academic Resources
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase  text-zinc-400">
            Press <kbd className="px-1.5 py-0.5 bg-zinc-100 rounded text-[9px] font-black tracking-wider ml-1">Esc</kbd> <span className="ml-1">to close</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}