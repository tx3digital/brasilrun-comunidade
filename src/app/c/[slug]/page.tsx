'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Community, Topic, Review, Product, Profile } from '@/lib/types';
import Link from 'next/link';
import { Footprints, Flag, Activity, AlertTriangle, MessageSquare, Users, Star, Loader2, Pin } from 'lucide-react';
import { MOCK_PROFILES, MOCK_REVIEWS, MOCK_PRODUCTS } from '@/lib/mockData';

type TabType = 'forum' | 'members' | 'reviews';

export default function CommunityDetail() {
    const params = useParams();
    const slug = params?.slug as string;
    const [activeTab, setActiveTab] = useState<TabType>('forum');
    const [community, setCommunity] = useState<Community | null>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCommunityAndTopics = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                // Fetch community
                const { data: commData, error: commError } = await supabase
                    .from('communities')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (commError) {
                    console.error('Error fetching community:', commError);
                    setCommunity(null);
                    return;
                }
                setCommunity(commData);

                if (commData) {
                    const now = new Date();
                    const thirtyDaysAgo = new Date(now);
                    thirtyDaysAgo.setDate(now.getDate() - 30);

                    const ninetyDaysAgo = new Date(now);
                    ninetyDaysAgo.setDate(now.getDate() - 90);

                    // Initial attempt with full filtering rules
                    let { data: topicsData, error: topicsError } = await supabase
                        .from('topics')
                        .select('*, profile:profiles(*)')
                        .eq('community_id', commData.id)
                        .or(`is_pinned.eq.true,and(reply_count.gte.10,created_at.gte.${ninetyDaysAgo.toISOString()}),created_at.gte.${thirtyDaysAgo.toISOString()}`)
                        .order('is_pinned', { ascending: false })
                        .order('created_at', { ascending: false });

                    // Fallback if reply_count column is missing or query fails
                    if (topicsError) {
                        console.warn('Advanced filtering failed, using fallback query:', topicsError.message);
                        const { data: fallbackData, error: fallbackError } = await supabase
                            .from('topics')
                            .select('*, profile:profiles(*)')
                            .eq('community_id', commData.id)
                            .or(`is_pinned.eq.true,created_at.gte.${thirtyDaysAgo.toISOString()}`)
                            .order('is_pinned', { ascending: false })
                            .order('created_at', { ascending: false });

                        if (fallbackError) throw fallbackError;
                        setTopics(fallbackData || []);
                    } else {
                        setTopics(topicsData || []);
                    }
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCommunityAndTopics();
    }, [slug]);

    const isPerformanceOrShoes = community?.slug === 'tenis-relogios-performance' || community?.slug === 'dicas-tenis';
    const isEvent = community?.slug === 'maratona-sp';

    const reviews = useMemo(() => {
        if (isPerformanceOrShoes) {
            const relevantProducts = MOCK_PRODUCTS.filter(p => p.category === 'tenis' || p.category === 'relogio');
            const productIds = relevantProducts.map(p => p.id);
            return MOCK_REVIEWS.filter(r => productIds.includes(r.product_id));
        }
        return [];
    }, [isPerformanceOrShoes]);

    const showReviewsTab = isPerformanceOrShoes || isEvent;

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!community) {
        return <div className="p-8 text-center">Comunidade não encontrada.</div>;
    }

    return (
        <div className="flex flex-col min-h-full bg-gray-50">
            <div className="p-6 space-y-2">
                <h1 className="text-3xl font-black text-blue-900 uppercase italic tracking-tighter leading-none">{community.name}</h1>
                <p className="text-xs text-gray-500 font-medium">{topics.length} tópicos ativos na comunidade.</p>
            </div>

            <div className="p-4 bg-white border-b border-gray-200 text-xs text-gray-600 font-medium">
                {community.description}
            </div>

            <div className="p-4 bg-white">
                <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                        <AlertTriangle className="w-16 h-16" />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="bg-amber-500 text-white p-1 rounded-lg">
                            <AlertTriangle className="w-3 h-3" />
                        </span>
                        <h3 className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Regras de Conduta</h3>
                    </div>
                    <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
                        Respeite os corredores e evite spam. Avaliações devem ser reais.
                    </p>
                </div>
            </div>

            <div className="flex bg-white sticky top-[56px] lg:top-[80px] z-40 shadow-sm overflow-x-auto scrollbar-hide border-b border-gray-100">
                <button onClick={() => setActiveTab('forum')} className={`flex-shrink-0 px-6 p-3 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'forum' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-400'}`}>
                    <MessageSquare className="w-3 h-3" />
                    Discussões
                </button>
                {showReviewsTab && (
                    <button onClick={() => setActiveTab('reviews')} className={`flex-shrink-0 px-6 p-3 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'reviews' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-400'}`}>
                        <Star className="w-3 h-3" />
                        Vitrine
                    </button>
                )}
                <button onClick={() => setActiveTab('members')} className={`flex-shrink-0 px-6 p-3 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'members' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-400'}`}>
                    <Users className="w-3 h-3" />
                    Corredores
                </button>
            </div>

            <div className="flex-1 p-4">
                {activeTab === 'forum' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Atividade Recente</h3>
                            <Link href={`/c/${community.slug}/new`} className="bg-green-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase shadow-lg">Criar Tópico</Link>
                        </div>
                        {topics.map(topic => (
                            <Link key={topic.id} href={`/t/${topic.id}`} className="block p-4 border rounded-2xl bg-white border-gray-100 hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-black text-gray-800 text-base italic leading-tight">{topic.title}</h4>
                                    {topic.is_pinned && (
                                        <Pin className="w-3 h-3 text-amber-500 fill-current rotate-45" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <img src={topic.profile?.avatar_url} alt="Avatar" className="w-5 h-5 rounded-full" />
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">por <span className="text-blue-600">{topic.profile?.username}</span></span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="space-y-4">
                        {reviews.map(review => (
                            <div key={review.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <img src={review.profile?.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full" />
                                        <div>
                                            <p className="text-[10px] font-black text-blue-900 uppercase leading-none">{review.profile?.username}</p>
                                            <div className="flex text-orange-400 text-[10px]">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                                        </div>
                                    </div>
                                </div>
                                <h4 className="text-sm font-black text-gray-800 uppercase italic">
                                    {MOCK_PRODUCTS.find(p => p.id === review.product_id)?.name}
                                </h4>
                                <p className="text-xs text-gray-600">"{review.content}"</p>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'members' && (
                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                        {MOCK_PROFILES.map(profile => (
                            <div key={profile.id} className="flex items-center gap-3 p-4 border-b border-gray-50">
                                <img src={profile.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                                <p className="font-bold text-gray-800">{profile.username}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
