'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Target, Footprints, Watch, Pill, ChevronRight } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/mockData';

export default function Reviews() {
    const [activeCategory, setActiveCategory] = useState<'todos' | 'suplemento' | 'tenis' | 'relogio'>('todos');

    const filteredProducts = activeCategory === 'todos'
        ? MOCK_PRODUCTS
        : MOCK_PRODUCTS.filter(p => p.category === activeCategory);

    const categories = [
        { id: 'todos', label: 'Todos', icon: <Target className="w-4 h-4" /> },
        { id: 'tenis', label: 'Tênis', icon: <Footprints className="w-4 h-4" /> },
        { id: 'relogio', label: 'Relógios', icon: <Watch className="w-4 h-4" /> },
        { id: 'suplemento', label: 'Suplementos', icon: <Pill className="w-4 h-4" /> },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-black text-blue-900 uppercase italic tracking-tighter">Guia de Equipamentos</h1>
                <p className="text-xs text-gray-500 font-medium">Reviews reais feitos pela comunidade BrasilRun.</p>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-tight transition-all whitespace-nowrap border-2 ${activeCategory === cat.id
                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105'
                                : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200'
                            }`}
                    >
                        <span>{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 gap-4">
                {filteredProducts.map(product => (
                    <Link
                        key={product.id}
                        href={`/reviews/${product.id}`}
                        className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition-shadow group"
                    >
                        <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                            />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{product.brand}</p>
                                <h3 className="font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{product.name}</h3>
                                <div className="flex items-center gap-1 mt-1">
                                    <div className="flex text-amber-400 text-xs">
                                        {'★'.repeat(Math.floor(product.average_rating))}
                                        {product.average_rating % 1 !== 0 && '½'}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400">({product.review_count})</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-500 line-clamp-1 italic">"{product.description}"</p>
                        </div>
                        <div className="flex items-center">
                            <div className="bg-blue-50 p-2 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <ChevronRight className="w-4 h-4" strokeWidth={3} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Nenhum produto encontrado</p>
                </div>
            )}
        </div>
    );
}
