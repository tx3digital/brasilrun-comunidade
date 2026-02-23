'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MOCK_COMMUNITIES } from '@/lib/mockData';
import { AuthUser } from '@/lib/types';

export default function ProfilePage() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tempIG, setTempIG] = useState('');
    const [tempStrava, setTempStrava] = useState('');

    useEffect(() => {
        const savedUser = localStorage.getItem('brasilrun_user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setTempIG(parsedUser.instagram_handle || '');
            setTempStrava(parsedUser.strava_link || '');
        }
    }, []);

    if (!user) return <div className="p-8 text-center text-gray-500 font-bold uppercase text-xs py-32">Faça login para ver seu perfil.</div>;

    const handleSave = () => {
        const updatedUser = { ...user, instagram_handle: tempIG, strava_link: tempStrava };
        setUser(updatedUser);
        localStorage.setItem('brasilrun_user', JSON.stringify(updatedUser));
        setIsEditing(false);
    };

    return (
        <div className="bg-gray-50 min-h-full pb-10">
            <div className="p-6 space-y-2">
                <h1 className="text-3xl font-black text-blue-900 uppercase italic tracking-tighter leading-none">Meu Perfil</h1>
                <p className="text-xs text-gray-500 font-medium">Gerencie sua jornada e conexões na BrasilRun.</p>
            </div>

            <div className="bg-white p-6 border-b border-gray-200 shadow-sm">
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <img
                            src={user.avatar_url}
                            className="w-32 h-32 rounded-full border-4 border-blue-100 shadow-lg object-cover"
                            alt="Profile"
                        />
                        <div className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                    </div>
                    <h2 className="mt-4 text-2xl font-black text-gray-800 uppercase italic leading-none">{user.username}</h2>
                    <p className="text-blue-600 text-xs font-black uppercase tracking-widest mt-1">Maratonista Aspirante</p>

                    <div className="flex gap-3 mt-4">
                        {user.instagram_handle ? (
                            <a href={`https://instagram.com/${user.instagram_handle}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                                <span>IG</span>
                                <span>@{user.instagram_handle}</span>
                            </a>
                        ) : (
                            <div className="bg-gray-100 text-gray-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200 opacity-60">IG Inativo</div>
                        )}
                    </div>

                    <div className="flex gap-4 mt-6 w-full">
                        <div className="flex-1 bg-blue-50 p-3 rounded-2xl text-center border border-blue-100 shadow-inner">
                            <p className="text-[10px] text-blue-800 font-black uppercase tracking-tighter opacity-60">Km Total</p>
                            <p className="text-xl font-black text-blue-900 italic">428.5</p>
                        </div>
                        <div className="flex-1 bg-green-50 p-3 rounded-2xl text-center border border-green-100 shadow-inner">
                            <p className="text-[10px] text-green-800 font-black uppercase tracking-tighter opacity-60">Pace Médio</p>
                            <p className="text-xl font-black text-green-900 italic">5'45"</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {isEditing ? (
                    <section className="bg-white p-5 rounded-3xl border-2 border-blue-400 shadow-xl space-y-4">
                        <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4 italic">Editar Conexões</h3>
                        <input type="text" value={tempIG} onChange={(e) => setTempIG(e.target.value)} placeholder="@instagram" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" />
                        <div className="flex gap-2 pt-2">
                            <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-xs">Salvar</button>
                            <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-black uppercase text-xs">Cancelar</button>
                        </div>
                    </section>
                ) : (
                    <div className="flex justify-end">
                        <button onClick={() => setIsEditing(true)} className="text-[10px] font-black uppercase text-blue-600 hover:underline">Editar Conexões</button>
                    </div>
                )}

                <section className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Minhas Comunidades</h3>
                    <div className="space-y-3">
                        {MOCK_COMMUNITIES.slice(0, 3).map(comm => (
                            <Link key={comm.id} href={`/c/${comm.slug}`} className="flex items-center gap-3 p-3 bg-blue-50 rounded-2xl border border-blue-50">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">🏃</div>
                                <div className="flex-1">
                                    <span className="text-sm font-black text-blue-900 uppercase italic leading-none">{comm.name}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
