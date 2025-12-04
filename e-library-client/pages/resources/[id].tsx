import { useRouter } from "next/router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useResource, useDownloadResource } from "@/hooks/useResources";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  ArrowLeft,
  Calendar,
  User,
  Tag,
  BookOpen,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { formatDate, getInitials } from "@/lib/utils";
import DOMPurify from "dompurify";

export default function ResourceDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: resource, isLoading, error } = useResource(id as string);
  const { mutate: download, isPending: isDownloading } = useDownloadResource();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-32" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !resource) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Resource not found</h3>
              <p className="text-muted-foreground mb-4">
                The resource you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <Button asChild>
                <Link href="/resources">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Resources
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const handleDownload = () => {
    download(resource.id);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/resources">
            <ArrowLeft className="h-4 w-4" />
            Back to Resources
          </Link>
        </Button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{resource.title}</CardTitle>
                    <CardDescription className="mt-1">
                      <span className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(resource.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {resource.downloadCount} downloads
                        </span>
                      </span>
                    </CardDescription>
                  </div>
                </div>
                <Button onClick={handleDownload} disabled={isDownloading} size="lg">
                  {isDownloading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge>{resource.type}</Badge>
                <Badge variant="outline">{resource.category}</Badge>
                {resource.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(resource.description),
                  }}
                />
              </div>
              {resource.course && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Course
                    </h3>
                    <Link
                      href={`/courses/${resource.course.id}`}
                      className="inline-flex items-center gap-2 p-3 rounded-lg bg-muted hover:bg-accent transition-colors"
                    >
                      <div>
                        <p className="font-medium">{resource.course.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {resource.course.code} - {resource.course.department}
                        </p>
                      </div>
                    </Link>
                  </div>
                </>
              )}
              <Separator />
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Uploaded by
                </h3>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={resource.createdBy?.avatar} />
                    <AvatarFallback>
                      {getInitials(
                        `${resource.createdBy?.firstName} ${resource.createdBy?.lastName}`
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {resource.createdBy?.firstName} {resource.createdBy?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {resource.createdBy?.role?.toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
