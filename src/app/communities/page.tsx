'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Community } from '@/lib/types';
import { Search, Footprints, Flag, Activity, Lightbulb, Loader2 } from 'lucide-react';

export default function Communities() {
    const [filter, setFilter] = useState('');
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCommunities = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('communities')
                    .select('*, topics(count)')
                    .order('name');
                if (error) throw error;
                // Mapeia a contagem real de tópicos
                const withRealCount = (data || []).map((c: any) => ({
                    ...c,
                    topic_count: c.topics?.[0]?.count ?? 0,
                }));
                setCommunities(withRealCount);
            } catch (err) {
                console.error('Error fetching communities:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCommunities();
    }, []);

    const filteredCommunities = useMemo(() => {
        return communities.filter(c =>
            c.name.toLowerCase().includes(filter.toLowerCase()) ||
            c.description.toLowerCase().includes(filter.toLowerCase())
        );
    }, [filter, communities]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-full pb-10">
            <div className="p-6 space-y-2">
                <h1 className="text-3xl font-black text-blue-900 uppercase italic tracking-tighter leading-none">Comunidades</h1>
                <p className="text-xs text-gray-500 font-medium">Encontre sua tribo no asfalto ou na trilha.</p>
            </div>

            <div className="p-4 sticky top-[56px] z-30 bg-gray-50/80 backdrop-blur-md">
                <div className="relative">
                    <input
                        type="text"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Filtrar por nome ou tema..."
                        className="w-full p-4 pl-12 bg-white border border-gray-100 rounded-3xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                    />
                    <Search className="w-6 h-6 absolute left-4 top-4 text-gray-300" />
                </div>
            </div>

            <div className="p-4 space-y-4">
                {filteredCommunities.map((community, idx) => (
                    <Link
                        key={community.id}
                        href={`/c/${community.slug}`}
                        className="group flex items-center p-4 bg-white border border-gray-100 rounded-3xl hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100/50 transition-all active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4"
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
                                <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{community.topic_count || 0} tópicos</span>
                                <span className="h-1 w-1 bg-gray-200 rounded-full"></span>
                                <span className="truncate">Criado em {new Date(community.created_at).toLocaleDateString('pt-BR', { year: '2-digit', month: 'short' })}</span>
                            </div>
                        </div>
                    </Link>
                ))}

                {filteredCommunities.length === 0 && (
                    <div className="text-center py-20">
                        <Search className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest italic">Nenhuma comunidade encontrada com esse termo.</p>
                    </div>
                )}
            </div>

            <div className="p-8 text-center">
                <button className="bg-green-500 text-white px-8 py-4 rounded-3xl font-black uppercase italic tracking-tighter shadow-lg shadow-green-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto">
                    <Lightbulb className="w-5 h-5" />
                    Sugira uma nova comunidade
                </button>
            </div>
        </div>
    );
}
