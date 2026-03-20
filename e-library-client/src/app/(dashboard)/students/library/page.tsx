"use client";

import React, { useState } from "react";
import {
    Search,
    Heart,
    Star,
    Library as LibraryIcon,
    ChevronDown,
    Filter,
    Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// Actual Books with public/covers path
const MOCK_BOOKS = [
    {
        id: 1,
        title: "Constitutional Law",
        author: "Prof. Sarah Kent",
        cover: "/covers/constitutional-law.jpg",
        rating: 4.9,
        category: "Law",
        isFavourited: true
    },
    {
        id: 2,
        title: "Machine Learning Fundamentals",
        author: "Dr. Alan Turing",
        cover: "/covers/machine-learning.jpg",
        rating: 4.8,
        category: "AI & ML",
        isFavourited: false
    },
    {
        id: 3,
        title: "Quantum Computing Insights",
        author: "Richard Feynman",
        cover: "/covers/quantum-computing.jpg",
        rating: 4.7,
        category: "Physics",
        isFavourited: true
    },
    {
        id: 4,
        title: "Strategic Management",
        author: "Michael Porter",
        cover: "/covers/strategic-management.jpg",
        rating: 4.9,
        category: "Business",
        isFavourited: false
    },
    {
        id: 5,
        title: "Data Structures & Algorithms",
        author: "Donald Knuth",
        cover: "/covers/data-structures.jpg",
        rating: 4.8,
        category: "Computer Science",
        isFavourited: false
    },
    {
        id: 6,
        title: "Criminal Justice System",
        author: "John Grisham",
        cover: "/covers/criminal-justice.jpg",
        rating: 4.6,
        category: "Law",
        isFavourited: false
    },
    {
        id: 7,
        title: "Environmental Systems",
        author: "Gaia Lovelock",
        cover: "/covers/environmental-systems.jpg",
        rating: 4.5,
        category: "Science",
        isFavourited: false
    },
    {
        id: 8,
        title: "Modern Art History",
        author: "Pablo Picasso",
        cover: "/covers/modern-art.jpg",
        rating: 4.9,
        category: "Arts",
        isFavourited: true
    }
];

export default function LibraryPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const categories = ["All", "Law", "AI & ML", "Computer Science", "Business", "Physics", "Arts", "Science"];

    const filteredBooks = MOCK_BOOKS.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === "All" || book.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-700 font-titillium">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8  pb-8">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-serif">Library</h1>
                    <p className="text-zinc-500 font-medium">Your personal collection of verified academic resources.</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                        <Input
                            placeholder="Find a book..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 w-full md:w-[340px] h-12 bg-white border-zinc-200 rounded shadow-none focus-visible:ring-1 "
                        />
                    </div>

                </div>
            </div>

            {/* Sub Nav / Category Pills */}
            <div className="flex items-center gap-3 overflow-x-auto pb-6 scrollbar-hide border-b border-zinc-100/50">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap ${activeCategory === cat
                            ? "bg-blue-900 text-white shadow-xl shadow-blue-100"
                            : "bg-white text-zinc-500 border border-blue-100 hover:border-blue-300 hover:text-zinc-900"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* High-End 3D Shelf View */}
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-x-2 gap-y-10 pt-4">
                <AnimatePresence mode="popLayout">
                    {filteredBooks.map((book, idx) => (
                        <motion.div
                            key={book.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                            className="group flex flex-col items-center text-center"
                        >
                            {/* Realistic 3D Book Container */}
                            <div className="relative perspective-2000 mb-8 w-44 lg:w-48 aspect-[2/3]">
                                <motion.div
                                    className="relative w-full h-full preserve-3d cursor-pointer"
                                    whileHover={{
                                        rotateY: -35,
                                        rotateX: 2,
                                        z: 50,
                                        x: 15
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 70,
                                        damping: 18,
                                        mass: 1.2
                                    }}
                                >
                                    {/* The Spine (Left Side) */}
                                    <div className="absolute top-0 left-0 w-[30px] h-full bg-zinc-800 origin-left -rotate-y-90 translate-x-[0px] shadow-inner flex flex-col items-center py-4 border-r border-white/5">
                                        <div className="w-[1px] h-3/4 bg-white/10" />
                                    </div>

                                    {/* Back Cover (Slightly visible if tilted far enough) */}
                                    <div className="absolute inset-0 bg-zinc-900 rounded-sm translate-z-[-30px]" />

                                    {/* Pages Block (Right Edge/Top Side) */}
                                    <div className="absolute top-0 right-0 w-[30px] h-full bg-zinc-100/90 origin-right rotate-y-90 translate-z-[-15px] translate-x-[15px] flex flex-col p-px space-y-1">
                                        {Array.from({ length: 30 }).map((_, i) => (
                                            <div key={i} className="w-full h-px bg-zinc-200/50" />
                                        ))}
                                    </div>

                                    {/* Front Cover */}
                                    <div className="relative w-full h-full rounded shadow-[15px_15px_35px_-5px_rgba(0,0,0,0.4)] overflow-hidden border border-white/10">
                                        <img
                                            src={book.cover}
                                            alt={book.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(book.title)}&background=27272a&color=fff&size=512`;
                                            }}
                                        />

                                        {/* Subtle Shine/Reflections */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none" />

                                        {/* Hover Overlay Buttons */}
                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                            <Button size="sm" className="w-full h-10 bg-white text-zinc-900 hover:bg-zinc-100 font-bold rounded shadow-xl">
                                                Open Book
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Ground Shadow */}
                                <div className="absolute -bottom-8 left-4 right-[-20px] h-6 bg-black/20 blur-2xl rounded-[100%] scale-x-75 group-hover:scale-x-90 group-hover:bg-black/30 transition-all duration-500" />
                            </div>

                            {/* Enhanced Typography Info */}
                            <div className="space-y-1 max-w-[200px]">
                                <h3 className="text-base text-zinc-900 leading-tight line-clamp-2 title-shadow group-hover:text-blue-900 transition-colors">
                                    {book.title}
                                </h3>
                                <p className="text-xs text-zinc-500 font-semibold">{book.author}</p>

                                <div className="flex items-center justify-between gap-3 pt-2">
                                    <div className="flex items-center gap-1 justify-between text-[12px] font- text-amber-600 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-100">
                                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                        {book.rating}
                                    </div>
                                    
                                    <button className="text-zinc-300 hover:text-red-500 transition-all hover:scale-125">
                                        <Heart className={`w-3.5 h-3.5 ${book.isFavourited ? "fill-red-500 text-red-500" : ""}`} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {filteredBooks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-40">
                    <Loader2 className="w-10 h-10 text-zinc-200 animate-spin mb-4" />
                    <h3 className="text-xl font-bold text-zinc-900">No results found</h3>
                    <p className="text-zinc-500 mt-1 max-w-sm text-center">We couldn't find any books with these filters. Try searching for a different keyword.</p>
                    <Button
                        variant="link"
                        onClick={() => { setSearchQuery(""); setActiveCategory("All") }}
                        className="mt-6 text-blue-600 font-bold"
                    >
                        Reset Filters
                    </Button>
                </div>
            )}

            <style jsx global>{`
                .perspective-2000 { perspective: 2000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .rotate-y-90 { transform: rotateY(-90deg); }
                .translate-z-100 { transform: translateZ(100px); }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .title-shadow { text-shadow: 0 1px 2px rgba(0,0,0,0.05); }
            `}</style>
        </div>
    );
}