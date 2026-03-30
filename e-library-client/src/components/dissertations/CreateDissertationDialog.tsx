"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateResource } from "@/hooks/useResources";
import { useDepartments, useCourses } from "@/hooks/useCourses";
import { useRole } from "@/hooks/useAuth";
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
import { CloudUpload, Loader2, Building2, BookOpen } from "lucide-react";
import { toast } from "sonner";

// ── Constants ─────────────────────────────────────────────────────────────────

const ACCESS_TYPES = [
    { value: "VIEW_ONLY", label: "View Only" },
    { value: "DOWNLOADABLE", label: "Downloadable" },
    { value: "CAMPUS_ONLY", label: "Campus Only (Physical)" },
] as const;

const CAMPUS_LOCATIONS = [
    { value: "MAIN_CAMPUS", label: "Main Campus" },
    { value: "MARKET_PLAZA", label: "Market Plaza" },
    { value: "ONLINE", label: "Online" },
] as const;

const CURRENT_YEAR = new Date().getFullYear();

// ── Zod schema ────────────────────────────────────────────────────────────────

const dissertationSchema = z
    .object({
        title: z.string().min(5, "Title must be at least 5 characters").max(300, "Title is too long"),
        authors: z
            .string()
            .min(2, "At least one author is required")
            .max(500, "Authors list is too long"),
        department: z.string().optional(),
        courseId: z.string().optional(),
        publicationYear: z
            .number({ invalid_type_error: "Enter a valid year" })
            .int()
            .min(1950, "Year must be 1950 or later")
            .max(CURRENT_YEAR, `Year cannot exceed ${CURRENT_YEAR}`),
        description: z.string().max(5000, "Abstract is too long").optional(),
        accessType: z.enum(["VIEW_ONLY", "DOWNLOADABLE", "CAMPUS_ONLY"]),
        campusLocation: z.enum(["MAIN_CAMPUS", "MARKET_PLAZA", "ONLINE"]).optional(),
        physicalLocation: z.string().optional(),
        shelfNumber: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.accessType === "CAMPUS_ONLY" && !data.physicalLocation?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Library section is required for physical archives",
                path: ["physicalLocation"],
            });
        }
    });

type DissertationFormData = z.infer<typeof dissertationSchema>;

// ── Component ─────────────────────────────────────────────────────────────────

