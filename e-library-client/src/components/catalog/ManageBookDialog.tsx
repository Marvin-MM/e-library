"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateBook, useUpdateBook, useCampuses } from "@/hooks/useCatalog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Edit } from "lucide-react";

// ── Zod schema ─────────────────────────────────────────────────────────────

const bookSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters").max(300, "Title is too long"),
    author: z.string().min(2, "Author name is required").max(200, "Author name is too long"),
    isbn: z
        .string()
        .regex(/^(97(8|9))?\d{9}(\d|X)$/, "Enter a valid ISBN (e.g. 9783161484100)")
        .optional()
        .or(z.literal("")),
    description: z.string().max(2000, "Description is too long").optional(),
    // Campus + copies only matter on create; we validate conditionally below
    campusId: z.string().optional(),
    copies: z.number().int().min(1, "At least 1 copy is required").optional(),
});

// Extend for create-only fields
const createBookSchema = bookSchema.superRefine((data, ctx) => {
    if (!data.campusId || data.campusId === "") {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please select an initial campus",
            path: ["campusId"],
        });
    }
    if (!data.copies || data.copies < 1) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "At least 1 copy is required",
            path: ["copies"],
        });
    }
});

type BookFormData = z.infer<typeof bookSchema>;

// ── Props ───────────────────────────────────────────────────────────────────

interface ManageBookDialogProps {
    initialData?: {
        id: string;
        title: string;
        author: string;
        description?: string;
        isbn?: string;
    };
    triggerType?: "button" | "icon";
}

// ── Component ───────────────────────────────────────────────────────────────

export function ManageBookDialog({ initialData, triggerType = "button" }: ManageBookDialogProps) {
    const [open, setOpen] = useState(false);
    const isEditMode = !!initialData;

    const { mutate: createBook, isPending: isCreating } = useCreateBook();
    const { mutate: updateBook, isPending: isUpdating } = useUpdateBook();
    const { data: campusesData } = useCampuses();
    const campuses = Array.isArray(campusesData) ? campusesData : [];

    const isPending = isCreating || isUpdating;

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<BookFormData>({
        // Edit mode only validates the shared fields; create mode validates campus+copies too
        resolver: zodResolver(isEditMode ? bookSchema : createBookSchema),
        defaultValues: {
            title: initialData?.title ?? "",
            author: initialData?.author ?? "",
            isbn: initialData?.isbn ?? "",
            description: initialData?.description ?? "",
            campusId: "",
            copies: 1,
        },
    });

    useEffect(() => {
        if (open) {
            reset({
                title: initialData?.title ?? "",
                author: initialData?.author ?? "",
                isbn: initialData?.isbn ?? "",
                description: initialData?.description ?? "",
                campusId: "",
                copies: 1,
            });
        }
    }, [open, initialData, reset]);

    const onSubmit = (data: BookFormData) => {
        if (isEditMode && initialData) {
            updateBook(
                { id: initialData.id, data },
                { onSuccess: () => setOpen(false) }
            );
        } else {
            createBook(data as any, {
                onSuccess: () => {
                    setOpen(false);
                    reset();
                },
            });
        }
    };

    const FieldError = ({ msg }: { msg?: string }) =>
        msg ? <p className="text-[10px] font-bold text-red-500 mt-1">{msg}</p> : null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerType === "button" ? (
                    <Button className="bg-blue-900 hover:bg-zinc-900 text-white h-10 px-5 font-bold text-[10px] uppercase tracking-widest rounded transition-colors">
                        <Plus className="w-3.5 h-3.5 mr-2" />
                        Catalog Book
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-blue-900 border-2 border-transparent hover:border-zinc-200 rounded transition-colors"
                    >
                        <Edit className="w-3.5 h-3.5" />
                        <span className="sr-only">Edit book</span>
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="max-w-xl font-titillium">
                <DialogHeader>
                    <DialogTitle className="text-lg font-black text-blue-900 uppercase tracking-tight">
                        {isEditMode ? "Update Book Details" : "Catalog New Physical Book"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                    {/* Title */}
                    <div className="space-y-1.5">
                        <Label className="font-bold text-xs uppercase text-zinc-500 tracking-widest">
                            Title <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            {...register("title")}
                            placeholder="Book Title"
                            className={`bg-zinc-50 h-11 focus-visible:ring-blue-900 ${errors.title ? "border-red-400" : ""}`}
                        />
                        <FieldError msg={errors.title?.message} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Author */}
                        <div className="space-y-1.5">
                            <Label className="font-bold text-xs uppercase text-zinc-500 tracking-widest">
                                Author <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                {...register("author")}
                                placeholder="Author Name"
                                className={`bg-zinc-50 h-11 focus-visible:ring-blue-900 ${errors.author ? "border-red-400" : ""}`}
                            />
                            <FieldError msg={errors.author?.message} />
                        </div>

                        {/* ISBN */}
                        <div className="space-y-1.5">
                            <Label className="font-bold text-xs uppercase text-zinc-500 tracking-widest">
                                ISBN
                            </Label>
                            <Input
                                {...register("isbn")}
                                placeholder="e.g. 9783161484100"
                                className={`bg-zinc-50 h-11 focus-visible:ring-blue-900 ${errors.isbn ? "border-red-400" : ""}`}
                            />
                            <FieldError msg={errors.isbn?.message} />
                        </div>
                    </div>

                    {/* Campus + Copies — create mode only */}
                    {!isEditMode && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50/50 p-4 rounded border-2 border-blue-100">
                            <div className="space-y-1.5 md:col-span-2">
                                <Label className="font-bold text-xs uppercase text-blue-900 tracking-widest">
                                    Initial Campus <span className="text-red-400">*</span>
                                </Label>
                                <Controller
                                    name="campusId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                            <SelectTrigger className={`bg-white h-11 ${errors.campusId ? "border-red-400" : ""}`}>
                                                <SelectValue placeholder="Select Campus" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {campuses.length > 0 ? (
                                                    campuses.map((c) => (
                                                        <SelectItem key={c.id} value={c.id}>
                                                            {c.name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="" disabled>
                                                        No campuses available
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <FieldError msg={errors.campusId?.message} />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="font-bold text-xs uppercase text-blue-900 tracking-widest">
                                    Copies
                                </Label>
                                <Input
                                    type="number"
                                    min={1}
                                    {...register("copies", { valueAsNumber: true })}
                                    className={`bg-white h-11 ${errors.copies ? "border-red-400" : ""}`}
                                />
                                <FieldError msg={errors.copies?.message} />
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label className="font-bold text-xs uppercase text-zinc-500 tracking-widest">
                            Description
                        </Label>
                        <Textarea
                            {...register("description")}
                            placeholder="Synopsis or details..."
                            className={`bg-zinc-50 resize-none h-24 focus-visible:ring-blue-900 ${errors.description ? "border-red-400" : ""}`}
                        />
                        <FieldError msg={errors.description?.message} />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t-2 border-zinc-50">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                            className="font-bold uppercase text-xs tracking-widest"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-900 text-white hover:bg-zinc-900 font-bold uppercase text-xs tracking-widest h-10 px-6 transition-colors"
                            disabled={isPending}
                        >
                            {isPending && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                            {isEditMode ? "Save Changes" : "Catalog Book"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}