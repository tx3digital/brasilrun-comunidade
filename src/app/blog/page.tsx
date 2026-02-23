'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { MOCK_BLOG_POSTS } from '@/lib/mockData';

export default function Blog() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const categories = useMemo(() => {
        return Array.from(new Set(MOCK_BLOG_POSTS.map(p => p.category)));
    }, []);

    const filteredPosts = useMemo(() => {
        if (!selectedCategory) return MOCK_BLOG_POSTS;
        return MOCK_BLOG_POSTS.filter(p => p.category === selectedCategory);
    }, [selectedCategory]);

    return (
        <div className="bg-gray-50 min-h-full pb-10">
            <div className="p-6 space-y-2">
                <h1 className="text-3xl font-black text-blue-900 uppercase italic leading-none tracking-tighter">BrasilRun Content</h1>
                <p className="text-xs text-gray-500 font-medium">A revista oficial da sua jornada no asfalto.</p>
            </div>

            {/* Filter Chips */}
            <div className="p-4 flex gap-2 overflow-x-auto scrollbar-hide bg-white sticky top-[56px] z-30 shadow-sm">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${!selectedCategory ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}
                >
                    Tudo
                </button>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="p-4 space-y-4">
                {filteredPosts.map((post, idx) => (
                    <Link
                        key={post.id}
                        href={`/blog/${post.id}`}
                        className="block bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all animate-in fade-in slide-in-from-bottom-4"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className="relative aspect-[16/9] overflow-hidden">
                            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-blue-600 uppercase tracking-widest shadow-sm">
                                {post.category}
                            </div>
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[8px] font-black uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded-full">{post.read_time} leitura</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-5">
                            <h2 className="text-lg font-black text-gray-900 leading-tight uppercase italic mb-2">{post.title}</h2>
                            <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">{post.excerpt}</p>
                            <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">Escrito por {post.author}</span>
                                <span className="text-[9px] font-black text-gray-300 uppercase">Ver Matéria &raquo;</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
