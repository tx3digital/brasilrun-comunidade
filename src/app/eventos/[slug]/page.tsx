'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronLeft, MapPin, Trophy, Ticket,
    Share2, Map as MapIcon, Info, Bell, Star,
    Activity, CheckCircle2, Users, Clock, Droplets, Package,
    Heart, ThumbsUp, ThumbsDown, X, Send, CheckCircle, Loader2
} from 'lucide-react';
import { MOCK_EVENTS } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';
import { Review } from '@/lib/types';

export default function EventoDetail() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;

    const event = MOCK_EVENTS.find(e => e.slug === slug);
    
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());

    const [newReview, setNewReview] = useState({
        rating: 5,
        content: '',
        pros: '',
        cons: '',
    });

    useEffect(() => {
        const fetchReviews = async () => {
            if (!slug) return;
            setLoadingReviews(true);
            try {
                const { data, error } = await supabase
                    .from('reviews')
                    .select('*, profile:profiles(*)')
                    .eq('target_id', slug)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setReviews(data || []);
            } catch (err) {
                console.warn('Erro ao buscar reviews:', err);
            } finally {
                setLoadingReviews(false);
            }
        };

        fetchReviews();
    }, [slug]);

    const handleSubmitReview = async () => {
        if (!newReview.content.trim()) return;

        const savedUser = localStorage.getItem('brasilrun_user');
        if (!savedUser) {
            router.push('/auth');
            return;
        }

        const user = JSON.parse(savedUser);

        try {
            const { data, error } = await supabase
                .from('reviews')
                .insert([{
                    target_id: slug,
                    user_id: user.id,
                    rating: newReview.rating,
                    content: newReview.content,
                    pros: newReview.pros,
                    cons: newReview.cons,
                    likes_count: 0
                }])
                .select('*, profile:profiles(*)')
                .single();

            if (error) throw error;

            setReviews(prev => [data, ...prev]);
            setReviewSubmitted(true);
            setNewReview({ rating: 5, content: '', pros: '', cons: '' });
            
            setTimeout(() => {
                setShowReviewForm(false);
                setReviewSubmitted(false);
            }, 2000);
        } catch (err) {
            console.error('Erro ao salvar review:', err);
            alert('Erro ao salvar sua avaliação.');
        }
    };

    const toggleLike = (reviewId: string) => {
        setLikedReviews(prev => {
            const next = new Set(prev);
            if (next.has(reviewId)) {
                next.delete(reviewId);
                setReviews(rs => rs.map(r => r.id === reviewId ? { ...r, likes_count: (r.likes_count || 0) - 1 } : r));
            } else {
                next.add(reviewId);
                setReviews(rs => rs.map(r => r.id === reviewId ? { ...r, likes_count: (r.likes_count || 0) + 1 } : r));
            }
            return next;
        });
    };

    if (!event) {
        return (
            <div className="p-20 text-center">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Evento não encontrado</p>
                <Link href="/eventos" className="mt-4 inline-block text-blue-600 font-black uppercase text-[10px] underline">Voltar para o Calendário</Link>
            </div>
        );
    }

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* ── Hero Banner ─────────────────────────────────────── */}
            <div className="relative rounded-[2rem] overflow-hidden h-56 bg-gray-900">
                <img
                    src={event.banner_url || event.image_url}
                    className="w-full h-full object-cover opacity-75"
                    alt={event.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Top actions */}
                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 p-2.5 bg-black/30 backdrop-blur-md rounded-xl text-white hover:bg-white hover:text-blue-600 transition-all border border-white/20"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="absolute top-4 right-4 flex gap-2">
                    <button className="p-2.5 bg-black/30 backdrop-blur-md rounded-xl text-white hover:bg-white hover:text-blue-600 transition-all border border-white/20">
                        <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-2.5 bg-black/30 backdrop-blur-md rounded-xl text-white hover:bg-white hover:text-blue-600 transition-all border border-white/20">
                        <Bell className="w-4 h-4" />
                    </button>
                </div>

                {/* Title over hero */}
                <div className="absolute bottom-5 left-5 right-5">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
                            {event.category}
                        </span>
                        <span className="text-white/60 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Nível Bronze
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-tight drop-shadow-lg">
                        {event.title}
                    </h1>
                    <p className="flex items-center gap-1.5 text-white/70 text-xs font-bold mt-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        {event.location}
                    </p>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                ÁREA DE DETALHES — reformulada
            ══════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">

                {/* ── Barra de data + CTA ─────────────────────── */}
                <div className="flex items-center justify-between gap-4 px-6 py-4 bg-blue-50 border-b border-blue-100">
                    {/* Date pill */}
                    <div className="flex items-center gap-3">
                        <div className="bg-white border border-blue-100 rounded-2xl px-4 py-2.5 text-center shadow-sm min-w-[64px]">
                            <p className="text-xl font-black text-blue-900 leading-none">{event.date.split(' ')[0]}</p>
                            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest leading-none mt-0.5">{event.date.split(' ')[1]}</p>
                            <p className="text-[8px] font-bold text-gray-400 mt-0.5">{event.date.split(' ')[2]}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Data da Prova</p>
                            <p className="text-sm font-black text-blue-900">{event.date}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{event.city}, {event.state}</p>
                        </div>
                    </div>
                    {/* CTA */}
                    <a
                        href={event.affiliate_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] px-5 py-3 rounded-xl transition-all shadow-md shadow-blue-200 active:scale-95 shrink-0"
                    >
                        <Ticket className="w-4 h-4" />
                        Garantir Inscrição
                    </a>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

                    {/* ── Coluna principal (3/5) ──────────────── */}
                    <div className="lg:col-span-3 p-6 space-y-6">

                        {/* Sobre a prova */}
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <Info className="w-3.5 h-3.5 text-blue-500" />
                                <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Sobre a Prova</h2>
                            </div>
                            <p className="text-gray-600 text-sm font-medium leading-relaxed">
                                {event.description}
                            </p>
                        </section>

                        {/* Logística */}
                        <section>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
                                    <Clock className="w-4 h-4 text-blue-400 mx-auto mb-1.5" />
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Largada</p>
                                    <p className="text-sm font-black text-blue-900 uppercase italic leading-tight">07:00 AM</p>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
                                    <Package className="w-4 h-4 text-blue-400 mx-auto mb-1.5" />
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Retirada Kit</p>
                                    <p className="text-sm font-black text-blue-900 uppercase italic leading-tight">Ginásio Ibirapuera</p>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
                                    <Droplets className="w-4 h-4 text-blue-400 mx-auto mb-1.5" />
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Hidratação</p>
                                    <p className="text-sm font-black text-blue-900 uppercase italic leading-tight">Cada 2.5km</p>
                                </div>
                            </div>
                        </section>

                        {/* Organizador */}
                        <section className="flex items-center gap-4 p-5 bg-slate-900 rounded-2xl text-white">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white font-black text-lg italic border border-white/5 shrink-0">
                                {event.organizer_name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Organização Oficial</p>
                                <h3 className="text-base font-black uppercase italic tracking-tighter leading-none">{event.organizer_name}</h3>
                                <Link href="#" className="text-[9px] font-black text-white/40 uppercase hover:text-white transition-colors">
                                    Ver portfólio do organizador →
                                </Link>
                            </div>
                        </section>
                    </div>

                    {/* ── Sidebar (2/5) ──────────────────────── */}
                    <div className="lg:col-span-2 p-6 space-y-4 bg-gray-50/50">

                        {/* Destaques */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                                <h3 className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Destaques</h3>
                            </div>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
                                    <Trophy className="w-4 h-4 text-yellow-500 shrink-0" />
                                    <span className="text-sm font-bold text-gray-700">Medalha Premium</span>
                                </li>
                                <li className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                    <span className="text-sm font-bold text-gray-700">Camiseta Poliamida</span>
                                </li>
                                <li className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
                                    <Users className="w-4 h-4 text-blue-500 shrink-0" />
                                    <span className="text-sm font-bold text-gray-700">Fotos Gratuitas</span>
                                </li>
                            </ul>
                        </div>

                        {/* Preço + CTA */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Inscrição</p>
                            <p className="text-3xl font-black text-blue-900 italic tracking-tighter mb-4">{event.price_from}</p>
                            <a
                                href={event.affiliate_url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] py-3.5 rounded-xl shadow-md shadow-blue-100 transition-all active:scale-95"
                            >
                                Acessar Site Oficial
                            </a>
                        </div>

                        {/* Mapa */}
                        <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-300 transition-all text-left shadow-sm">
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Percurso</p>
                                <p className="text-sm font-black text-blue-900 uppercase italic">Visualizar Mapa</p>
                            </div>
                            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                                <MapIcon className="w-5 h-5 text-blue-500" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
            {/* ══════════════════════════════════════════════════════ */}

            {/* ── Reviews Section ────────────────────────────────── */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-sm font-black text-blue-900 uppercase italic tracking-tighter">O que dizem os corredores</h2>
                    <button
                        onClick={() => setShowReviewForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                        <Star className="w-3 h-3" />
                        Avaliar
                    </button>
                </div>

                {loadingReviews ? (
                    <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 text-blue-500 animate-spin" /></div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-3xl border border-gray-100">
                        <Star className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Seja o primeiro a avaliar este evento!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map(review => (
                            <div key={review.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <img src={review.profile?.avatar_url || 'https://i.pravatar.cc/150?u=' + review.user_id} alt="" className="w-10 h-10 rounded-full border-2 border-blue-50 object-cover" />
                                        <div>
                                            <p className="text-xs font-black text-gray-900">{review.profile?.username || 'Usuário'}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase">{new Date(review.created_at).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                    </div>
                                    <div className="flex text-amber-400">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-current' : 'text-gray-200'}`} />
                                        ))}
                                    </div>
                                </div>

                                <p className="text-sm text-gray-700 leading-relaxed font-medium">{review.content}</p>

                                {(review.pros || review.cons) && (
                                    <div className="grid grid-cols-2 gap-2">
                                        {review.pros && (
                                            <div className="flex items-start gap-1.5 bg-green-50 rounded-xl p-2.5">
                                                <ThumbsUp className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                                <p className="text-[10px] text-green-700 font-bold leading-tight">{review.pros}</p>
                                            </div>
                                        )}
                                        {review.cons && (
                                            <div className="flex items-start gap-1.5 bg-red-50 rounded-xl p-2.5">
                                                <ThumbsDown className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                                                <p className="text-[10px] text-red-600 font-bold leading-tight">{review.cons}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-end pt-1 border-t border-gray-50">
                                    <button
                                        onClick={() => toggleLike(review.id)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${likedReviews.has(review.id) ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                    >
                                        <Heart className={`w-3 h-3 ${likedReviews.has(review.id) ? 'fill-current' : ''}`} />
                                        <span className="text-[10px] font-black">{review.likes_count || 0}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ===== REVIEW FORM MODAL ===== */}
            {showReviewForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end lg:items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom-8 duration-300 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-black text-blue-900 uppercase italic tracking-tight">Avaliar {event.title}</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sua opinião é muito importante</p>
                            </div>
                            <button onClick={() => setShowReviewForm(false)} className="p-2 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200 transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {reviewSubmitted ? (
                            <div className="p-10 flex flex-col items-center gap-3 animate-in zoom-in duration-300">
                                <CheckCircle className="w-14 h-14 text-green-500" />
                                <p className="text-sm font-black text-green-600 uppercase tracking-widest">Avaliação enviada!</p>
                                <p className="text-xs text-gray-400 font-medium text-center">Obrigado por ajudar outros corredores com sua experiência ✌️</p>
                            </div>
                        ) : (
                            <div className="p-5 space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Sua nota</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setNewReview(r => ({ ...r, rating: s }))}
                                                className="focus:outline-none transition-transform hover:scale-125 active:scale-110"
                                            >
                                                <Star className={`w-8 h-8 transition-colors ${s <= newReview.rating ? 'text-amber-400 fill-current' : 'text-gray-200'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Comentário *</label>
                                    <textarea
                                        value={newReview.content}
                                        onChange={e => setNewReview(r => ({ ...r, content: e.target.value }))}
                                        placeholder="Como foi a prova? Percurso, hidratação, organização..."
                                        rows={4}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-black text-green-600 uppercase tracking-widest block mb-2 flex items-center gap-1">
                                            <ThumbsUp className="w-3 h-3" /> Pontos positivos
                                        </label>
                                        <input
                                            value={newReview.pros}
                                            onChange={e => setNewReview(r => ({ ...r, pros: e.target.value }))}
                                            placeholder="Ex: Percurso, Medalha"
                                            className="w-full p-3 bg-green-50 border border-green-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-green-400 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-2 flex items-center gap-1">
                                            <ThumbsDown className="w-3 h-3" /> Pontos negativos
                                        </label>
                                        <input
                                            value={newReview.cons}
                                            onChange={e => setNewReview(r => ({ ...r, cons: e.target.value }))}
                                            placeholder="Ex: Preço, Calor"
                                            className="w-full p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-red-400 outline-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmitReview}
                                    disabled={!newReview.content.trim()}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    <Send className="w-4 h-4" />
                                    Publicar Avaliação
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════ */}

            {/* ── Preparation CTA ────────────────────────────────── */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-green-200/60">
                <div className="max-w-sm">
                    <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2 leading-tight">
                        Vai correr esta prova? Treine com assessorias parceiras
                    </h3>
                    <p className="text-green-50/80 font-medium text-sm">
                        Encontre grupos que já estão inscritos e planeje seus treinos de rodagem e longões para chegar no seu melhor.
                    </p>
                </div>
                <Link
                    href="/assessorias"
                    className="bg-white text-green-600 font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-all shrink-0"
                >
                    Ver Assessorias Confirmadas
                </Link>
            </div>
        </div>
    );
}
