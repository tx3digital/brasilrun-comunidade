'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Instagram, Globe, Plus, Search, ChevronRight } from 'lucide-react';
import { MOCK_RUNNING_GROUPS } from '@/lib/mockData';

export default function AssessoriasPage() {
    return (
        <div className="p-4 sm:p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-blue-900 uppercase italic tracking-tighter mb-2">Assessorias de Corrida</h1>
                    <p className="text-gray-500 font-medium">Encontre a equipe ideal para transformar seus treinos e alcançar seus objetivos.</p>
                </div>
                <Link
                    href="/assessorias/register"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-xs px-6 py-4 rounded-2xl transition-all shadow-lg active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Cadastrar minha Assessoria
                </Link>
            </div>

            {/* Content List */}
            <div className="grid grid-cols-1 gap-4">
                {MOCK_RUNNING_GROUPS.map((group, idx) => (
                    <Link
                        key={group.id}
                        href={`/assessorias/${group.slug}`}
                        className="group flex items-center p-4 bg-white border border-gray-100 rounded-3xl hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100/50 transition-all active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 overflow-hidden border border-gray-100 p-0.5">
                            <img
                                src={group.logo_url}
                                alt={group.name}
                                className="w-full h-full object-cover rounded-[14px]"
                            />
                        </div>
                        <div className="flex-1 min-w-0 ml-4">
                            <h3 className="font-black text-blue-900 truncate uppercase italic leading-none mb-1">{group.name}</h3>
                            <p className="text-xs text-gray-500 line-clamp-1 leading-tight font-medium">
                                {group.description}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full truncate shrink-0 max-w-[100px] sm:max-w-none">{group.specialties[0]}</span>
                                <span className="h-1 w-1 bg-gray-200 rounded-full shrink-0"></span>
                                <span className="truncate">{group.location.split(',')[0]}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Info Section */}
            <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl">
                <div className="relative z-10 max-w-2xl">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Sua assessoria não está aqui?</h3>
                    <p className="text-blue-100 font-medium mb-8 leading-relaxed">
                        Faça parte do maior diretório de assessorias de corrida do Brasil. Aumente sua visibilidade e conecte-se com novos atletas que buscam orientação profissional.
                    </p>
                    <Link href="/assessorias/register" className="inline-block bg-white text-blue-600 font-black uppercase tracking-widest text-sm px-8 py-4 rounded-2xl hover:bg-green-500 hover:text-white transition-all shadow-xl">
                        Começar Cadastro Gratuito
                    </Link>
                </div>
                <MapPin className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 -rotate-12 group-hover:scale-110 transition-transform duration-700" />
            </div>
        </div>
    );
}
