'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Footprints, Flag, Activity, Lightbulb } from 'lucide-react';
import { MOCK_COMMUNITIES } from '@/lib/mockData';

export default function Communities() {
    const [filter, setFilter] = useState('');

    const filteredCommunities = useMemo(() => {
        return MOCK_COMMUNITIES.filter(c =>
            c.name.toLowerCase().includes(filter.toLowerCase()) ||
            c.description.toLowerCase().includes(filter.toLowerCase())
        );
    }, [filter]);

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
                        className="group block p-5 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-blue-200 transition-all animate-in fade-in slide-in-from-bottom-4"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                                {community.slug.includes('tenis') ? <Footprints className="w-8 h-8" /> : community.slug.includes('maratona') ? <Flag className="w-8 h-8" /> : <Activity className="w-8 h-8" />}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-black text-blue-900 uppercase italic leading-none mb-2">{community.name}</h3>
                                <p className="text-xs text-gray-500 font-medium leading-tight line-clamp-2">{community.description}</p>

                                <div className="mt-4 flex items-center gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                                        {community.topic_count || 0} Tópicos
                                    </span>
                                    <span className="text-[10px] font-black uppercase text-gray-300">
                                        Criado em {new Date(community.created_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' })}
                                    </span>
                                </div>
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
