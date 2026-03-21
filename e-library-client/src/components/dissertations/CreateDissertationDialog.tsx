"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateResource } from "@/hooks/useResources";
import { useDepartments, useCourses } from "@/hooks/useCourses"; // Dynamic data hooks
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

const ACCESS_TYPES = ["VIEW_ONLY", "DOWNLOADABLE", "CAMPUS_ONLY"] as const;
const CAMPUS_LOCATIONS = ["MAIN_CAMPUS", "MARKET_PLAZA", "ONLINE"] as const;

export function CreateDissertationDialog() {
    const { isAdmin } = useRole(); 
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
            category: "THESIS", // Silently forced
            resourceType: "DISSERTATION", // Silently forced
            department: "",
            courseId: "none", // Track course mapping
            publicationYear: new Date().getFullYear().toString(),
            accessType: "VIEW_ONLY",
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

    // Strict Backend Rule: Only Admins can upload Dissertations
    if (!isAdmin) return null;

    const onSubmit = (data: any) => {
        if (!isCampusOnly && !file) {
            toast.error("Please select the dissertation document (PDF/DOCX).");
            return;
        }

        if (isCampusOnly && !data.physicalLocation) {
            toast.error("Physical location is required for physical archives.");
            return;
        }

        const formData = new FormData();
        
        // Append text fields, excluding custom arrays/selects
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'courseId' || key === 'authors') return;
            if (value) formData.append(key, String(value));
        });

        if (file && !isCampusOnly) formData.append("file", file);
        if (coverImage) formData.append("coverImage", coverImage);

        // Format authors array for the backend
        if (data.authors) {
            const authorsArray = data.authors.split(',').map((a: string) => a.trim());
            formData.append("authors", JSON.stringify(authorsArray));
        }

        // Link to course if selected
        if (data.courseId && data.courseId !== "none") {
            formData.append("courseIds", JSON.stringify([data.courseId]));
        }

        createResource(formData, {
            onSuccess: () => {
                setOpen(false);
                reset();
                setFile(null);
                setCoverImage(null);
                toast.success("Dissertation published successfully!");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-12 px-6 rounded bg-blue-900 hover:bg-zinc-900 text-white shrink-0 font-bold text-xs uppercase tracking-wider transition-all">
                    <CloudUpload className="w-4 h-4 mr-2" />
                    Publish Thesis
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto font-titillium">
                <DialogHeader className="border-b-2 border-zinc-100 pb-4 mb-2">
                    <DialogTitle className="text-2xl font-black text-blue-900 tracking-tight">Publish New Dissertation</DialogTitle>
                    <DialogDescription className="font-bold text-zinc-500">
                        Upload an approved student thesis or doctoral dissertation. Note: This action is restricted to administrators.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="title" className="font-bold">Research Title *</Label>
                            <Input id="title" {...register("title", { required: true })} placeholder="e.g., Analysis of Web3 Scalability..." className="bg-zinc-50 focus-visible:ring-blue-900" />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="authors" className="font-bold">Researcher(s) (comma separated) *</Label>
                            <Input id="authors" {...register("authors", { required: true })} placeholder="Student Name" className="bg-zinc-50 focus-visible:ring-blue-900" />
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

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="publicationYear" className="font-bold">Defense / Publication Year</Label>
                            <Input id="publicationYear" type="number" {...register("publicationYear")} className="bg-zinc-50 focus-visible:ring-blue-900 w-full md:w-1/2" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="font-bold">Abstract</Label>
                        <Textarea id="description" {...register("description")} placeholder="Paste the research abstract here..." className="resize-none bg-zinc-50 focus-visible:ring-blue-900 min-h-[120px]" />
                    </div>

                    <div className="space-y-2 border-t-2 border-zinc-100 pt-6">
                        <Label className="text-blue-900 font-black tracking-widest uppercase text-sm">Access & Storage Parameters</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div className="space-y-2">
                                <Label className="font-bold">Access Rights</Label>
                                <Select onValueChange={(val) => setValue("accessType", val)} defaultValue="VIEW_ONLY">
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
                                <Label htmlFor="physicalLocation" className="font-bold text-blue-900">Library Section *</Label>
                                <Input id="physicalLocation" {...register("physicalLocation")} placeholder="e.g. Post-Grad Archive" className="bg-white" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="shelfNumber" className="font-bold text-blue-900">Shelf Number</Label>
                                <Input id="shelfNumber" {...register("shelfNumber")} placeholder="e.g. TH-10" className="bg-white" />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50 p-6 rounded-xl border-2 border-zinc-100">
                            <div className="space-y-2">
                                <Label htmlFor="file" className="font-bold">Thesis Document (PDF/DOCX) *</Label>
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
                                <Label htmlFor="coverImage" className="font-bold">Cover Page (Optional)</Label>
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
                            {isCreating ? "Publishing..." : "Publish Thesis"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}