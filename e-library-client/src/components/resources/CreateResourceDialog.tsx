"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateResource } from "@/hooks/useResources";
import { useDepartments, useCourses } from "@/hooks/useCourses";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    CloudUpload,
    Loader2,
    Building2,
    BookOpen,
    FileUp,
    ImagePlus,
    X,
    CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES       = ["BOOK", "JOURNAL", "PAPER", "MAGAZINE", "OTHER"] as const;
const RESOURCE_TYPES   = ["BOOK", "JOURNAL", "MAGAZINE", "MODULE_NOTES", "PAST_PAPER", "LECTURE_SLIDE", "LAB_MANUAL", "ASSIGNMENT", "OTHER"] as const;
const ACCESS_TYPES     = ["VIEW_ONLY", "DOWNLOADABLE", "CAMPUS_ONLY"] as const;
const CAMPUS_LOCATIONS = ["MAIN_CAMPUS", "MARKET_PLAZA", "ONLINE"] as const;

/** Converts SNAKE_CASE enum values to "Snake Case" labels */
const toLabel = (s: string) =>
    s.split("_").map((w) => w[0] + w.slice(1).toLowerCase()).join(" ");

// ── Default form values ──────────────────────────────────────────────────────
const DEFAULT_VALUES = {
    title:           "",
    authors:         "",
    description:     "",
    category:        "BOOK",
    resourceType:    "BOOK",
    department:      "",
    courseId:        "",          // empty string = no course linked
    publicationYear: new Date().getFullYear().toString(),
    accessType:      "DOWNLOADABLE",
    campusLocation:  "ONLINE",
    physicalLocation: "",
    shelfNumber:     "",
    copies:          "1",
} as const;

// ── File drop zone ────────────────────────────────────────────────────────────
interface DropZoneProps {
    id: string;
    label: string;
    accept: string;
    acceptLabel: string;
    file: File | null;
    icon: React.ElementType;
    onFileChange: (f: File | null) => void;
}

function DropZone({ id, label, accept, acceptLabel, file, icon: Icon, onFileChange }: DropZoneProps) {
    const [dragging, setDragging] = useState(false);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) onFileChange(dropped);
    }, [onFileChange]);

    return (
        <div className="space-y-1.5">
            <Label htmlFor={id} className="text-xs font-black uppercase tracking-widest text-zinc-600">
                {label}
            </Label>
            <label
                htmlFor={id}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={cn(
                    "flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-5 cursor-pointer transition-all",
                    dragging
                        ? "border-blue-400 bg-blue-50"
                        : file
                        ? "border-emerald-200 bg-emerald-50/50"
                        : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-zinc-100/50"
                )}
            >
                {file ? (
                    <>
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        <div className="text-center">
                            <p className="text-xs font-bold text-emerald-700 truncate max-w-[160px]">{file.name}</p>
                            <p className="text-[9px] font-bold text-emerald-500 uppercase">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); onFileChange(null); }}
                            className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 flex items-center gap-1"
                        >
                            <X className="w-3 h-3" /> Remove
                        </button>
                    </>
                ) : (
                    <>
                        <div className="w-9 h-9 rounded-lg bg-white border-2 border-zinc-200 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-bold text-zinc-600">
                                Drop file or <span className="text-blue-600 underline underline-offset-2">browse</span>
                            </p>
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">{acceptLabel}</p>
                        </div>
                    </>
                )}
                <input
                    id={id}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                />
            </label>
        </div>
    );
}

// ── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 border-t-2 border-zinc-100 pt-5 mt-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-900">{children}</span>
            <div className="flex-1 h-px bg-blue-50" />
        </div>
    );
}

