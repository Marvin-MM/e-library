"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

// ── Validation schema ─────────────────────────────────────────────────────────

const manageModuleSchema = z.object({
    code: z
        .string()
        .min(2, "Code must be at least 2 characters")
        .max(20, "Code must be 20 characters or fewer")
        .regex(/^[A-Z0-9-]+$/i, "Code can only contain letters, numbers, and hyphens"),
    name: z
        .string()
        .min(3, "Name must be at least 3 characters")
        .max(100, "Name must be 100 characters or fewer"),
    description: z
        .string()
        .max(500, "Description must be 500 characters or fewer")
        .optional(),
});

type ManageModuleFormData = z.infer<typeof manageModuleSchema>;

// ── Props ─────────────────────────────────────────────────────────────────────

interface ManageModuleDialogProps {
    courseId: string;
    initialData?: {
        id: string;
        code: string;
        name: string;
        description?: string;
    };
    triggerType?: "button" | "icon";
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ManageModuleDialog({
    courseId,
    initialData,
    triggerType = "button",
}: ManageModuleDialogProps) {
    const [open, setOpen] = useState(false);
    const isEditMode = !!initialData;

    const { mutate: createModule, isPending: isCreating } = useCreateCourseUnit(courseId);
    const { mutate: updateModule, isPending: isUpdating } = useUpdateCourseUnit(courseId);
    const isPending = isCreating || isUpdating;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ManageModuleFormData>({
        resolver: zodResolver(manageModuleSchema),
        defaultValues: {
            code: initialData?.code ?? "",
            name: initialData?.name ?? "",
            description: initialData?.description ?? "",
        },
    });

    useEffect(() => {
        if (open) {
            reset({
                code: initialData?.code ?? "",
                name: initialData?.name ?? "",
                description: initialData?.description ?? "",
            });
        }
    }, [open, initialData, reset]);

    const onSubmit = (data: ManageModuleFormData) => {
        if (isEditMode && initialData) {
            updateModule(
                { unitId: initialData.id, data },
                { onSuccess: () => setOpen(false) }
            );
        } else {
            createModule(data, {
                onSuccess: () => {
                    setOpen(false);
                    reset();
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerType === "button" ? (
                    <Button className="bg-blue-900 hover:bg-zinc-900 text-white h-10 px-4 font-bold text-xs uppercase tracking-wider rounded transition-colors">
                        <Plus className="w-3.5 h-3.5 mr-2" />
                        Add Module
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-blue-900 border-2 border-transparent hover:border-zinc-200 rounded transition-colors"
                    >
                        <Edit className="w-3.5 h-3.5" />
                        <span className="sr-only">Edit module</span>
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="max-w-md border-2 border-zinc-100 shadow-xl">
                <DialogHeader className="border-b-2 border-zinc-50 pb-4 mb-2">
                    <DialogTitle className="text-lg font-black text-blue-900 uppercase tracking-tight">
                        {isEditMode ? "Modify Module" : "Create Course Module"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    {/* Code */}
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="code"
                            className="font-bold text-xs uppercase tracking-widest text-zinc-500"
                        >
                            Module Code <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            id="code"
                            {...register("code")}
                            placeholder="e.g. MOD-01"
                            className={`bg-zinc-50 focus-visible:ring-blue-900 font-bold h-11 ${
                                errors.code ? "border-red-400" : ""
                            }`}
                        />
                        {errors.code && (
                            <p className="text-[10px] font-bold text-red-500">{errors.code.message}</p>
                        )}
                    </div>

                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="name"
                            className="font-bold text-xs uppercase tracking-widest text-zinc-500"
                        >
                            Module Name <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            id="name"
                            {...register("name")}
                            placeholder="e.g. Introduction to Programming"
                            className={`bg-zinc-50 focus-visible:ring-blue-900 font-bold h-11 ${
                                errors.name ? "border-red-400" : ""
                            }`}
                        />
                        {errors.name && (
                            <p className="text-[10px] font-bold text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="description"
                            className="font-bold text-xs uppercase tracking-widest text-zinc-500"
                        >
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            placeholder="Brief overview of the module..."
                            className={`resize-none bg-zinc-50 focus-visible:ring-blue-900 min-h-[96px] text-sm ${
                                errors.description ? "border-red-400" : ""
                            }`}
                        />
                        {errors.description && (
                            <p className="text-[10px] font-bold text-red-500">{errors.description.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t-2 border-zinc-50">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                            className="font-bold uppercase tracking-widest text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-900 text-white hover:bg-zinc-900 font-bold uppercase tracking-widest text-xs h-10 px-6 transition-colors"
                            disabled={isPending}
                        >
                            {isPending && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                            {isEditMode ? "Save Changes" : "Create Module"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}