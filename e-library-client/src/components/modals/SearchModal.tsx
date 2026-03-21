import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSearchResults, useSearchSuggestions } from "@/hooks/useSearch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Search,
  FileText,
  BookOpen,
  User,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  Globe,
  Database,
  BookOpenIcon,
  Library,
} from "lucide-react";
import { debounce } from "@/lib/utils";
import { useDiscoverySources } from "@/hooks/useDiscovery";
import { DiscoverySearchModal } from "./DiscoverySearchModal";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"local" | "discovery">("local");
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);

  const { data: sourcesData } = useDiscoverySources();
  const { data: suggestions, isLoading: loadingSuggestions } = useSearchSuggestions(
    debouncedQuery
  );
  const {
    data: results,
    isLoading: loadingResults,
    error: resultsError,
  } = useSearchResults(debouncedQuery, { page, limit: 9 });

  const debouncedSetQuery = useCallback(
    debounce((value: string) => {
      setDebouncedQuery(value);
      setPage(1);
    }, 300),
    []
  );

  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebouncedQuery("");
      setPage(1);
    }
  }, [open]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    debouncedSetQuery(value);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "resource":
        return FileText;
      case "course":
        return BookOpen;
      case "user":
        return User;
      default:
        return FileText;
    }
  };

  const handleResultClick = (resource: any) => {
    onOpenChange(false);
    router.push(`/resources/${resource.id}`);
  };

  const handleRequestResource = () => {
    onOpenChange(false);
    router.push("/requests");
  };

  const getSourceIcon = (sourceId: string) => {
    switch (sourceId) {
      case "openalex":
        return Globe;
      case "core":
        return Database;
      case "doaj":
        return FileText;
      case "eric":
        return BookOpenIcon;
      case "doab":
        return Library;
      default:
        return Database;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto rounded-xl border-2 border-zinc-100 p-0">
          {/* ── Z-ROW 1: Header (left: branding + tabs) → (right: search input) ── */}
          <div className="border-b-2 border-zinc-100 px-6 pt-6 pb-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              {/* Z top-left: Title + Tabs */}
              <DialogHeader className="space-y-1 flex-shrink-0">
                <DialogTitle className="text-2xl font-black text-blue-900 tracking-tight flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search
                </DialogTitle>
                <DialogDescription className="text-xs font-bold uppercase  text-zinc-400">
                  Campus resources &amp; academic discovery
                </DialogDescription>
              </DialogHeader>

              {/* Z top-right: Tab switcher */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="grid grid-cols-2 w-full md:w-[320px] rounded-lg border-2 border-zinc-100 bg-zinc-50 p-0.5">
                  <TabsTrigger
                    value="local"
                    className="flex items-center gap-2 rounded-md text-xs font-bold uppercase tracking-wider data-[state=active]:bg-blue-900 data-[state=active]:text-white transition-all"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Campus
                  </TabsTrigger>
                  <TabsTrigger
                    value="discovery"
                    className="flex items-center gap-2 rounded-md text-xs font-bold uppercase tracking-wider data-[state=active]:bg-blue-900 data-[state=active]:text-white transition-all"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Discovery
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* ── BODY ── */}
          <div className="px-6 pb-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              {/* ================================================================ */}
              {/* LOCAL RESOURCES TAB                                              */}
              {/* ================================================================ */}
              <TabsContent value="local" className="mt-0 space-y-5">
                {/* Search input bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 pointer-events-none" />
                  <Input
                    placeholder="Search courses, books, papers..."
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    className="pl-10 h-12 text-base bg-zinc-50 border-2 border-zinc-100 focus-visible:ring-blue-900 rounded-lg"
                    autoFocus
                  />
                  {query && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 rounded-full hover:bg-zinc-100"
                      onClick={() => { setQuery(""); setDebouncedQuery(""); }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {debouncedQuery.length >= 2 && (
                  <>
                    {/* ── Z-ROW 2: Suggestions (left) → Results count (right) ── */}
                    {!loadingSuggestions && suggestions && suggestions.length > 0 && (
                      <div className="border-2 border-zinc-100 rounded-lg p-4">
                        <h4 className="text-[10px] font-bold uppercase  text-zinc-400 mb-3">
                          Quick suggestions
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {suggestions.slice(0, 6).map((suggestion) => {
                            const Icon = getIconForType(suggestion.type);
                            return (
                              <Button
                                key={suggestion.id}
                                variant="outline"
                                size="sm"
                                className="gap-2 border-2 border-zinc-100 hover:border-blue-900 hover:text-blue-900 rounded-lg text-xs font-bold transition-all"
                                onClick={() => {
                                  if (suggestion.type === "resource") {
                                    onOpenChange(false);
                                    router.push(`/resources/${suggestion.id}`);
                                  } else if (suggestion.type === "course") {
                                    onOpenChange(false);
                                    router.push(`/courses/${suggestion.id}`);
                                  }
                                }}
                              >
                                <Icon className="h-3.5 w-3.5" />
                                <span className="truncate max-w-[200px]">
                                  {suggestion.title}
                                </span>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Results header */}
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase  text-zinc-500">
                        {loadingResults
                          ? "Searching..."
                          : results?.data?.length
                            ? `${results.pagination.total} result${results.pagination.total !== 1 ? "s" : ""
                            } found`
                            : "No results found"}
                      </h4>
                      {results?.pagination && results.pagination.totalPages > 1 && (
                        <span className="text-[10px] font-bold uppercase  text-zinc-400">
                          Page {results.pagination.page}/{results.pagination.totalPages}
                        </span>
                      )}
                    </div>

                    {/* Loading skeleton */}
                    {loadingResults && (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="border-2 border-zinc-100 rounded-lg p-4">
                            <Skeleton className="h-4 w-3/4 mb-3" />
                            <Skeleton className="h-3 w-full mb-2" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Error state */}
                    {resultsError && !loadingResults && (
                      <div className="border-2 border-red-100 rounded-lg p-8 text-center">
                        <Search className="h-10 w-10 text-red-400 mx-auto mb-3" />
                        <h3 className="text-sm font-black uppercase  text-zinc-700 mb-2">Search Error</h3>
                        <p className="text-xs text-zinc-500 mb-4">
                          Something went wrong. Please try again.
                        </p>
                        <Button
                          onClick={() => handleQueryChange(query)}
                          variant="outline"
                          className="border-2 border-zinc-200 text-xs font-bold uppercase tracking-wider"
                        >
                          Retry Search
                        </Button>
                      </div>
                    )}

                    {/* ── Z-ROW 3: Results Grid (diagonal Z flow across cards) ── */}
                    {!loadingResults &&
                      !resultsError &&
                      results?.data &&
                      results.data.length > 0 && (
                        <>
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {results.data.map((resource) => (
                              <div
                                key={resource.id}
                                className="group border-2 border-zinc-100 rounded-lg p-4 hover:border-blue-900 cursor-pointer transition-all"
                                onClick={() => handleResultClick(resource)}
                              >
                                {/* Card top: icon + badge (Z top-left → top-right) */}
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2 bg-blue-50 rounded-lg">
                                    <FileText className="h-4 w-4 text-blue-900" />
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className="text-[9px] font-bold uppercase  bg-zinc-100 text-zinc-600"
                                  >
                                    {resource.type}
                                  </Badge>
                                </div>
                                {/* Card body: title + description */}
                                <h5 className="text-sm font-bold text-zinc-800 line-clamp-2 mb-1 group-hover:text-blue-900 transition-colors">
                                  {resource.title}
                                </h5>
                                <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
                                  {resource.description}
                                </p>
                                {/* Card bottom: category + arrow (Z bottom-left → bottom-right) */}
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold uppercase  text-zinc-400 truncate">
                                    {resource.category}
                                  </span>
                                  <ArrowRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-blue-900 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Pagination */}
                          {results.pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 pt-3 border-t-2 border-zinc-100">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={!results.pagination.hasPrev}
                                className="border-2 border-zinc-200 text-xs font-bold uppercase tracking-wider"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <span className="text-[10px] font-bold uppercase  text-zinc-400 px-2">
                                {results.pagination.page} / {results.pagination.totalPages}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={!results.pagination.hasNext}
                                className="border-2 border-zinc-200 text-xs font-bold uppercase tracking-wider"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </>
                      )}

                    {/* Empty state — Z diagonal: icon top-left, CTA bottom-right */}
                    {!loadingResults &&
                      !resultsError &&
                      debouncedQuery.length >= 2 &&
                      results?.data &&
                      results.data.length === 0 && (
                        <div className="border-2 border-zinc-100 rounded-lg p-10">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            {/* Z bottom-left: messaging */}
                            <div className="flex items-start gap-4">
                              <div className="p-3 bg-zinc-50 rounded-lg flex-shrink-0">
                                <Search className="h-8 w-8 text-zinc-300" />
                              </div>
                              <div>
                                <h3 className="text-sm font-black uppercase  text-zinc-700 mb-1">No results</h3>
                                <p className="text-xs text-zinc-400 max-w-sm">
                                  Nothing matched &ldquo;{debouncedQuery}&rdquo;. Try different keywords or request this resource.
                                </p>
                              </div>
                            </div>
                            {/* Z bottom-right: actions */}
                            <div className="flex gap-3 flex-shrink-0">
                              <Button
                                onClick={handleRequestResource}
                                className="bg-blue-900 hover:bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider h-10 px-5 transition-all"
                              >
                                <ExternalLink className="h-3.5 w-3.5 mr-2" />
                                Request
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setActiveTab("discovery")}
                                className="border-2 border-zinc-200 text-xs font-bold uppercase tracking-wider h-10 px-5 hover:border-blue-900 hover:text-blue-900 transition-all"
                              >
                                <Globe className="h-3.5 w-3.5 mr-2" />
                                Online
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                  </>
                )}

                {/* Default state */}
                {query.length < 2 && (
                  <div className="border-2 border-zinc-100 rounded-lg p-10 text-center">
                    <div className="p-4 bg-zinc-50 rounded-xl inline-block mb-4">
                      <Search className="h-10 w-10 text-zinc-300" />
                    </div>
                    <h3 className="text-sm font-black uppercase  text-zinc-700 mb-2">Start searching</h3>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      Enter at least 2 characters to search local resources
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* ================================================================ */}
              {/* DISCOVERY TAB                                                    */}
              {/* ================================================================ */}
              <TabsContent value="discovery" className="mt-0">
                {/* ── Z-ROW 2: Hero (left: text + CTA) → (right: sources grid) ── */}
                <div className="border-2 border-zinc-100 rounded-lg p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                    {/* Z left: Hero messaging */}
                    <div className="flex-1 space-y-4">
                      <div className="p-3 bg-blue-50 rounded-lg inline-block">
                        <Globe className="h-8 w-8 text-blue-900" />
                      </div>
                      <h3 className="text-xl font-black text-blue-900 tracking-tight">
                        Search Millions of Academic Resources
                      </h3>
                      <p className="text-sm text-zinc-500 max-w-md">
                        Access millions of free academic papers, articles, and books from
                        open access repositories worldwide. All resources are completely free.
                      </p>

                      {/* Quick search trigger */}
                      <div className="space-y-3 pt-2">
                        <div
                          className="relative cursor-pointer"
                          onClick={() => setShowDiscoveryModal(true)}
                        >
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 pointer-events-none" />
                          <Input
                            placeholder="Enter research topic, keywords..."
                            className="pl-10 h-12 text-base bg-zinc-50 border-2 border-zinc-100 cursor-pointer rounded-lg"
                            readOnly
                          />
                        </div>
                        <Button
                          onClick={() => setShowDiscoveryModal(true)}
                          className="w-full h-11 bg-blue-900 hover:bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider transition-all rounded-lg"
                        >
                          <Search className="mr-2 h-4 w-4" />
                          Open Discovery Search
                        </Button>
                      </div>
                    </div>

                    {/* Z right: Sources grid + features */}
                    <div className="lg:w-[340px] space-y-5">
                      {/* Sources */}
                      <div>
                        <h4 className="text-[10px] font-bold uppercase  text-zinc-400 mb-3">
                          Integrated Sources
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {sourcesData?.data?.map((source) => {
                            const Icon = getSourceIcon(source.id);
                            return (
                              <div
                                key={source.id}
                                className="flex items-center gap-2.5 p-3 bg-zinc-50 rounded-lg border-2 border-zinc-100"
                              >
                                <Icon className="h-4 w-4 text-blue-900 flex-shrink-0" />
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-zinc-700 block truncate">{source.name}</span>
                                  <span className="text-[9px] font-bold uppercase  text-zinc-400">
                                    {source.free ? "Free" : "Premium"}
                                  </span>
                                </div>
                              </div>
                            );
                          }) || (
                              <>
                                {["OpenAlex", "CORE", "DOAJ", "ERIC", "DOAB"].map((name) => (
                                  <div
                                    key={name}
                                    className="flex items-center gap-2.5 p-3 bg-zinc-50 rounded-lg border-2 border-zinc-100"
                                  >
                                    <Skeleton className="h-4 w-4 rounded" />
                                    <div className="flex-1">
                                      <Skeleton className="h-3 w-14 mb-1" />
                                      <Skeleton className="h-2 w-8" />
                                    </div>
                                  </div>
                                ))}
                              </>
                            )}
                        </div>
                      </div>

                      {/* Feature highlights — Z diagonal */}
                      <div className="border-t-2 border-zinc-100 pt-4 space-y-3">
                        <h4 className="text-[10px] font-bold uppercase  text-zinc-400">
                          Why Discovery?
                        </h4>
                        {[
                          { icon: Globe, label: "Global Access", desc: "Millions of resources worldwide" },
                          { icon: Database, label: "Free Resources", desc: "All open access, completely free" },
                          { icon: ExternalLink, label: "Direct Links", desc: "Direct links to papers & PDFs" },
                        ].map((feature) => (
                          <div key={feature.label} className="flex items-start gap-3">
                            <div className="p-1.5 bg-blue-50 rounded flex-shrink-0">
                              <feature.icon className="h-3 w-3 text-blue-900" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-zinc-700">{feature.label}</span>
                              <p className="text-[10px] text-zinc-400">{feature.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* ── Z-ROW 4: Footer bar ── */}
          <div className="border-t-2 border-zinc-100 px-6 py-3 flex justify-between items-center">
            <div className="text-[10px] font-bold uppercase  text-zinc-400">
              {activeTab === "discovery" && sourcesData?.data && (
                <span className="flex items-center gap-1.5">
                  <Database className="h-3 w-3" />
                  {sourcesData.data.length} sources available
                </span>
              )}
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase  text-zinc-400">
              Press <kbd className="px-1.5 py-0.5 bg-zinc-100 rounded text-[9px] font-black tracking-wider ml-1">Esc</kbd> <span className="ml-1">to close</span>
            </span>
          </div>
        </DialogContent>
      </Dialog>

      {/* Discovery Modal */}
      <DiscoverySearchModal
        open={showDiscoveryModal}
        onOpenChange={(open) => {
          setShowDiscoveryModal(open);
          if (!open) {
            setActiveTab("discovery");
          }
        }}
      />
    </>
  );
}