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
    BarChart2, Activity, TrendingUp, Upload, CheckCircle, XCircle,
    TableProperties, RefreshCw
} from 'lucide-react';

type EditorMode = 'list' | 'create' | 'edit' | 'import';

interface ImportRow {
    title: string;
    content: string;
    excerpt: string;
    status: 'pending' | 'success' | 'error';
    error?: string;
}

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
    const [sources, setSources] = useState('');

    // Bulk import state
    const [importRows, setImportRows] = useState<ImportRow[]>([]);
    const [importCategory, setImportCategory] = useState('');
    const [importAuthor, setImportAuthor] = useState('Redação BrasilRun');
    const [importImageUrl, setImportImageUrl] = useState('https://images.unsplash.com/photo-1461896836934-bd45ba1e9eba?q=80&w=2070&auto=format&fit=crop');
    const [importProgress, setImportProgress] = useState(0);
    const [importDone, setImportDone] = useState(false);
    const [importRunning, setImportRunning] = useState(false);
    const [dragOver, setDragOver] = useState(false);

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
        setSources('');
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
            setSources(post.sources || '');
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
                sources: sources.trim() || null,
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

    // ===== CSV PARSER =====
    const parseCSV = (text: string): ImportRow[] => {
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) return [];

        // Detect delimiter: tab or comma
        const delim = lines[0].includes('\t') ? '\t' : ',';

        // Parse headers (first line)
        const headers = lines[0].split(delim).map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());
        const titleCol = headers.findIndex(h => h.includes('tit') || h.includes('title'));
        const contentCol = headers.findIndex(h => h.includes('cont') || h.includes('body') || h.includes('texto'));

        if (titleCol === -1 || contentCol === -1) {
            // Try to treat col 0 = title, col 1 = content (no header)
            return lines.map(line => {
                const cols = line.split(delim).map(c => c.replace(/^"|"$/g, '').trim());
                const t = cols[0] || '';
                const c = cols[1] || '';
                return { title: t, content: c, excerpt: c.slice(0, 160), status: 'pending' as const };
            }).filter(r => r.title && r.content);
        }

        return lines.slice(1).map(line => {
            // Handle quoted fields with commas inside
            const cols: string[] = [];
            let cur = '';
            let inQ = false;
            for (const ch of line) {
                if (ch === '"') { inQ = !inQ; }
                else if (ch === delim && !inQ) { cols.push(cur.trim()); cur = ''; }
                else { cur += ch; }
            }
            cols.push(cur.trim());

            const t = (cols[titleCol] || '').replace(/^"|"$/g, '').trim();
            const c = (cols[contentCol] || '').replace(/^"|"$/g, '').trim();
            return { title: t, content: c, excerpt: c.slice(0, 160), status: 'pending' as const };
        }).filter(r => r.title && r.content);
    };

    const handleFileUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const rows = parseCSV(text);
            setImportRows(rows);
            setImportProgress(0);
            setImportDone(false);
        };
        reader.readAsText(file, 'UTF-8');
    };

    const handleBulkImport = async () => {
        if (!importCategory) { alert('Selecione uma categoria antes de importar.'); return; }
        if (importRows.length === 0) return;

        setImportRunning(true);
        setImportDone(false);
        setImportProgress(0);

        const rows = [...importRows];
        const CHUNK = 10; // insert 10 at a time
        let done = 0;

        for (let i = 0; i < rows.length; i += CHUNK) {
            const chunk = rows.slice(i, i + CHUNK);
            const payload = chunk.map(r => ({
                title: r.title,
                content: r.content,
                excerpt: r.content.slice(0, 160),
                category: importCategory,
                author: importAuthor,
                image_url: importImageUrl,
                read_time: calcReadTime(r.content),
                published_at: new Date().toISOString(),
                view_count: 0,
                like_count: 0,
                share_count: 0,
            }));

            const { error } = await supabase.from('blog_posts').insert(payload);
            if (error) {
                chunk.forEach((r, idx) => { rows[i + idx].status = 'error'; rows[i + idx].error = error.message; });
            } else {
                chunk.forEach((_, idx) => { rows[i + idx].status = 'success'; });
            }

            done += chunk.length;
            setImportProgress(Math.round((done / rows.length) * 100));
            setImportRows([...rows]);
        }

        setImportRunning(false);
        setImportDone(true);
        await fetchPosts();
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
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => { setImportRows([]); setImportDone(false); setImportProgress(0); setMode('import'); }}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
                            >
                                <Upload className="w-4 h-4" />
                                Importar CSV
                            </button>
                            <button
                                onClick={() => openEditor()}
                                className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
                            >
                                <Plus className="w-4 h-4" strokeWidth={3} />
                                Nova Matéria
                            </button>
                        </div>
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

                            {/* Sources / Fontes */}
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                                    📚 Fontes
                                </label>
                                <textarea
                                    value={sources}
                                    onChange={(e) => setSources(e.target.value)}
                                    placeholder={`Fontes Científicas Consultadas\nJournal of Orthopaedic & Sports Physical Therapy (JOSPT): Diretrizes de prática clínica...\nRevista Brasileira de Medicina do Esporte: Artigos sobre fortalecimento muscular para corredores.`}
                                    rows={5}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                                />
                                <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest mt-1">
                                    Exibido ao final da matéria publicada. Uma entrada por linha.
                                </p>
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
                {/* ===== IMPORT MODE ===== */}
                {mode === 'import' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Instructions */}
                        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 flex items-start gap-4">
                            <TableProperties className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-black text-purple-900 uppercase italic tracking-tight mb-1">Importação em Massa via CSV</p>
                                <p className="text-[11px] text-purple-700 font-medium leading-relaxed">
                                    Exporte sua planilha como <strong>CSV (separado por vírgulas ou Tab)</strong>.
                                    A primeira linha deve ser o cabeçalho com as colunas <strong>Título</strong> e <strong>Conteúdo Limpo</strong>.
                                    Selecione a categoria padrão abaixo antes de importar.
                                </p>
                            </div>
                        </div>

                        {/* Drop Zone */}
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragOver(false);
                                const file = e.dataTransfer.files[0];
                                if (file) handleFileUpload(file);
                            }}
                            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${dragOver ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50/50'
                                }`}
                            onClick={() => document.getElementById('csv-file-input')?.click()}
                        >
                            <input
                                id="csv-file-input"
                                type="file"
                                accept=".csv,.tsv,.txt"
                                className="hidden"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
                            />
                            <Upload className={`w-10 h-10 mx-auto mb-3 ${dragOver ? 'text-purple-500' : 'text-gray-300'}`} />
                            <p className="text-sm font-black text-gray-500 uppercase tracking-widest">
                                {importRows.length > 0 ? `✅ ${importRows.length} linhas carregadas` : 'Arraste o CSV aqui ou clique para selecionar'}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold mt-1">Formatos aceitos: .csv, .tsv, .txt</p>
                        </div>

                        {/* Import defaults */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">⚙️ Padrões para Todas as Matérias</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                                        <Tag className="w-3 h-3 inline mr-1" /> Categoria *
                                    </label>
                                    <select
                                        value={importCategory}
                                        onChange={e => setImportCategory(e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
                                    >
                                        <option value="" disabled>Selecione uma categoria...</option>
                                        {BLOG_CATEGORIES.map(cat => (
                                            <option key={cat.slug} value={cat.slug}>{cat.emoji} {cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Autor</label>
                                    <input
                                        value={importAuthor}
                                        onChange={e => setImportAuthor(e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                                    <ImageIcon className="w-3 h-3 inline mr-1" /> URL da Imagem Padrão
                                </label>
                                <input
                                    value={importImageUrl}
                                    onChange={e => setImportImageUrl(e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Preview table */}
                        {importRows.length > 0 && (
                            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <p className="text-xs font-black text-gray-700 uppercase tracking-widest">
                                        Preview — {importRows.length} matérias
                                    </p>
                                    <button
                                        onClick={() => { setImportRows([]); setImportProgress(0); setImportDone(false); }}
                                        className="text-[10px] text-gray-400 hover:text-red-500 font-black uppercase tracking-widest flex items-center gap-1 transition-colors"
                                    >
                                        <RefreshCw className="w-3 h-3" /> Limpar
                                    </button>
                                </div>
                                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                                    <table className="w-full text-xs">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="text-left p-3 text-[9px] font-black text-gray-400 uppercase tracking-widest w-8">#</th>
                                                <th className="text-left p-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Título</th>
                                                <th className="text-left p-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Conteúdo (prévia)</th>
                                                <th className="text-left p-3 text-[9px] font-black text-gray-400 uppercase tracking-widest w-24">Leitura</th>
                                                <th className="text-left p-3 text-[9px] font-black text-gray-400 uppercase tracking-widest w-20">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {importRows.map((row, i) => (
                                                <tr key={i} className={`transition-colors ${row.status === 'success' ? 'bg-green-50' :
                                                    row.status === 'error' ? 'bg-red-50' : 'hover:bg-gray-50'
                                                    }`}>
                                                    <td className="p-3 text-gray-400 font-bold">{i + 1}</td>
                                                    <td className="p-3 font-black text-gray-900 max-w-[200px] truncate">{row.title}</td>
                                                    <td className="p-3 text-gray-500 font-medium max-w-[300px] truncate">{row.content.slice(0, 80)}...</td>
                                                    <td className="p-3 text-gray-400 font-bold">{calcReadTime(row.content)}</td>
                                                    <td className="p-3">
                                                        {row.status === 'pending' && <span className="text-[9px] font-black text-gray-400 uppercase">Na fila</span>}
                                                        {row.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                                        {row.status === 'error' && (
                                                            <span title={row.error}><XCircle className="w-4 h-4 text-red-500" /></span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Progress bar */}
                        {(importRunning || importProgress > 0) && (
                            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                        {importRunning ? '⏳ Importando...' : importDone ? '✅ Concluído!' : 'Progresso'}
                                    </span>
                                    <span className="text-sm font-black text-purple-600">{importProgress}%</span>
                                </div>
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-300"
                                        style={{ width: `${importProgress}%` }}
                                    />
                                </div>
                                {importDone && (
                                    <p className="text-[10px] text-green-600 font-black uppercase tracking-widest mt-2">
                                        ✅ {importRows.filter(r => r.status === 'success').length} matérias importadas com sucesso!
                                        {importRows.filter(r => r.status === 'error').length > 0 &&
                                            ` ❌ ${importRows.filter(r => r.status === 'error').length} falhas.`
                                        }
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBulkImport}
                                disabled={importRunning || importRows.length === 0 || !importCategory}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:text-gray-400 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                {importRunning ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Importando {importProgress}%...</>
                                ) : (
                                    <><Upload className="w-4 h-4" /> Importar {importRows.length} Matérias para Supabase</>
                                )}
                            </button>
                            <button
                                onClick={() => { resetForm(); setMode('list'); }}
                                className="px-6 py-4 bg-gray-100 text-gray-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
