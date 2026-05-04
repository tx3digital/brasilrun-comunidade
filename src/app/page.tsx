'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Topic, BlogPost } from '@/lib/types';
import Link from 'next/link';
import { TrendingUp, Users, ChevronRight, Footprints, Flag, Activity, Star, Loader2, RefreshCw, BookOpen, Flame, Clock, ChevronDown, Eye } from 'lucide-react';
import { MOCK_EVENTS } from '@/lib/mockData';
import { type Metric, FALLBACK_METRICS, formatLastUpdated } from '@/lib/metrics';
import { getCategoryBySlug } from '@/lib/categories';

const ARTICLES_PAGE_SIZE = 5;

export default function Home() {
    const [latestTopics, setLatestTopics] = useState<Topic[]>([]);
    const [communities, setCommunities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<Metric[]>(FALLBACK_METRICS);
    const [metricsLoading, setMetricsLoading] = useState(false);
    const [metricsLastFetch, setMetricsLastFetch] = useState<Date | null>(null);

    // ── Editorial feed states ──────────────────────────────────
    const [articles, setArticles] = useState<BlogPost[]>([]);
    const [articlesPage, setArticlesPage] = useState(0);
    const [articlesTotal, setArticlesTotal] = useState(0);
    const [articlesLoading, setArticlesLoading] = useState(false);
    const [articlesInitialized, setArticlesInitialized] = useState(false);
    const [engagedArticles, setEngagedArticles] = useState<BlogPost[]>([]);
    const [engagedLoading, setEngagedLoading] = useState(false);

    useEffect(() => {
        const fetchHomeData = async () => {
            setLoading(true);
            try {

                // Fetch latest 3 topics with visibility rules
                const now = new Date();
                const thirtyDaysAgo = new Date(now);
                thirtyDaysAgo.setDate(now.getDate() - 30);

                const ninetyDaysAgo = new Date(now);
                ninetyDaysAgo.setDate(now.getDate() - 90);

                let { data, error } = await supabase
                    .from('topics')
                    .select('*, profile:profiles(*)')
                    .or(`is_pinned.eq.true,and(reply_count.gte.10,created_at.gte.${ninetyDaysAgo.toISOString()}),created_at.gte.${thirtyDaysAgo.toISOString()}`)
                    .order('is_pinned', { ascending: false })
                    .order('created_at', { ascending: false })
                    .limit(3);

                if (error) {
                    console.warn('Advanced filtering failed on Home, using fallback:', error.message);
                    const { data: fallbackData } = await supabase
                        .from('topics')
                        .select('*, profile:profiles(*)')
                        .or(`is_pinned.eq.true,created_at.gte.${thirtyDaysAgo.toISOString()}`)
                        .order('is_pinned', { ascending: false })
                        .order('created_at', { ascending: false })
                        .limit(3);
                    setLatestTopics(fallbackData || []);
                } else {
                    setLatestTopics(data || []);
                }

                // Busca comunidades reais com contagem de tópicos real
                const { data: commData } = await supabase
                    .from('communities')
                    .select('*, topics(count)')
                    .order('name')
                    .limit(3);

                if (commData) {
                    setCommunities(commData.map((c: any) => ({
                        ...c,
                        topic_count: c.topics?.[0]?.count ?? 0,
                    })));
                }
            } catch (err) {
                console.error('Error fetching home data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    // ── Editorial: últimas matérias ────────────────────────────
    const fetchArticles = useCallback(async (page: number) => {
        setArticlesLoading(true);
        try {
            const from = page * ARTICLES_PAGE_SIZE;
            const to = from + ARTICLES_PAGE_SIZE - 1;
            const { data, count, error } = await supabase
                .from('blog_posts')
                .select('*', { count: 'exact' })
                .order('published_at', { ascending: false })
                .range(from, to);
            if (!error && data) {
                setArticles(prev => page === 0 ? data : [...prev, ...data]);
                setArticlesTotal(count ?? 0);
            }
        } catch (err) {
            console.warn('[editorial] Erro ao buscar matérias:', err);
        } finally {
            setArticlesLoading(false);
            setArticlesInitialized(true);
        }
    }, []);

    // ── Editorial: mais engajadas (view_count ou like_count) ───
    const fetchEngagedArticles = useCallback(async () => {
        setEngagedLoading(true);
        try {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .order('view_count', { ascending: false })
                .limit(3);
            if (!error && data) setEngagedArticles(data);
        } catch (err) {
            console.warn('[editorial-engaged] Erro ao buscar matérias engajadas:', err);
        } finally {
            setEngagedLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchArticles(0);
        fetchEngagedArticles();
    }, [fetchArticles, fetchEngagedArticles]);

    const handleLoadMoreArticles = () => {
        const next = articlesPage + 1;
        setArticlesPage(next);
        fetchArticles(next);
    };

    const hasMoreArticles = articles.length < articlesTotal;

    // ── Métricas do setor ──────────────────────────────────────
    const fetchMetrics = useCallback(async () => {
        setMetricsLoading(true);
        try {
            const res = await fetch('/api/metrics', { cache: 'no-store' });
            if (res.ok) {
                const json = await res.json();
                if (json.data && json.data.length > 0) {
                    setMetrics(json.data);
                }
            }
        } catch (err) {
            console.warn('[metrics] Usando fallback:', err);
        } finally {
            setMetricsLoading(false);
            setMetricsLastFetch(new Date());
        }
    }, []);

    useEffect(() => {
        fetchMetrics();
        // Recarrega automaticamente a cada 12 horas
        const interval = setInterval(fetchMetrics, 12 * 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchMetrics]);

    // ── Helpers ────────────────────────────────────────────────
    const fmtDate = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    const m1 = metrics[0] ?? FALLBACK_METRICS[0];
    const m2 = metrics[1] ?? FALLBACK_METRICS[1];

    return (
        <div className="bg-transparent min-h-full flex flex-col">
            <div className="p-6 space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-blue-900 leading-tight uppercase italic tracking-tighter">
                        Conheça a nossa tribo
                    </h1>
                    <p className="text-xs text-gray-500 font-medium">Junte-se a +1.200 corredores apaixonados pelo asfalto.</p>
                </div>

                {/* ── Métricas do Setor ────────────────────────── */}
                <div className="grid grid-cols-2 gap-3 mb-2 animate-in slide-in-from-top-4 duration-500 delay-200">
                    {/* Card 1 */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-3xl text-white relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">{m1.label}</p>
                            <h4 className="text-2xl font-black italic leading-none">{m1.value}</h4>
                            {m1.sublabel && (
                                <p className="text-[8px] opacity-70 mt-1 leading-tight">{m1.sublabel}</p>
                            )}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                            <div>
                                <p className="text-[7px] opacity-50 font-bold uppercase tracking-wider">Fonte: {m1.source_name}</p>
                                <p className="text-[7px] opacity-40">Atualizado: {formatLastUpdated(m1.last_updated)}</p>
                            </div>
                            <button
                                onClick={fetchMetrics}
                                disabled={metricsLoading}
                                className="opacity-40 hover:opacity-80 transition-opacity"
                                title="Atualizar métricas"
                            >
                                <RefreshCw className={`w-3 h-3 ${metricsLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        <div className="absolute -right-2 -bottom-2 opacity-10">
                            <Users className="w-16 h-16" />
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-gradient-to-br from-green-500 to-green-700 p-4 rounded-3xl text-white relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">{m2.label}</p>
                            <h4 className="text-2xl font-black italic leading-none">{m2.value}</h4>
                            {m2.sublabel && (
                                <p className="text-[8px] opacity-70 mt-1 leading-tight">{m2.sublabel}</p>
                            )}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                            <div>
                                <p className="text-[7px] opacity-50 font-bold uppercase tracking-wider">Fonte: {m2.source_name}</p>
                                <p className="text-[7px] opacity-40">Atualizado: {formatLastUpdated(m2.last_updated)}</p>
                            </div>
                            <TrendingUp className="w-3 h-3 opacity-40" />
                        </div>
                        <div className="absolute -right-2 -bottom-2 opacity-10">
                            <TrendingUp className="w-16 h-16" />
                        </div>
                    </div>
                </div>

                {/* Recommended Communities */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-black text-gray-800 uppercase italic tracking-tighter">Comunidades em Destaque</h2>
                        <Link href="/communities" className="text-[10px] text-blue-600 font-black uppercase cursor-pointer hover:underline">Ver todas</Link>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {(communities.length > 0 ? communities : []).slice(0, 3).map((community, idx) => (
                            <Link
                                key={community.id}
                                href={`/c/${community.slug}`}
                                className="group flex items-center p-4 bg-white border border-gray-100 rounded-3xl hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100/50 transition-all active:scale-[0.98] animate-in fade-in slide-in-from-right-4 duration-500 delay-75"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 text-blue-600">
                                    {community.slug.includes('tenis') ? <Footprints className="w-8 h-8" /> : community.slug.includes('maratona') ? <Flag className="w-8 h-8" /> : <Activity className="w-8 h-8" />}
                                </div>
                                <div className="flex-1 min-w-0 ml-4">
                                    <h3 className="font-black text-blue-900 truncate uppercase italic leading-none mb-1">{community.name}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-2 leading-tight font-medium">
                                        {community.description}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                        <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{community.topic_count} tópicos</span>
                                        <span className="h-1 w-1 bg-gray-200 rounded-full"></span>
                                        <span>Última ativ. 5m</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Activity Feed */}
                <section className="space-y-4">
                    <h2 className="text-sm font-black text-gray-800 uppercase italic tracking-tighter">O que estão falando</h2>
                    <div className="space-y-3">
                        {latestTopics.map(topic => (
                            <Link
                                key={topic.id}
                                href={`/t/${topic.id}`}
                                className="group flex items-center p-4 bg-white border border-gray-100 rounded-3xl hover:border-blue-400 transition-all active:scale-[0.98]"
                            >
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                    <img src={topic.profile?.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                                </div>
                                <div className="flex-1 min-w-0 ml-4">
                                    <h3 className="text-sm sm:text-base font-black text-blue-900 truncate uppercase italic leading-none mb-1">{topic.title}</h3>
                                    <p className="text-xs text-gray-500 leading-tight font-medium line-clamp-1">{topic.content}</p>
                                    <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                        <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{topic.profile?.username}</span>
                                        <span className="h-1 w-1 bg-gray-200 rounded-full"></span>
                                        <span>{MOCK_COMMUNITIES.find(c => c.id === topic.community_id)?.name.split(' ')[0] ?? 'Comunidade'}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    CONTEÚDO EDITORIAL — Matérias
                    ══════════════════════════════════════════════════ */}
                <section className="space-y-5">

                    {/* Header divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent" />
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                            <h2 className="text-sm font-black text-blue-900 uppercase italic tracking-tighter whitespace-nowrap">
                                Conteúdo Editorial
                            </h2>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-l from-blue-200 to-transparent" />
                    </div>

                    {/* ── Mais lidas / engajadas ──────────────── */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span className="text-xs font-black text-gray-700 uppercase italic tracking-tighter">Mais Lidas</span>
                        </div>

                        {engagedLoading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                            </div>
                        ) : engagedArticles.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-4">Nenhuma matéria encontrada.</p>
                        ) : (
                            <div className="space-y-2">
                                {engagedArticles.map((art, idx) => {
                                    const cat = getCategoryBySlug(art.category);
                                    return (
                                        <Link
                                            key={art.id}
                                            href={`/blog/${art.id}`}
                                            className="group flex items-center p-4 bg-gradient-to-r from-orange-50 to-white border border-orange-100 rounded-3xl hover:border-orange-300 transition-all active:scale-[0.98]"
                                        >
                                            {/* Rank */}
                                            <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-black mr-4
                                                ${idx === 0 ? 'bg-orange-500 text-white' : idx === 1 ? 'bg-orange-200 text-orange-700' : 'bg-orange-100 text-orange-500'}`}>
                                                {idx + 1}
                                            </div>
                                            {/* Thumbnail */}
                                            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                                {art.image_url
                                                    ? <img src={art.image_url} alt={art.title} className="w-full h-full object-cover" />
                                                    : <BookOpen className="w-5 h-5 text-orange-300" />
                                                }
                                            </div>
                                            {/* Content */}
                                            <div className="flex-1 min-w-0 ml-4">
                                                <h3 className="text-sm sm:text-base font-black text-blue-900 truncate uppercase italic leading-none mb-1">
                                                    {art.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 leading-tight font-medium line-clamp-1">{art.excerpt}</p>
                                                {cat && (
                                                    <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                                        <span className={`px-2 py-0.5 rounded-full ${cat.color} ${cat.textColor}`}>
                                                            #{cat.label}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Views */}
                                            {art.view_count != null && (
                                                <div className="flex items-center gap-1 text-orange-400 flex-shrink-0">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-black">{art.view_count.toLocaleString('pt-BR')}</span>
                                                </div>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ── Últimas matérias ────────────────────── */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-black text-gray-700 uppercase italic tracking-tighter">Últimas Matérias</span>
                        </div>

                        {!articlesInitialized && articlesLoading ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                            </div>
                        ) : articles.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-4">Nenhuma matéria encontrada.</p>
                        ) : (
                            <div className="space-y-2">
                                {articles.map((art, idx) => {
                                    const cat = getCategoryBySlug(art.category);
                                    return (
                                        <Link
                                            key={`${art.id}-${idx}`}
                                            href={`/blog/${art.id}`}
                                            className="group flex items-center p-4 bg-white border border-gray-100 rounded-3xl hover:border-blue-400 transition-all active:scale-[0.98]"
                                        >
                                            {/* Thumbnail */}
                                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                                {art.image_url
                                                    ? <img src={art.image_url} alt={art.title} className="w-full h-full object-cover" />
                                                    : <BookOpen className="w-6 h-6 text-blue-200" />
                                                }
                                            </div>
                                            {/* Content */}
                                            <div className="flex-1 min-w-0 ml-4">
                                                <h3 className="text-sm sm:text-base font-black text-blue-900 truncate uppercase italic leading-none mb-1">
                                                    {art.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 leading-tight font-medium line-clamp-1">{art.excerpt}</p>
                                                <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                                    {cat && (
                                                        <span className={`px-2 py-0.5 rounded-full ${cat.color} ${cat.textColor}`}>
                                                            #{cat.label}
                                                        </span>
                                                    )}
                                                    <span className="h-1 w-1 bg-gray-200 rounded-full" />
                                                    <span>{fmtDate(art.published_at)}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        {/* ── Botão Carregar Mais ──────────────── */}
                        {articlesInitialized && hasMoreArticles && (
                            <button
                                onClick={handleLoadMoreArticles}
                                disabled={articlesLoading}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-blue-200 bg-blue-50 text-blue-700 text-[11px] font-black uppercase tracking-widest hover:bg-blue-100 hover:border-blue-300 active:scale-[0.98] transition-all disabled:opacity-60"
                            >
                                {articlesLoading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Carregando...</span></>
                                ) : (
                                    <><ChevronDown className="w-4 h-4" /><span>Carregar mais 5 matérias</span></>
                                )}
                            </button>
                        )}
                        {articlesInitialized && !hasMoreArticles && articles.length > 0 && (
                            <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest py-2">
                                Você leu tudo! Volte em breve para novas matérias 📰
                            </p>
                        )}
                    </div>
                </section>
                {/* ══════════════════════════════════════════════════ */}

                {/* Ad Section */}
                <section className="px-1">
                    <div className="bg-white border border-gray-200 rounded-[2.5rem] p-1 shadow-sm overflow-hidden relative group">
                        <div className="absolute top-4 right-5 z-10">
                            <span className="text-[8px] font-black bg-black/20 backdrop-blur-md text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Patrocinado</span>
                        </div>
                        <a
                            href="https://www.nike.com.br"
                            target="_blank"
                            rel="sponsored noopener noreferrer"
                            className="block relative overflow-hidden rounded-[2.3rem]"
                        >
                            <div className="aspect-[21/9] w-full relative">
                                <img
                                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
                                    alt="Ad Banner"
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center p-6">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-green-400 uppercase tracking-[0.2em] animate-pulse">Novo Lançamento</p>
                                        <h3 className="text-xl font-black text-white italic uppercase leading-none tracking-tighter">NIKE VAPORFLY 3</h3>
                                        <p className="text-[10px] text-gray-200 font-bold max-w-[180px] leading-tight mb-3">Voe baixo na sua próxima maratona com a placa de carbono mais rápida do mundo.</p>
                                        <div className="inline-flex items-center gap-2 bg-white text-black text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest group-hover:bg-green-500 group-hover:text-white transition-all transform group-hover:translate-x-1">
                                            <span>Ver Oferta</span>
                                            <ChevronRight className="w-3 h-3" strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>
                </section>

                {/* Events Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-black text-gray-800 uppercase italic tracking-tighter">Próximas Provas &amp; Eventos</h2>
                        <div className="flex items-center gap-1.5 bg-green-100 px-2 py-1 rounded-full">
                            <span className="text-[8px] font-black text-green-700 uppercase tracking-widest">Parceria Oficial</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {MOCK_EVENTS.map((event, idx) => (
                            <a
                                key={event.id}
                                href={event.affiliate_url}
                                target="_blank"
                                rel="sponsored noopener noreferrer"
                                className="block group bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:border-orange-200 transition-all active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4 duration-500"
                                style={{ animationDelay: `${idx * 150}ms` }}
                            >
                                <div className="relative h-32 overflow-hidden">
                                    <img src={event.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={event.title} />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-orange-600 uppercase tracking-widest shadow-sm">
                                        {event.category}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-3 left-4 right-4 text-white">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">{event.date}</p>
                                        <h3 className="text-sm font-black italic uppercase truncate">{event.title}</h3>
                                    </div>
                                </div>
                                <div className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Localização</p>
                                        <p className="text-xs font-bold text-gray-700">{event.location}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Inscrições a partir de</p>
                                        <p className="text-sm font-black text-green-600">{event.price_from}</p>
                                    </div>
                                </div>
                                <div className="px-4 pb-4">
                                    <div className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-orange-600 flex items-center justify-center gap-2 group-hover:gap-4 transition-all">
                                        <span>Garantir Inscrição</span>
                                        <ChevronRight className="w-4 h-4" strokeWidth={3} />
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>

                {/* BrasilRun Special Info */}
                <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-orange-800 font-black text-sm mb-2 italic uppercase tracking-widest">Dica BrasilRun</h3>
                        <p className="text-xs text-orange-700 font-medium leading-relaxed">
                            Mantenha seu ritmo! Tópicos de recuperação estão em alta hoje. <span className="font-bold underline cursor-pointer">Confira agora &raquo;</span>
                        </p>
                    </div>
                    <div className="absolute top-4 right-4 text-orange-200 opacity-50 group-hover:scale-125 transition-transform">
                        <Star className="w-12 h-12 fill-current" />
                    </div>
                </div>
            </div>
        </div>
    );
}
