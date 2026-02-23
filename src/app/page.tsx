import React from 'react';
import Link from 'next/link';
import { TrendingUp, MessageSquare, ChevronRight, Footprints, Flag, Activity, Star } from 'lucide-react';
import { MOCK_COMMUNITIES, MOCK_TOPICS, MOCK_EVENTS } from '@/lib/mockData';

export default function Home() {
    const latestTopics = [...MOCK_TOPICS].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, 3);

    const totalTopics = MOCK_TOPICS.length;

    return (
        <div className="bg-gray-50 min-h-full flex flex-col">
            <div className="p-6 space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-blue-900 leading-tight uppercase italic tracking-tighter">
                        Conheça a nossa tribo
                    </h1>
                    <p className="text-xs text-gray-500 font-medium">Junte-se a +1.200 corredores apaixonados pelo asfalto.</p>
                </div>

                {/* Quick Stats Banner */}
                <div className="grid grid-cols-2 gap-3 mb-2 animate-in slide-in-from-top-4 duration-500 delay-200">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-3xl text-white shadow-lg shadow-blue-200 relative overflow-hidden">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Corredores On</p>
                        <h4 className="text-2xl font-black italic">1.2k</h4>
                        <div className="absolute -right-2 -bottom-2 opacity-10">
                            <TrendingUp className="w-16 h-16" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-700 p-4 rounded-3xl text-white shadow-lg shadow-green-200 relative overflow-hidden">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Total de Tópicos</p>
                        <h4 className="text-2xl font-black italic">{totalTopics}</h4>
                        <div className="absolute -right-2 -bottom-2 opacity-10">
                            <MessageSquare className="w-16 h-16" />
                        </div>
                    </div>
                </div>

                {/* Recommended Communities */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-black text-gray-800 uppercase italic tracking-tighter">Comunidades em Destaque</h2>
                        <Link href="/communities" className="text-[10px] text-blue-600 font-black uppercase cursor-pointer hover:underline">Ver todas</Link>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {MOCK_COMMUNITIES.slice(0, 3).map((community, idx) => (
                            <Link
                                key={community.id}
                                href={`/c/${community.slug}`}
                                className="group flex items-center p-4 bg-white border border-gray-100 rounded-3xl hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100/50 transition-all active:scale-[0.98] animate-in fade-in slide-in-from-right-4 duration-500 delay-75"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 text-blue-600">
                                    {community.slug.includes('tenis') ? <Footprints className="w-8 h-8" /> : community.slug.includes('maratona') ? <Flag className="w-8 h-8" /> : <Activity className="w-8 h-8" />}
                                </div>
                                <div className="flex-1 min-w-0 ml-4">
                                    <h3 className="font-black text-blue-900 truncate uppercase italic leading-none mb-1">{community.name}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-2 leading-tight font-medium">
                                        {community.description}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                        <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{community.topic_count} tópicos</span>
                                        <span className="h-1 w-1 bg-gray-200 rounded-full"></span>
                                        <span>Última ativ. 5m</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Activity Feed */}
                <section className="space-y-4">
                    <h2 className="text-sm font-black text-gray-800 uppercase italic tracking-tighter">O que estão falando</h2>
                    <div className="space-y-3">
                        {latestTopics.map(topic => (
                            <Link key={topic.id} href={`/t/${topic.id}`} className="block p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-green-200 active:scale-95 transition-all">
                                <div className="flex items-center gap-2 mb-2">
                                    <img src={topic.profile?.avatar_url} className="w-4 h-4 rounded-full" alt="Avatar" />
                                    <span className="text-[10px] font-black text-blue-600 uppercase italic tracking-tighter">{topic.profile?.username}</span>
                                    <span className="text-[10px] text-gray-300 ml-auto">{MOCK_COMMUNITIES.find(c => c.id === topic.community_id)?.name.split(' ')[0]}</span>
                                </div>
                                <h4 className="text-sm font-bold text-gray-800 leading-snug line-clamp-1">{topic.title}</h4>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Ad Section */}
                <section className="px-1">
                    <div className="bg-white border border-gray-200 rounded-[2.5rem] p-1 shadow-sm overflow-hidden relative group">
                        <div className="absolute top-4 right-5 z-10">
                            <span className="text-[8px] font-black bg-black/20 backdrop-blur-md text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Patrocinado</span>
                        </div>
                        <a
                            href="https://www.nike.com.br"
                            target="_blank"
                            rel="sponsored noopener noreferrer"
                            className="block relative overflow-hidden rounded-[2.3rem]"
                        >
                            <div className="aspect-[21/9] w-full relative">
                                <img
                                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
                                    alt="Ad Banner"
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center p-6">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-green-400 uppercase tracking-[0.2em] animate-pulse">Novo Lançamento</p>
                                        <h3 className="text-xl font-black text-white italic uppercase leading-none tracking-tighter">NIKE VAPORFLY 3</h3>
                                        <p className="text-[10px] text-gray-200 font-bold max-w-[180px] leading-tight mb-3">Voe baixo na sua próxima maratona com a placa de carbono mais rápida do mundo.</p>
                                        <div className="inline-flex items-center gap-2 bg-white text-black text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest group-hover:bg-green-500 group-hover:text-white transition-all transform group-hover:translate-x-1">
                                            <span>Ver Oferta</span>
                                            <ChevronRight className="w-3 h-3" strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>
                </section>

                {/* Events Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-black text-gray-800 uppercase italic tracking-tighter">Próximas Provas & Eventos</h2>
                        <div className="flex items-center gap-1.5 bg-green-100 px-2 py-1 rounded-full">
                            <span className="text-[8px] font-black text-green-700 uppercase tracking-widest">Parceria Oficial</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {MOCK_EVENTS.map((event, idx) => (
                            <a
                                key={event.id}
                                href={event.affiliate_url}
                                target="_blank"
                                rel="sponsored noopener noreferrer"
                                className="block group bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:border-orange-200 transition-all active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4 duration-500"
                                style={{ animationDelay: `${idx * 150}ms` }}
                            >
                                <div className="relative h-32 overflow-hidden">
                                    <img src={event.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={event.title} />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-orange-600 uppercase tracking-widest shadow-sm">
                                        {event.category}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-3 left-4 right-4 text-white">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">{event.date}</p>
                                        <h3 className="text-sm font-black italic uppercase truncate">{event.title}</h3>
                                    </div>
                                </div>
                                <div className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Localização</p>
                                        <p className="text-xs font-bold text-gray-700">{event.location}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Inscrições a partir de</p>
                                        <p className="text-sm font-black text-green-600">{event.price_from}</p>
                                    </div>
                                </div>
                                <div className="px-4 pb-4">
                                    <div className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-100 flex items-center justify-center gap-2 group-hover:gap-4 transition-all">
                                        <span>Garantir Inscrição</span>
                                        <ChevronRight className="w-4 h-4" strokeWidth={3} />
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>

                {/* BrasilRun Special Info */}
                <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-orange-800 font-black text-sm mb-2 italic uppercase tracking-widest">Dica BrasilRun</h3>
                        <p className="text-xs text-orange-700 font-medium leading-relaxed">
                            Mantenha seu ritmo! Tópicos de recuperação estão em alta hoje. <span className="font-bold underline cursor-pointer">Confira agora &raquo;</span>
                        </p>
                    </div>
                    <div className="absolute top-4 right-4 text-orange-200 opacity-50 group-hover:scale-125 transition-transform">
                        <Star className="w-12 h-12 fill-current" />
                    </div>
                </div>
            </div>
        </div>
    );
}
