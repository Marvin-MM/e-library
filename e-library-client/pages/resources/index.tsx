import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useResources } from "@/hooks/useResources";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Upload,
  CloudUpload,
} from "lucide-react";
import { useRole } from "@/hooks/useAuth";
import { resourceTypeOptions, categoryOptions } from "@/schemas/resources";
import type { ResourceType } from "@/types/api";

export default function ResourcesPage() {
  const { isStaffOrAdmin } = useRole();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<ResourceType | "">("");
  const [category, setCategory] = useState("");

  const { data, isLoading } = useResources({
    page,
    limit: 12,
    search: search || undefined,
    type: type || undefined,
    category: category || undefined,
  });

  const resources = data?.data || [];
  const pagination = data?.pagination;

  return (
    <DashboardLayout title="Resources">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Resources</h2>
            <p className="text-muted-foreground">
              Browse and download educational resources
            </p>
          </div>
          {isStaffOrAdmin && (
            <Button asChild>
              <Link href="/resources/upload">
                <CloudUpload className="mr-2 h-4 w-4" />
                Upload Resource
              </Link>
            </Button>
          )}
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Select
                value={type || "all-types"}
                onValueChange={(value) => {
                  if (value === "all-types") {
                    setType("");
                  } else {
                    setType(value as ResourceType);
                  }
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">All Types</SelectItem>
                  {resourceTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={category || "all-categories"}
                onValueChange={(value) => {
                  if (value === "all-categories") {
                    setCategory("");
                  } else {
                    setCategory(value);
                  }
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">All Categories</SelectItem>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-32 w-full mb-4" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : resources.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {resources.map((resource, index) => (
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
                        <span className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {resource.downloadCount}
                        </span>
                        <span>{resource.category}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No resources found</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                {search || type || category
                  ? "Try adjusting your filters to find what you're looking for."
                  : "There are no resources available yet."}
              </p>
            </CardContent>
          </Card>
        )}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNext}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
