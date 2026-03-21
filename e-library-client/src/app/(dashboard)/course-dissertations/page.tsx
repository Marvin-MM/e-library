"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useDepartmentStore } from "@/stores/departmentStore";
import { useCourses, useCourseResources } from "@/hooks/useCourses";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, BookOpen, Download, FileText, BoxSelectIcon, Building2, ChevronRight, ChevronLeft } from "lucide-react";

export default function CourseDissertationsPage() {
    // 1. Get Context from Sidebar
    const { selectedDepartment } = useDepartmentStore();

    // 2. Fetch Courses for that Department
    const { data: coursesData, isLoading: isLoadingCourses } = useCourses({ 
        department: selectedDepartment || undefined, 
        limit: 100 // Get a large list for the dropdown
    });
    
    const courses = coursesData?.data || [];
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");

    // Auto-select first course when loaded
    if (courses.length > 0 && !selectedCourseId) {
        setSelectedCourseId(courses[0].id);
    }

    // 3. Fetch Resources for the Selected Course (Filtered by DISSERTATION)
    const [page, setPage] = useState(1);
    const { data: resourcesData, isLoading: isLoadingResources } = useCourseResources(
        selectedCourseId, 
        { resourceType: "DISSERTATION", page }
    );

    const dissertations = resourcesData?.data || [];
    const pagination = resourcesData?.pagination;

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700 font-titillium">
            
            {/* Header section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col justify-center gap-2">
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase bg-blue-50 w-fit px-3 py-1 rounded">
                        <GraduationCap className="w-3 h-3" />
                        Course Research Archive
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
                        Department Dissertations
                    </h1>
                    <p className="text-zinc-500 text-sm max-w-sm flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-zinc-400" />
                        Viewing records for: <span className="font-bold text-zinc-900">{selectedDepartment || 'Loading...'}</span>
                    </p>
                </motion.div>

                {/* Course Selector */}
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center justify-end">
                    <div className="bg-white border-2 border-zinc-100 p-2 rounded w-full max-w-sm">
                        <p className="text-[10px] font-black uppercase text-zinc-400 mb-1 ml-1">Filter by Course</p>
                        {isLoadingCourses ? (
                            <Skeleton className="h-10 w-full rounded" />
                        ) : (
                            <Select value={selectedCourseId} onValueChange={(val) => { setSelectedCourseId(val); setPage(1); }}>
                                <SelectTrigger className="border-0 bg-zinc-50 h-10 focus:ring-0 font-bold text-sm">
                                    <SelectValue placeholder="Select a course..." />
                                </SelectTrigger>
                                <SelectContent className="font-titillium">
                                    {courses.length === 0 && <SelectItem value="none" disabled>No courses found</SelectItem>}
                                    {courses.map(course => (
                                        <SelectItem key={course.id} value={course.id} className="font-bold text-xs">
                                            {course.code} - {course.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-hidden">
                <div className="bg-white border-2 border-zinc-100 rounded flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b-2 border-zinc-50 shrink-0">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-tight flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Approved Theses
                        </h3>
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => setPage(Math.max(1, page - 1))} disabled={!pagination.hasPrev} className="border-2 border-zinc-100 h-8 w-8 hover:bg-zinc-900 hover:text-white transition-all">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="text-[10px] font-bold text-blue-900 px-2">{page} / {pagination.totalPages}</span>
                                <Button variant="ghost" size="icon" onClick={() => setPage(page + 1)} disabled={!pagination.hasNext} className="border-2 border-zinc-100 h-8 w-8 hover:bg-zinc-900 hover:text-white transition-all">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {isLoadingResources ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 rounded w-full" />)}
                            </div>
                        ) : dissertations.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {dissertations.map((doc) => (
                                    <Link key={doc.id} href={`/course-dissertations/${doc.id}`}>
                                        <div className="bg-white border-2 border-zinc-100 p-4 rounded flex flex-col justify-between hover:border-blue-900 transition-all group h-full relative">
                                            <div className="space-y-3">
                                                <div className="aspect-[4/3] bg-zinc-50 rounded border-2 border-zinc-100 overflow-hidden relative">
                                                    {doc.coverImageUrl ? (
                                                        <img src={doc.coverImageUrl} alt={doc.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-100 group-hover:text-blue-50 transition-colors">
                                                            <FileText className="w-12 h-12" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[10px] font-bold uppercase text-zinc-400 truncate">{doc.department}</span>
                                                        <span className="text-[10px] font-bold text-blue-900">{doc.publicationYear}</span>
                                                    </div>
                                                    <h4 className="text-sm font-bold text-zinc-900 line-clamp-2 leading-tight group-hover:text-blue-900">{doc.title}</h4>
                                                    <p className="text-xs text-zinc-500 mt-1 truncate font-bold uppercase tracking-wide">By {doc.authors?.join(", ")}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-3 border-t-2 border-zinc-50 flex items-center justify-between text-zinc-300">
                                                <div className="flex items-center gap-1.5 group-hover:text-blue-900 transition-colors">
                                                    <Download className="w-3 h-3" />
                                                    <span className="text-[10px] font-black">{doc.downloadCount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-20 grayscale opacity-50">
                                <BoxSelectIcon className="w-10 h-10 text-zinc-400 mb-6" />
                                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight mb-2">No Records Found</h3>
                                <p className="text-xs text-zinc-400">No dissertations have been published for this course yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}