'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Topic, Reply, Community } from '@/lib/types';
import Link from 'next/link';
import { Heart, Zap, Sparkles, Send, Loader2, Pin, PinOff } from 'lucide-react';

export default function TopicDetail() {
    const params = useParams();
    const id = params?.id as string;
    const [topic, setTopic] = useState<Topic | null>(null);
    const [community, setCommunity] = useState<Community | null>(null);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [loading, setLoading] = useState(true);
    const [newReply, setNewReply] = useState('');
    const [isLiking, setIsLiking] = useState(false);
    const [hasLiked, setHasLiked] = useState(false);
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    // Chave para rastrear likes no localStorage (evita duplo clique)
    const likeKey = `liked_topic_${id}`;

    const formatRelativeTime = (dateStr: string) => {
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
        if (diff < 60) return 'agora mesmo';
        if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
        return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    useEffect(() => {
        const fetchTopicData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const { data: topicData, error: topicError } = await supabase
                    .from('topics')
                    .select('*, profile:profiles(*)')
                    .eq('id', id)
                    .single();

                if (topicError) throw topicError;
                setTopic(topicData);

                if (topicData) {
                    const { data: commData } = await supabase
                        .from('communities')
                        .select('*')
                        .eq('id', topicData.community_id)
                        .single();
                    setCommunity(commData);

                    const { data: repliesData, error: repliesError } = await supabase
                        .from('replies')
                        .select('*, profile:profiles(*)')
                        .eq('topic_id', id)
                        .eq('status', 'approved')
                        .order('created_at', { ascending: true });

                    if (repliesError) {
                        const { data: fallbackReplies } = await supabase
                            .from('replies')
                            .select('*, profile:profiles(*)')
                            .eq('topic_id', id)
                            .order('created_at', { ascending: true });
                        setReplies(fallbackReplies || []);
                    } else {
                        setReplies(repliesData || []);
                    }
                }
            } catch (err) {
                console.error('Error fetching topic:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTopicData();
    }, [id]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setHasLiked(localStorage.getItem(likeKey) === 'true');
        }
    }, [likeKey]);

    const currentUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('brasilrun_user') || 'null') : null;
    const isAdmin = currentUser?.role === 'admin';

    const togglePin = async () => {
        if (!isAdmin || !topic) return;
        try {
            const { error } = await supabase
                .from('topics')
                .update({ is_pinned: !topic.is_pinned })
                .eq('id', topic.id);
            if (error) throw error;
            setTopic({ ...topic, is_pinned: !topic.is_pinned });
        } catch (err) {
            console.error('Error toggling pin:', err);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReply.trim() || isSubmittingReply || !topic) return;

        setIsSubmittingReply(true);
        try {
            const savedUser = localStorage.getItem('brasilrun_user');
            const user = savedUser ? JSON.parse(savedUser) : null;

            if (!user) {
                alert('Você precisa estar logado para responder.');
                return;
            }

            const payload = {
                topic_id: topic.id,
                user_id: user.id,
                content: newReply.trim(),
                status: 'pending' as const,
            };

            // Try insert + select (may be blocked by RLS SELECT policy)
            const { data, error } = await supabase
                .from('replies')
                .insert([payload])
                .select('*, profile:profiles(*)')
                .single();

            if (error) {
                // Surface the real Supabase error for debugging
                console.error('Supabase reply error:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code,
                });

                // RLS blocks SELECT but INSERT may have succeeded — try plain insert
                const { error: insertErr } = await supabase
                    .from('replies')
                    .insert([payload]);

                if (insertErr) {
                    console.error('Plain insert failed:', insertErr.message, insertErr.hint);
                    alert(`Erro ao enviar: ${insertErr.message || 'Verifique as políticas RLS da tabela replies no Supabase.'}`);
                    return;
                }

                // Optimistic UI
                const optimistic = {
                    id: `local-${Date.now()}`,
                    ...payload,
                    likes_count: 0,
                    created_at: new Date().toISOString(),
                    profile: {
                        id: user.id,
                        username: user.username,
                        avatar_url: user.avatar_url,
                        created_at: new Date().toISOString(),
                        trust_score: user.trust_score ?? 80,
                    },
                };
                setReplies(prev => [...prev, optimistic]);
                setNewReply('');
                return;
            }

            setReplies(prev => [...prev, data]);
            setNewReply('');
        } catch (err: any) {
            const msg = err?.message ?? err?.code ?? JSON.stringify(err);
            console.error('Error submitting reply:', msg);
            alert(`Erro ao enviar resposta.\n\n${err?.message || err?.hint || 'Verifique as políticas RLS da tabela replies no Supabase.'}`);
        } finally {
            setIsSubmittingReply(false);
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!topic) {
        return <div className="p-8 text-center font-bold text-gray-400 uppercase tracking-widest py-32">Tópico não encontrado.</div>;
    }

    return (
        <div className="pb-32 bg-gray-50 min-h-screen">
            <div className="bg-blue-600 p-2 px-4 text-[10px] text-white font-black uppercase tracking-widest flex items-center gap-2">
                <Link href="/" className="hover:underline">BrasilRun</Link>
                <span>&raquo;</span>
                <Link href={`/c/${community?.slug}`} className="hover:underline">{community?.name}</Link>
            </div>

            <div className="bg-white p-6 border-b border-gray-200 shadow-sm mb-4 space-y-2">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <img src={topic.profile?.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-blue-50 shadow-sm" />
                        <div>
                            <h3 className="text-sm font-black text-blue-900 uppercase italic leading-none">{topic.profile?.username}</h3>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Autor do Tópico</span>
                        </div>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={togglePin}
                            className={`p-2 rounded-full transition-all ${topic.is_pinned ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400 hover:bg-amber-50 hover:text-amber-500'}`}
                            title={topic.is_pinned ? "Desafixar tópico" : "Fixar tópico (Tempo Indeterminado)"}
                        >
                            {topic.is_pinned ? <PinOff className="w-5 h-5" /> : <Pin className="w-5 h-5" />}
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {topic.is_pinned && (
                        <span className="bg-amber-100 text-amber-600 text-[8px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Pin className="w-2 h-2" /> Tópico Fixado
                        </span>
                    )}
                    <h1 className="text-3xl font-black text-blue-900 leading-tight italic uppercase tracking-tighter">{topic.title}</h1>
                </div>
                <p className="text-xs text-gray-500 font-medium">Discussão iniciada na comunidade {community?.name}.</p>

                <div className="pt-4">
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">{topic.content}</p>
                </div>

                <div className="mt-8 flex items-center justify-between gap-3">
                    <button
                        onClick={async () => {
                            if (hasLiked || isLiking || !topic) return;
                            setIsLiking(true);
                            try {
                                const newCount = (topic.likes_count || 0) + 1;
                                const { error } = await supabase
                                    .from('topics')
                                    .update({ likes_count: newCount })
                                    .eq('id', topic.id);
                                if (!error) {
                                    setTopic({ ...topic, likes_count: newCount });
                                    setHasLiked(true);
                                    localStorage.setItem(likeKey, 'true');
                                }
                            } finally {
                                setIsLiking(false);
                            }
                        }}
                        disabled={hasLiked || isLiking}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            hasLiked
                                ? 'bg-red-50 text-red-600 border border-red-100 cursor-default'
                                : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-red-50 hover:text-red-500'
                        }`}
                    >
                        <Heart className={`w-3 h-3 ${hasLiked ? 'fill-current' : ''}`} />
                        <span>{topic.likes_count || 0} Gostei</span>
                    </button>
                </div>
            </div>

            <div className="px-4 space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    Comentários <span className="h-0.5 bg-gray-200 flex-1"></span>
                </h4>

                {replies.map(reply => (
                    <div key={reply.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 mb-2">
                            <img src={reply.profile?.avatar_url} alt="Avatar" className="w-6 h-6 rounded-full border border-blue-50" />
                            <span className="text-[10px] font-black text-blue-800 uppercase italic tracking-tighter">{reply.profile?.username}</span>
                        </div>
                        <p className="text-sm text-gray-700 font-medium leading-relaxed">{reply.content}</p>
                        <p className="text-[9px] text-gray-300 font-bold mt-2 text-right">{formatRelativeTime(reply.created_at)}</p>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 p-4 pb-24 shadow-2xl z-50">
                <form onSubmit={handleReply} className="flex items-center gap-2">
                    <input
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="Sua resposta..."
                        className="flex-1 p-4 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    />
                    <button type="submit" disabled={isSubmittingReply} className="bg-blue-600 text-white p-4 rounded-2xl font-black border border-blue-700">
                        <Send className="w-5 h-5" strokeWidth={3} />
                    </button>
                </form>
            </div>
        </div>
    );
}
