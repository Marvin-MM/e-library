"use client";


import { useRouter } from "next/navigation";
import { useCourse, useCourseResources } from "@/hooks/useCourses";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

import {
    FileText,
    Download,
    Calendar,
    Clock,
    BookOpen,
    ArrowLeft,
    Search,
    Filter,
    GraduationCap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, use } from "react";
import { format } from "date-fns";
import { useRole } from "@/hooks/useAuth";
import { motion } from "framer-motion";

interface CourseDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
    // Unwrap params with use() (Next.js 15)
    const { id } = use(params);
    const [search, setSearch] = useState("");

    const { data: course, isLoading: loadingCourse } = useCourse(id);
    const { data: resourcesData, isLoading: loadingResources } = useCourseResources(id, {
        limit: 100,
        search: search || undefined,
    });

    const resources = resourcesData?.data || [];

    const { isStaffOrAdmin } = useRole();

    if (loadingCourse) {
        return (
            <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700 font-titillium">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-full max-w-sm" />
                    </div>
                    <div className="flex justify-end items-center">
                        <Skeleton className="h-20 w-48 rounded" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
                    <Skeleton className="lg:col-span-2 h-20 rounded" />
                    <Skeleton className="h-20 rounded" />
                </div>
                <div className="flex-1 bg-white border-2 border-zinc-100 rounded p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-32 rounded w-full" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <div className="text-center bg-white border-2 border-zinc-100 p-12 rounded max-w-md w-full">
                    <GraduationCap className="w-16 h-16 text-zinc-100 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-zinc-900 mb-2 uppercase tracking-tight">Course Not Found</h3>
                    <p className="text-xs font-bold text-zinc-400 uppercase mb-6">The repository you are looking for does not exist.</p>
                    <Button asChild className="bg-blue-900 hover:bg-zinc-900 text-white font-bold uppercase text-xs px-8">
                        <Link href="/courses">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Return to Catalog
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700 font-titillium">

            {/* TOP ROW: Z-Pattern Start */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex flex-col justify-center gap-2"
                >
                    <Button variant="ghost" asChild className="w-fit p-0 h-auto gap-1 text-[10px] font-bold text-blue-900 hover:bg-transparent uppercase mb-2">
                        <Link href="/courses">
                            <ArrowLeft className="w-3 h-3" />
                            Back to Courses
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-blue-900 bg-blue-50 px-2 py-1 rounded">
                            {course.code}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-zinc-400">
                            {course.department}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
                        {course.name}
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center justify-end"
                >
                    <div className="bg-white border-2 border-zinc-100 p-2 flex items-center gap-4 rounded">
                        <div className="px-6 py-2 border-r-2 border-zinc-100 last:border-0 text-center">
                            <p className="text-[10px] uppercase font-bold text-zinc-400">Repositories</p>
                            <p className="text-2xl font-bold text-blue-900">{course.resourceCount}</p>
                        </div>
                        <div className="px-6 py-2 border-r-2 border-zinc-100 last:border-0 text-left">
                            <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1 leading-none flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Updated
                            </p>
                            <p className="text-xs font-bold text-zinc-900">{format(new Date(course.updatedAt), 'MMM d, yyyy')}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* MIDDLE ROW: Discovery & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
                <div className="lg:col-span-2 bg-white border-2 border-zinc-100 p-6 rounded relative flex items-center justify-between">
                    <div className="flex items-center gap-4 w-full">
                        <div className="w-12 h-12 rounded bg-zinc-50 flex items-center justify-center shrink-0 border-2 border-zinc-100">
                            <Search className="w-5 h-5 text-zinc-900" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 px-1">Resource Discovery</h2>
                            <Input
                                placeholder="Filter resources by title or keywords..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="border-0 p-0 h-auto focus-visible:ring-0 text-lg font-bold placeholder:text-zinc-300 bg-transparent px-1"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-zinc-100 p-6 rounded flex flex-col justify-center gap-4">
                    {isStaffOrAdmin ? (
                        <div className="flex flex-col gap-2">
                            <p className="text-[10px] uppercase font-bold text-zinc-400 text-center">Staff Controls</p>
                            <Button className="w-full bg-blue-900 hover:bg-zinc-900 text-white h-11 font-bold text-xs uppercase tracking-wider rounded transition-all">
                                <FileText className="w-4 h-4 mr-2" />
                                Modify Course
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Status</p>
                            <span className="text-xs font-black text-blue-900 bg-blue-50 px-3 py-1 rounded uppercase tracking-widest">Active</span>
                        </div>
                    )}
                </div>
            </div>

            {/* BOTTOM ROW: Content Grid */}
            <div className="flex-1 overflow-hidden">
                <div className="bg-white border-2 border-zinc-100 rounded flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b-2 border-zinc-50 shrink-0">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-tight flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Academic Repositories
                        </h3>
                        {resources.length > 0 && (
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">
                                Displaying {resources.length} items
                            </span>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {loadingResources ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white border-2 border-zinc-100 p-6 rounded flex flex-col gap-4">
                                        <Skeleton className="w-full h-8 rounded" />
                                        <Skeleton className="w-2/3 h-4 rounded" />
                                        <div className="mt-4 pt-4 border-t-2 border-zinc-50 flex justify-between">
                                            <Skeleton className="w-16 h-4 rounded" />
                                            <Skeleton className="w-16 h-4 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : resources.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {resources.map((resource) => (
                                    <Link key={resource.id} href={`/resources/${resource.id}`}>
                                        <div className="bg-white border-2 border-zinc-100 p-6 rounded flex flex-col justify-between hover:border-blue-900 transition-all group h-full min-h-[160px]">
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-[10px] font-black uppercase text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                                                        {resource.type || 'Resource'}
                                                    </span>
                                                    <Download className="w-4 h-4 text-zinc-300 group-hover:text-blue-900 transition-colors" />
                                                </div>
                                                <h4 className="text-sm font-bold text-zinc-900 line-clamp-2 leading-tight group-hover:text-blue-900 transition-colors mb-2">
                                                    {resource.title}
                                                </h4>
                                                <p className="text-[10px] font-bold text-zinc-400 line-clamp-1">
                                                    {resource.description}
                                                </p>
                                            </div>
                                            <div className="mt-6 flex flex-col gap-3 pt-4 border-t-2 border-zinc-50">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {format(new Date(resource.createdAt), 'MMM d, yyyy')}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold">
                                                        <Download className="w-3.5 h-3.5" />
                                                        {resource.downloadCount}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-20 grayscale opacity-50">
                                <div className="w-20 h-20 rounded bg-zinc-50 flex items-center justify-center border-2 border-zinc-100 mb-6">
                                    <Filter className="w-10 h-10 text-zinc-400" />
                                </div>
                                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight mb-2">No Resources Found</h3>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase max-w-[200px] text-center mb-6">This repository is currently empty or has no matching records.</p>
                                {search && (
                                    <Button variant="link" className="text-xs text-blue-600 font-bold p-0 uppercase" onClick={() => setSearch("")}>Clear Search</Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
