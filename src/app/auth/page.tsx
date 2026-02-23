'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser } from '@/lib/types';

export default function Auth() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Legacy mock logic for development
        const isAdmin = email.toLowerCase() === 'admin@brasilrun.com';

        const mockUser: AuthUser = {
            id: isAdmin ? 'admin-1' : Math.random().toString(36).substr(2, 9),
            email: email,
            username: isAdmin ? 'BrasilRunAdmin' : email.split('@')[0],
            avatar_url: isAdmin
                ? 'https://i.pravatar.cc/150?u=admin'
                : `https://picsum.photos/seed/${email}/100`,
            trust_score: isAdmin ? 100 : 50,
            role: isAdmin ? 'admin' : 'user'
        };

        localStorage.setItem('brasilrun_user', JSON.stringify(mockUser));
        // Trigger layout update
        window.location.href = isAdmin ? '/admin' : '/';
    };

    return (
        <div className="p-8 flex flex-col justify-center min-h-[70vh]">
            <div className="text-center mb-10">
                <div className="w-20 h-20 bg-green-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg rotate-3">
                    <span className="text-4xl text-white">👟</span>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900">BrasilRun</h1>
                <p className="text-sm text-gray-500 font-medium">A maior comunidade de corredores.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 pb-2 text-sm font-bold border-b-2 transition-all ${isLogin ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent'}`}
                    >
                        Entrar
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 pb-2 text-sm font-bold border-b-2 transition-all ${!isLogin ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent'}`}
                    >
                        Criar Conta
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            placeholder="admin@brasilrun.com para admin"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all mt-6"
                    >
                        {isLogin ? 'Entrar Agora' : 'Começar Minha Jornada'}
                    </button>
                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-[9px] font-black text-blue-700 uppercase tracking-widest text-center">
                        Dica: Use o e-mail acima para ver o Painel Admin
                    </p>
                </div>
            </div>
        </div>
    );
}
