// components/modals/SearchModal.tsx
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  BookOpen,
  User,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { debounce } from "@/lib/utils";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Search Resources</DialogTitle>
          <DialogDescription>
            Find resources, courses, and more across the platform
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for resources, courses..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="pl-10 h-12 text-lg"
              autoFocus
            />
          </div>

          {debouncedQuery.length >= 2 && (
            <>
              <AnimatePresence>
                {!loadingSuggestions && suggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground">
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
                              className="gap-2"
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
                              <Icon className="h-4 w-4" />
                              <span className="truncate max-w-[200px]">
                                {suggestion.title}
                              </span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">
                    {loadingResults
                      ? "Searching..."
                      : results?.data?.length
                      ? `${results.pagination.total} result${
                          results.pagination.total !== 1 ? "s" : ""
                        } found`
                      : "No results found"}
                  </h4>
                </div>

                {loadingResults && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <Skeleton className="h-20 w-full mb-3" />
                          <Skeleton className="h-5 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {resultsError && !loadingResults && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <Search className="h-12 w-12 text-destructive mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Search Error</h3>
                      <p className="text-muted-foreground text-center max-w-sm mb-4">
                        Something went wrong while searching. Please try again.
                      </p>
                      <Button onClick={() => handleQueryChange(query)} variant="outline">
                        Retry Search
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {!loadingResults &&
                  !resultsError &&
                  results?.data &&
                  results.data.length > 0 && (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {results.data.map((resource, index) => (
                          <motion.div
                            key={resource.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card
                              className="h-full hover:shadow-md transition-shadow cursor-pointer group"
                              onClick={() => handleResultClick(resource)}
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="p-2 bg-primary/10 rounded-lg">
                                    <FileText className="h-5 w-5 text-primary" />
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    {resource.type}
                                  </Badge>
                                </div>
                                <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                                  {resource.title}
                                </CardTitle>
                                <CardDescription className="line-clamp-2 text-sm">
                                  {resource.description}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span className="truncate">{resource.category}</span>
                                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>

                      {results.pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={!results.pagination.hasPrev}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm text-muted-foreground px-2">
                            Page {results.pagination.page} of {results.pagination.totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={!results.pagination.hasNext}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}

                {!loadingResults &&
                  !resultsError &&
                  debouncedQuery.length >= 2 &&
                  results?.data &&
                  results.data.length === 0 && (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Search className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No results found</h3>
                        <p className="text-muted-foreground text-center max-w-sm mb-6">
                          We couldn't find any resources matching "{debouncedQuery}". Try
                          different keywords or request this resource.
                        </p>
                        <Button onClick={handleRequestResource} className="gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Request This Resource
                        </Button>
                      </CardContent>
                    </Card>
                  )}
              </div>
            </>
          )}

          {query.length < 2 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Start searching</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  Enter at least 2 characters to search for resources
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
