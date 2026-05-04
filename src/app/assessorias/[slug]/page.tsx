'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronLeft, MapPin, Instagram, Globe, Mail, Phone,
    User, CheckCircle2, Calendar, Trophy, MessageSquare,
    Star, ArrowRight, ShieldCheck
} from 'lucide-react';
import { MOCK_RUNNING_GROUPS } from '@/lib/mockData';

export default function AssessoriaDetail() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;

    const group = MOCK_RUNNING_GROUPS.find(g => g.slug === slug);

    if (!group) {
        return (
            <div className="p-20 text-center">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Assessoria não encontrada</p>
                <Link href="/assessorias" className="mt-4 inline-block text-blue-600 font-black uppercase text-[10px] underline">Voltar para a Lista</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Header */}
            <div className="relative bg-white rounded-none sm:rounded-[2.5rem] border-0 sm:border border-gray-100 sm:shadow-sm overflow-hidden">
                <div className="h-40 sm:h-48 lg:h-64 relative bg-gray-900">
                    <img
                        src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80"
                        className="w-full h-full object-cover opacity-60"
                        alt=""
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                    <button
                        onClick={() => router.back()}
                        className="absolute top-4 left-4 sm:top-6 sm:left-6 p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white hover:text-blue-600 transition-all border border-white/20 shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-5 sm:px-8 lg:px-12 pb-8 sm:pb-12 relative">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 -mt-14 sm:-mt-12 mb-8 text-center sm:text-left">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-[2rem] shadow-xl p-1.5 border border-gray-50 overflow-hidden shrink-0 relative z-10">
                            <img src={group.logo_url} className="w-full h-full object-cover rounded-[1.5rem]" alt={group.name} />
                        </div>
                        <div className="flex-1 pb-2 flex flex-col items-center sm:items-start">
                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-2">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-900 uppercase italic tracking-tighter leading-none">
                                    {group.name}
                                </h1>
                                <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">Verificada</span>
                            </div>
                            <div className="flex items-center gap-4 text-gray-500 font-bold text-xs sm:text-sm">
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-blue-500" />
                                    {group.location}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                            <a href="#" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-[10px] px-8 py-4 rounded-2xl transition-all shadow-lg active:scale-95">
                                <Phone className="w-4 h-4" />
                                WhatsApp
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
                        {/* Left Column: Content */}
                        <div className="lg:col-span-2 space-y-8 sm:space-y-10">
                            <section>
                                <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4 border-l-4 border-blue-600 pl-4 leading-none">Sobre a Assessoria</h2>
                                <p className="text-gray-600 text-base sm:text-lg font-medium leading-relaxed italic">
                                    {group.description}
                                </p>
                            </section>

                            <section>
                                <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-6 border-l-4 border-blue-600 pl-4 leading-none">Especialidades</h2>
                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                    {group.specialties.map((spec: string, i: number) => (
                                        <div key={i} className="flex items-center gap-2 sm:gap-3 bg-gray-50 px-4 py-3 sm:px-5 sm:py-4 rounded-2xl border border-gray-100 group hover:border-blue-300 transition-all w-full sm:w-auto">
                                            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                            <span className="font-black text-blue-900 uppercase italic tracking-tighter text-[10px] sm:text-xs truncate">{spec}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="bg-gray-50 p-6 sm:p-8 rounded-[2rem] border border-dashed border-gray-200">
                                <div className="flex items-center gap-4 mb-4 sm:mb-6">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center text-white ring-8 ring-blue-600/10 shrink-0">
                                        <User className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Treinador Responsável</p>
                                        <p className="text-base sm:text-lg font-black text-blue-900 uppercase italic tracking-tighter leading-none">{group.head_coach || 'Coordenação Técnica'}</p>
                                    </div>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
                                    Equipe multidisciplinar dedicada a acompanhar sua evolução, desde os primeiros passos até a linha de chegada das maiores provas do mundo.
                                </p>
                            </section>
                        </div>

                        {/* Right Column: Info Card */}
                        <div className="space-y-6">
                            <div className="bg-blue-50/50 p-6 sm:p-8 rounded-[2rem] border border-blue-100/50">
                                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6 text-center sm:text-left">Informações de Contato</h3>
                                <ul className="space-y-4 sm:space-y-6">
                                    <li className="flex items-center gap-3 sm:gap-4 group cursor-pointer">
                                        <div className="p-2.5 sm:p-3 bg-white rounded-xl text-gray-400 group-hover:text-pink-600 transition-colors shadow-sm shrink-0">
                                            <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Instagram</p>
                                            <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">{group.instagram_handle || '@' + group.slug}</p>
                                        </div>
                                    </li>
                                    <li className="flex items-center gap-3 sm:gap-4 group cursor-pointer">
                                        <div className="p-2.5 sm:p-3 bg-white rounded-xl text-gray-400 group-hover:text-blue-600 transition-colors shadow-sm shrink-0">
                                            <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Website</p>
                                            <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">{group.website_url || 'www.' + group.slug + '.com.br'}</p>
                                        </div>
                                    </li>
                                    <li className="flex items-center gap-3 sm:gap-4 group cursor-pointer">
                                        <div className="p-2.5 sm:p-3 bg-white rounded-xl text-gray-400 group-hover:text-blue-600 transition-colors shadow-sm shrink-0">
                                            <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">E-mail</p>
                                            <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">{group.contact_email || 'contato@' + group.slug + '.com.br'}</p>
                                        </div>
                                    </li>
                                </ul>

                                <button className="w-full mt-8 sm:mt-10 bg-blue-900 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-xl hover:bg-black transition-all shadow-lg active:scale-95">
                                    Solicitar Orçamento
                                </button>
                            </div>

                            <div className="bg-red-50 p-5 sm:p-6 rounded-[2rem] border border-red-100">
                                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
                                    <h4 className="text-[10px] font-black text-red-900 uppercase tracking-widest leading-none">Benefício BrasilPlus</h4>
                                </div>
                                <p className="text-[10px] sm:text-[11px] text-red-800/70 font-medium leading-relaxed uppercase italic">
                                    Membros BrasilPlus ganham **Isenção na Matrícula** e 10% de desconto na primeira mensalidade.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonials or Results Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        <h3 className="text-lg font-black text-blue-900 uppercase italic tracking-tighter">Próximos Desafios</h3>
                    </div>
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 font-black text-[10px] italic">0{i}</div>
                                    <div>
                                        <p className="text-sm font-black text-blue-900 uppercase italic">Maratona de SP</p>
                                        <p className="text-[9px] font-bold text-gray-400">ABRIL 2025</p>
                                    </div>
                                </div>
                                <span className="bg-green-100 text-green-600 text-[8px] font-black px-2 py-1 rounded-md uppercase">32 Inscritos</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-6 h-6 text-blue-500" />
                            <h3 className="text-lg font-black text-blue-900 uppercase italic tracking-tighter">O que dizem os atletas</h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-black text-gray-800">4.9</span>
                        </div>
                    </div>
                    <div className="p-5 bg-blue-50/30 rounded-2xl italic border border-blue-100/30 relative">
                        <Star className="absolute top-4 right-4 w-12 h-12 text-blue-600/5" />
                        <p className="text-gray-600 text-sm leading-relaxed mb-4 relative z-10">
                            "Treinar com a {group.name} mudou meu fôlego. O acompanhamento é realmente personalizado e os treinos presenciais no Ibirapuera são incríveis."
                        </p>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">— Rodrigo Silva, Maratonista</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
