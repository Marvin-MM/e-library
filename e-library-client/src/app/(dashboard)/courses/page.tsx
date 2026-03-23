"use client";

import { useState } from "react";
import { useCourses, useCreateCourse } from "@/hooks/useCourses";
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
import Link from "next/link";

import { GraduationCap, Loader2, Search, ChevronLeft, ChevronRight, BookOpen, ArrowRight, Clock, ShieldAlert, GitBranchPlus, Layers, Trash2 } from "lucide-react";
import { useDeleteCourse } from "@/hooks/useCourses";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCourseSchema, type CreateCourseFormData } from "@/schemas/courses";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";


export default function CoursesPage() {
    const { isStaffOrAdmin, isAdmin } = useRole();
    const { mutate: deleteCourse } = useDeleteCourse();
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
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700 font-titillium">

            {/* TOP ROW: Z-Pattern Start */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex flex-col justify-center gap-2"
                >
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase bg-blue-50 w-fit px-3 py-1 rounded">
                        <GraduationCap className="w-3 h-3" />
                        Academic Explorer
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
                        Explore Courses
                    </h1>
                    <p className="text-zinc-500 text-sm max-w-sm">
                        Discover a wide range of academic courses and their comprehensive repositories.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center justify-end"
                >
                    <div className="bg-white border-2 border-zinc-100 p-2 flex items-center gap-4 rounded">
                        <div className="px-6 py-2 border-r-2 border-zinc-100 last:border-0 text-center">
                            <p className="text-[10px] uppercase font-bold text-zinc-400">Total Courses</p>
                            <p className="text-xl font-bold text-blue-900">{pagination?.total || 0}</p>
                        </div>
                        {isStaffOrAdmin && (
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="h-12 px-6 rounded bg-blue-900 hover:bg-zinc-900 text-white shrink-0 font-bold text-xs uppercase tracking-wider">
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
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase text-zinc-400">Course Code</Label>
                                                <Input
                                                    {...register("code")}
                                                    placeholder="CS101"
                                                    className={`border-2 ${errors.code ? 'border-red-500' : 'border-zinc-100'} focus-visible:ring-0 rounded h-11`}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase text-zinc-400">Department</Label>
                                                <Input
                                                    {...register("department")}
                                                    placeholder="Computer Science"
                                                    className={`border-2 ${errors.department ? 'border-red-500' : 'border-zinc-100'} focus-visible:ring-0 rounded h-11`}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-zinc-400">Course Name</Label>
                                            <Input
                                                {...register("name")}
                                                placeholder="Introduction to Programming"
                                                className={`border-2 ${errors.name ? 'border-red-500' : 'border-zinc-100'} focus-visible:ring-0 rounded h-11`}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-zinc-400">Description</Label>
                                            <Textarea
                                                {...register("description")}
                                                placeholder="Enter course description..."
                                                className={`border-2 ${errors.description ? 'border-red-500' : 'border-zinc-100'} focus-visible:ring-0 rounded min-h-[100px]`}
                                            />
                                        </div>
                                        <DialogFooter className="pt-4">
                                            <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)} className="font-bold uppercase text-xs">Cancel</Button>
                                            <Button type="submit" disabled={isPending} className="bg-blue-900 hover:bg-zinc-900 text-white font-bold uppercase text-xs px-8">
                                                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                Create Course
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* MIDDLE ROW: Search & Discovery */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
                <div className="lg:col-span-2 bg-white border-2 border-zinc-100 p-6 rounded relative flex items-center justify-between">
                    <div className="flex items-center gap-4 w-full">
                        <div className="w-12 h-12 rounded bg-zinc-50 flex items-center justify-center shrink-0 border-2 border-zinc-100">
                            <Search className="w-5 h-5 text-zinc-900" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Global Search</h2>
                            <Input
                                placeholder="Find by course name, code, or department..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="border-0 p-0 h-auto focus-visible:ring-0 text-lg font-bold placeholder:text-zinc-300 bg-transparent"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-zinc-100 p-6 rounded flex flex-col justify-center">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Pagination</p>
                            <p className="text-xs font-bold text-zinc-900">
                                Page <span className="text-blue-900">{page}</span> of {pagination?.totalPages || 1}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={!pagination?.hasPrev}
                                className="border-2 border-zinc-100 h-10 w-10 hover:bg-zinc-900 hover:text-white transition-all disabled:opacity-20"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={!pagination?.hasNext}
                                className="border-2 border-zinc-100 h-10 w-10 hover:bg-zinc-900 hover:text-white transition-all disabled:opacity-20"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM ROW: Course Grid */}
            <div className="flex-1 overflow-hidden">
                <div className="bg-white border-2 border-zinc-100 rounded flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b-2 border-zinc-50 shrink-0">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-tight flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Course Catalog
                        </h3>
                        {search && (
                            <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded uppercase">
                                Results for: {search}
                            </span>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="bg-white border-2 border-zinc-100 p-6 rounded flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <Skeleton className="w-10 h-10 rounded" />
                                            <Skeleton className="w-16 h-4 rounded" />
                                        </div>
                                        <div className="space-y-2">
                                            <Skeleton className="w-full h-5 rounded" />
                                            <Skeleton className="w-2/3 h-4 rounded" />
                                        </div>
                                        <div className="mt-4 flex justify-between pt-4 border-t-2 border-zinc-50">
                                            <Skeleton className="w-20 h-4 rounded" />
                                            <Skeleton className="w-4 h-4 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : courses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {courses.map((course) => (
                                    <div key={course.id} className="bg-white border-2 border-zinc-100 p-6 rounded flex flex-col justify-between hover:border-blue-900 transition-all group h-[200px] relative">
                                        <Link href={`/courses/${course.id}`} className="absolute inset-0 z-0" />
                                        <div className="z-10 pointer-events-none flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center border-2 border-blue-100 group-hover:bg-blue-900 group-hover:border-blue-900 transition-all">
                                                        <BookOpen className="w-5 h-5 text-blue-900 group-hover:text-white transition-all" />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {isAdmin && (
                                                            <DeleteConfirmationDialog 
                                                                title="Delete Course?"
                                                                description={`Permanently remove "${course.name}" (${course.code})? This will unpin all linked resources.`}
                                                                onDelete={() => deleteCourse(course.id)}
                                                                trigger={
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="icon" 
                                                                        className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50/50 transition-colors pointer-events-auto"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </Button>
                                                                }
                                                            />
                                                        )}
                                                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-50 px-2 py-1 rounded">
                                                            {course.code}
                                                        </span>
                                                    </div>
                                                </div>
                                                <h4 className="text-sm font-bold text-zinc-900 line-clamp-2 leading-tight group-hover:text-blue-900 transition-colors mb-2">
                                                    {course.name}
                                                </h4>
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                                    {course.department}
                                                </p>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between pt-4 border-t-2 border-zinc-50">
                                                <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                                                    <Layers className="w-3 h-3" />
                                                    {course.resourceCount} Repositories
                                                </span>
                                                <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-blue-900 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-20">
                                <GraduationCap className="w-16 h-16 text-zinc-100 mb-4" />
                                <p className="text-sm font-bold text-zinc-400 uppercase">No Courses Found</p>
                                <Button variant="link" className="text-xs text-blue-600 font-bold p-0 mt-2 uppercase" onClick={() => setSearch("")}>Clear all filters</Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