// ── Dialog ───────────────────────────────────────────────────────────────────
export function CreateResourceDialog() {
    const [open, setOpen]           = useState(false);
    const [file, setFile]           = useState<File | null>(null);
    const [coverImage, setCoverImage] = useState<File | null>(null);

    const { mutate: createResource, isPending: isCreating } = useCreateResource();
    const { data: departments, isLoading: isDepartmentsLoading } = useDepartments();

    const { register, handleSubmit, watch, setValue, reset } = useForm({
        defaultValues: DEFAULT_VALUES,
    });

    const accessType        = watch("accessType");
    const isCampusOnly      = (accessType as string) === "CAMPUS_ONLY";
    const selectedDepartment = watch("department");

    const { data: coursesData, isLoading: isCoursesLoading } = useCourses(
        { department: selectedDepartment || undefined, limit: 100 }
    );
    const courses = coursesData?.data ?? [];

    // Reset everything when dialog closes — regardless of success/cancel
    const handleOpenChange = (next: boolean) => {
        if (!next) {
            reset();
            setFile(null);
            setCoverImage(null);
        }
        setOpen(next);
    };

    const onSubmit = (data: any) => {
        if (!isCampusOnly && !file) {
            toast.error("Please select a file for digital resources.");
            return;
        }
        if (isCampusOnly && !data.physicalLocation) {
            toast.error("Physical location is required for campus-only resources.");
            return;
        }

        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (key === "courseId" || key === "authors") return;
            if (value) formData.append(key, String(value));
        });

        if (file && !isCampusOnly) formData.append("file", file);
        if (coverImage) formData.append("coverImage", coverImage);

        if (data.authors) {
            const authorsArray = data.authors.split(",").map((a: string) => a.trim()).filter(Boolean);
            formData.append("authors", JSON.stringify(authorsArray));
        }

        if (data.courseId) {
            formData.append("courseIds", JSON.stringify([data.courseId]));
        }

        createResource(formData, {
            onSuccess: () => handleOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="h-10 px-5 rounded-lg bg-blue-900 hover:bg-zinc-900 text-white font-black text-[10px] uppercase tracking-widest transition-colors gap-2">
                    <CloudUpload className="w-4 h-4" />
                    Upload New
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto font-titillium p-0">
                {/* Dialog header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b-2 border-zinc-100 sticky top-0 bg-white z-10">
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle className="text-xl font-black text-blue-900 tracking-tight">
                                Add New Resource
                            </DialogTitle>
                            <DialogDescription className="text-xs font-bold text-zinc-400 mt-0.5 max-w-sm">
                                Digital files are stored securely. Physical assets are cataloged for campus access.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-5 pt-5">

                    {/* ── Core info ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-zinc-600">
                                Title <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                {...register("title", { required: true })}
                                placeholder="Resource title"
                                className="bg-zinc-50 border-2 border-zinc-100 focus-visible:ring-0 focus-visible:border-blue-300 h-11"
                            />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-zinc-600">
                                Authors <span className="text-red-400">*</span>
                                <span className="text-[9px] font-bold text-zinc-400 normal-case tracking-normal ml-2">comma-separated</span>
                            </Label>
                            <Input
                                {...register("authors", { required: true })}
                                placeholder="John Doe, Jane Smith"
                                className="bg-zinc-50 border-2 border-zinc-100 focus-visible:ring-0 focus-visible:border-blue-300 h-11"
                            />
                        </div>

                        {/* Department */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-black uppercase tracking-widest text-zinc-600 flex items-center gap-1.5">
                                <Building2 className="w-3 h-3 text-zinc-400" /> Department
                            </Label>
                            <Select
                                value={watch("department") || undefined}
                                onValueChange={(v) => { setValue("department", v as any); setValue("courseId", "" as any); }}
                                disabled={isDepartmentsLoading}
                            >
                                <SelectTrigger className="bg-zinc-50 border-2 border-zinc-100 focus:ring-0 focus:border-blue-300 h-11">
                                    <SelectValue placeholder={isDepartmentsLoading ? "Loading…" : "Select department"} />
                                </SelectTrigger>
                                <SelectContent className="border-2 border-zinc-100 shadow-none font-titillium">
                                    {departments?.map((dept) => (
                                        <SelectItem key={dept} value={dept} className="text-xs font-bold">{dept}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Course — cascades from department */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-black uppercase tracking-widest text-zinc-600 flex items-center gap-1.5">
                                <BookOpen className="w-3 h-3 text-zinc-400" /> Course
                                <span className="text-[9px] font-bold text-zinc-400 normal-case tracking-normal">optional</span>
                            </Label>
                            <Select
                                value={watch("courseId") || "none"}
                                onValueChange={(v) => setValue("courseId", (v === "none" ? "" : v) as any)}
                                disabled={isCoursesLoading}
                            >
                                <SelectTrigger className="bg-zinc-50 border-2 border-zinc-100 focus:ring-0 focus:border-blue-300 h-11">
                                    <SelectValue placeholder={isCoursesLoading ? "Loading…" : "Link to a course"} />
                                </SelectTrigger>
                                <SelectContent className="border-2 border-zinc-100 shadow-none font-titillium">
                                    <SelectItem value="none" className="text-xs font-bold text-zinc-400">No course linked</SelectItem>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id} className="text-xs font-bold">
                                            <span className="font-black text-blue-900 mr-2">{course.code}</span>
                                            {course.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Category */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-black uppercase tracking-widest text-zinc-600">Category</Label>
                            <Select onValueChange={(v) => setValue("category", v as any)} defaultValue="BOOK">
                                <SelectTrigger className="bg-zinc-50 border-2 border-zinc-100 focus:ring-0 focus:border-blue-300 h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-2 border-zinc-100 shadow-none font-titillium">
                                    {CATEGORIES.map((c) => (
                                        <SelectItem key={c} value={c} className="text-xs font-bold">{toLabel(c)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Resource type */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-black uppercase tracking-widest text-zinc-600">Resource Type</Label>
                            <Select onValueChange={(v) => setValue("resourceType", v as any)} defaultValue="BOOK">
                                <SelectTrigger className="bg-zinc-50 border-2 border-zinc-100 focus:ring-0 focus:border-blue-300 h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-2 border-zinc-100 shadow-none font-titillium">
                                    {RESOURCE_TYPES.map((t) => (
                                        <SelectItem key={t} value={t} className="text-xs font-bold">{toLabel(t)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Publication year */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-black uppercase tracking-widest text-zinc-600">Publication Year</Label>
                            <Input
                                type="number"
                                {...register("publicationYear")}
                                min={1900}
                                max={new Date().getFullYear()}
                                className="bg-zinc-50 border-2 border-zinc-100 focus-visible:ring-0 focus-visible:border-blue-300 h-11"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-black uppercase tracking-widest text-zinc-600">Description</Label>
                        <Textarea
                            {...register("description")}
                            placeholder="Brief overview of the resource…"
                            className="resize-none bg-zinc-50 border-2 border-zinc-100 focus-visible:ring-0 focus-visible:border-blue-300 min-h-[90px]"
                        />
                    </div>

                    {/* ── Access & Storage ── */}
                    <SectionHeading>Access &amp; Storage</SectionHeading>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-black uppercase tracking-widest text-zinc-600">Access Type</Label>
                            <Select onValueChange={(v) => setValue("accessType", v as any)} defaultValue="DOWNLOADABLE">
                                <SelectTrigger className="bg-zinc-50 border-2 border-zinc-100 focus:ring-0 focus:border-blue-300 h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-2 border-zinc-100 shadow-none font-titillium">
                                    {ACCESS_TYPES.map((t) => (
                                        <SelectItem key={t} value={t} className="text-xs font-bold">{toLabel(t)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-black uppercase tracking-widest text-zinc-600">Campus Location</Label>
                            <Select
                                onValueChange={(v) => setValue("campusLocation", v as any)}
                                defaultValue="ONLINE"
                                disabled={!isCampusOnly}
                            >
                                <SelectTrigger className={cn(
                                    "bg-zinc-50 border-2 border-zinc-100 focus:ring-0 focus:border-blue-300 h-11",
                                    !isCampusOnly && "opacity-40"
                                )}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-2 border-zinc-100 shadow-none font-titillium">
                                    {CAMPUS_LOCATIONS.map((l) => (
                                        <SelectItem key={l} value={l} className="text-xs font-bold">{toLabel(l)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* ── Campus-only fields ── */}
                    {isCampusOnly && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-blue-50/40 border-2 border-blue-100 rounded-lg p-4">
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-blue-800">
                                    Physical Location <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    {...register("physicalLocation")}
                                    placeholder="e.g. Main Library, Floor 2"
                                    className="bg-white border-2 border-blue-100 focus-visible:ring-0 focus-visible:border-blue-300 h-10"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-black uppercase tracking-widest text-blue-800">Shelf No.</Label>
                                <Input
                                    {...register("shelfNumber")}
                                    placeholder="CS-402"
                                    className="bg-white border-2 border-blue-100 focus-visible:ring-0 focus-visible:border-blue-300 h-10"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-black uppercase tracking-widest text-blue-800">Copies Available</Label>
                                <Input
                                    type="number"
                                    {...register("copies")}
                                    min={1}
                                    className="bg-white border-2 border-blue-100 focus-visible:ring-0 focus-visible:border-blue-300 h-10"
                                />
                            </div>
                        </div>
                    )}

                    {/* ── File upload zones ── */}
                    {!isCampusOnly && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DropZone
                                id="file-upload"
                                label="Resource File *"
                                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                acceptLabel="PDF or DOCX only"
                                file={file}
                                icon={FileUp}
                                onFileChange={setFile}
                            />
                            <DropZone
                                id="cover-upload"
                                label="Cover Image (optional)"
                                accept="image/jpeg,image/png,image/webp"
                                acceptLabel="JPG, PNG, WebP"
                                file={coverImage}
                                icon={ImagePlus}
                                onFileChange={setCoverImage}
                            />
                        </div>
                    )}

                    {/* ── Actions ── */}
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t-2 border-zinc-100">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleOpenChange(false)}
                            className="font-black text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 border-2 border-zinc-100 hover:border-zinc-200 h-10 px-5"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isCreating}
                            className="bg-blue-900 text-white hover:bg-zinc-900 font-black text-[10px] uppercase tracking-widest h-10 px-8 transition-colors"
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                    Uploading…
                                </>
                            ) : (
                                "Save Resource"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}