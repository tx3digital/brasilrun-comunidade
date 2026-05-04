'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Search, ChevronRight, Plus, Tag, SlidersHorizontal, X } from 'lucide-react';
import { MOCK_EVENTS } from '@/lib/mockData';

// ── Month helpers ─────────────────────────────────────────────────────────────
const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const parseEventDate = (dateStr: string): { month: number; year: number } | null => {
    const parts = dateStr.trim().split(' ');
    if (parts.length < 3) return null;
    const monthPT: Record<string, number> = {
        JAN: 0, FEV: 1, MAR: 2, ABR: 3, MAI: 4, JUN: 5,
        JUL: 6, AGO: 7, SET: 8, OUT: 9, NOV: 10, DEZ: 11,
    };
    const month = monthPT[parts[1].toUpperCase()];
    const year = parseInt(parts[2], 10);
    return month !== undefined && !isNaN(year) ? { month, year } : null;
};

const buildMonthOptions = () => {
    const seen = new Set<string>();
    MOCK_EVENTS.forEach(e => {
        const d = parseEventDate(e.date);
        if (d) seen.add(`${d.year}-${String(d.month).padStart(2, '0')}`);
    });
    return Array.from(seen).sort().map(key => {
        const [y, m] = key.split('-');
        return { key, label: `${MONTH_LABELS[parseInt(m, 10)]} ${y}`, month: parseInt(m, 10), year: parseInt(y, 10) };
    });
};

const CATEGORIES = ['Todos', 'Maratona', 'Meia Maratona', 'Trail Run', 'Asfalto'];

