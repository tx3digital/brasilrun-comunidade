'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft, CheckCircle2, MapPin, Calendar,
    Ticket, Info, User, Camera, Loader2, Flag,
    Dumbbell, Star
} from 'lucide-react';

export default function CadastroEventoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        date: '',
        city: '',
        state: '',
        category: '',
        description: '',
        price_from: '',
        organizer_name: '',
        official_website: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulação de insert no Supabase
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
        }, 1500);
    };

    if (submitted) {
        return (
            <div className="max-w-xl mx-auto py-20 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-black text-blue-900 uppercase italic tracking-tighter mb-4">Solicitação Enviada!</h1>
                <p className="text-gray-500 font-medium mb-10 px-8 text-lg">
                    Seu evento foi enviado para o nosso conselho editorial. Entraremos em contato para validar os detalhes técnicos e de segurança.
                </p>
                <Link href="/eventos" className="inline-block bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] px-10 py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all">
                    Voltar para o Calendário
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Nav */}
            <Link href="/eventos" className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-600 font-black uppercase tracking-widest text-[10px] mb-8 transition-colors group">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Voltar para o calendário
            </Link>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-slate-900 p-12 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="bg-blue-600 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-4 inline-block">Área do Organizador</span>
                        <h1 className="text-3xl lg:text-4xl font-black uppercase italic tracking-tighter mb-2 leading-none">Cadastrar Novo Evento</h1>
                        <p className="text-slate-400 font-medium max-w-sm">Coloque sua prova no mapa dos maiores corredores do país.</p>
                    </div>
                    <Flag className="absolute -right-6 -bottom-6 w-48 h-48 text-white/5 -rotate-12" />
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-12">
                    {/* Event Detail */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-4">
                            <Info className="w-5 h-5 text-blue-600" />
                            <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest">Detalhes da Prova</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nome Oficial da Prova</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Ex: Maratona de Verão 2025"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Data do Evento</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-12 text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="Ex: 24 AGO 2025"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Distâncias (Categorias)</label>
                                    <div className="relative">
                                        <Dumbbell className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-12 text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="Ex: 42K | 21K | 10K"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Descrição e Diferenciais</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Descreva o percurso, tipo de terreno, premiação e o que o atleta pode esperar..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Logistics */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-4">
                                <MapPin className="w-5 h-5 text-blue-600" />
                                <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest">Localização</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Cidade"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                />
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="UF (Estado)"
                                    value={formData.state}
                                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-4">
                                <Ticket className="w-5 h-5 text-blue-600" />
                                <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest">Valores</h2>
                            </div>
                            <div>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Preço inicial (Ex: R$ 99,00)"
                                    value={formData.price_from}
                                    onChange={e => setFormData({ ...formData, price_from: e.target.value })}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Organizer */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-4">
                            <User className="w-5 h-5 text-blue-600" />
                            <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest">Dados do Produtor</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input
                                required
                                type="text"
                                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                                placeholder="Nome da Empresa / Organizador"
                                value={formData.organizer_name}
                                onChange={e => setFormData({ ...formData, organizer_name: e.target.value })}
                            />
                            <input
                                type="url"
                                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                                placeholder="Site Oficial da Prova"
                                value={formData.official_website}
                                onChange={e => setFormData({ ...formData, official_website: e.target.value })}
                            />
                        </div>
                    </section>

                    {/* Quality Warning */}
                    <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex items-start gap-4">
                        <Star className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                        <div>
                            <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1">BrasilRun Editorial</h4>
                            <p className="text-xs text-amber-800/80 font-medium leading-relaxed">
                                Para garantir a melhor experiência da nossa comunidade, todos os eventos passam por uma curadoria técnica antes de serem aprovados no calendário.
                            </p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-6 rounded-[2.5rem] shadow-2xl shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Processando Cadastro...</>
                        ) : (
                            'Publicar Evento no Calendário'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
