import { useRouter } from "next/router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useCourse } from "@/hooks/useCourses";
import { useResources } from "@/hooks/useResources";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, ArrowLeft, FileText, Download } from "lucide-react";

export default function CourseDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: course, isLoading: loadingCourse } = useCourse(id as string);
  const { data: resourcesData, isLoading: loadingResources } = useResources({
    courseId: id as string,
    limit: 20,
  });

  const resources = resourcesData?.data || [];

  if (loadingCourse) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-32" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Course not found</h3>
              <p className="text-muted-foreground mb-4">
                The course you are looking for does not exist or has been removed.
              </p>
              <Button asChild>
                <Link href="/courses">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Courses
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/courses">
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Link>
        </Button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{course.code}</Badge>
                    <Badge variant="secondary">{course.department}</Badge>
                  </div>
                  <CardTitle className="text-2xl">{course.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {course.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Course Resources ({course.resourceCount})
          </h3>
          {loadingResources ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-10 w-10 rounded mb-3" />
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : resources.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {resources.map((resource, index) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/resources/${resource.id}`}>
                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium line-clamp-1 group-hover:text-primary transition-colors">
                              {resource.title}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {resource.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <Badge variant="secondary" className="text-xs">
                                {resource.type}
                              </Badge>
                              <span className="flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                {resource.downloadCount}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <FileText className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No resources available for this course yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