export default function EventosPage() {
    const monthOptions = buildMonthOptions();
    const nowKey = `${new Date().getFullYear()}-${String(new Date().getMonth()).padStart(2, '0')}`;
    const defaultMonthKey = monthOptions.find(m => m.key === nowKey) ? nowKey : 'all';

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [activeMonthKey, setActiveMonthKey] = useState(defaultMonthKey);

    const monthScrollRef = useRef<HTMLDivElement>(null);
    const activeMonthBtnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (activeMonthBtnRef.current && monthScrollRef.current) {
            const container = monthScrollRef.current;
            const btn = activeMonthBtnRef.current;
            container.scrollTo({ left: btn.offsetLeft - container.offsetWidth / 2 + btn.offsetWidth / 2, behavior: 'smooth' });
        }
    }, []);

    const filtered = MOCK_EVENTS.filter(event => {
        const q = searchQuery.toLowerCase();
        if (q && ![event.title, event.city, event.state, event.location].some(f => f.toLowerCase().includes(q))) return false;
        if (activeCategory !== 'Todos') {
            const cats = event.category.split('|').map(c => c.trim().toLowerCase());
            if (!cats.some(c => c.includes(activeCategory.toLowerCase()))) return false;
        }
        if (activeMonthKey !== 'all') {
            const d = parseEventDate(event.date);
            if (!d) return false;
            if (`${d.year}-${String(d.month).padStart(2, '0')}` !== activeMonthKey) return false;
        }
        return true;
    });

    const hasFilters = activeMonthKey !== 'all' || activeCategory !== 'Todos' || searchQuery !== '';
    const clearAll = () => { setActiveMonthKey('all'); setActiveCategory('Todos'); setSearchQuery(''); };
    const activeCount = [activeMonthKey !== 'all', activeCategory !== 'Todos', searchQuery !== ''].filter(Boolean).length;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-blue-900 uppercase italic tracking-tighter mb-2">Calendário de Provas</h1>
                    <p className="text-gray-500 font-medium max-w-lg">Planeje sua temporada com as melhores corridas de rua e trilha do Brasil.</p>
                </div>
                <Link href="/eventos/cadastro" className="relative z-10 inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] px-8 py-5 rounded-2xl transition-all shadow-xl active:scale-95">
                    <Plus className="w-5 h-5" />
                    Sou Organizador e quero Cadastrar
                </Link>
                <div className="absolute right-0 top-0 w-64 h-64 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-0 opacity-50" />
            </div>

            {/* ══════════════════════════════════════════════════════════
                PAINEL DE FILTROS UNIFICADO
            ══════════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">

                {/* Topo do painel: título + limpar */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-blue-500" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-gray-700">Filtros</span>
                        {hasFilters && (
                            <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                                {activeCount} {activeCount === 1 ? 'ativo' : 'ativos'}
                            </span>
                        )}
                    </div>
                    {hasFilters && (
                        <button
                            onClick={clearAll}
                            className="flex items-center gap-1 text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                            Limpar tudo
                        </button>
                    )}
                </div>

                {/* Busca */}
                <div className="px-5 pb-4">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Pesquisar prova, cidade ou estado..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-9 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all outline-none"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Separador */}
                <div className="h-px bg-gray-50 mx-5" />

                {/* Filtro por mês */}
                <div className="px-5 py-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> Mês
                    </p>
                    <div
                        ref={monthScrollRef}
                        className="flex gap-2 overflow-x-auto pb-0.5"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {/* Pill "Todos" */}
                        <button
                            ref={activeMonthKey === 'all' ? activeMonthBtnRef : undefined}
                            onClick={() => setActiveMonthKey('all')}
                            className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                ${activeMonthKey === 'all'
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                                    : 'bg-gray-50 text-gray-400 border border-gray-100 hover:border-blue-200 hover:text-blue-500'}`}
                        >
                            Todos
                        </button>
                        {monthOptions.map(opt => (
                            <button
                                key={opt.key}
                                ref={activeMonthKey === opt.key ? activeMonthBtnRef : undefined}
                                onClick={() => setActiveMonthKey(opt.key)}
                                className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                                    ${activeMonthKey === opt.key
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                                        : 'bg-gray-50 text-gray-400 border border-gray-100 hover:border-blue-200 hover:text-blue-500'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Separador */}
                <div className="h-px bg-gray-50 mx-5" />

                {/* Filtro por modalidade */}
                <div className="px-5 py-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Modalidade</p>
                    <div className="flex gap-2 flex-wrap">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                    ${activeCategory === cat
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                                        : 'bg-gray-50 text-gray-400 border border-gray-100 hover:border-blue-200 hover:text-blue-500'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Rodapé do painel: contador de resultados */}
                <div className="bg-gray-50 border-t border-gray-100 px-5 py-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {filtered.length} {filtered.length === 1 ? 'prova encontrada' : 'provas encontradas'}
                    </span>
                </div>
            </div>
            {/* ══════════════════════════════════════════════════════════ */}

            {/* ── Lista de eventos ───────────────────────────────────── */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[2.5rem] border border-gray-100">
                    <Calendar className="w-12 h-12 text-blue-100 mb-4" />
                    <p className="text-sm font-black text-gray-300 uppercase tracking-widest">Nenhuma prova encontrada</p>
                    <p className="text-xs text-gray-300 mt-1">Tente outro mês, modalidade ou termo de busca.</p>
                    <button onClick={clearAll} className="mt-6 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">
                        Ver todas as provas
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filtered.map(event => (
                        <Link
                            key={event.id}
                            href={`/eventos/${event.slug}`}
                            className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row hover:border-blue-400 transition-all active:scale-[0.99]"
                        >
                            <div className="relative w-full md:w-80 h-48 md:h-auto overflow-hidden shrink-0">
                                <img src={event.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={event.title} />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/50 shadow-xl">
                                    <p className="text-[10px] font-black text-blue-900 leading-none">{event.date.split(' ')[0]}</p>
                                    <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest leading-none mt-0.5">{event.date.split(' ').slice(1).join(' ')}</p>
                                </div>
                            </div>
                            <div className="flex-1 p-8 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-md">{event.category}</span>
                                        <span className="text-[10px] font-bold text-gray-400 italic">Organizado por {event.organizer_name}</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-blue-900 uppercase italic tracking-tighter mb-2 group-hover:text-blue-600 transition-colors">{event.title}</h3>
                                    <div className="flex items-center gap-4 text-gray-500 text-xs font-medium">
                                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-500" />{event.location}</span>
                                    </div>
                                    <p className="mt-4 text-gray-400 text-sm font-medium line-clamp-2 leading-relaxed">{event.description}</p>
                                </div>
                                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-50">
                                    <div>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Inscrições a partir de</p>
                                        <p className="text-xl font-black text-blue-900 italic tracking-tighter">{event.price_from}</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-blue-600 text-white font-black uppercase tracking-widest text-[9px] px-6 py-4 rounded-xl shadow-lg transition-all group-hover:bg-blue-700">
                                        Ver Detalhes <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* ── Bottom CTA ─────────────────────────────────────────── */}
            <div className="bg-slate-900 p-12 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Vantagem BrasilPlus</h3>
                    <p className="text-slate-400 font-medium max-w-md">Membros premium têm cashback em todas as inscrições via BrasilRun e acesso a largadas antecipadas.</p>
                </div>
                <div className="relative z-10 flex gap-4">
                    <button className="bg-blue-600 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl">Conhecer BrasilPlus</button>
                    <Link href="/eventos/cadastro" className="bg-white/10 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-2xl hover:bg-white/20 transition-all border border-white/10">Seja Parceiro</Link>
                </div>
                <Tag className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 -rotate-12" />
            </div>
        </div>
    );
}
