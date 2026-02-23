'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Users, Search, User as UserIcon, Plus, Play, AlertTriangle, X, MessageSquare, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { AuthUser } from '@/lib/types';

// Mock data integration will come later from Supabase
const MOCK_COMMUNITIES: any[] = [];
const MOCK_TOPICS: any[] = [];

interface LayoutProps {
    children: React.ReactNode;
    user: AuthUser | null;
    onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [showSearch, setShowSearch] = useState(false);
    const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const isActive = (path: string) => pathname === path;

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return { communities: [], topics: [] };
        const query = searchQuery.toLowerCase();

        return {
            communities: MOCK_COMMUNITIES.filter(c =>
                c.name.toLowerCase().includes(query) || c.description.toLowerCase().includes(query)
            ),
            topics: MOCK_TOPICS.filter(t =>
                t.title.toLowerCase().includes(query) || t.content.toLowerCase().includes(query)
            )
        };
    }, [searchQuery]);

    return (
        <div className="min-h-screen flex flex-col brasilrun-container shadow-xl relative overflow-x-hidden">
            {/* Admin Quick Entry */}
            {user?.role === 'admin' && (
                <Link href="/admin" className="bg-slate-900 text-slate-100 p-1.5 text-center text-[9px] font-black uppercase tracking-[0.2em] hover:bg-black transition-colors">
                    ⚠️ Sistema Admin Ativo - Acessar Painel
                </Link>
            )}

            {/* Search Overlay */}
            {showSearch && (
                <div className="fixed inset-0 bg-blue-900/40 z-[100] flex flex-col backdrop-blur-md p-4">
                    <div className="bg-white rounded-3xl p-5 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-black text-blue-900 uppercase italic tracking-tighter text-sm">Explorar BrasilRun</h2>
                            <button
                                onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                                className="bg-gray-100 p-2 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative mb-4">
                            <input
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Pesquisar comunidades ou tópicos..."
                                className="w-full p-4 pl-12 bg-blue-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none transition-all font-medium text-blue-900 text-sm"
                            />
                            <Search className="w-6 h-6 absolute left-4 top-4 text-blue-400" />
                        </div>

                        <div className="overflow-y-auto flex-1 space-y-4 pr-2">
                            {searchQuery.trim() === '' ? (
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sugestões para você</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['#maratona', '#tenis', '#trail', '#dieta', '#recovery'].map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => setSearchQuery(tag.replace('#', ''))}
                                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-all"
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {searchResults.communities.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Comunidades</p>
                                            {searchResults.communities.map((c: any) => (
                                                <Link
                                                    key={c.id}
                                                    href={`/c/${c.slug}`}
                                                    onClick={() => setShowSearch(false)}
                                                    className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100"
                                                >
                                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                                        <Users className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-blue-900 leading-none">{c.name}</p>
                                                        <p className="text-[10px] text-gray-500">{c.topic_count} tópicos</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1" onClick={() => setShowSearch(false)}></div>
                </div>
            )}

            {/* Header BrasilRun */}
            <header className="bg-blue-600 text-white p-3 flex justify-between items-center sticky top-0 z-50 shadow-md">
                <Link href="/" className="text-xl font-black flex items-center gap-1 group">
                    <span className="bg-green-500 text-white px-2 py-0.5 rounded italic text-sm transform group-hover:rotate-6 transition-transform">BRASIL</span>
                    <span className="tracking-tighter">RUN</span>
                </Link>
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <Link href="/profile" className="text-[10px] uppercase font-black hover:scale-105 active:scale-95 transition-all bg-white/20 px-3 py-1.5 rounded-full flex items-center gap-2">
                                <img src={user.avatar_url} className="w-5 h-5 rounded-full border border-white/50 object-cover" alt="Avatar" />
                                Perfil
                            </Link>
                            <button
                                onClick={() => { onLogout(); router.push('/'); }}
                                className="text-[10px] uppercase font-black bg-white/10 px-2 py-1 rounded hover:bg-white/20 transition-all active:scale-90 opacity-60"
                            >
                                Sair
                            </button>
                        </div>
                    ) : (
                        <Link href="/auth" className="text-[10px] uppercase font-black hover:scale-105 active:scale-95 transition-all bg-white/20 px-3 py-1.5 rounded-full">
                            Entrar
                        </Link>
                    )}
                </div>
            </header>

            {/* Sub-nav banner */}
            <nav className="bg-blue-100 p-2 flex gap-4 overflow-x-auto text-[10px] border-b border-blue-200 whitespace-nowrap scrollbar-hide">
                <Link href="/" className={`font-black uppercase tracking-wider px-2 py-1 rounded-md transition-colors ${isActive('/') ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-700/60'}`}>Início</Link>
                <Link href="/communities" className={`font-black uppercase tracking-wider px-2 py-1 rounded-md transition-colors ${isActive('/communities') ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-700/60'}`}>Comunidades</Link>
                <Link href="/reviews" className={`font-black uppercase tracking-wider px-2 py-1 rounded-md transition-colors ${isActive('/reviews') ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-700/60'}`}>Vitrine</Link>
                <Link href="/blog" className={`font-black uppercase tracking-wider px-2 py-1 rounded-md transition-colors ${isActive('/blog') ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-700/60'}`}>Conteúdo</Link>
                <button onClick={() => setShowSearch(true)} className="font-black uppercase tracking-wider text-blue-700/60 px-2">Busca</button>
            </nav>

            <main className="flex-1 pb-24 overflow-y-auto flex flex-col">
                {/* Video Section */}
                <section className="animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className={`relative w-full bg-black overflow-hidden group transition-all duration-500 ease-in-out ${pathname.startsWith('/blog') && !isPlayerExpanded ? 'h-0 opacity-0' : 'aspect-video opacity-100'}`}>
                        <iframe
                            className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                            src="https://www.youtube.com/embed/dQw4w9WgXcQ?controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3"
                            title="BrasilRun Explainer"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent pointer-events-none"></div>
                        <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20 text-white pointer-events-none">
                            <Play className="w-4 h-4 fill-current" />
                        </div>
                    </div>

                    <div className={`px-6 relative z-10 transition-all duration-500 ${pathname.startsWith('/blog') && !isPlayerExpanded ? 'mt-4' : '-mt-10'}`}>
                        <div className="mt-8 flex items-center gap-4">
                            <div className="h-[1px] bg-gray-200 flex-1"></div>
                            <div className="flex items-center gap-3">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] whitespace-nowrap">
                                    {pathname.startsWith('/blog') ? 'Assistir OFERTAS EM DESTAQUE acima' : 'Assista ao vídeo explicativo acima'}
                                </p>
                                {pathname.startsWith('/blog') && (
                                    <button
                                        onClick={() => setIsPlayerExpanded(!isPlayerExpanded)}
                                        className="bg-blue-600 text-white p-1.5 rounded-full shadow-lg active:scale-90 transition-all hover:bg-blue-700 flex items-center justify-center"
                                    >
                                        {isPlayerExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    </button>
                                )}
                            </div>
                            <div className="h-[1px] bg-gray-200 flex-1"></div>
                        </div>
                    </div>
                </section>

                <div className="flex-1">
                    {children}
                </div>

                {/* Global Health Disclaimer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <div className="bg-amber-50/50 border border-amber-200/50 p-4 rounded-3xl">
                        <p className="text-[9px] font-black text-amber-900 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3" />
                            Aviso Importante
                        </p>
                        <p className="text-[9px] text-amber-800/70 font-bold leading-relaxed uppercase italic">
                            O conteúdo do BrasilRun é estritamente informativo. Ele não substitui o diagnóstico, aconselhamento ou acompanhamento de médicos, nutricionistas ou educadores físicos. Consulte sempre um profissional de saúde antes de iniciar novos treinos ou dietas.
                        </p>
                    </div>
                    <p className="mt-4 text-[8px] text-center text-gray-300 font-black uppercase tracking-[0.2em]">BrasilRun © 2025 - A Sua Comunidade no Asfalto</p>
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[448px] bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-around items-center p-2 z-50 shadow-[0_-5px_25px_rgba(0,0,0,0.1)]">
                <Link href="/" className={`flex flex-col items-center gap-1 transition-all ${isActive('/') ? 'text-blue-600 scale-110' : 'text-gray-400'}`}>
                    <Home className="w-4 h-4" />
                    <span className="text-[8px] font-bold uppercase tracking-tighter">Início</span>
                </Link>
                <Link href="/communities" className={`flex flex-col items-center gap-1 transition-all ${isActive('/communities') ? 'text-blue-600 scale-110' : 'text-gray-400'}`}>
                    <Users className="w-4 h-4" />
                    <span className="text-[8px] font-bold uppercase tracking-tighter">Grupos</span>
                </Link>

                <Link
                    href="/c/dicas-tenis/new"
                    className="relative -top-5 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-2xl p-3 shadow-xl border-4 border-white text-white active:scale-90 active:rotate-12 transition-all"
                >
                    <Plus className="w-6 h-6" strokeWidth={3} />
                </Link>

                <button onClick={() => setShowSearch(true)} className={`flex flex-col items-center gap-1 text-gray-400`}>
                    <Search className="w-4 h-4" />
                    <span className="text-[8px] font-bold uppercase tracking-tighter">Busca</span>
                </button>

                <Link href="/my-messages" className={`flex flex-col items-center gap-1 transition-all ${isActive('/my-messages') ? 'text-blue-600 scale-110' : 'text-gray-400'}`}>
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-[8px] font-bold uppercase tracking-tighter">Mensagens</span>
                </Link>
            </footer>
        </div>
    );
};

export default Layout;
