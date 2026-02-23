'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, X, Plus, Minus, Heart } from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_REVIEWS } from '@/lib/mockData';

export default function ProductDetail() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const product = MOCK_PRODUCTS.find(p => p.id === id);
    const reviews = MOCK_REVIEWS.filter(r => r.product_id === id);

    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newReview, setNewReview] = useState({
        rating: 5,
        content: '',
        pros: '',
        cons: ''
    });

    if (!product) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Produto não encontrado</p>
                <Link href="/reviews" className="mt-4 inline-block text-blue-600 font-black uppercase text-[10px] underline">Voltar para Guia</Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full bg-gray-50">
            {/* Header Image */}
            <div className="relative h-64 bg-white">
                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg text-gray-700"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-contain p-8"
                />
            </div>

            <div className="p-6 space-y-2 -mt-4 relative z-10">
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 space-y-2">
                    <p className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-1">{product.brand}</p>
                    <h1 className="text-3xl font-black text-blue-900 leading-tight uppercase italic tracking-tighter">{product.name}</h1>

                    <div className="flex items-center gap-2 pt-2 mb-4">
                        <div className="flex text-amber-400">
                            {'★'.repeat(Math.floor(product.average_rating))}
                        </div>
                        <span className="text-xs font-black text-gray-900">{product.average_rating}</span>
                        <span className="text-xs text-gray-400 font-bold">({product.review_count} avaliações)</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed italic border-l-4 border-blue-100 pl-4 mb-6">
                        "{product.description}"
                    </p>

                    <div className="space-y-3">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Especificações Técnicas</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(product.specifications).map(([key, value]) => (
                                <div key={key} className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">{key}</p>
                                    <p className="text-[11px] font-bold text-gray-900">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <h2 className="text-sm font-black text-blue-900 uppercase italic tracking-tighter">O que dizem os corredores</h2>
                        <button
                            onClick={() => setShowReviewForm(true)}
                            className="bg-blue-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-full shadow-lg"
                        >
                            Avaliar Produto
                        </button>
                    </div>

                    <div className="space-y-4">
                        {reviews.map(review => (
                            <div key={review.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <img src={review.profile?.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-blue-50 object-cover" />
                                        <div>
                                            <p className="text-xs font-black text-gray-900">{review.profile?.username}</p>
                                        </div>
                                    </div>
                                    <div className="flex text-amber-400 text-xs">
                                        {'★'.repeat(review.rating)}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-700 leading-relaxed font-medium">{review.content}</p>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase">{new Date(review.created_at).toLocaleDateString('pt-BR')}</span>
                                    <button className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                                        <Heart className="w-3 h-3 fill-current" />
                                        <span className="text-[10px] font-black">{review.likes_count}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
