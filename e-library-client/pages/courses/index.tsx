import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useCourses, useCreateCourse } from "@/hooks/useCourses";
import { useRole } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Plus, Loader2, Search, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCourseSchema, type CreateCourseFormData } from "@/schemas/courses";

export default function CoursesPage() {
  const { isStaffOrAdmin } = useRole();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useCourses({ page, limit: 12, search: search || undefined });
  const { mutate: createCourse, isPending } = useCreateCourse();
  const [dialogOpen, setDialogOpen] = useState(false);

  const courses = data?.data || [];
  const pagination = data?.pagination;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCourseFormData>({
    resolver: zodResolver(createCourseSchema),
  });

  const onSubmit = (data: CreateCourseFormData) => {
    createCourse(data, {
      onSuccess: () => {
        setDialogOpen(false);
        reset();
      },
    });
  };

  return (
    <DashboardLayout title="Courses">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Courses</h2>
            <p className="text-muted-foreground">
              Browse courses and their associated resources
            </p>
          </div>
          {isStaffOrAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Course
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Course</DialogTitle>
                  <DialogDescription>
                    Add a new course to organize resources
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Course Code</Label>
                      <Input
                        id="code"
                        placeholder="CS101"
                        {...register("code")}
                        className={errors.code ? "border-destructive" : ""}
                      />
                      {errors.code && (
                        <p className="text-sm text-destructive">{errors.code.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        placeholder="Computer Science"
                        {...register("department")}
                        className={errors.department ? "border-destructive" : ""}
                      />
                      {errors.department && (
                        <p className="text-sm text-destructive">{errors.department.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Course Name</Label>
                    <Input
                      id="name"
                      placeholder="Introduction to Programming"
                      {...register("name")}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Course description..."
                      rows={3}
                      {...register("description")}
                      className={errors.description ? "border-destructive" : ""}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description.message}</p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Course
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-10 w-10 rounded mb-4" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/courses/${course.id}`}>
                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <GraduationCap className="h-6 w-6 text-primary" />
                          </div>
                          <Badge variant="outline">{course.code}</Badge>
                        </div>
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {course.name}
                        </CardTitle>
                        <CardDescription>{course.department}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {course.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>{course.resourceCount} resources</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
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
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                {search
                  ? "Try adjusting your search to find what you're looking for."
                  : "There are no courses available yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
