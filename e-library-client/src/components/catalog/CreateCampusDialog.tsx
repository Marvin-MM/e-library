"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateCampus } from "@/hooks/useCatalog";
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
import { Loader2, MapPin, Plus } from "lucide-react";

// ── Zod schema ─────────────────────────────────────────────────────────────

const campusSchema = z.object({
    name: z
        .string()
        .min(2, "Campus name must be at least 2 characters")
        .max(100, "Campus name is too long"),
    code: z
        .string()
        .min(2, "Code must be at least 2 characters")
        .max(10, "Code must be 10 characters or fewer")
        .regex(/^[A-Z0-9_-]+$/i, "Code can only contain letters, numbers, hyphens, and underscores")
        .transform((v) => v.toUpperCase()),
    address: z.string().max(300, "Address is too long").optional(),
});

type CampusFormData = z.infer<typeof campusSchema>;

// ── Component ───────────────────────────────────────────────────────────────

export function CreateCampusDialog() {
    const [open, setOpen] = useState(false);
    const { mutate: createCampus, isPending } = useCreateCampus();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CampusFormData>({
        resolver: zodResolver(campusSchema),
        defaultValues: {
            name: "",
            code: "",
            address: "",
        },
    });

    const handleClose = () => {
        setOpen(false);
        reset();
    };

    const onSubmit = (data: CampusFormData) => {
        createCampus(data, {
            onSuccess: handleClose,
        });
    };

    return (
        <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="border-2 border-zinc-200 h-10 w-full sm:w-auto md:px-4 font-bold text-[10px] uppercase tracking-widest text-zinc-600 hover:text-blue-900 hover:border-blue-900 transition-colors rounded"
                >
                    <MapPin className="w-3 h-3 mr-2" />
                    Add Campus
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-black text-blue-900 uppercase tracking-tight">
                        Register Campus
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    {/* Campus Name */}
                    <div className="space-y-1.5">
                        <Label className="font-bold text-xs uppercase text-zinc-500 tracking-widest">
                            Campus Name <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            {...register("name")}
                            placeholder="e.g. Main Campus"
                            className={`bg-zinc-50 h-11 focus-visible:ring-blue-900 ${errors.name ? "border-red-400" : ""}`}
                        />
                        {errors.name && (
                            <p className="text-[10px] font-bold text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Campus Code */}
                    <div className="space-y-1.5">
                        <Label className="font-bold text-xs uppercase text-zinc-500 tracking-widest">
                            Campus Code <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            {...register("code")}
                            placeholder="e.g. MAIN"
                            className={`bg-zinc-50 h-11 focus-visible:ring-blue-900 uppercase ${errors.code ? "border-red-400" : ""}`}
                        />
                        {errors.code && (
                            <p className="text-[10px] font-bold text-red-500">{errors.code.message}</p>
                        )}
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            Letters, numbers, hyphens only. Will be stored in uppercase.
                        </p>
                    </div>

                    {/* Address */}
                    <div className="space-y-1.5">
                        <Label className="font-bold text-xs uppercase text-zinc-500 tracking-widest">
                            Address
                            <span className="ml-1 normal-case font-normal text-zinc-400">(optional)</span>
                        </Label>
                        <Input
                            {...register("address")}
                            placeholder="Physical location"
                            className={`bg-zinc-50 h-11 focus-visible:ring-blue-900 ${errors.address ? "border-red-400" : ""}`}
                        />
                        {errors.address && (
                            <p className="text-[10px] font-bold text-red-500">{errors.address.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t-2 border-zinc-100">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
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
                            {isPending ? "Saving…" : "Save Campus"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}