"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCreateCourseUnit, useUpdateCourseUnit } from "@/hooks/useCourseUnits";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Edit } from "lucide-react";

interface ManageModuleDialogProps {
    courseId: string;
    initialData?: { id: string; code: string; name: string; description?: string };
    triggerType?: "button" | "icon";
}

export function ManageModuleDialog({ courseId, initialData, triggerType = "button" }: ManageModuleDialogProps) {
    const [open, setOpen] = useState(false);
    const isEditMode = !!initialData;

    const { mutate: createModule, isPending: isCreating } = useCreateCourseUnit(courseId);
    const { mutate: updateModule, isPending: isUpdating } = useUpdateCourseUnit(courseId);
    
    const isPending = isCreating || isUpdating;

    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            code: initialData?.code || "",
            name: initialData?.name || "",
            description: initialData?.description || "",
        }
    });

    // Reset form when opened with new data
    useEffect(() => {
        if (open) {
            reset({
                code: initialData?.code || "",
                name: initialData?.name || "",
                description: initialData?.description || "",
            });
        }
    }, [open, initialData, reset]);

    const onSubmit = (data: any) => {
        if (isEditMode && initialData) {
            updateModule({ unitId: initialData.id, data }, {
                onSuccess: () => setOpen(false)
            });
        } else {
            createModule(data, {
                onSuccess: () => {
                    setOpen(false);
                    reset();
                }
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerType === "button" ? (
                    <Button className="bg-blue-900 hover:bg-zinc-900 text-white h-11 font-bold text-xs uppercase tracking-wider rounded transition-all">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Module
                    </Button>
                ) : (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-blue-900 border-2 border-transparent hover:border-zinc-200">
                        <Edit className="w-4 h-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md font-titillium border-2 border-zinc-100 shadow-xl">
                <DialogHeader className="border-b-2 border-zinc-50 pb-4 mb-2">
                    <DialogTitle className="text-xl font-black text-blue-900 uppercase tracking-tight">
                        {isEditMode ? "Modify Module" : "Create Course Module"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="code" className="font-bold text-xs uppercase tracking-widest text-zinc-500">Module Code *</Label>
                        <Input id="code" {...register("code", { required: true })} placeholder="e.g. MOD-01" className="bg-zinc-50 focus-visible:ring-blue-900 font-bold" />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="name" className="font-bold text-xs uppercase tracking-widest text-zinc-500">Module Name *</Label>
                        <Input id="name" {...register("name", { required: true })} placeholder="e.g. Introduction to Programming" className="bg-zinc-50 focus-visible:ring-blue-900 font-bold" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="font-bold text-xs uppercase tracking-widest text-zinc-500">Description</Label>
                        <Textarea id="description" {...register("description")} placeholder="Brief overview of the module..." className="resize-none bg-zinc-50 focus-visible:ring-blue-900 min-h-[100px] text-sm" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t-2 border-zinc-50">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="font-bold uppercase tracking-widest text-xs">Cancel</Button>
                        <Button type="submit" className="bg-blue-900 text-white hover:bg-zinc-900 font-bold uppercase tracking-widest text-xs h-10 px-6" disabled={isPending}>
                            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isEditMode ? "Save Changes" : "Create Module"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}