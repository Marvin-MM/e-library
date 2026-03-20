"use client";

import React from "react";
import {
    ArrowLeft,
    Download,
    FileText,
    Maximize2,
    Share2,
    Printer,
    CheckCircle2,
    Calendar,
    User,
    GraduationCap,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface PreviewDissertationProps {
    dissertation: {
        id: number;
        title: string;
        author: string;
        department: string;
        year: string;
        status: string;
        file?: string;
    };
    onBack: () => void;
}

export function PreviewDissertation({ dissertation, onBack }: PreviewDissertationProps) {
    const handleDownload = () => {
        if (dissertation.file) {
            window.open(dissertation.file, "_blank");
        } else {
            alert("Download link not available for this mock item.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-col h-full space-y-6"
        >
            {/* Header Actions */}
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="rounded-full hover:bg-zinc-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="min-w-0">
                        <h2 className="text font-semibold truncate max-w-[200px] font-serif sm:max-w-md">{dissertation.title}</h2>
                        <p className="text-xs text-muted-foreground font-titillium">Document Preview</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownload} className="hidden sm:flex gap-2 rounded-full border-zinc-300">
                        <Download className="w-4 h-4" />
                        Download PDF
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full border-zinc-300">
                        <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full border-zinc-300 shrink-0">
                        <Printer className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-y-auto lg:overflow-visible">
                {/* PDF Viewer Area */}
                <div className="lg:col-span-3 bg-zinc-800 rounded overflow-hidden min-h-[500px] lg:min-h-[700px] relative shadow-inner group">
                    {dissertation.file ? (
                        <iframe
                            src={`${dissertation.file}#toolbar=0`}
                            className="w-full h-full border-none"
                            title="PDF Preview"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
                            <FileText className="w-16 h-16 opacity-20" />
                            <p className="text-sm">Preview not available for this document</p>
                            <Button variant="secondary" size="sm" className="rounded-full">
                                Request Access
                            </Button>
                        </div>
                    )}

                    {/* Floating Expand Controls */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" className="rounded-full bg-white/10 backdrop-blur hover:bg-white/20 text-white">
                            <Maximize2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold font-titillium text-zinc-500">Metadata</h3>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 rounded bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                <User className="w-4 h-4 mt-0.5 text-blue-600" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Author</p>
                                    <p className="text-sm font-medium">{dissertation.author}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                <GraduationCap className="w-4 h-4 mt-0.5 text-indigo-600" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Department</p>
                                    <p className="text-sm font-medium">{dissertation.department}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                <Calendar className="w-4 h-4 mt-0.5 text-emerald-600" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Submission Year</p>
                                    <p className="text-sm font-medium">{dissertation.year}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                    <Button variant="outline" className="w-full justify-between h-12 rounded border-dashed border-zinc-300 group hover:border-blue-500 hover:bg-blue-50 transition-all">
                        <span className="text-sm text-zinc-600 group-hover:text-blue-700">Detailed Report</span>
                        <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-blue-500" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
