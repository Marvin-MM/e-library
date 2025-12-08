import { useRouter } from "next/router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useResource, useDownloadResource } from "@/hooks/useResources";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Eye,
  ExternalLink,
  Info,
  FileType,
  HardDrive,
  Share2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { formatDate, getInitials } from "@/lib/utils";
import DOMPurify from "dompurify";
import Image from "next/image";

export default function ResourceDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: resource, isLoading, error } = useResource(id as string);
  const { mutate: download, isPending: isDownloading } = useDownloadResource();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-8 pb-8">
          <Skeleton className="h-8 w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <Skeleton className="h-96 w-full rounded-3xl" />
              <Skeleton className="h-48 w-full rounded-3xl" />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-3xl" />
              <Skeleton className="h-96 w-full rounded-3xl" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !resource) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto py-12">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="bg-muted/30 p-6 rounded-full mb-4">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Resource not found</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
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

  const isDownloadable = resource.accessType === "DOWNLOADABLE";
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Back Button */}
        <Button variant="ghost" asChild className="gap-2 pl-0 hover:bg-transparent hover:text-primary transition-colors">
          <Link href="/resources">
            <ArrowLeft className="h-4 w-4" />
            Back to Resources
          </Link>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Column: Cover & Quick Stats */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden border-none shadow-xl rounded-3xl">
              <CardContent className="p-0">
                <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-primary/10 via-primary/5 to-muted group">
                  {resource.coverImageUrl ? (
                    <Image
                      src={resource.coverImageUrl}
                      alt={resource.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="h-24 w-24 text-primary/20" />
                    </div>
                  )}

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Quick Info Panel */}
                <div className="p-6 space-y-4 bg-card">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <FileType className="h-4 w-4" />
                      Type
                    </span>
                    <Badge variant="secondary" className="font-mono">
                      {resource.fileType?.split("/")[1]?.toUpperCase() || "N/A"}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <HardDrive className="h-4 w-4" />
                      Size
                    </span>
                    <span className="font-medium">{formatFileSize(resource.fileSize || 0)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Views
                    </span>
                    <span className="font-medium">{resource.viewCount}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Downloads
                    </span>
                    <span className="font-medium">{resource.downloadCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Access Alert */}
            {!isDownloadable && (
              <Alert className="bg-primary/5 border-primary/20 text-primary">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This resource is view-only. Please visit the library to access it physically.
                </AlertDescription>
              </Alert>
            )}

            {/* Uploader Card */}
            <Card className="rounded-3xl border-none shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Uploaded by
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                    <AvatarImage src={resource.uploadedBy?.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(resource.uploadedBy?.name || "Unknown User")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {resource.uploadedBy?.name || "Unknown User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {resource.uploadedBy?.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-background to-muted/50 border shadow-sm p-8">
              <div className="absolute top-0 right-0 -mt-16 -mr-16 opacity-[0.03]">
                <FileText className="h-96 w-96" />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1">
                      {resource.category}
                    </Badge>
                    {resource.department && (
                      <Badge variant="outline" className="px-3 py-1">
                        {resource.department}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm ml-auto">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Updated {formatDate(resource.updatedAt)}</span>
                    </div>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                    {resource.title}
                  </h1>

                  {resource.authors && resource.authors.length > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground text-lg">
                      <User className="h-5 w-5" />
                      <span>by {resource.authors.join(", ")}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 pt-4">
                  {isDownloadable ? (
                    <Button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      size="lg"
                      className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isDownloading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-5 w-5" />
                      )}
                      Download Resource
                    </Button>
                  ) : (
                    <Button
                      asChild
                      size="lg"
                      className="rounded-xl shadow-lg"
                    >
                      <Link href="/library">
                        <Eye className="mr-2 h-5 w-5" />
                        View in Library
                      </Link>
                    </Button>
                  )}

                  {resource.cloudinaryUrl && (
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="rounded-xl"
                    >
                      <a
                        href={resource.cloudinaryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-5 w-5" />
                        Preview
                      </a>
                    </Button>
                  )}

                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <Card className="rounded-3xl border-none shadow-sm">
              <CardContent className="p-8">
                <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Description
                </h3>
                <div
                  className="prose prose-neutral dark:prose-invert max-w-none leading-relaxed text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(resource.description || ""),
                  }}
                />

                {resource.tags && resource.tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {resource.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="px-3 py-1 bg-muted/50 hover:bg-muted transition-colors">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Associated Courses Section */}
            {resource.courses && resource.courses.length > 0 && (
              <Card className="rounded-3xl border-none shadow-sm">
                <CardHeader className="p-8 pb-0">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Associated Courses
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {resource.courses.map((course: any) => (
                      <Link
                        key={course.id}
                        href={`/courses/${course.id}`}
                        className="group flex items-start gap-4 p-4 rounded-2xl bg-muted/30 hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all duration-300"
                      >
                        <div className="p-3 bg-background rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {course.name}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {course.code}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                            {course.department}
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}