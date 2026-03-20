"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    CheckCircle2,
    ChevronRight,
    Clock,
    FileText,
    MoreHorizontal,
    Plus,
    Search
} from "lucide-react";
import { useState } from "react";
import { DissertationUpload } from "../DissertationUpload";
import { PreviewDissertation } from "./previewdiset";

// Mock Data
const MOCK_DISSERTATIONS = [
    {
        id: 1,
        title: "AI-Driven Cyber Threat Intelligence in Next-Gen Networks",
        author: "Jane Doe",
        department: "Computer Science",
        year: "2025",
        status: "Approved",
        file: "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf"
    },
    {
        id: 2,
        title: "Blockchain Applications in Supply Chain Transparency",
        author: "Richard Roe",
        department: "Information Technology",
        year: "2024",
        status: "Approved",
        file: "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf"
    },
    {
        id: 3,
        title: "Machine Learning for Automated Grading Systems",
        author: "Current User",
        department: "Computer Science",
        year: "2026",
        status: "Pending",
        isMine: true,
        file: "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf"
    },
];

export default function DissertationsPage() {
    const [isUploading, setIsUploading] = useState(false);
    const [previewingDissertation, setPreviewingDissertation] = useState<null | typeof MOCK_DISSERTATIONS[0]>(null);
    const [searchQuery, setSearchQuery] = useState("");

    if (isUploading) {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-6xl mx-auto py-1"
            >
                <Button
                    variant="ghost"
                    onClick={() => setIsUploading(false)}
                    className="mb-8 hover:bg-transparent px-0 text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Dissertations
                </Button>

                <div className="max-w-5xl dark:bg-zinc-900 p-6 ">
                    <DissertationUpload />
                </div>
            </motion.div>
        );
    }

    if (previewingDissertation) {
        return (
            <div className="max-w-6xl mx-auto py-1 h-[calc(100vh-140px)]">
                <PreviewDissertation
                    dissertation={previewingDissertation as any}
                    onBack={() => setPreviewingDissertation(null)}
                />
            </div>
        );
    }

    return (
        <div className=" max-w-6xl mx-auto font-titillium space-y-10 py-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold tracking-tight">Dissertations</h1>
                    <p className="text-muted-foreground">Browse and manage academic research papers.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                        <Input
                            placeholder="Search papers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-[240px] h-10  dark:bg-zinc-900 shadow-none border-zinc-200 dark:border-zinc-800 rounded focus-visible:ring-1"
                        />
                    </div>
                    <Button
                        onClick={() => setIsUploading(true)}
                        className="rounded dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-opacity px-6"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Upload
                    </Button>
                </div>
            </div>

            {/* Stats/Quick Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 p-1 bg-white/50">
                {[
                    { label: "Total Papers", value: "1,204", color: "text-blue-600" },
                    { label: "My Submissions", value: "3", color: "text-indigo-600" },
                    { label: "Approved", value: "98%", color: "text-emerald-600" },
                    { label: "Processing", value: "12", color: "text-amber-600" },
                ].map((stat) => (
                    <div key={stat.label} className="p-4 rounded-none bg-white dark:bg-zinc-900/50  dark:border-zinc-800/50">
                        <p className="text-sm font-titillium font-semibold text-zinc-700 ">{stat.label}</p>
                        <p className={`text-xl font-titillium font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* List Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-sm text-zinc-500 ">Recent Submissions</h2>
                    <Button variant="ghost" size="sm" className="text-xs text-blue-800 hover:text-blue-900 bg-transparent hover:bg-transparent">
                        View All <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                </div>

                <div className="grid gap-3">
                    {MOCK_DISSERTATIONS.map((doc) => (
                        <motion.div
                            key={doc.id}
                            whileHover={{ y: -2 }}
                            onClick={() => setPreviewingDissertation(doc as any)}
                            className="group flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900 transition-colors">
                                <FileText className="w-5 h-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm sm:text-base truncate">{doc.title}</h3>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                    <span className="font-medium text-zinc-600 dark:text-zinc-400">{doc.author}</span>
                                    <span>•</span>
                                    <span>{doc.department}</span>
                                    <span>•</span>
                                    <span>{doc.year}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="hidden sm:flex items-center gap-2">
                                    {doc.status === "Approved" ? (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Approved
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase">
                                            <Clock className="w-3 h-3" />
                                            Pending
                                        </div>
                                    )}
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-zinc-400">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}