"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCreateBook, useUpdateBook, useCampuses } from "@/hooks/useCatalog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Edit } from "lucide-react";

interface ManageBookDialogProps {
    initialData?: { id: string; title: string; author: string; description?: string; isbn?: string };
    triggerType?: "button" | "icon";
}

export function ManageBookDialog({ initialData, triggerType = "button" }: ManageBookDialogProps) {
    const [open, setOpen] = useState(false);
    const isEditMode = !!initialData;
    
    const { mutate: createBook, isPending: isCreating } = useCreateBook();
    const { mutate: updateBook, isPending: isUpdating } = useUpdateBook();
    const { data: campuses } = useCampuses();
    
    const isPending = isCreating || isUpdating;

    const { register, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: {
            title: initialData?.title || "",
            author: initialData?.author || "",
            isbn: initialData?.isbn || "",
            description: initialData?.description || "",
            campusId: "",
            copies: 1,
        }
    });

    useEffect(() => {
        if (open && initialData) reset({ ...initialData, campusId: "", copies: 1 });
    }, [open, initialData, reset]);

    const onSubmit = (data: any) => {
        // Format payload
        const payload = {
            ...data,
            copies: parseInt(data.copies, 10)
        };

        if (isEditMode && initialData) {
            updateBook({ id: initialData.id, data: payload }, { onSuccess: () => setOpen(false) });
        } else {
            createBook(payload, {
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
                    <Button className="bg-blue-900 hover:bg-zinc-900 text-white h-10 px-6 font-bold text-[10px] uppercase tracking-widest rounded transition-all">
                        <Plus className="w-4 h-4 mr-2" /> Catalog Book
                    </Button>
                ) : (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-blue-900 border-2 border-transparent hover:border-zinc-200">
                        <Edit className="w-4 h-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-xl font-titillium">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black text-blue-900 uppercase tracking-tight">
                        {isEditMode ? "Update Book Details" : "Catalog New Physical Book"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase text-zinc-500 tracking-widest">Title *</Label>
                        <Input {...register("title", { required: true })} placeholder="Book Title" className="bg-zinc-50" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase text-zinc-500 tracking-widest">Author *</Label>
                            <Input {...register("author", { required: true })} placeholder="Author Name" className="bg-zinc-50" />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase text-zinc-500 tracking-widest">ISBN</Label>
                            <Input {...register("isbn")} placeholder="e.g. 978-3-16-148410-0" className="bg-zinc-50" />
                        </div>
                    </div>

                    {!isEditMode && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50/50 p-4 rounded border-2 border-blue-100">
                            <div className="space-y-2 md:col-span-2">
                                <Label className="font-bold text-xs uppercase text-blue-900 tracking-widest">Initial Campus *</Label>
                                <Select onValueChange={(val) => setValue("campusId", val)} required>
                                    <SelectTrigger className="bg-white"><SelectValue placeholder="Select Campus" /></SelectTrigger>
                                    <SelectContent>
                                        {Array.isArray(campuses) ? campuses.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        )) : (
                                            <SelectItem value="none" disabled>No campuses available</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase text-blue-900 tracking-widest">Copies</Label>
                                <Input type="number" {...register("copies", { min: 1 })} min="1" className="bg-white" />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase text-zinc-500 tracking-widest">Description</Label>
                        <Textarea {...register("description")} placeholder="Synopsis or details..." className="bg-zinc-50 resize-none h-24" />
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4 border-t-2 border-zinc-50">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-blue-900 text-white" disabled={isPending}>
                            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} {isEditMode ? "Save Changes" : "Catalog Book"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}