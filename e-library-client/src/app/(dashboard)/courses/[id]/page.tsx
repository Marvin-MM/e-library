"use client";

import { useState, use } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { motion } from "framer-motion";

import { useCourse, useCourseResources } from "@/hooks/useCourses";
import { useCourseUnits, useDeleteCourseUnit } from "@/hooks/useCourseUnits";
import { useRole } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManageModuleDialog } from "@/components/courses/ManageModuleDialog";

import {
    FileText, Download, Calendar, Clock, ArrowLeft, Search, Filter, 
    GraduationCap, Layers, Trash2, Library
} from "lucide-react";

interface CourseDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
    const { id } = use(params);
    const [search, setSearch] = useState("");
    const { isStaffOrAdmin } = useRole();

    // Data Hooks
    const { data: course, isLoading: loadingCourse } = useCourse(id);
    const { data: modulesData, isLoading: loadingModules } = useCourseUnits(id, { limit: 50 });
    const { data: resourcesData, isLoading: loadingResources } = useCourseResources(id, {
        limit: 100,
        search: search || undefined,
    });

    const { mutate: deleteModule } = useDeleteCourseUnit(id);

    const modules = modulesData?.data || [];
    const resources = resourcesData?.data || [];

    const handleDeleteModule = (unitId: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete the module "${name}"? This action cannot be undone.`)) {
            deleteModule(unitId);
        }
    };

    if (loadingCourse) {
        return (
            <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700 font-titillium">
                <Skeleton className="h-32 w-full rounded" />
                <Skeleton className="h-10 w-64 rounded" />
                <div className="flex-1 bg-white border-2 border-zinc-100 rounded p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 rounded w-full" />)}
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
                        <Link href="/courses"><ArrowLeft className="mr-2 h-4 w-4" /> Return to Catalog</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700 font-titillium">

            {/* TOP HEADER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col justify-center gap-2">
                    <Button variant="ghost" asChild className="w-fit p-0 h-auto gap-1 text-[10px] font-bold text-blue-900 hover:bg-transparent uppercase mb-2">
                        <Link href="/courses"><ArrowLeft className="w-3 h-3" /> Back to Courses</Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-blue-900 bg-blue-50 px-2 py-1 rounded">{course.code}</span>
                        <span className="text-[10px] font-bold uppercase text-zinc-400">{course.department}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{course.name}</h1>
                </motion.div>

                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center justify-end">
                    <div className="bg-white border-2 border-zinc-100 p-2 flex items-center gap-4 rounded">
                        <div className="px-6 py-2 border-r-2 border-zinc-100 last:border-0 text-center">
                            <p className="text-[10px] uppercase font-bold text-zinc-400">Total Assets</p>
                            <p className="text-2xl font-bold text-blue-900">{course.resourceCount}</p>
                        </div>
                        <div className="px-6 py-2 border-r-2 border-zinc-100 last:border-0 text-left">
                            <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Updated</p>
                            <p className="text-xs font-bold text-zinc-900">{format(new Date(course.updatedAt), 'MMM d, yyyy')}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* TABS CONTAINER */}
            <Tabs defaultValue="modules" className="flex-1 flex flex-col h-full overflow-hidden">
                
                {/* Discovery & Tab Controls */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0 mb-6">
                    <div className="lg:col-span-2 flex flex-col sm:flex-row items-center gap-4">
                        <TabsList className="bg-white border-2 border-zinc-100 p-1 h-14 rounded w-full sm:w-auto shrink-0 shadow-sm">
                            <TabsTrigger value="modules" className="h-full px-6 text-[10px] uppercase font-bold tracking-widest data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all rounded">
                                <Layers className="w-4 h-4 mr-2" /> Course Modules
                            </TabsTrigger>
                            <TabsTrigger value="resources" className="h-full px-6 text-[10px] uppercase font-bold tracking-widest data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all rounded">
                                <Library className="w-4 h-4 mr-2" /> Uncategorized Resources
                            </TabsTrigger>
                        </TabsList>

                        <div className="bg-white border-2 border-zinc-100 px-4 rounded flex items-center h-14 w-full">
                            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                            <Input
                                placeholder="Filter within course..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="border-0 focus-visible:ring-0 shadow-none font-bold text-sm placeholder:text-zinc-300"
                            />
                        </div>
                    </div>

                    <div className="bg-white border-2 border-zinc-100 p-4 rounded flex items-center justify-between sm:justify-end gap-4 h-14">
                        {isStaffOrAdmin ? (
                            <ManageModuleDialog courseId={id} />
                        ) : (
                            <div className="flex items-center gap-2 w-full justify-center">
                                <span className="text-[10px] uppercase font-bold text-zinc-400">Course Status</span>
                                <span className="text-[10px] font-black text-blue-900 bg-blue-50 px-2 py-1 rounded uppercase tracking-widest">Active</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* MODULES CONTENT */}
                <TabsContent value="modules" className="flex-1 overflow-hidden mt-0 outline-none">
                    <div className="bg-white border-2 border-zinc-100 rounded flex flex-col h-full overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b-2 border-zinc-50 shrink-0">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                <Layers className="w-4 h-4" /> Structured Curriculum Modules
                            </h3>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{modules.length} Modules</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                            {loadingModules ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="w-full h-24 rounded" />)}
                                </div>
                            ) : modules.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {modules.map((module: any) => (
                                        <div key={module.id} className="bg-white border-2 border-zinc-100 p-5 rounded hover:border-blue-900 transition-all group flex flex-col justify-between min-h-[160px]">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-900 bg-blue-50 px-2 py-1 rounded">
                                                        {module.code}
                                                    </span>
                                                    {isStaffOrAdmin && (
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <ManageModuleDialog courseId={id} initialData={module} triggerType="icon" />
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-600 border-2 border-transparent hover:border-red-100" onClick={() => handleDeleteModule(module.id, module.name)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                                <h4 className="text-sm font-black text-zinc-900 leading-tight mb-2 group-hover:text-blue-900">{module.name}</h4>
                                                <p className="text-[11px] font-bold text-zinc-500 line-clamp-2 leading-relaxed">{module.description || "No description provided."}</p>
                                            </div>
                                            <div className="mt-4 pt-4 border-t-2 border-zinc-50 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                                <span>{module._count?.resources || 0} Assets</span>
                                                <Link href={`/course-units/${module.id}`} className="text-blue-600 hover:text-blue-900 group-hover:underline">Open Module &rarr;</Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center grayscale opacity-50 py-12">
                                    <Layers className="w-12 h-12 text-zinc-400 mb-4" />
                                    <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight mb-1">No Modules Created</h3>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase">This course has no structured modules yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* UNCATEGORIZED RESOURCES CONTENT */}
                <TabsContent value="resources" className="flex-1 overflow-hidden mt-0 outline-none">
                    <div className="bg-white border-2 border-zinc-100 rounded flex flex-col h-full overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b-2 border-zinc-50 shrink-0">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Uncategorized Course Files
                            </h3>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{resources.length} Assets</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                            {loadingResources ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 rounded w-full" />)}
                                </div>
                            ) : resources.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {resources.map((resource: any) => (
                                        <Link key={resource.id} href={`/resources/${resource.id}`}>
                                            <div className="bg-white border-2 border-zinc-100 p-6 rounded flex flex-col justify-between hover:border-blue-900 transition-all group h-full min-h-[160px]">
                                                <div>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-[10px] font-black uppercase text-blue-900 bg-blue-50 px-2 py-0.5 rounded tracking-widest">{resource.type || 'Resource'}</span>
                                                        <Download className="w-4 h-4 text-zinc-300 group-hover:text-blue-900 transition-colors" />
                                                    </div>
                                                    <h4 className="text-sm font-bold text-zinc-900 line-clamp-2 leading-tight group-hover:text-blue-900 transition-colors mb-2">{resource.title}</h4>
                                                    <p className="text-[10px] font-bold text-zinc-400 line-clamp-1">{resource.description}</p>
                                                </div>
                                                <div className="mt-6 pt-4 border-t-2 border-zinc-50 flex justify-between">
                                                    <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold"><Calendar className="w-3.5 h-3.5" />{format(new Date(resource.createdAt), 'MMM d, yyyy')}</div>
                                                    <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold"><Download className="w-3.5 h-3.5" />{resource.downloadCount}</div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center grayscale opacity-50 py-12">
                                    <Filter className="w-12 h-12 text-zinc-400 mb-4" />
                                    <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight mb-1">No Files Found</h3>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase">No loose resources are associated directly with this course.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

            </Tabs>
        </div>
    );
}