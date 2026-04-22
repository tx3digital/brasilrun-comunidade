'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Clock, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BlogPost } from '@/lib/types';
import { calcReadTime } from '@/lib/readTime';

export default function BlogPostDetail() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('blog_posts')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setPost(data);

                // Track view: silently increment counter
                supabase
                    .from('blog_posts')
                    .update({ view_count: (data?.view_count || 0) + 1 })
                    .eq('id', id)
                    .then(() => { });
            } catch (err) {
                console.error('Error fetching blog post:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="p-8 text-center py-32">
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Matéria não encontrada</p>
                <Link href="/blog" className="mt-4 inline-block text-blue-600 font-black uppercase text-[10px] underline">Voltar para Blog</Link>
            </div>
        );
    }

    // Render content with paragraphs
    const renderContent = (text: string) => {
        return text.split('\n\n').map((paragraph, idx) => {
            // Check if it's a heading (###)
            if (paragraph.startsWith('### ')) {
                return (
                    <h3 key={idx} className="text-lg font-black text-blue-900 uppercase italic tracking-tighter mt-8 mb-3">
                        {paragraph.replace('### ', '')}
                    </h3>
                );
            }
            // Check if it contains list items (* or -)
            if (paragraph.includes('\n*   ') || paragraph.includes('\n-   ')) {
                const items = paragraph.split('\n').filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'));
                return (
                    <ul key={idx} className="space-y-3 my-4">
                        {items.map((item, i) => {
                            const text = item.replace(/^\*\s+/, '').replace(/^-\s+/, '');
                            const boldMatch = text.match(/^\*\*(.*?)\*\*:\s*(.*)/);
                            return (
                                <li key={i} className="flex items-start gap-3 bg-blue-50/50 p-3 rounded-xl">
                                    <span className="text-blue-500 font-black text-sm mt-0.5">›</span>
                                    <div>
                                        {boldMatch ? (
                                            <>
                                                <span className="font-black text-blue-900 text-sm">{boldMatch[1]}</span>
                                                <span className="text-gray-600 text-sm">: {boldMatch[2]}</span>
                                            </>
                                        ) : (
                                            <span className="text-gray-700 text-sm font-medium">{text}</span>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                );
            }
            // Check for numbered items (1. 2. 3.)
            if (/^\d+\.\s/.test(paragraph.trim())) {
                return (
                    <div key={idx} className="bg-green-50/50 border-l-4 border-green-400 p-4 rounded-r-xl my-4">
                        <p className="text-sm text-gray-800 font-bold leading-relaxed">{paragraph}</p>
                    </div>
                );
            }
            // Regular paragraph
            return (
                <p key={idx} className="text-gray-700 font-medium leading-[1.8] text-base">
                    {paragraph}
                </p>
            );
        });
    };

    return (
        <div className="bg-white min-h-full pb-20">
            <div className="relative h-72 bg-gray-900">
                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 z-20 bg-black/30 backdrop-blur-md p-2 rounded-full text-white active:scale-95 transition-all"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                    <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg">
                        {post.category}
                    </span>
                </div>
            </div>

            <div className="p-6 -mt-10 relative z-10 space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-blue-900/5 border border-gray-50">
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <Calendar className="w-3 h-3 text-blue-500" />
                            {new Date(post.published_at).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <Clock className="w-3 h-3 text-blue-500" />
                            {calcReadTime(post.content)}
                        </div>
                    </div>

                    <h1 className="text-3xl font-black text-blue-900 leading-tight uppercase italic tracking-tighter mb-4">
                        {post.title}
                    </h1>

                    <p className="text-sm font-bold text-gray-400 leading-relaxed border-l-4 border-blue-50 pl-4 italic">
                        {post.excerpt}
                    </p>
                </div>

                <div className="px-2 space-y-8">
                    <div className="flex items-center gap-4 py-4 border-b border-gray-50">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-black italic">BR</div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Escrito por</p>
                            <p className="text-sm font-black text-blue-900 uppercase italic leading-none">{post.author}</p>
                        </div>
                    </div>

                    <article className="prose prose-sm max-w-none">
                        <div className="space-y-4">
                            {renderContent(post.content)}
                        </div>
                    </article>
                </div>
            </div>
        </div>
    );
}
