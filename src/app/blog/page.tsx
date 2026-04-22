'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { BlogPost } from '@/lib/types';
import { BLOG_CATEGORIES, getCategoryBySlug } from '@/lib/categories';
import { calcReadTime } from '@/lib/readTime';
import { Loader2, Clock } from 'lucide-react';

export default function Blog() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('blog_posts')
                    .select('*')
                    .order('published_at', { ascending: false });

                if (error) throw error;
                setPosts(data || []);
            } catch (err) {
                console.error('Error fetching blog posts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const filteredPosts = useMemo(() => {
        if (!selectedCategory) return posts;
        return posts.filter(p => p.category === selectedCategory);
    }, [selectedCategory, posts]);

    // Count posts per category
    const countByCategory = useMemo(() => {
        const map: Record<string, number> = {};
        posts.forEach(p => { map[p.category] = (map[p.category] || 0) + 1; });
        return map;
    }, [posts]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-full pb-10">
            {/* Header */}
            <div className="p-6 pb-4 space-y-1">
                <h1 className="text-3xl font-black text-blue-900 uppercase italic leading-none tracking-tighter">BrasilRun Content</h1>
                <p className="text-xs text-gray-500 font-medium">A revista oficial da sua jornada no asfalto.</p>
            </div>

            {/* Category Filter — fixed 5 pills */}
            <div className="px-4 pb-4 flex gap-2 overflow-x-auto scrollbar-hide bg-gray-50 sticky top-[56px] lg:top-[80px] z-30">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${!selectedCategory
                        ? 'bg-blue-900 text-white shadow-blue-900/30 shadow-lg'
                        : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-200'
                        }`}
                >
                    🗂️ Tudo
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${!selectedCategory ? 'bg-white/20' : 'bg-gray-100'}`}>
                        {posts.length}
                    </span>
                </button>

                {BLOG_CATEGORIES.map(cat => {
                    const isActive = selectedCategory === cat.slug;
                    const count = countByCategory[cat.slug] || 0;
                    return (
                        <button
                            key={cat.slug}
                            onClick={() => setSelectedCategory(cat.slug)}
                            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${isActive
                                ? `${cat.color} ${cat.textColor} border-transparent shadow-md`
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            {cat.emoji} {cat.label}
                            {count > 0 && (
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-black/10' : 'bg-gray-100'}`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Active category hero banner */}
            {selectedCategory && (() => {
                const cat = getCategoryBySlug(selectedCategory);
                return cat ? (
                    <div className={`mx-4 mb-4 ${cat.color} rounded-2xl px-5 py-4 flex items-center gap-4`}>
                        <span className="text-3xl">{cat.emoji}</span>
                        <div>
                            <p className={`text-sm font-black uppercase italic tracking-tight ${cat.textColor}`}>{cat.label}</p>
                            <p className="text-xs text-gray-500 font-medium">{cat.description}</p>
                        </div>
                        <span className={`ml-auto text-xs font-black ${cat.textColor}`}>{filteredPosts.length} matéria{filteredPosts.length !== 1 ? 's' : ''}</span>
                    </div>
                ) : null;
            })()}

            {/* Posts grid */}
            <div className="px-4 space-y-4">
                {filteredPosts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Nenhuma matéria encontrada nesta categoria.</p>
                    </div>
                ) : (
                    filteredPosts.map((post, idx) => {
                        const cat = getCategoryBySlug(post.category);
                        return (
                            <Link
                                key={post.id}
                                href={`/blog/${post.id}`}
                                className="block bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all animate-in fade-in slide-in-from-bottom-4"
                                style={{ animationDelay: `${idx * 80}ms` }}
                            >
                                <div className="relative aspect-[16/9] overflow-hidden">
                                    <img
                                        src={post.image_url}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                    />
                                    {/* Category badge */}
                                    <div className={`absolute top-4 left-4 flex items-center gap-1 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${cat ? `${cat.color} ${cat.textColor}` : 'bg-white/90 text-blue-600'}`}>
                                        {cat?.emoji} {post.category}
                                    </div>
                                    {/* Read time badge */}
                                    <div className="absolute bottom-4 left-4">
                                        <span className="text-[8px] font-black uppercase tracking-widest bg-black/40 backdrop-blur-sm text-white px-2.5 py-1 rounded-full flex items-center gap-1">
                                            <Clock className="w-2.5 h-2.5" /> {calcReadTime(post.content)}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h2 className="text-lg font-black text-gray-900 leading-tight uppercase italic mb-2">{post.title}</h2>
                                    <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">{post.excerpt}</p>
                                    <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
                                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">Por {post.author}</span>
                                        <span className="text-[9px] font-black text-gray-300 uppercase">Ver Matéria »</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
