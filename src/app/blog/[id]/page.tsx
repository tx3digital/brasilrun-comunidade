'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Clock, Calendar, Loader2, Share2, Bookmark, ArrowUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BlogPost } from '@/lib/types';
import { calcReadTime } from '@/lib/readTime';
import { getCategoryBySlug } from '@/lib/categories';

export default function BlogPostDetail() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [readProgress, setReadProgress] = useState(0);

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

                // Track view silently
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

    // Reading progress bar + scroll-to-top visibility
    useEffect(() => {
        const onScroll = () => {
            const scroll = window.scrollY;
            const total = document.documentElement.scrollHeight - window.innerHeight;
            setReadProgress(total > 0 ? Math.min(100, (scroll / total) * 100) : 0);
            setShowScrollTop(scroll > 600);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="p-8 text-center py-32 bg-white min-h-screen">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Matéria não encontrada</p>
                <Link href="/blog" className="mt-4 inline-block text-blue-600 font-black uppercase text-[10px] underline">Voltar para o Blog</Link>
            </div>
        );
    }

    const cat = getCategoryBySlug(post.category);
    const readTime = calcReadTime(post.content);
    const wordCount = post.content.split(/\s+/).filter(w => w.length > 0).length;

    // ── Rich content renderer ──────────────────────────────────────────────
    const renderContent = (text: string) => {
        return text.split(/\n\n+/).map((block, idx) => {
            const trimmed = block.trim();
            if (!trimmed) return null;

            // H2 heading: ## Texto
            if (trimmed.startsWith('## ')) {
                return (
                    <h2 key={idx} className="text-2xl font-black text-gray-900 mt-10 mb-4 leading-tight tracking-tight">
                        {trimmed.replace(/^##\s/, '')}
                    </h2>
                );
            }

            // H3 heading: ### Texto
            if (trimmed.startsWith('### ')) {
                return (
                    <h3 key={idx} className="text-lg font-black text-blue-700 uppercase tracking-wide mt-8 mb-3">
                        {trimmed.replace(/^###\s/, '')}
                    </h3>
                );
            }

            // Blockquote: > Texto
            if (trimmed.startsWith('> ')) {
                return (
                    <blockquote key={idx} className="my-8 pl-6 border-l-4 border-blue-500">
                        <p className="text-xl font-serif italic text-gray-700 leading-relaxed">
                            {trimmed.replace(/^>\s/, '')}
                        </p>
                    </blockquote>
                );
            }

            // Unordered list: lines starting with * or -
            const listLines = trimmed.split('\n').filter(l => /^[-*•]\s/.test(l.trim()));
            if (listLines.length > 0 && listLines.length === trimmed.split('\n').filter(l => l.trim()).length) {
                return (
                    <ul key={idx} className="my-6 space-y-3 pl-2">
                        {listLines.map((item, i) => {
                            const raw = item.replace(/^[-*•]\s+/, '');
                            const boldMatch = raw.match(/^\*\*(.*?)\*\*:?\s*(.*)/);
                            return (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="mt-2 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                    <span className="text-gray-700 leading-relaxed text-base">
                                        {boldMatch ? (
                                            <><strong className="font-bold text-gray-900">{boldMatch[1]}</strong>{boldMatch[2] ? `: ${boldMatch[2]}` : ''}</>
                                        ) : raw}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                );
            }

            // Numbered list: lines starting with "1. 2." etc
            const numberedLines = trimmed.split('\n').filter(l => /^\d+[.)]\s/.test(l.trim()));
            if (numberedLines.length > 0 && numberedLines.length === trimmed.split('\n').filter(l => l.trim()).length) {
                return (
                    <ol key={idx} className="my-6 space-y-3 pl-2">
                        {numberedLines.map((item, i) => {
                            const raw = item.replace(/^\d+[.)]\s+/, '');
                            return (
                                <li key={i} className="flex items-start gap-4">
                                    <span className="mt-0.5 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                                        {i + 1}
                                    </span>
                                    <span className="text-gray-700 leading-relaxed text-base">{raw}</span>
                                </li>
                            );
                        })}
                    </ol>
                );
            }

            // Tip / callout box: starts with **Dica** or **Atenção** or **Lembrete**
            if (/^\*\*(Dica|Aten[çc][aã]o|Lembrete|Importante|Aviso)\*\*/i.test(trimmed)) {
                return (
                    <div key={idx} className="my-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
                        <span className="text-2xl">💡</span>
                        <p className="text-sm text-amber-900 font-medium leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </div>
                );
            }

            // Regular paragraph — inline bold support
            const html = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
            return (
                <p key={idx}
                    className="text-gray-700 leading-[1.85] text-base font-normal"
                    dangerouslySetInnerHTML={{ __html: html }} />
            );
        });
    };
    // ─────────────────────────────────────────────────────────────────────

    return (
        <div className="bg-white min-h-full">

            {/* ── Reading progress bar ── */}
            <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-gray-100">
                <div
                    className="h-full bg-blue-600 transition-all duration-100"
                    style={{ width: `${readProgress}%` }}
                />
            </div>

            {/* ── Hero image ── */}
            <div className="relative w-full" style={{ aspectRatio: '16/7', maxHeight: 480 }}>
                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 z-20 bg-black/40 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-black/60 active:scale-95 transition-all"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />

                {/* Category badge over image */}
                {cat && (
                    <div className="absolute bottom-6 left-6">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg ${cat.color} ${cat.textColor}`}>
                            {cat.emoji} {cat.label}
                        </span>
                    </div>
                )}
            </div>

            {/* ── Article container ── */}
            <div className="max-w-2xl mx-auto px-5 lg:px-0 pb-24">

                {/* ── Meta row ── */}
                <div className="flex items-center gap-4 mt-8 mb-5 flex-wrap">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        {new Date(post.published_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="text-gray-200">·</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        {readTime} leitura
                    </span>
                    <span className="text-gray-200">·</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {wordCount.toLocaleString('pt-BR')} palavras
                    </span>
                </div>

                {/* ── Title ── */}
                <h1 className="text-[2rem] lg:text-[2.5rem] font-black text-gray-900 leading-[1.1] tracking-tight mb-5">
                    {post.title}
                </h1>

                {/* ── Excerpt / standfirst ── */}
                {post.excerpt && (
                    <p className="text-lg text-gray-500 leading-relaxed font-normal mb-8 border-l-4 border-blue-500 pl-5 italic">
                        {post.excerpt}
                    </p>
                )}

                {/* ── Author + actions bar ── */}
                <div className="flex items-center justify-between py-5 border-t border-b border-gray-100 mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-sm italic select-none">
                            BR
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Escrito por</p>
                            <p className="text-sm font-black text-gray-900 leading-none">{post.author}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigator.share?.({ title: post.title, url: window.location.href }).catch(() => { })}
                            className="p-2.5 rounded-full bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-all"
                            title="Compartilhar"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                        <button
                            className="p-2.5 rounded-full bg-gray-100 text-gray-500 hover:bg-amber-100 hover:text-amber-600 transition-all"
                            title="Salvar"
                        >
                            <Bookmark className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* ── Article body ── */}
                <article className="space-y-5 text-gray-700">
                    {renderContent(post.content)}
                </article>

                {/* ── Sources / Fontes ── */}
                {post.sources && post.sources.trim() && (() => {
                    const lines = post.sources.trim().split('\n').map(l => l.trim()).filter(Boolean);
                    // First line may be a heading like "Fontes Científicas..."
                    const hasHeading = lines.length > 1 && !lines[0].includes(':') && lines[0].length < 60;
                    const heading = hasHeading ? lines[0] : 'Fontes Consultadas';
                    const refs = hasHeading ? lines.slice(1) : lines;
                    return (
                        <div className="mt-14 border-t border-gray-100 pt-10">
                            <div className="flex items-center gap-2 mb-5">
                                <span className="text-lg">📚</span>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{heading}</h3>
                            </div>
                            <ol className="space-y-3">
                                {refs.map((ref, i) => {
                                    // Split "Fonte: descrição" into bold + rest
                                    const colonIdx = ref.indexOf(':');
                                    const hasSplit = colonIdx > 0 && colonIdx < 80;
                                    const bold = hasSplit ? ref.slice(0, colonIdx).trim() : null;
                                    const rest = hasSplit ? ref.slice(colonIdx + 1).trim() : ref;
                                    return (
                                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                                            <span className="mt-0.5 min-w-[22px] h-5 w-5 rounded-full bg-gray-100 text-gray-500 text-[9px] font-black flex items-center justify-center flex-shrink-0">
                                                {i + 1}
                                            </span>
                                            <span>
                                                {bold && <strong className="font-bold text-gray-800">{bold}:</strong>}{' '}
                                                {rest}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>
                    );
                })()}


                {/* ── Footer disclaimer ── */}
                <div className="mt-16 pt-8 border-t border-gray-100 bg-amber-50 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">⚠ Aviso Importante</p>
                    <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                        Este conteúdo é apenas informativo. Não substitui diagnóstico, aconselhamento ou acompanhamento de profissional de saúde qualificado.
                    </p>
                </div>

                {/* ── Back to blog ── */}
                <div className="mt-10 text-center">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Mais Matérias
                    </Link>
                </div>
            </div>

            {/* ── Scroll to top ── */}
            {showScrollTop && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-24 right-5 z-40 w-11 h-11 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all animate-in fade-in slide-in-from-bottom-4"
                >
                    <ArrowUp className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}
