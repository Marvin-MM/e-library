"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateResource } from "@/hooks/useResources";
import { useDepartments, useCourses } from "@/hooks/useCourses"; // Import the dynamic hooks

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

// Removed THESIS from categories
const CATEGORIES = ["BOOK", "JOURNAL", "PAPER", "MAGAZINE", "OTHER"] as const;

// Removed DISSERTATION from resource types
const RESOURCE_TYPES = ["BOOK", "JOURNAL", "MAGAZINE", "MODULE_NOTES", "PAST_PAPER", "LECTURE_SLIDE", "LAB_MANUAL", "ASSIGNMENT", "OTHER"] as const;

const ACCESS_TYPES = ["VIEW_ONLY", "DOWNLOADABLE", "CAMPUS_ONLY"] as const;
const CAMPUS_LOCATIONS = ["MAIN_CAMPUS", "MARKET_PLAZA", "ONLINE"] as const;

export function CreateResourceDialog() {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [coverImage, setCoverImage] = useState<File | null>(null);
    
    const { mutate: createResource, isPending: isCreating } = useCreateResource();
    
    // Fetch Departments globally
    const { data: departments, isLoading: isDepartmentsLoading } = useDepartments();

    const { register, handleSubmit, watch, setValue, reset } = useForm({
        defaultValues: {
            title: "",
            authors: "",
            description: "",
            category: "BOOK",
            resourceType: "BOOK",
            department: "",
            courseId: "none", // Added courseId to state tracking
            publicationYear: new Date().getFullYear().toString(),
            accessType: "DOWNLOADABLE",
            campusLocation: "ONLINE",
            physicalLocation: "",
            shelfNumber: "",
            copies: "1",
        }
    });

    const accessType = watch("accessType");
    const isCampusOnly = accessType === "CAMPUS_ONLY";
    const selectedDepartment = watch("department");

    // Dynamically fetch courses based on the currently selected department
    const { data: coursesData, isLoading: isCoursesLoading } = useCourses(
        selectedDepartment ? { department: selectedDepartment, limit: 100 } : { limit: 100 }
    );
    const courses = coursesData?.data || [];

    const onSubmit = (data: any) => {
        if (!isCampusOnly && !file) {
            toast.error("Please select a file to upload for digital resources.");
            return;
        }

        if (isCampusOnly && !data.physicalLocation) {
            toast.error("Physical location is required for campus-only resources.");
            return;
        }

        const formData = new FormData();
        
        // Append text fields dynamically, excluding special fields
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'courseId' || key === 'authors') return; // Handle these separately
            if (value) formData.append(key, String(value));
        });

        // Append files
        if (file && !isCampusOnly) formData.append("file", file);
        if (coverImage) formData.append("coverImage", coverImage);

        // Required by your backend for the Authors Array
        if (data.authors) {
            const authorsArray = data.authors.split(',').map((a: string) => a.trim());
            formData.append("authors", JSON.stringify(authorsArray));
        }

        // Required by your backend for mapping to specific courses
        if (data.courseId && data.courseId !== "none") {
            // Your backend prisma transaction uses `courseIds` array
            formData.append("courseIds", JSON.stringify([data.courseId]));
        }

        createResource(formData, {
            onSuccess: () => {
                setOpen(false);
                reset();
                setFile(null);
                setCoverImage(null);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-12 px-6 rounded bg-blue-900 hover:bg-zinc-900 text-white shrink-0 font-bold text-xs uppercase tracking-wider transition-all">
                    <CloudUpload className="w-4 h-4 mr-2" />
                    Upload New
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto font-titillium">
                <DialogHeader className="border-b-2 border-zinc-100 pb-4 mb-2">
                    <DialogTitle className="text-2xl font-black text-blue-900 tracking-tight">Add New Resource</DialogTitle>
                    <DialogDescription className="font-bold text-zinc-500">
                        Fill in the details below. Digital files are sent to secure storage, while physical assets are cataloged for campus access.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="font-bold">Title *</Label>
                            <Input id="title" {...register("title", { required: true })} placeholder="Resource title" className="bg-zinc-50 focus-visible:ring-blue-900" />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="authors" className="font-bold">Authors (comma separated) *</Label>
                            <Input id="authors" {...register("authors", { required: true })} placeholder="John Doe, Jane Smith" className="bg-zinc-50 focus-visible:ring-blue-900" />
                        </div>

                        {/* DYNAMIC DEPARTMENT SELECT */}
                        <div className="space-y-2">
                            <Label className="font-bold flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-zinc-400" />
                                Department
                            </Label>
                            <Select onValueChange={(val) => setValue("department", val)} value={watch("department") || undefined} disabled={isDepartmentsLoading}>
                                <SelectTrigger className="bg-zinc-50 focus:ring-blue-900">
                                    <SelectValue placeholder={isDepartmentsLoading ? "Loading departments..." : "Select Department"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments?.map(dept => (
                                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* CASCADING COURSE SELECT */}
                        <div className="space-y-2">
                            <Label className="font-bold flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-zinc-400" />
                                Associated Course (Optional)
                            </Label>
                            <Select onValueChange={(val) => setValue("courseId", val)} value={watch("courseId")} disabled={isCoursesLoading}>
                                <SelectTrigger className="bg-zinc-50 focus:ring-blue-900">
                                    <SelectValue placeholder={isCoursesLoading ? "Loading courses..." : "Link to a Course"} />
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
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold">Category</Label>
                            <Select onValueChange={(val) => setValue("category", val)} defaultValue="BOOK">
                                <SelectTrigger className="bg-zinc-50 focus:ring-blue-900"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat.replace('_', ' ')}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold">Resource Type</Label>
                            <Select onValueChange={(val) => setValue("resourceType", val)} defaultValue="BOOK">
                                <SelectTrigger className="bg-zinc-50 focus:ring-blue-900"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {RESOURCE_TYPES.map(type => <SelectItem key={type} value={type}>{type.replace('_', ' ')}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="publicationYear" className="font-bold">Publication / Release Year</Label>
                            <Input id="publicationYear" type="number" {...register("publicationYear")} className="bg-zinc-50 focus-visible:ring-blue-900" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="font-bold">Description</Label>
                        <Textarea id="description" {...register("description")} placeholder="Brief overview of the resource..." className="resize-none bg-zinc-50 focus-visible:ring-blue-900 min-h-[100px]" />
                    </div>

                    <div className="space-y-2 border-t-2 border-zinc-100 pt-6">
                        <Label className="text-blue-900 font-black tracking-widest uppercase text-sm">Access & Storage Parameters</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div className="space-y-2">
                                <Label className="font-bold">Access Type</Label>
                                <Select onValueChange={(val) => setValue("accessType", val)} defaultValue="DOWNLOADABLE">
                                    <SelectTrigger className="bg-zinc-50 focus:ring-blue-900"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {ACCESS_TYPES.map(type => <SelectItem key={type} value={type}>{type.replace('_', ' ')}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bold">Campus Location</Label>
                                <Select onValueChange={(val) => setValue("campusLocation", val)} defaultValue="ONLINE" disabled={!isCampusOnly}>
                                    <SelectTrigger className="bg-zinc-50 focus:ring-blue-900"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {CAMPUS_LOCATIONS.map(loc => <SelectItem key={loc} value={loc}>{loc.replace('_', ' ')}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {isCampusOnly ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50/50 p-6 rounded-xl border-2 border-blue-100">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="physicalLocation" className="font-bold text-blue-900">Physical Location *</Label>
                                <Input id="physicalLocation" {...register("physicalLocation")} placeholder="e.g. Main Library, Floor 2" className="bg-white" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="shelfNumber" className="font-bold text-blue-900">Shelf Number</Label>
                                <Input id="shelfNumber" {...register("shelfNumber")} placeholder="e.g. CS-402" className="bg-white" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="copies" className="font-bold text-blue-900">Available Copies</Label>
                                <Input id="copies" type="number" {...register("copies")} min="1" className="bg-white" />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50 p-6 rounded-xl border-2 border-zinc-100">
                            <div className="space-y-2">
                                <Label htmlFor="file" className="font-bold">Resource File (PDF or DOCX only) *</Label>
                                <Input 
                                    id="file" 
                                    type="file" 
                                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)} 
                                    className="bg-white cursor-pointer"
                                />
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Supported: PDF, DOCX</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="coverImage" className="font-bold">Cover Image (Optional)</Label>
                                <Input 
                                    id="coverImage" 
                                    type="file" 
                                    accept="image/jpeg,image/png,image/webp" 
                                    onChange={(e) => setCoverImage(e.target.files?.[0] || null)} 
                                    className="bg-white cursor-pointer"
                                />
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Supported: JPG, PNG, WebP</p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-6 border-t-2 border-zinc-100">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="font-bold uppercase tracking-widest text-xs">Cancel</Button>
                        <Button type="submit" className="bg-blue-900 text-white hover:bg-zinc-900 font-bold uppercase tracking-widest text-xs h-10 px-8" disabled={isCreating}>
                            {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isCreating ? "Uploading..." : "Save Resource"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}