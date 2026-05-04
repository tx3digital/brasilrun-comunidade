'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft, CheckCircle2, MapPin, Instagram, Globe,
    Mail, Phone, User, Tag, Camera, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function RegisterAssessoriaPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        city: '',
        state: '',
        head_coach: '',
        contact_email: '',
        contact_phone: '',
        instagram_handle: '',
        website_url: '',
        specialties: [] as string[]
    });

    const specialtiesOptions = [
        'Maratona', 'Meia Maratona', 'Iniciantes', 'Trail Run',
        'Performance', 'Saúde & Bem-estar', 'Triathlon', 'Crianças'
    ];

    const toggleSpecialty = (spec: string) => {
        setFormData(prev => ({
            ...prev,
            specialties: prev.specialties.includes(spec)
                ? prev.specialties.filter(s => s !== spec)
                : [...prev.specialties, spec]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('running_groups')
                .insert([{
                    name: formData.name,
                    description: formData.description,
                    city: formData.city,
                    state: formData.state,
                    location: `${formData.city}, ${formData.state}`,
                    head_coach: formData.head_coach,
                    contact_email: formData.contact_email,
                    contact_phone: formData.contact_phone,
                    instagram_handle: formData.instagram_handle,
                    website_url: formData.website_url,
                    specialties: formData.specialties,
                    status: 'pending',
                    slug: formData.name
                        .toLowerCase()
                        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9\s-]/g, '')
                        .trim()
                        .replace(/\s+/g, '-'),
                }]);

            if (error) {
                console.error('Erro ao cadastrar assessoria:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code,
                });
                alert(`Erro ao enviar cadastro: ${error.message}`);
                return;
            }

            setSubmitted(true);
        } catch (err: any) {
            console.error('Erro inesperado:', err?.message || err);
            alert('Erro inesperado ao enviar o cadastro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="max-w-xl mx-auto py-20 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-black text-blue-900 uppercase italic tracking-tighter mb-4">Cadastro Enviado!</h1>
                <p className="text-gray-500 font-medium mb-10 px-8">
                    Sua assessoria foi enviada para análise. Em breve ela aparecerá no diretório oficial do BrasilRun.
                </p>
                <Link href="/assessorias" className="inline-block bg-blue-600 text-white font-black uppercase tracking-widest text-xs px-10 py-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-all">
                    Voltar para a Lista
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Nav */}
            <Link href="/assessorias" className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-600 font-black uppercase tracking-widest text-[10px] mb-8 transition-colors group">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Voltar para assessorias
            </Link>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-blue-600 p-10 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Cadastrar Assessoria</h1>
                        <p className="text-blue-100 font-medium">Junte-se à maior rede de corredores do Brasil.</p>
                    </div>
                    <Camera className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10 -rotate-12" />
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-10">
                    {/* Basic Info */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-4">
                            <Tag className="w-5 h-5 text-blue-600" />
                            <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest">Informações Básicas</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nome da Assessoria</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Ex: Velocidade Máxima"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Descrição da Equipe</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Conte um pouco sobre a metodologia, história e diferencial da sua assessoria..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Location & Team */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-4">
                                <MapPin className="w-5 h-5 text-blue-600" />
                                <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest">Localização</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cidade</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="Ex: São Paulo"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Estado</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="SP"
                                        value={formData.state}
                                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-4">
                                <User className="w-5 h-5 text-blue-600" />
                                <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest">Equipe</h2>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Treinador Principal (Head Coach)</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Nome completo"
                                    value={formData.head_coach}
                                    onChange={e => setFormData({ ...formData, head_coach: e.target.value })}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Specialties */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-4">
                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                            <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest">Especialidades</h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {specialtiesOptions.map(spec => (
                                <button
                                    key={spec}
                                    type="button"
                                    onClick={() => toggleSpecialty(spec)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${formData.specialties.includes(spec) ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200'}`}
                                >
                                    {spec}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Contact & Social */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-4">
                            <Phone className="w-5 h-5 text-blue-600" />
                            <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest">Contato & Social</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Instagram</label>
                                <div className="relative">
                                    <Instagram className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-12 text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="@assessoria"
                                        value={formData.instagram_handle}
                                        onChange={e => setFormData({ ...formData, instagram_handle: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Website</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                                    <input
                                        type="url"
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-12 text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="https://www.site.com.br"
                                        value={formData.website_url}
                                        onChange={e => setFormData({ ...formData, website_url: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">E-mail Comercial</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-12 text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="contato@empresa.com.br"
                                        value={formData.contact_email}
                                        onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Telefone / WhatsApp</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-12 text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="(00) 00000-0000"
                                        value={formData.contact_phone}
                                        onChange={e => setFormData({ ...formData, contact_phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-6 rounded-[2rem] shadow-xl shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</>
                        ) : (
                            'Enviar para Análise Oficial'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
