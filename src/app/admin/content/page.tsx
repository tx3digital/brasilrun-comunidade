'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { BlogPost } from '@/lib/types';
import { BLOG_CATEGORIES } from '@/lib/categories';
import { calcReadTime } from '@/lib/readTime';
import {
    FileText, Plus, Edit3, Trash2, Eye, Save, X, Loader2,
    ChevronLeft, Image as ImageIcon, Clock, Tag, AlertTriangle,
    BarChart2, Activity, TrendingUp
} from 'lucide-react';

type EditorMode = 'list' | 'create' | 'edit';

export default function AdminContentPanel() {
    const router = useRouter();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mode, setMode] = useState<EditorMode>('list');
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [author, setAuthor] = useState('Redação BrasilRun');
    const [imageUrl, setImageUrl] = useState('');

    // Auth check
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem('brasilrun_user');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            if (user.role === 'admin') {
                setIsAdmin(true);
            } else {
                router.push('/');
            }
        } else {
            router.push('/auth');
        }
    }, [router]);

    useEffect(() => {
        if (isAdmin) fetchPosts();
    }, [isAdmin]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .order('published_at', { ascending: false });

            if (error) {
                console.error('Supabase fetchPosts error:', error.message, error.code, error.details, error.hint);
                // If table doesn't exist or column mismatch, show empty
                setPosts([]);
                return;
            }
            setPosts(data || []);
        } catch (err: any) {
            console.error('Error fetching posts:', err?.message || JSON.stringify(err));
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setExcerpt('');
        setContent('');
        setCategory('');
        setAuthor('Redação BrasilRun');
        setImageUrl('');
        setEditingPost(null);
    };

    const openEditor = (post?: BlogPost) => {
        if (post) {
            setTitle(post.title);
            setExcerpt(post.excerpt);
            setContent(post.content);
            setCategory(post.category);
            setAuthor(post.author);
            setImageUrl(post.image_url);
            setEditingPost(post);
            setMode('edit');
        } else {
            resetForm();
            setMode('create');
        }
    };

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            alert('Título e conteúdo são obrigatórios.');
            return;
        }

        setSaving(true);
        try {
            const postData = {
                title,
                excerpt,
                content,
                category: category || 'Geral',
                author,
                image_url: imageUrl || 'https://images.unsplash.com/photo-1461896836934-bd45ba1e9eba?q=80&w=2070&auto=format&fit=crop',
                read_time: calcReadTime(content),
                published_at: editingPost?.published_at || new Date().toISOString(),
            };

            if (mode === 'edit' && editingPost) {
                const { error } = await supabase
                    .from('blog_posts')
                    .update(postData)
                    .eq('id', editingPost.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('blog_posts')
                    .insert([postData]);
                if (error) throw error;
            }

            await fetchPosts();
            resetForm();
            setMode('list');
        } catch (err: any) {
            const errorMsg = err?.message || err?.details || JSON.stringify(err);
            console.error('Error saving post:', errorMsg, err);
            alert(`Erro ao salvar: ${errorMsg}\n\nSe a tabela blog_posts não existir, rode o SQL de criação no Supabase.\nSe o erro for de permissão (RLS), desabilite RLS ou ajuste as policies.`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from('blog_posts')
                .delete()
                .eq('id', id);
            if (error) throw error;
            setPosts(posts.filter(p => p.id !== id));
            setDeleteConfirm(null);
        } catch (err) {
            console.error('Error deleting post:', err);
        }
    };


    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-black uppercase italic tracking-tighter">Painel de Conteúdo</h1>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gerencie matérias e artigos do BrasilRun</p>
                        </div>
                    </div>
                    {mode === 'list' && (
                        <button
                            onClick={() => openEditor()}
                            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
                        >
                            <Plus className="w-4 h-4" strokeWidth={3} />
                            Nova Matéria
                        </button>
                    )}
                    {mode !== 'list' && (
                        <button
                            onClick={() => { resetForm(); setMode('list'); }}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                        >
                            <X className="w-4 h-4" />
                            Cancelar
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Bar */}
            {mode === 'list' && (
                <div className="bg-white border-b border-gray-100 p-4 flex gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-lg font-black text-blue-900">{posts.length}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Matérias</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Tag className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                            <p className="text-lg font-black text-green-900">
                                {Array.from(new Set(posts.map(p => p.category))).length}
                            </p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Categorias</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4 lg:p-8 max-w-4xl mx-auto">
                {/* ===== LIST MODE ===== */}
                {mode === 'list' && (
                    <>
                        {loading ? (
                            <div className="flex items-center justify-center p-20">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-20 space-y-4">
                                <FileText className="w-16 h-16 text-gray-200 mx-auto" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Nenhuma matéria publicada ainda</p>
                                <button
                                    onClick={() => openEditor()}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest mt-4 hover:bg-blue-700 transition-all"
                                >
                                    Criar Primeira Matéria
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {posts.map((post, idx) => (
                                    <div
                                        key={post.id}
                                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <div className="flex flex-col lg:flex-row">
                                            {post.image_url && (
                                                <div className="lg:w-48 h-32 lg:h-auto bg-gray-100 flex-shrink-0">
                                                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="flex-1 p-5">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="bg-blue-100 text-blue-600 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                                                                {post.category}
                                                            </span>
                                                            <span className="text-[9px] text-gray-300 font-bold flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {post.read_time}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-base font-black text-blue-900 uppercase italic tracking-tight leading-tight mb-1">
                                                            {post.title}
                                                        </h3>
                                                        <p className="text-[11px] text-gray-400 font-medium line-clamp-1">{post.excerpt}</p>
                                                        <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest mt-2">
                                                            Por {post.author} · {new Date(post.published_at).toLocaleDateString('pt-BR')}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                                        <Link
                                                            href={`/blog/${post.id}`}
                                                            className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                                                            title="Visualizar"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => openEditor(post)}
                                                            className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-all"
                                                            title="Editar"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        {deleteConfirm === post.id ? (
                                                            <button
                                                                onClick={() => handleDelete(post.id)}
                                                                className="p-2 bg-red-600 rounded-lg text-white animate-pulse"
                                                                title="Confirmar exclusão"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => setDeleteConfirm(post.id)}
                                                                className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"
                                                                title="Excluir"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ===== EDITOR MODE (Create / Edit) ===== */}
                {(mode === 'create' || mode === 'edit') && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* ===== ANALYTICS CARD (edit mode only) ===== */}
                        {mode === 'edit' && editingPost && (() => {
                            const now = new Date();
                            const publishedDate = new Date(editingPost.published_at);
                            const daysSince = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));
                            const wordCount = editingPost.content.split(/\s+/).filter(w => w.length > 0).length;
                            const charCount = editingPost.content.length;
                            const views = editingPost.view_count || 0;
                            const likes = editingPost.like_count || 0;
                            const shares = editingPost.share_count || 0;
                            const engagementRate = views > 0 ? Math.min(100, Math.round(((likes + shares) / views) * 100)) : 0;
                            const qualityScore = Math.min(100, Math.floor(
                                (wordCount >= 500 ? 40 : wordCount / 500 * 40) +
                                (views > 0 ? Math.min(30, views / 10) : 0) +
                                (likes > 0 ? Math.min(20, likes * 4) : 0) +
                                (shares > 0 ? Math.min(10, shares * 5) : 0)
                            ));

                            const engagementMetrics = [
                                { label: 'Visualizações', value: views.toLocaleString('pt-BR'), icon: Eye, color: 'blue', sub: 'leituras únicas', trend: views > 100 ? '🔥 Alta' : views > 20 ? '📈 Crescendo' : '🌱 Novo' },
                                { label: 'Curtidas', value: likes.toLocaleString('pt-BR'), icon: TrendingUp, color: 'pink', sub: 'reações positivas', trend: likes > 0 ? `${views > 0 ? Math.round((likes / views) * 100) : 0}% dos leitores` : '—' },
                                { label: 'Compartilhamentos', value: shares.toLocaleString('pt-BR'), icon: Activity, color: 'emerald', sub: 'vezes compartilhado', trend: shares > 0 ? `${views > 0 ? Math.round((shares / views) * 100) : 0}% dos leitores` : '—' },
                                { label: 'Engajamento', value: `${engagementRate}%`, icon: BarChart2, color: 'purple', sub: '(curtidas + shares) / views', trend: engagementRate >= 10 ? '✅ Excelente' : engagementRate >= 3 ? '👍 Bom' : '💡 Melhorar' },
                            ];

                            const contentMetrics = [
                                { label: 'Palavras', value: wordCount.toLocaleString('pt-BR'), icon: FileText, color: 'blue', sub: 'no artigo completo' },
                                { label: 'Tempo de Leitura', value: editingPost.read_time, icon: Clock, color: 'purple', sub: 'estimativa avg. leitor' },
                                { label: 'Categoria', value: editingPost.category || '—', icon: Tag, color: 'green', sub: 'segmento do conteúdo' },
                                { label: 'Caracteres', value: charCount.toLocaleString('pt-BR'), icon: Activity, color: 'amber', sub: 'total do corpo' },
                            ];

                            const colorMap: Record<string, { bg: string; text: string }> = {
                                blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
                                purple: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
                                green: { bg: 'bg-green-500/20', text: 'text-green-400' },
                                amber: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
                                pink: { bg: 'bg-pink-500/20', text: 'text-pink-400' },
                                emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
                            };

                            return (
                                <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
                                    {/* Header */}
                                    <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                <BarChart2 className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-white uppercase tracking-widest">Análise da Matéria</p>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase">Publicada em {publishedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${daysSince <= 7 ? 'bg-green-500/20 text-green-400' : daysSince <= 30 ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                            {daysSince === 0 ? 'Publicada hoje' : `${daysSince} dias no ar`}
                                        </span>
                                    </div>

                                    {/* Engagement Metrics (real data) */}
                                    <div className="p-4 border-b border-slate-800">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                            <TrendingUp className="w-3 h-3" /> Dados de Engajamento
                                        </p>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                            {engagementMetrics.map(metric => (
                                                <div key={metric.label} className="bg-slate-800/60 rounded-xl p-4">
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${colorMap[metric.color].bg}`}>
                                                        <metric.icon className={`w-3.5 h-3.5 ${colorMap[metric.color].text}`} />
                                                    </div>
                                                    <p className={`text-2xl font-black leading-none mb-1 ${colorMap[metric.color].text}`}>{metric.value}</p>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{metric.label}</p>
                                                    <p className="text-[8px] text-slate-600 font-bold mt-1">{metric.trend}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Content Metrics */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-800">
                                        {contentMetrics.map(metric => (
                                            <div key={metric.label} className="p-5">
                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-3 ${colorMap[metric.color].bg}`}>
                                                    <metric.icon className={`w-3.5 h-3.5 ${colorMap[metric.color].text}`} />
                                                </div>
                                                <p className="text-xl font-black text-white leading-none mb-1">{metric.value}</p>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{metric.label}</p>
                                                <p className="text-[8px] text-slate-600 font-bold mt-0.5">{metric.sub}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Quality Score bar */}
                                    <div className="px-6 py-4 border-t border-slate-800">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <TrendingUp className="w-3 h-3" /> Score Geral
                                            </span>
                                            <span className={`text-sm font-black ${qualityScore >= 70 ? 'text-green-400' : qualityScore >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{qualityScore}/100</span>
                                        </div>
                                        <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${qualityScore >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : qualityScore >= 40 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-red-500 to-orange-400'}`}
                                                style={{ width: `${qualityScore}%` }}
                                            />
                                        </div>
                                        <p className="text-[8px] text-slate-600 font-bold mt-1.5">
                                            {qualityScore >= 70 ? '✅ Conteúdo de alta qualidade com bom engajamento.' : qualityScore >= 40 ? '⚠️ Score moderado — aumente as visualizações e o conteúdo.' : '📝 Score baixo. Expanda o artigo e promova para mais leitores.'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Edit3 className="w-4 h-4" />
                                {mode === 'create' ? 'Nova Matéria' : 'Editar Matéria'}
                            </h2>

                            {/* Title */}
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Título *</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ex: Musculação para Corredores"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg font-black text-blue-900 uppercase italic tracking-tight focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            {/* Excerpt */}
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Resumo (Excerpt)</label>
                                <textarea
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                    placeholder="Breve descrição para o card de preview..."
                                    rows={2}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Conteúdo Completo *</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Escreva o artigo completo aqui... Use quebras de linha para parágrafos."
                                    rows={16}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                                />
                                <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest mt-1">
                                    {content.split(/\s+/).filter(w => w.length > 0).length} palavras · Leitura estimada: {calcReadTime(content)}
                                </p>
                            </div>

                            {/* Category + Author Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                                        <Tag className="w-3 h-3 inline mr-1" /> Categoria
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                                    >
                                        <option value="" disabled>Selecione uma categoria...</option>
                                        {BLOG_CATEGORIES.map(cat => (
                                            <option key={cat.slug} value={cat.slug}>
                                                {cat.emoji} {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                    {category && (() => {
                                        const cat = BLOG_CATEGORIES.find(c => c.slug === category);
                                        return cat ? (
                                            <p className="text-[9px] text-gray-400 font-bold mt-1.5 pl-1">{cat.description}</p>
                                        ) : null;
                                    })()}
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Autor</label>
                                    <input
                                        value={author}
                                        onChange={(e) => setAuthor(e.target.value)}
                                        placeholder="Redação BrasilRun"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Image URL */}
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                                    <ImageIcon className="w-3 h-3 inline mr-1" /> URL da Imagem de Capa
                                </label>
                                <input
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://images.unsplash.com/photo-..."
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                {imageUrl && (
                                    <div className="mt-3 rounded-xl overflow-hidden border border-gray-100 h-40">
                                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            {/* Auto read time display */}
                            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                                <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <div>
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Tempo de leitura calculado automaticamente: </span>
                                    <span className="text-sm font-black text-blue-700">{calcReadTime(content)}</span>
                                </div>
                                <span className="ml-auto text-[9px] text-blue-300 font-bold">
                                    {content.split(/\s+/).filter(w => w.length > 0).length} palavras · 200 wpm
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleSave}
                                disabled={saving || !title.trim() || !content.trim()}
                                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {mode === 'create' ? 'Publicar Matéria' : 'Salvar Alterações'}
                            </button>
                            <button
                                onClick={() => { resetForm(); setMode('list'); }}
                                className="px-6 py-4 bg-gray-100 text-gray-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                            >
                                Cancelar
                            </button>
                        </div>

                        {/* Warning */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                            <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
                                A matéria será publicada imediatamente após clicar em "Publicar". Revise o conteúdo antes de prosseguir.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
