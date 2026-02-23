'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Clock, User, Calendar } from 'lucide-react';
import { MOCK_BLOG_POSTS } from '@/lib/mockData';

export default function BlogPostDetail() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const post = MOCK_BLOG_POSTS.find(p => p.id === id);

    if (!post) {
        return (
            <div className="p-8 text-center py-32">
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Matéria não encontrada</p>
                <Link href="/blog" className="mt-4 inline-block text-blue-600 font-black uppercase text-[10px] underline">Voltar para Blog</Link>
            </div>
        );
    }

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
                            {post.read_time}
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
                        <div className="text-gray-700 font-medium leading-[1.8] text-base space-y-4">
                            {post.content}
                            <p>Esta é uma versão migrada para o Next.js, mantendo toda a fidelidade visual do BrasilRun original.</p>
                        </div>
                    </article>
                </div>
            </div>
        </div>
    );
}
