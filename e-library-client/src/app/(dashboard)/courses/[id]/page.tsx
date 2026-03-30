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
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";

import {
    FileText, Download, Calendar, Clock, ArrowLeft, Search,
    GraduationCap, Layers, Trash2, Library,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface CourseUnit {
    id: string;
    code: string;
    name: string;
    description?: string;
    _count?: { resources: number };
}

interface Resource {
    id: string;
    title: string;
    description?: string;
    type?: string;
    createdAt: string;
    downloadCount: number;
}

interface CourseDetailPageProps {
    params: Promise<{ id: string }>;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
    const { id } = use(params);

    // Separate search state per tab so one doesn't bleed into the other
    const [moduleSearch, setModuleSearch] = useState("");
    const [resourceSearch, setResourceSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"modules" | "resources">("modules");

    const { isStaffOrAdmin } = useRole();

    const { data: course, isLoading: loadingCourse } = useCourse(id);
    const { data: modulesData, isLoading: loadingModules } = useCourseUnits(id, { limit: 50 });
    const { data: resourcesData, isLoading: loadingResources } = useCourseResources(id, {
        limit: 100,
        search: resourceSearch || undefined,
    });
    const { mutate: deleteModule } = useDeleteCourseUnit(id);

    const allModules: CourseUnit[] = modulesData?.data ?? [];
    const resources: Resource[] = resourcesData?.data ?? [];

    // Client-side module filtering (they're fetched all at once with limit:50)
    const modules = moduleSearch.trim()
        ? allModules.filter(
              (m) =>
                  m.name.toLowerCase().includes(moduleSearch.toLowerCase()) ||
                  m.code.toLowerCase().includes(moduleSearch.toLowerCase())
          )
        : allModules;

    // ── Loading skeleton ───────────────────────────────────────────────────

    if (loadingCourse) {
        return (
            <div className="flex flex-col gap-6 pb-6">
                <Skeleton className="h-28 w-full rounded" />
                <Skeleton className="h-12 w-72 rounded" />
                <div className="bg-white border-2 border-zinc-100 rounded p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-40 rounded" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ── 404 state ──────────────────────────────────────────────────────────

    if (!course) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] p-6">
                <div className="text-center bg-white border-2 border-zinc-100 p-12 rounded max-w-md w-full">
                    <GraduationCap className="w-14 h-14 text-zinc-100 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-zinc-900 mb-2 uppercase tracking-tight">
                        Course Not Found
                    </h3>
                    <p className="text-xs font-bold text-zinc-400 uppercase mb-6">
                        The course you are looking for does not exist.
                    </p>
                    <Button asChild className="bg-blue-900 hover:bg-zinc-900 text-white font-bold uppercase text-xs px-8 transition-colors">
                        <Link href="/courses">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Return to Catalog
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    // ── Active search state for current tab ────────────────────────────────

    const activeSearch = activeTab === "modules" ? moduleSearch : resourceSearch;
    const setActiveSearch = activeTab === "modules" ? setModuleSearch : setResourceSearch;

    return (
        <div className="flex flex-col gap-6 pb-6">

            {/* ── PAGE HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <motion.div
                    initial={{ x: -16, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex flex-col gap-2"
                >
                    <Button
                        variant="ghost"
                        asChild
                        className="w-fit p-0 h-auto gap-1 text-[10px] font-bold text-blue-900 hover:bg-transparent uppercase tracking-wider"
                    >
                        <Link href="/courses">
                            <ArrowLeft className="w-3 h-3" />
                            Back to Courses
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase text-blue-900 bg-blue-50 px-2 py-1 rounded">
                            {course.code}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-zinc-400">
                            {course.department}
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                        {course.name}
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ x: 16, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.05 }}
                    className="bg-white border-2 border-zinc-100 rounded flex items-stretch divide-x-2 divide-zinc-100 shrink-0 self-start sm:self-auto"
                >
                    <div className="px-5 py-3 text-center">
                        <p className="text-[10px] uppercase font-bold text-zinc-400">Assets</p>
                        <p className="text-xl font-bold text-blue-900">{course.resourceCount}</p>
                    </div>
                    <div className="px-5 py-3">
                        <p className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1 mb-0.5">
                            <Clock className="w-3 h-3" /> Updated
                        </p>
                        <p className="text-xs font-bold text-zinc-900">
                            {format(new Date(course.updatedAt), "MMM d, yyyy")}
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* ── TABS ── */}
            <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as "modules" | "resources")}
                className="flex flex-col gap-4"
            >
                {/* Tab bar + search + action */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <TabsList className="bg-white border-2 border-zinc-100 p-1 h-12 rounded shrink-0 shadow-none">
                        <TabsTrigger
                            value="modules"
                            className="h-full px-4 text-[10px] uppercase font-bold tracking-widest data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all rounded"
                        >
                            <Layers className="w-3.5 h-3.5 mr-1.5" />
                            Modules
                            <span className="ml-1.5 text-[9px] opacity-60">({allModules.length})</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="resources"
                            className="h-full px-4 text-[10px] uppercase font-bold tracking-widest data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all rounded"
                        >
                            <Library className="w-3.5 h-3.5 mr-1.5" />
                            Uncategorized
                            <span className="ml-1.5 text-[9px] opacity-60">({resources.length})</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Search — scoped to current tab */}
                    <div className="bg-white border-2 border-zinc-100 rounded flex items-center h-12 flex-1 px-3 min-w-0 w-full sm:w-auto">
                        <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0 mr-2" />
                        <Input
                            placeholder={activeTab === "modules" ? "Filter modules..." : "Filter resources..."}
                            value={activeSearch}
                            onChange={(e) => setActiveSearch(e.target.value)}
                            className="border-0 focus-visible:ring-0 shadow-none font-bold text-sm placeholder:text-zinc-300 p-0 h-auto bg-transparent"
                        />
                        {activeSearch && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setActiveSearch("")}
                                className="text-[10px] font-bold text-zinc-400 h-auto p-1 ml-1"
                            >
                                Clear
                            </Button>
                        )}
                    </div>

                    {isStaffOrAdmin && (
                        <div className="shrink-0">
                            <ManageModuleDialog courseId={id} />
                        </div>
                    )}
                </div>

                {/* ── MODULES TAB ── */}
                <TabsContent value="modules" className="mt-0 outline-none">
                    <div className="bg-white border-2 border-zinc-100 rounded overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-zinc-50">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                <Layers className="w-3.5 h-3.5" />
                                Curriculum Modules
                            </h3>
                            <span className="text-[10px] font-bold text-zinc-400">
                                {modules.length} module{modules.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        <div className="p-6">
                            {loadingModules ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <Skeleton key={i} className="h-40 rounded" />
                                    ))}
                                </div>
                            ) : modules.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {modules.map((module) => (
                                        <div
                                            key={module.id}
                                            className="bg-white border-2 border-zinc-100 rounded p-5 hover:border-blue-900 transition-colors group flex flex-col justify-between min-h-[160px]"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-900 bg-blue-50 px-2 py-1 rounded">
                                                    {module.code}
                                                </span>
                                                {isStaffOrAdmin && (
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ManageModuleDialog
                                                            courseId={id}
                                                            initialData={module}
                                                            triggerType="icon"
                                                        />
                                                        {/* Use DeleteConfirmationDialog — not window.confirm */}
                                                        <DeleteConfirmationDialog
                                                            title="Delete Module?"
                                                            description={`Permanently remove "${module.name}"? All resources in this module will become uncategorized.`}
                                                            onDelete={() => deleteModule(module.id)}
                                                            trigger={
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-zinc-400 hover:text-red-600 border-2 border-transparent hover:border-red-100 rounded"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                    <span className="sr-only">Delete {module.name}</span>
                                                                </Button>
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-black text-zinc-900 leading-snug mb-1.5 group-hover:text-blue-900 transition-colors">
                                                    {module.name}
                                                </h4>
                                                <p className="text-[11px] font-bold text-zinc-500 line-clamp-2 leading-relaxed">
                                                    {module.description ?? "No description provided."}
                                                </p>
                                            </div>
                                            <div className="mt-4 pt-3.5 border-t-2 border-zinc-50 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                                <span>{module._count?.resources ?? 0} Assets</span>
                                                <Link
                                                    href={`/course-units/${module.id}`}
                                                    className="text-blue-600 hover:text-blue-900 hover:underline transition-colors"
                                                >
                                                    Open Module &rarr;
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 opacity-50 gap-3">
                                    <Layers className="w-10 h-10 text-zinc-400" />
                                    <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">
                                        {moduleSearch ? "No matches" : "No Modules Yet"}
                                    </h3>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase">
                                        {moduleSearch
                                            ? `No modules match "${moduleSearch}"`
                                            : "This course has no structured modules."}
                                    </p>
                                    {moduleSearch && (
                                        <Button variant="link" className="text-xs text-blue-600 font-bold p-0 h-auto" onClick={() => setModuleSearch("")}>
                                            Clear filter
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* ── UNCATEGORIZED RESOURCES TAB ── */}
                <TabsContent value="resources" className="mt-0 outline-none">
                    <div className="bg-white border-2 border-zinc-100 rounded overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-zinc-50">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5" />
                                Uncategorized Files
                            </h3>
                            <span className="text-[10px] font-bold text-zinc-400">
                                {resources.length} asset{resources.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        <div className="p-6">
                            {loadingResources ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <Skeleton key={i} className="h-40 rounded" />
                                    ))}
                                </div>
                            ) : resources.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {resources.map((resource) => (
                                        <Link key={resource.id} href={`/resources/${resource.id}`} className="group">
                                            <div className="bg-white border-2 border-zinc-100 rounded p-5 flex flex-col justify-between hover:border-blue-900 transition-colors h-full min-h-[160px]">
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-[10px] font-black uppercase text-blue-900 bg-blue-50 px-2 py-0.5 rounded tracking-widest">
                                                            {resource.type ?? "Resource"}
                                                        </span>
                                                        <Download className="w-3.5 h-3.5 text-zinc-300 group-hover:text-blue-900 transition-colors" />
                                                    </div>
                                                    <h4 className="text-sm font-bold text-zinc-900 line-clamp-2 leading-snug group-hover:text-blue-900 transition-colors mb-1.5">
                                                        {resource.title}
                                                    </h4>
                                                    {resource.description && (
                                                        <p className="text-[10px] font-bold text-zinc-400 line-clamp-1">
                                                            {resource.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="mt-4 pt-3.5 border-t-2 border-zinc-50 flex justify-between">
                                                    <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold">
                                                        <Calendar className="w-3 h-3" />
                                                        {format(new Date(resource.createdAt), "MMM d, yyyy")}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-zinc-400 text-[10px] font-bold">
                                                        <Download className="w-3 h-3" />
                                                        {resource.downloadCount}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 opacity-50 gap-3">
                                    <FileText className="w-10 h-10 text-zinc-400" />
                                    <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">
                                        {resourceSearch ? "No matches" : "No Files Found"}
                                    </h3>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase">
                                        {resourceSearch
                                            ? `No resources match "${resourceSearch}"`
                                            : "No loose resources are associated with this course."}
                                    </p>
                                    {resourceSearch && (
                                        <Button variant="link" className="text-xs text-blue-600 font-bold p-0 h-auto" onClick={() => setResourceSearch("")}>
                                            Clear filter
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}