'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Topic, Reply, Profile } from '@/lib/types';
import {
    Shield, AlertTriangle, CheckCircle, XCircle, Eye, Trash2,
    MessageSquare, Users, Flag, Pin, PinOff, ChevronRight,
    Loader2, Search, Filter, RefreshCw, FileText, Activity,
    TrendingUp, Clock, BarChart2, ChevronLeft
} from 'lucide-react';

type ModerationTab = 'dashboard' | 'topics' | 'replies' | 'users';
type TopicStatus = 'pending_review' | 'approved' | 'flagged';

interface Stats {
    totalTopics: number;
    pendingTopics: number;
    flaggedTopics: number;
    totalReplies: number;
    totalUsers: number;
}

export default function AdminModerationPanel() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState<ModerationTab>('dashboard');
    const [loading, setLoading] = useState(true);

    // Data states
    const [stats, setStats] = useState<Stats>({ totalTopics: 0, pendingTopics: 0, flaggedTopics: 0, totalReplies: 0, totalUsers: 0 });
    const [topics, setTopics] = useState<Topic[]>([]);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [users, setUsers] = useState<Profile[]>([]);

    // Filter states
    const [topicFilter, setTopicFilter] = useState<TopicStatus | 'all'>('pending_review');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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
        if (isAdmin) {
            fetchAll();
        }
    }, [isAdmin]);

    const fetchAll = async () => {
        setLoading(true);
        await Promise.all([fetchStats(), fetchTopics(), fetchReplies(), fetchUsers()]);
        setLoading(false);
    };

    const fetchStats = async () => {
        const [topicsRes, pendingRes, flaggedRes, repliesRes, usersRes] = await Promise.all([
            supabase.from('topics').select('*', { count: 'exact', head: true }),
            supabase.from('topics').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
            supabase.from('topics').select('*', { count: 'exact', head: true }).eq('status', 'flagged'),
            supabase.from('replies').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
        ]);
        setStats({
            totalTopics: topicsRes.count || 0,
            pendingTopics: pendingRes.count || 0,
            flaggedTopics: flaggedRes.count || 0,
            totalReplies: repliesRes.count || 0,
            totalUsers: usersRes.count || 0,
        });
    };

    const fetchTopics = async () => {
        const query = supabase
            .from('topics')
            .select('*, profile:profiles(*)')
            .order('created_at', { ascending: false })
            .limit(100);
        const { data } = await query;
        setTopics(data || []);
    };

    const fetchReplies = async () => {
        const { data } = await supabase
            .from('replies')
            .select('*, profile:profiles(*)')
            .order('created_at', { ascending: false })
            .limit(50);
        setReplies(data || []);
    };

    const fetchUsers = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
        setUsers(data || []);
    };

    const updateTopicStatus = async (id: string, status: TopicStatus) => {
        const { error } = await supabase.from('topics').update({ status }).eq('id', id);
        if (!error) {
            setTopics(prev => prev.map(t => t.id === id ? { ...t, status } : t));
            await fetchStats();
        }
    };

    const toggleTopicPin = async (topic: Topic) => {
        const { error } = await supabase.from('topics').update({ is_pinned: !topic.is_pinned }).eq('id', topic.id);
        if (!error) setTopics(prev => prev.map(t => t.id === topic.id ? { ...t, is_pinned: !t.is_pinned } : t));
    };

    const deleteTopic = async (id: string) => {
        const { error } = await supabase.from('topics').delete().eq('id', id);
        if (!error) {
            setTopics(prev => prev.filter(t => t.id !== id));
            setDeleteConfirm(null);
            await fetchStats();
        }
    };

    const deleteReply = async (id: string) => {
        const { error } = await supabase.from('replies').delete().eq('id', id);
        if (!error) {
            setReplies(prev => prev.filter(r => r.id !== id));
            setDeleteConfirm(null);
        }
    };

    const filteredTopics = topics.filter(t => {
        const matchStatus = topicFilter === 'all' || t.status === topicFilter;
        const matchSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchStatus && matchSearch;
    });

    const statusColor = (status: string) => {
        if (status === 'approved') return 'bg-green-100 text-green-700';
        if (status === 'pending_review') return 'bg-amber-100 text-amber-700';
        if (status === 'flagged') return 'bg-red-100 text-red-700';
        return 'bg-gray-100 text-gray-500';
    };

    const statusLabel = (status: string) => {
        if (status === 'approved') return 'Aprovado';
        if (status === 'pending_review') return 'Pendente';
        if (status === 'flagged') return 'Sinalizado';
        return status;
    };

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Top Bar */}
            <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <Shield className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black uppercase italic tracking-tighter leading-none">Painel de Moderação</h1>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">BrasilRun Admin Center</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {stats.pendingTopics > 0 && (
                        <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-full">
                            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">{stats.pendingTopics} pendentes</span>
                        </div>
                    )}
                    <button onClick={fetchAll} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <Link href="/admin/content" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                        📝 Conteúdo
                    </Link>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-slate-900 border-b border-slate-800 flex overflow-x-auto">
                {([
                    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
                    { id: 'topics', label: 'Tópicos', icon: MessageSquare, badge: stats.pendingTopics },
                    { id: 'replies', label: 'Comentários', icon: Activity },
                    { id: 'users', label: 'Usuários', icon: Users },
                ] as { id: ModerationTab; label: string; icon: React.ElementType; badge?: number }[]).map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {tab.badge ? (
                            <span className="bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{tab.badge}</span>
                        ) : null}
                    </button>
                ))}
            </div>

            <div className="p-6 max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* ===== DASHBOARD TAB ===== */}
                        {activeTab === 'dashboard' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Total de Tópicos', value: stats.totalTopics, icon: MessageSquare, color: 'blue', sub: 'na plataforma' },
                                        { label: 'Pendentes', value: stats.pendingTopics, icon: Clock, color: 'amber', sub: 'aguardando revisão', urgent: stats.pendingTopics > 0 },
                                        { label: 'Sinalizados', value: stats.flaggedTopics, icon: Flag, color: 'red', sub: 'reportados pela comunidade', urgent: stats.flaggedTopics > 0 },
                                        { label: 'Comentários', value: stats.totalReplies, icon: Activity, color: 'green', sub: 'total de respostas' },
                                    ].map((card) => (
                                        <div key={card.label} className={`bg-slate-900 border rounded-2xl p-5 ${card.urgent ? 'border-amber-500/40 shadow-lg shadow-amber-500/10' : 'border-slate-800'}`}>
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color === 'blue' ? 'bg-blue-500/20' : card.color === 'amber' ? 'bg-amber-500/20' : card.color === 'red' ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                                                <card.icon className={`w-5 h-5 ${card.color === 'blue' ? 'text-blue-400' : card.color === 'amber' ? 'text-amber-400' : card.color === 'red' ? 'text-red-400' : 'text-green-400'}`} />
                                            </div>
                                            <p className="text-3xl font-black">{card.value}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
                                            <p className="text-[9px] text-slate-600 font-bold">{card.sub}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Users stat */}
                                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Users className="w-4 h-4" /> Membros da Comunidade
                                        </h3>
                                        <span className="text-2xl font-black text-white">{stats.totalUsers}</span>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                        {users.slice(0, 8).map(u => (
                                            <div key={u.id} className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-xl">
                                                <img src={u.avatar_url} className="w-7 h-7 rounded-full object-cover" alt="" />
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-black text-white truncate">{u.username}</p>
                                                    <p className="text-[8px] text-slate-500 font-bold uppercase">{u.role || 'user'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Ações Rápidas</h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                                        <button onClick={() => { setActiveTab('topics'); setTopicFilter('pending_review'); }} className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition-all text-left">
                                            <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-black text-amber-300">Revisar Pendentes</p>
                                                <p className="text-[9px] text-amber-500/70 font-bold uppercase">{stats.pendingTopics} tópicos esperando</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-amber-500 ml-auto" />
                                        </button>
                                        <button onClick={() => { setActiveTab('topics'); setTopicFilter('flagged'); }} className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all text-left">
                                            <Flag className="w-5 h-5 text-red-400 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-black text-red-300">Ver Sinalizados</p>
                                                <p className="text-[9px] text-red-500/70 font-bold uppercase">{stats.flaggedTopics} aguardando análise</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-red-500 ml-auto" />
                                        </button>
                                        <Link href="/admin/content" className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-all">
                                            <FileText className="w-5 h-5 text-green-400 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-black text-green-300">Painel de Conteúdo</p>
                                                <p className="text-[9px] text-green-500/70 font-bold uppercase">Blog e matérias</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-green-500 ml-auto" />
                                        </Link>
                                    </div>
                                </div>

                                {/* Recent topics list */}
                                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" /> Tópicos Recentes
                                    </h3>
                                    <div className="space-y-2">
                                        {topics.slice(0, 5).map(t => (
                                            <div key={t.id} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl">
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${statusColor(t.status)}`}>
                                                    {statusLabel(t.status)}
                                                </span>
                                                <p className="text-sm font-bold text-slate-300 flex-1 truncate">{t.title}</p>
                                                <Link href={`/t/${t.id}`} className="text-slate-600 hover:text-blue-400 transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ===== TOPICS TAB ===== */}
                        {activeTab === 'topics' && (
                            <div className="space-y-4 animate-in fade-in duration-500">
                                {/* Filters */}
                                <div className="flex flex-col lg:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                                        <input
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder="Pesquisar tópicos..."
                                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        {([
                                            { val: 'all', label: 'Todos' },
                                            { val: 'pending_review', label: '⏳ Pendentes' },
                                            { val: 'approved', label: '✅ Aprovados' },
                                            { val: 'flagged', label: '🚩 Sinalizados' },
                                        ] as { val: typeof topicFilter; label: string }[]).map(f => (
                                            <button
                                                key={f.val}
                                                onClick={() => setTopicFilter(f.val)}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${topicFilter === f.val ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{filteredTopics.length} tópicos encontrados</p>

                                <div className="space-y-3">
                                    {filteredTopics.map(topic => (
                                        <div key={topic.id} className={`bg-slate-900 border rounded-2xl p-5 transition-all ${topic.is_pinned ? 'border-amber-500/40' : 'border-slate-800'}`}>
                                            <div className="flex items-start gap-4">
                                                <img src={topic.profile?.avatar_url} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" alt="" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${statusColor(topic.status)}`}>
                                                            {statusLabel(topic.status)}
                                                        </span>
                                                        {topic.is_pinned && (
                                                            <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest bg-amber-500/20 text-amber-400">
                                                                📌 Fixado
                                                            </span>
                                                        )}
                                                        <span className="text-[9px] text-slate-500 font-bold">por {topic.profile?.username}</span>
                                                        <span className="text-[9px] text-slate-600 font-bold ml-auto">
                                                            {new Date(topic.created_at).toLocaleDateString('pt-BR')}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-base font-black text-white italic uppercase tracking-tight truncate mb-1">{topic.title}</h3>
                                                    <p className="text-xs text-slate-500 font-medium line-clamp-2">{topic.content}</p>
                                                </div>
                                            </div>

                                            {/* Action bar */}
                                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800 flex-wrap">
                                                <Link href={`/t/${topic.id}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-black text-slate-300 uppercase tracking-widest transition-all">
                                                    <Eye className="w-3 h-3" /> Ver
                                                </Link>

                                                {topic.status !== 'approved' && (
                                                    <button onClick={() => updateTopicStatus(topic.id, 'approved')} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-[10px] font-black text-green-400 uppercase tracking-widest transition-all">
                                                        <CheckCircle className="w-3 h-3" /> Aprovar
                                                    </button>
                                                )}

                                                {topic.status !== 'pending_review' && (
                                                    <button onClick={() => updateTopicStatus(topic.id, 'pending_review')} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-[10px] font-black text-amber-400 uppercase tracking-widest transition-all">
                                                        <Clock className="w-3 h-3" /> Pendente
                                                    </button>
                                                )}

                                                {topic.status !== 'flagged' && (
                                                    <button onClick={() => updateTopicStatus(topic.id, 'flagged')} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-[10px] font-black text-red-400 uppercase tracking-widest transition-all">
                                                        <Flag className="w-3 h-3" /> Sinalizar
                                                    </button>
                                                )}

                                                <button onClick={() => toggleTopicPin(topic)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${topic.is_pinned ? 'bg-amber-500/30 border border-amber-500/40 text-amber-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'}`}>
                                                    {topic.is_pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                                                    {topic.is_pinned ? 'Desafixar' : 'Fixar'}
                                                </button>

                                                <div className="ml-auto">
                                                    {deleteConfirm === topic.id ? (
                                                        <button onClick={() => deleteTopic(topic.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 rounded-lg text-[10px] font-black text-white uppercase tracking-widest animate-pulse">
                                                            <Trash2 className="w-3 h-3" /> Confirmar Exclusão
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => setDeleteConfirm(topic.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/40 rounded-lg text-[10px] font-black text-slate-400 hover:text-red-400 uppercase tracking-widest transition-all">
                                                            <Trash2 className="w-3 h-3" /> Excluir
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {filteredTopics.length === 0 && (
                                        <div className="text-center py-20">
                                            <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhum tópico encontrado</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ===== REPLIES TAB ===== */}
                        {activeTab === 'replies' && (
                            <div className="space-y-3 animate-in fade-in duration-500">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{replies.length} comentários recentes</p>
                                {replies.map(reply => (
                                    <div key={reply.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                                        <div className="flex items-start gap-4">
                                            <img src={reply.profile?.avatar_url} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" alt="" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-[10px] font-black text-white uppercase italic">{reply.profile?.username}</span>
                                                    <span className="text-[9px] text-slate-500 font-bold">{new Date(reply.created_at).toLocaleDateString('pt-BR')}</span>
                                                    <Link href={`/t/${reply.topic_id}`} className="text-[9px] text-blue-400 font-bold hover:underline ml-auto">
                                                        Ver Tópico →
                                                    </Link>
                                                </div>
                                                <p className="text-sm text-slate-300 font-medium leading-relaxed">{reply.content}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end mt-3 pt-3 border-t border-slate-800">
                                            {deleteConfirm === reply.id ? (
                                                <button onClick={() => deleteReply(reply.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 rounded-lg text-[10px] font-black text-white uppercase tracking-widest animate-pulse">
                                                    <Trash2 className="w-3 h-3" /> Confirmar Exclusão
                                                </button>
                                            ) : (
                                                <button onClick={() => setDeleteConfirm(reply.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/40 rounded-lg text-[10px] font-black text-slate-400 hover:text-red-400 uppercase tracking-widest transition-all">
                                                    <Trash2 className="w-3 h-3" /> Excluir Comentário
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {replies.length === 0 && (
                                    <div className="text-center py-20">
                                        <Activity className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhum comentário encontrado</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ===== USERS TAB ===== */}
                        {activeTab === 'users' && (
                            <div className="space-y-3 animate-in fade-in duration-500">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{users.length} membros cadastrados</p>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                    {users.map(user => (
                                        <div key={user.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                                            <img src={user.avatar_url} className="w-12 h-12 rounded-2xl object-cover flex-shrink-0 border border-slate-700" alt="" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-black text-white uppercase italic truncate">{user.username}</p>
                                                    {user.role === 'admin' && (
                                                        <span className="bg-red-500/20 text-red-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest flex-shrink-0">Admin</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[9px] text-slate-500 font-bold">Trust Score:</span>
                                                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                                                            style={{ width: `${Math.min(user.trust_score || 0, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[9px] text-slate-400 font-black">{user.trust_score || 0}</span>
                                                </div>
                                                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">
                                                    Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {users.length === 0 && (
                                    <div className="text-center py-20">
                                        <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhum usuário encontrado</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
