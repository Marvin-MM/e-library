"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateCampus } from "@/hooks/useCatalog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, Plus } from "lucide-react";

export function CreateCampusDialog() {
    const [open, setOpen] = useState(false);
    const { mutate: createCampus, isPending } = useCreateCampus();
    const { register, handleSubmit, reset } = useForm();

    const onSubmit = (data: any) => {
        createCampus(data, {
            onSuccess: () => {
                setOpen(false);
                reset();
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-2 border-zinc-100 h-10 px-4 font-bold text-[10px] uppercase tracking-widest text-zinc-600 hover:text-blue-900 transition-all">
                    <MapPin className="w-3 h-3 mr-2" /> Add Campus
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md font-titillium">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black text-blue-900 uppercase">Register Campus</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase text-zinc-500 tracking-widest">Campus Name *</Label>
                        <Input {...register("name", { required: true })} placeholder="e.g. Main Campus" className="bg-zinc-50" />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase text-zinc-500 tracking-widest">Campus Code *</Label>
                        <Input {...register("code", { required: true })} placeholder="e.g. MAIN" className="bg-zinc-50 uppercase" />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase text-zinc-500 tracking-widest">Address (Optional)</Label>
                        <Input {...register("address")} placeholder="Physical location" className="bg-zinc-50" />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-blue-900 text-white" disabled={isPending}>
                            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Campus
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}