export function CreateDissertationDialog() {
    const { isAdmin } = useRole();
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const { mutate: createResource, isPending: isCreating } = useCreateResource();
    const { data: departments, isLoading: isDepartmentsLoading } = useDepartments();

    const {
        register,
        handleSubmit,
        watch,
        control,
        reset,
        formState: { errors },
    } = useForm<DissertationFormData>({
        resolver: zodResolver(dissertationSchema),
        defaultValues: {
            title: "",
            authors: "",
            description: "",
            department: "",
            courseId: "none",
            publicationYear: CURRENT_YEAR,
            accessType: "VIEW_ONLY",
            campusLocation: "ONLINE",
            physicalLocation: "",
            shelfNumber: "",
        },
    });

    const accessType = watch("accessType");
    const selectedDepartment = watch("department");
    const isCampusOnly = accessType === "CAMPUS_ONLY";

    // Cascading course select: filter by department if one is chosen
    const { data: coursesData, isLoading: isCoursesLoading } = useCourses(
        selectedDepartment
            ? { department: selectedDepartment, limit: 100 }
            : { limit: 100 }
    );
    const courses = coursesData?.data ?? [];

    // Only admins can publish dissertations
    if (!isAdmin) return null;

    const handleClose = () => {
        setOpen(false);
        reset();
        setFile(null);
        setCoverImage(null);
        setFileError(null);
    };

    const onSubmit = (data: DissertationFormData) => {
        // File validation: required if not campus-only
        if (!isCampusOnly && !file) {
            setFileError("Please select the dissertation document (PDF or DOCX).");
            return;
        }
        setFileError(null);

        // Build FormData explicitly — no magic loop that hides which keys go where
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description ?? "");
        formData.append("department", data.department ?? "");
        formData.append("publicationYear", String(data.publicationYear));
        formData.append("accessType", data.accessType);
        formData.append("category", "THESIS");
        formData.append("resourceType", "DISSERTATION");

        // Authors — parsed from comma-separated string to JSON array
        const authorsArray = data.authors
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean);
        formData.append("authors", JSON.stringify(authorsArray));

        if (isCampusOnly) {
            formData.append("campusLocation", data.campusLocation ?? "MAIN_CAMPUS");
            formData.append("physicalLocation", data.physicalLocation ?? "");
            if (data.shelfNumber) formData.append("shelfNumber", data.shelfNumber);
        } else {
            formData.append("campusLocation", "ONLINE");
            if (file) formData.append("file", file);
        }

        if (coverImage) formData.append("coverImage", coverImage);

        if (data.courseId && data.courseId !== "none") {
            formData.append("courseIds", JSON.stringify([data.courseId]));
        }

        createResource(formData, {
            onSuccess: () => {
                handleClose();
                toast.success("Dissertation published successfully!");
            },
            onError: () => {
                toast.error("Failed to publish dissertation. Please try again.");
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
            <DialogTrigger asChild>
                <Button className="h-11 px-5 rounded bg-blue-900 hover:bg-zinc-900 text-white font-bold text-xs uppercase tracking-wider transition-colors">
                    <CloudUpload className="w-4 h-4 mr-2" />
                    Publish Thesis
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto font-titillium">
                <DialogHeader className="border-b-2 border-zinc-100 pb-4 mb-2">
                    <DialogTitle className="text-xl font-black text-blue-900 tracking-tight">
                        Publish New Dissertation
                    </DialogTitle>
                    <DialogDescription className="font-bold text-zinc-500 text-sm">
                        Upload an approved student thesis or doctoral dissertation. Restricted to administrators.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>

                    {/* ── RESEARCH DETAILS ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 md:col-span-2">
                            <Label htmlFor="title" className="font-bold text-xs uppercase text-zinc-500 tracking-wider">
                                Research Title <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                id="title"
                                {...register("title")}
                                placeholder="e.g., Analysis of Web3 Scalability..."
                                className={`bg-zinc-50 focus-visible:ring-blue-900 h-11 ${errors.title ? "border-red-400" : ""}`}
                            />
                            {errors.title && (
                                <p className="text-[10px] font-bold text-red-500">{errors.title.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <Label htmlFor="authors" className="font-bold text-xs uppercase text-zinc-500 tracking-wider">
                                Researcher(s) <span className="text-red-400">*</span>
                                <span className="ml-1 normal-case font-normal text-zinc-400">(comma separated)</span>
                            </Label>
                            <Input
                                id="authors"
                                {...register("authors")}
                                placeholder="Jane Doe, John Smith"
                                className={`bg-zinc-50 focus-visible:ring-blue-900 h-11 ${errors.authors ? "border-red-400" : ""}`}
                            />
                            {errors.authors && (
                                <p className="text-[10px] font-bold text-red-500">{errors.authors.message}</p>
                            )}
                        </div>

                        {/* Department */}
                        <div className="space-y-1.5">
                            <Label className="font-bold text-xs uppercase text-zinc-500 tracking-wider flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5" /> Department
                            </Label>
                            <Controller
                                name="department"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={isDepartmentsLoading}
                                    >
                                        <SelectTrigger className="bg-zinc-50 focus:ring-blue-900 h-11">
                                            <SelectValue placeholder={isDepartmentsLoading ? "Loading…" : "Select Department"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments?.map((dept: string) => (
                                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        {/* Cascading course */}
                        <div className="space-y-1.5">
                            <Label className="font-bold text-xs uppercase text-zinc-500 tracking-wider flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5" /> Associated Course
                                <span className="normal-case font-normal text-zinc-400">(optional)</span>
                            </Label>
                            <Controller
                                name="courseId"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value ?? "none"}
                                        disabled={isCoursesLoading}
                                    >
                                        <SelectTrigger className="bg-zinc-50 focus:ring-blue-900 h-11">
                                            <SelectValue placeholder={isCoursesLoading ? "Loading…" : "Link to a Course"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Course Linked</SelectItem>
                                            {courses.map((course) => (
                                                <SelectItem key={course.id} value={course.id}>
                                                    <span className="font-black text-blue-900 mr-2">{course.code}</span>
                                                    {course.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        {/* Publication year */}
                        <div className="space-y-1.5">
                            <Label htmlFor="publicationYear" className="font-bold text-xs uppercase text-zinc-500 tracking-wider">
                                Defense / Publication Year
                            </Label>
                            <Input
                                id="publicationYear"
                                type="number"
                                min={1950}
                                max={CURRENT_YEAR}
                                {...register("publicationYear", { valueAsNumber: true })}
                                className={`bg-zinc-50 focus-visible:ring-blue-900 h-11 ${errors.publicationYear ? "border-red-400" : ""}`}
                            />
                            {errors.publicationYear && (
                                <p className="text-[10px] font-bold text-red-500">{errors.publicationYear.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Abstract */}
                    <div className="space-y-1.5">
                        <Label htmlFor="description" className="font-bold text-xs uppercase text-zinc-500 tracking-wider">
                            Abstract
                        </Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            placeholder="Paste the research abstract here..."
                            className={`resize-none bg-zinc-50 focus-visible:ring-blue-900 min-h-[120px] ${errors.description ? "border-red-400" : ""}`}
                        />
                        {errors.description && (
                            <p className="text-[10px] font-bold text-red-500">{errors.description.message}</p>
                        )}
                    </div>

                    {/* ── ACCESS & STORAGE ── */}
                    <div className="border-t-2 border-zinc-100 pt-6 space-y-4">
                        <p className="text-[10px] font-black uppercase text-blue-900 tracking-widest">
                            Access &amp; Storage Parameters
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="font-bold text-xs uppercase text-zinc-500 tracking-wider">
                                    Access Rights
                                </Label>
                                <Controller
                                    name="accessType"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="bg-zinc-50 focus:ring-blue-900 h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ACCESS_TYPES.map((t) => (
                                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            {isCampusOnly && (
                                <div className="space-y-1.5">
                                    <Label className="font-bold text-xs uppercase text-zinc-500 tracking-wider">
                                        Campus Location
                                    </Label>
                                    <Controller
                                        name="campusLocation"
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value ?? "MAIN_CAMPUS"}>
                                                <SelectTrigger className="bg-zinc-50 focus:ring-blue-900 h-11">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CAMPUS_LOCATIONS.map((l) => (
                                                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── PHYSICAL LOCATION (campus-only) ── */}
                    {isCampusOnly ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50/60 p-5 rounded-xl border-2 border-blue-100">
                            <div className="space-y-1.5 md:col-span-2">
                                <Label htmlFor="physicalLocation" className="font-bold text-xs uppercase text-blue-900 tracking-wider">
                                    Library Section <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="physicalLocation"
                                    {...register("physicalLocation")}
                                    placeholder="e.g. Post-Grad Archive"
                                    className={`bg-white h-11 ${errors.physicalLocation ? "border-red-400" : ""}`}
                                />
                                {errors.physicalLocation && (
                                    <p className="text-[10px] font-bold text-red-500">{errors.physicalLocation.message}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="shelfNumber" className="font-bold text-xs uppercase text-blue-900 tracking-wider">
                                    Shelf Number
                                </Label>
                                <Input
                                    id="shelfNumber"
                                    {...register("shelfNumber")}
                                    placeholder="e.g. TH-10"
                                    className="bg-white h-11"
                                />
                            </div>
                        </div>
                    ) : (
                        /* ── FILE UPLOADS (digital) ── */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-zinc-50 p-5 rounded-xl border-2 border-zinc-100">
                            <div className="space-y-1.5">
                                <Label htmlFor="file" className="font-bold text-xs uppercase text-zinc-500 tracking-wider">
                                    Thesis Document <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="file"
                                    type="file"
                                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    onChange={(e) => {
                                        setFile(e.target.files?.[0] ?? null);
                                        setFileError(null);
                                    }}
                                    className="bg-white cursor-pointer h-11"
                                />
                                {fileError && (
                                    <p className="text-[10px] font-bold text-red-500">{fileError}</p>
                                )}
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                    PDF or DOCX
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="coverImage" className="font-bold text-xs uppercase text-zinc-500 tracking-wider">
                                    Cover Page <span className="font-normal normal-case text-zinc-400">(optional)</span>
                                </Label>
                                <Input
                                    id="coverImage"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
                                    className="bg-white cursor-pointer h-11"
                                />
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                    JPG, PNG, or WebP
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── FORM FOOTER ── */}
                    <div className="flex justify-end gap-3 pt-4 border-t-2 border-zinc-100">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            disabled={isCreating}
                            className="font-bold uppercase tracking-widest text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-900 text-white hover:bg-zinc-900 font-bold uppercase tracking-widest text-xs h-10 px-8 transition-colors"
                            disabled={isCreating}
                        >
                            {isCreating && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                            {isCreating ? "Publishing…" : "Publish Thesis"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}