'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronLeft, Heart, Star, ShoppingCart, ExternalLink,
    ThumbsUp, ThumbsDown, X, Send, CheckCircle
} from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_REVIEWS, MOCK_PROFILES } from '@/lib/mockData';
import { Review } from '@/lib/types';
import { supabase } from '@/lib/supabase';

export default function ProductDetail() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();

    const product = MOCK_PRODUCTS.find(p => p.id === id);
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
            setLoadingReviews(true);
            try {
                // Busca reviews reais do Supabase com join no profile
                const { data, error } = await supabase
                    .from('reviews')
                    .select('*, profile:profiles(*)')
                    .eq('target_id', id)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Filtra mock reviews para este produto
                const mockForProduct = MOCK_REVIEWS.filter(r => r.product_id === id);
                
                // Combina reais com mock
                setReviews([...(data || []), ...mockForProduct]);
            } catch (err) {
                console.warn('Usando apenas reviews locais:', err);
                setReviews(MOCK_REVIEWS.filter(r => r.product_id === id));
            } finally {
                setLoadingReviews(false);
            }
        };

        if (id) fetchReviews();
    }, [id]);

    if (!product) {
        return (
            <div className="p-8 text-center py-32">
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Produto não encontrado</p>
                <Link href="/reviews" className="mt-4 inline-block text-blue-600 font-black uppercase text-[10px] underline">Voltar para Guia</Link>
            </div>
        );
    }

    const handleSubmitReview = async () => {
        if (!newReview.content.trim()) return;

        const savedUser = typeof window !== 'undefined' ? localStorage.getItem('brasilrun_user') : null;
        if (!savedUser) {
            router.push('/auth');
            return;
        }

        const user = JSON.parse(savedUser);

        try {
            // 1. Tenta insert + select (pode ser bloqueado por RLS no SELECT)
            const payload = {
                target_id: String(id),
                user_id: String(user.id),
                rating: newReview.rating,
                content: newReview.content,
                pros: newReview.pros || null,
                cons: newReview.cons || null,
                likes_count: 0
            };

            const { data, error } = await supabase
                .from('reviews')
                .insert([payload])
                .select('*, profile:profiles(*)')
                .single();

            if (error) {
                // Log detalhado do erro real do Supabase
                console.error('Supabase review error:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code,
                });

                // RLS pode bloquear o SELECT mas o INSERT ter funcionado.
                // Tenta insert simples como fallback.
                const { error: insertErr } = await supabase
                    .from('reviews')
                    .insert([payload]);

                if (insertErr) {
                    console.error('Insert direto falhou:', insertErr.message, insertErr.hint, insertErr.code);
                    alert(`Erro ao salvar avaliação: ${insertErr.message || 'Verifique as políticas RLS da tabela reviews.'}`);
                    return;
                }

                // INSERT ok mas SELECT bloqueado — usa UI otimista
                const optimistic = {
                    id: `local-${Date.now()}`,
                    target_id: id,
                    user_id: user.id,
                    rating: newReview.rating,
                    content: newReview.content,
                    pros: newReview.pros,
                    cons: newReview.cons,
                    likes_count: 0,
                    created_at: new Date().toISOString(),
                    profile: {
                        id: user.id,
                        username: user.username,
                        avatar_url: user.avatar_url,
                        created_at: new Date().toISOString(),
                        trust_score: user.trust_score || 80,
                    },
                };
                setReviews(prev => [optimistic as any, ...prev]);
            } else {
                // 2. Sucesso total — usa dados reais retornados
                setReviews(prev => [data, ...prev]);
            }

            setReviewSubmitted(true);
            setNewReview({ rating: 5, content: '', pros: '', cons: '' });
            
            setTimeout(() => {
                setShowReviewForm(false);
                setReviewSubmitted(false);
            }, 2000);
        } catch (err: any) {
            console.error('Erro inesperado ao salvar review:', err?.message || err);
            alert(`Erro inesperado: ${err?.message || 'Verifique o console para mais detalhes.'}`);
        }
    };

    const toggleLike = (reviewId: string) => {
        setLikedReviews(prev => {
            const next = new Set(prev);
            if (next.has(reviewId)) {
                next.delete(reviewId);
                setReviews(rs => rs.map(r => r.id === reviewId ? { ...r, likes_count: r.likes_count - 1 } : r));
            } else {
                next.add(reviewId);
                setReviews(rs => rs.map(r => r.id === reviewId ? { ...r, likes_count: r.likes_count + 1 } : r));
            }
            return next;
        });
    };

    const avgRating = reviews.length > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : product.average_rating.toFixed(1);

    return (
        <div className="flex flex-col min-h-full bg-gray-50">
            {/* Header Image */}
            <div className="relative h-64 bg-white border-b border-gray-100">
                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg text-gray-700 hover:scale-105 transition-all"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-8" />
            </div>

            <div className="p-4 space-y-4 -mt-4 relative z-10 pb-10">

                {/* Product Info Card */}
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 space-y-4">
                    <div>
                        <p className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-1">{product.brand}</p>
                        <h1 className="text-3xl font-black text-blue-900 leading-tight uppercase italic tracking-tighter">{product.name}</h1>
                    </div>

                    {/* Rating row */}
                    <div className="flex items-center gap-2">
                        <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} className={`w-4 h-4 ${s <= Math.round(Number(avgRating)) ? 'fill-current' : 'text-gray-200'}`} />
                            ))}
                        </div>
                        <span className="text-sm font-black text-gray-900">{avgRating}</span>
                        <span className="text-xs text-gray-400 font-bold">({reviews.length} avaliações)</span>
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed italic border-l-4 border-blue-100 pl-4">
                        "{product.description}"
                    </p>

                    {/* Specs */}
                    <div>
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Especificações Técnicas</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(product.specifications).map(([key, value]) => (
                                <div key={key} className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">{key}</p>
                                    <p className="text-[11px] font-bold text-gray-900">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ===== BUY BUTTON ===== */}
                    {product.affiliate_url && (
                        <a
                            href={product.affiliate_url}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-900 font-black uppercase tracking-widest text-sm rounded-2xl py-4 shadow-lg shadow-amber-200 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
                            Ver Oferta
                            <ExternalLink className="w-4 h-4 opacity-60" />
                        </a>
                    )}
                    {product.affiliate_url && (
                        <p className="text-[8px] text-center text-gray-300 font-bold uppercase tracking-widest -mt-2">
                            🔗 Link de afiliado — Sem custo extra para você
                        </p>
                    )}
                </div>

                {/* Reviews Section */}
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

                    {reviews.length === 0 && (
                        <div className="text-center py-10 bg-white rounded-3xl border border-gray-100">
                            <Star className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Seja o primeiro a avaliar!</p>
                        </div>
                    )}

                    {reviews.map(review => (
                        <div key={review.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <img src={review.profile?.avatar_url} alt="" className="w-10 h-10 rounded-full border-2 border-blue-50 object-cover" />
                                    <div>
                                        <p className="text-xs font-black text-gray-900">{review.profile?.username}</p>
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
                                    <span className="text-[10px] font-black">{review.likes_count}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ===== REVIEW FORM MODAL ===== */}
            {showReviewForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
                        {/* Modal header */}
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-black text-blue-900 uppercase italic tracking-tight">Avaliar {product.name}</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Compartilhe sua experiência</p>
                            </div>
                            <button onClick={() => setShowReviewForm(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {reviewSubmitted ? (
                            <div className="p-10 flex flex-col items-center gap-3 animate-in zoom-in duration-300">
                                <CheckCircle className="w-14 h-14 text-green-500" />
                                <p className="text-sm font-black text-green-600 uppercase tracking-widest">Avaliação enviada!</p>
                                <p className="text-xs text-gray-400 font-medium">Obrigado por ajudar a comunidade ✌️</p>
                            </div>
                        ) : (
                            <div className="p-5 space-y-4">
                                {/* Star rating picker */}
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

                                {/* Review text */}
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Sua avaliação *</label>
                                    <textarea
                                        value={newReview.content}
                                        onChange={e => setNewReview(r => ({ ...r, content: e.target.value }))}
                                        placeholder="Como foi sua experiência com este produto? Detalhes ajudam outros corredores..."
                                        rows={4}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    />
                                </div>

                                {/* Pros & Cons */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-black text-green-600 uppercase tracking-widest block mb-2 flex items-center gap-1">
                                            <ThumbsUp className="w-3 h-3" /> Pontos positivos
                                        </label>
                                        <input
                                            value={newReview.pros}
                                            onChange={e => setNewReview(r => ({ ...r, pros: e.target.value }))}
                                            placeholder="Ex: Leveza, amortecimento"
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
                                            placeholder="Ex: Preço, durabilidade"
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
        </div>
    );
}
