import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useSearchResults, useSearchSuggestions } from "@/hooks/useSearch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, BookOpen, User, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { debounce } from "@/lib/utils";

export default function SearchPage() {
  const router = useRouter();
  const { q } = router.query;
  const [query, setQuery] = useState((q as string) || "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [page, setPage] = useState(1);

  const { data: suggestions, isLoading: loadingSuggestions } = useSearchSuggestions(debouncedQuery);
  const { data: results, isLoading: loadingResults } = useSearchResults(debouncedQuery, { page, limit: 12 });

  const debouncedSetQuery = useCallback(
    debounce((value: string) => {
      setDebouncedQuery(value);
      setPage(1);
    }, 300),
    []
  );

  useEffect(() => {
    if (q && typeof q === "string") {
      setQuery(q);
      setDebouncedQuery(q);
    }
  }, [q]);

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

  return (
    <DashboardLayout title="Search">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Search</h2>
          <p className="text-muted-foreground">
            Find resources, courses, and more
          </p>
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for resources, courses..."
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </CardContent>
        </Card>
        {debouncedQuery.length >= 2 && (
          <>
            <AnimatePresence>
              {suggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion) => {
                          const Icon = getIconForType(suggestion.type);
                          return (
                            <Button
                              key={suggestion.id}
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => {
                                if (suggestion.type === "resource") {
                                  router.push(`/resources/${suggestion.id}`);
                                } else if (suggestion.type === "course") {
                                  router.push(`/courses/${suggestion.id}`);
                                }
                              }}
                            >
                              <Icon className="h-4 w-4" />
                              {suggestion.title}
                            </Button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {loadingResults
                    ? "Searching..."
                    : results?.data?.length
                    ? `${results.pagination.total} results found`
                    : "No results"}
                </h3>
              </div>
              {loadingResults ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <Skeleton className="h-32 w-full mb-4" />
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : results?.data && results.data.length > 0 ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {results.data.map((resource, index) => (
                      <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link href={`/resources/${resource.id}`}>
                          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <FileText className="h-6 w-6 text-primary" />
                                </div>
                                <Badge variant="secondary">{resource.type}</Badge>
                              </div>
                              <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                                {resource.title}
                              </CardTitle>
                              <CardDescription className="line-clamp-2">
                                {resource.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>{resource.category}</span>
                                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                  {results.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={!results.pagination.hasPrev}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground px-4">
                        Page {results.pagination.page} of {results.pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!results.pagination.hasNext}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No results found</h3>
                    <p className="text-muted-foreground text-center max-w-sm">
                      Try different keywords or check your spelling
                    </p>
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
    </DashboardLayout>
  );
}
