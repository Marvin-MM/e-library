"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

interface DeleteConfirmationDialogProps {
    title: string;
    description: string;
    onDelete: () => void | Promise<any>;
    trigger?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
}

export function DeleteConfirmationDialog({
    title,
    description,
    onDelete,
    trigger,
    confirmText = "Delete Permanently",
    cancelText = "Cancel",
}: DeleteConfirmationDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDeleting(true);
        try {
            await onDelete();
            setIsOpen(false);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                {trigger || (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-red-600 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent 
                className="max-w-md border-2 border-zinc-100 font-titillium" 
                onClick={(e) => e.stopPropagation()}
            >
                <DialogHeader className="space-y-4">
                    {/* <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center border-2 border-red-100 mb-2">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div> */}
                    <div className="space-y-1">
                        <DialogTitle className="text-lg font-black text-zinc-900 uppercase tracking-tight">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-xs font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                            {description}
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <div className="bg-red-50/50 p-4 border-l-2 border-red-600 rounded">
                    <p className="text-xs font-bold text-red-900 leading-tight">
                        Warning: This action cannot be undone. Data will be permanently removed from our active servers.
                    </p>
                </div>
                <DialogFooter className="gap-3 pt-6">
                    <Button
                        variant="ghost"
                        onClick={() => setIsOpen(false)}
                        disabled={isDeleting}
                        className="font-bold uppercase tracking-widest text-xs h-12"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-zinc-900 text-white font-black uppercase tracking-widest text-xs h-12 px-6 shadow-lg shadow-red-200"
                    >
                        {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
