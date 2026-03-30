"use client";

import { useState } from "react";
import { useCourses, useCreateCourse, useDeleteCourse } from "@/hooks/useCourses";
import { useRole } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import Link from "next/link";
import { GraduationCap, Loader2, Search, ChevronLeft, ChevronRight, BookOpen, ArrowRight, GitBranchPlus, Layers, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCourseSchema, type CreateCourseFormData } from "@/schemas/courses";
import { motion } from "framer-motion";

export default function CoursesPage() {
    const { isStaffOrAdmin, isAdmin } = useRole();
    const { mutate: deleteCourse } = useDeleteCourse();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);

    const { data, isLoading } = useCourses({ page, limit: 12, search: search || undefined });
    const { mutate: createCourse, isPending } = useCreateCourse();

    const courses = data?.data ?? [];
    const pagination = data?.pagination;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateCourseFormData>({
        resolver: zodResolver(createCourseSchema),
    });

    const onSubmit = (formData: CreateCourseFormData) => {
        createCourse(formData, {
            onSuccess: () => {
                setDialogOpen(false);
                reset();
            },
        });
    };

    return (
        <div className="flex flex-col gap-6 min-h-0 pb-6">

            {/* ── PAGE HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <motion.div
                    initial={{ y: -8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col gap-1.5"
                >
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-[10px] uppercase bg-blue-50 w-fit px-3 py-1 rounded tracking-wider">
                        <GraduationCap className="w-3 h-3" />
                        Academic Explorer
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                        Explore Courses
                    </h1>
                    <p className="text-zinc-500 text-sm max-w-sm">
                        Discover academic courses and their comprehensive repositories.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ y: -8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.05 }}
                    className="flex items-center gap-3 shrink-0"
                >
                    <div className="bg-white border-2 border-zinc-100 px-5 py-2.5 rounded text-center">
                        <p className="text-[10px] uppercase font-bold text-zinc-400">Total Courses</p>
                        <p className="text-xl font-bold text-blue-900">{pagination?.total ?? 0}</p>
                    </div>
                    {isStaffOrAdmin && (
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-full px-5 py-2.5 rounded bg-blue-900 hover:bg-zinc-900 text-white shrink-0 font-bold text-xs uppercase tracking-wider transition-colors">
                                    <GitBranchPlus className="w-4 h-4 mr-2" />
                                    Create New
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg border-2 border-zinc-100 shadow-none">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold">Create New Course</DialogTitle>
                                    <DialogDescription className="text-zinc-500">
                                        Add a new course to organize academic resources
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Course Code</Label>
                                            <Input
                                                {...register("code")}
                                                placeholder="CS101"
                                                className={`border-2 ${errors.code ? "border-red-500" : "border-zinc-100"} focus-visible:ring-0 rounded h-11`}
                                            />
                                            {errors.code && (
                                                <p className="text-[10px] font-bold text-red-500">{errors.code.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Department</Label>
                                            <Input
                                                {...register("department")}
                                                placeholder="Computer Science"
                                                className={`border-2 ${errors.department ? "border-red-500" : "border-zinc-100"} focus-visible:ring-0 rounded h-11`}
                                            />
                                            {errors.department && (
                                                <p className="text-[10px] font-bold text-red-500">{errors.department.message}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Course Name</Label>
                                        <Input
                                            {...register("name")}
                                            placeholder="Introduction to Programming"
                                            className={`border-2 ${errors.name ? "border-red-500" : "border-zinc-100"} focus-visible:ring-0 rounded h-11`}
                                        />
                                        {errors.name && (
                                            <p className="text-[10px] font-bold text-red-500">{errors.name.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Description</Label>
                                        <Textarea
                                            {...register("description")}
                                            placeholder="Enter course description..."
                                            className={`border-2 ${errors.description ? "border-red-500" : "border-zinc-100"} focus-visible:ring-0 rounded min-h-[100px]`}
                                        />
                                    </div>
                                    <DialogFooter className="pt-4">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => { setDialogOpen(false); reset(); }}
                                            className="font-bold uppercase text-xs"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isPending}
                                            className="bg-blue-900 hover:bg-zinc-900 text-white font-bold uppercase text-xs px-8 transition-colors"
                                        >
                                            {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                            Create Course
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </motion.div>
            </div>

            {/* ── SEARCH BAR ── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white border-2 border-zinc-100 rounded flex items-center gap-4 px-5 py-3.5"
            >
                <div className="w-9 h-9 rounded bg-zinc-50 flex items-center justify-center shrink-0 border-2 border-zinc-100">
                    <Search className="w-4 h-4 text-zinc-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Search</p>
                    <Input
                        placeholder="Find by name, code, or department..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="border-0 p-0 h-auto focus-visible:ring-0 text-base font-bold placeholder:text-zinc-300 bg-transparent"
                    />
                </div>
                {search && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSearch(""); setPage(1); }}
                        className="text-[10px] font-bold text-zinc-400 hover:text-zinc-600 uppercase shrink-0"
                    >
                        Clear
                    </Button>
                )}
            </motion.div>

            {/* ── COURSE GRID ── */}
            <div className="bg-white border-2 border-zinc-100 rounded overflow-hidden">
                {/* Grid header */}
                <div className="flex items-center justify-between px-6 py-4 border-b-2 border-zinc-50">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-tight flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5" />
                        Course Catalog
                        {search && (
                            <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded normal-case tracking-normal ml-1">
                                &ldquo;{search}&rdquo;
                            </span>
                        )}
                    </h3>
                    {pagination && (
                        <span className="text-[10px] font-bold text-zinc-400">
                            {pagination.total} course{pagination.total !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>

                {/* Grid body */}
                <div className="p-6">
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="border-2 border-zinc-100 rounded p-5 flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <Skeleton className="w-9 h-9 rounded" />
                                        <Skeleton className="w-14 h-4 rounded" />
                                    </div>
                                    <div className="space-y-1.5 flex-1">
                                        <Skeleton className="w-full h-4 rounded" />
                                        <Skeleton className="w-2/3 h-3 rounded" />
                                    </div>
                                    <div className="flex justify-between pt-3 border-t-2 border-zinc-50">
                                        <Skeleton className="w-20 h-3 rounded" />
                                        <Skeleton className="w-3 h-3 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : courses.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {courses.map((course, idx) => (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03, duration: 0.25 }}
                                    className="relative bg-white border-2 border-zinc-100 rounded hover:border-blue-900 transition-colors group"
                                >
                                    {/* Full-card link layer */}
                                    <Link
                                        href={`/courses/${course.id}`}
                                        className="absolute inset-0 z-0 rounded"
                                        aria-label={`Open ${course.name}`}
                                    />

                                    <div className="relative z-10 p-5 flex flex-col gap-3 h-full min-h-[180px] pointer-events-none">
                                        {/* Card header */}
                                        <div className="flex items-start justify-between">
                                            <div className="w-9 h-9 rounded bg-blue-50 flex items-center justify-center border-2 border-blue-100 group-hover:bg-blue-900 group-hover:border-blue-900 transition-colors shrink-0">
                                                <BookOpen className="w-4 h-4 text-blue-900 group-hover:text-white transition-colors" />
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                {isAdmin && (
                                                    <div className="pointer-events-auto">
                                                        <DeleteConfirmationDialog
                                                            title="Delete Course?"
                                                            description={`Permanently remove "${course.name}" (${course.code})? This will unpin all linked resources.`}
                                                            onDelete={() => deleteCourse(course.id)}
                                                            trigger={
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-zinc-300 hover:text-red-600 hover:bg-red-50 transition-colors rounded"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                    <span className="sr-only">Delete {course.name}</span>
                                                                </Button>
                                                            }
                                                        />
                                                    </div>
                                                )}
                                                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded">
                                                    {course.code}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card body */}
                                        <div className="flex-1 flex flex-col gap-1">
                                            <h4 className="text-sm font-bold text-zinc-900 line-clamp-2 leading-snug group-hover:text-blue-900 transition-colors">
                                                {course.name}
                                            </h4>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                                {course.department}
                                            </p>
                                        </div>

                                        {/* Card footer */}
                                        <div className="flex items-center justify-between pt-3 border-t-2 border-zinc-50">
                                            <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                                                <Layers className="w-3 h-3" />
                                                {course.resourceCount} Repositories
                                            </span>
                                            <ArrowRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-blue-900 group-hover:translate-x-0.5 transition-all" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <GraduationCap className="w-12 h-12 text-zinc-100" />
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-tight">No Courses Found</p>
                            {search && (
                                <Button
                                    variant="link"
                                    className="text-xs text-blue-600 font-bold p-0 uppercase h-auto"
                                    onClick={() => setSearch("")}
                                >
                                    Clear search
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* ── PAGINATION (bottom of grid — correct placement) ── */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t-2 border-zinc-50 bg-zinc-50/50">
                        <p className="text-[11px] font-bold text-zinc-400">
                            Page <span className="text-blue-900">{page}</span> of {pagination.totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={!pagination.hasPrev}
                                className="h-8 w-8 border-2 border-zinc-200 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all disabled:opacity-30 rounded"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span className="sr-only">Previous page</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={!pagination.hasNext}
                                className="h-8 w-8 border-2 border-zinc-200 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all disabled:opacity-30 rounded"
                            >
                                <ChevronRight className="w-4 h-4" />
                                <span className="sr-only">Next page</span>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}