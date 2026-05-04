'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Home, Users, Search, Plus, Play, AlertTriangle, X,
    MessageSquare, ChevronDown, ChevronUp, Loader2,
    TrendingUp, Star, Menu, Bell, Settings, LogOut,
    LayoutDashboard, Hash, Gift, User as UserIcon, MapPin, Calendar
} from 'lucide-react';
import { AuthUser, Community, Topic, AdPlacement } from '@/lib/types';
import { supabase } from '@/lib/supabase';

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
    const [searchResults, setSearchResults] = useState<{ communities: Community[], topics: Topic[] }>({ communities: [], topics: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [adPlacements, setAdPlacements] = useState<AdPlacement[]>([]);

    const isActive = (path: string) => pathname === path;

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const { data } = await supabase
                    .from('ad_placements')
                    .select('*')
                    .eq('is_active', true);
                if (data) setAdPlacements(data);
            } catch (err) {
                console.warn('Could not fetch ad placements:', err);
            }
        };
        fetchAds();
    }, [pathname]);

    useEffect(() => {
        const performSearch = async () => {
            if (!searchQuery.trim()) {
                setSearchResults({ communities: [], topics: [] });
                return;
            }

            setIsSearching(true);
            try {
                const query = `%${searchQuery}%`;
                const { data: communities } = await supabase
                    .from('communities')
                    .select('*')
                    .or(`name.ilike.${query},description.ilike.${query}`)
                    .limit(5);

                const { data: topics } = await supabase
                    .from('topics')
                    .select('*, profile:profiles(*)')
                    .or(`title.ilike.${query},content.ilike.${query}`)
                    .limit(5);

                setSearchResults({
                    communities: communities || [],
                    topics: topics || []
                });
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(performSearch, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const DesktopNavigation = () => (
        <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-0 h-screen bg-white border-r border-gray-100 p-6 z-50">
            <Link href="/" className="text-2xl font-black flex items-center gap-1 mb-10 group">
                <span className="bg-green-500 text-white px-2 py-0.5 rounded italic text-sm transform group-hover:rotate-6 transition-transform">BRASIL</span>
                <span className="tracking-tighter text-blue-900">RUN</span>
            </Link>

            <nav className="flex-1 space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Menu Principal</p>
                <Link href="/" className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${isActive('/') ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}>
                    <Home className="w-5 h-5" />
                    <span className="font-bold">Feed Oficial</span>
                </Link>
                <Link href="/communities" className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${isActive('/communities') ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}>
                    <Users className="w-5 h-5" />
                    <span className="font-bold">Comunidades</span>
                </Link>
                <Link href="/reviews" className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${isActive('/reviews') ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}>
                    <Gift className="w-5 h-5" />
                    <span className="font-bold">Vitrine & Review</span>
                </Link>
                <Link href="/assessorias" className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${isActive('/assessorias') ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}>
                    <MapPin className="w-5 h-5" />
                    <span className="font-bold">Assessorias</span>
                </Link>
                <Link href="/eventos" className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${isActive('/eventos') ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}>
                    <Calendar className="w-5 h-5" />
                    <span className="font-bold">Calendário de Provas</span>
                </Link>
                <Link href="/blog" className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${isActive('/blog') ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}>
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="font-bold">Conteúdo Editorial</span>
                </Link>

                <div className="pt-8 mb-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Minha Conta</p>
                    <Link href="/profile" className="flex items-center gap-3 p-3 rounded-2xl text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all font-bold">
                        <UserIcon className="w-5 h-5" />
                        Perfil do Atleta
                    </Link>
                    <button onClick={onLogout} className="w-full flex items-center gap-3 p-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold">
                        <LogOut className="w-5 h-5" />
                        Sair do App
                    </button>
                </div>
            </nav>

            {user?.role === 'admin' && (
                <div className="space-y-2">
                    <Link href="/admin/ads" className="block bg-blue-600 text-white p-4 rounded-2xl text-[10px] font-black uppercase text-center tracking-widest hover:bg-blue-700 transition-all mb-2">
                        💰 Gestão de Publicidade
                    </Link>
                    <Link href="/admin/content" className="block bg-green-600 text-white p-4 rounded-2xl text-[10px] font-black uppercase text-center tracking-widest hover:bg-green-700 transition-all">
                        📝 Painel de Conteúdo
                    </Link>
                    <Link href="/admin" className="block bg-slate-900 text-white p-4 rounded-2xl text-[10px] font-black uppercase text-center tracking-widest hover:bg-black transition-all">
                        ⚠️ Painel de Moderação
                    </Link>
                </div>
            )}
        </aside>
    );

    const DesktopHeader = () => (
        <header className="hidden lg:flex fixed top-0 left-64 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-40 px-8 items-center justify-between">
            <div className="relative w-96">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSearch(true)}
                    placeholder="O que você está buscando hoje?"
                    className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
                <Search className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 rounded-full">
                    <Bell className="w-5 h-5" />
                </button>
                <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>
                {user ? (
                    <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
                        <div className="text-right">
                            <p className="text-xs font-black text-blue-900 italic leading-none">{user.username}</p>
                            <p className="text-[10px] font-bold text-blue-400 uppercase">Pro Runner</p>
                        </div>
                        <img src={user.avatar_url} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="Profile" />
                    </div>
                ) : (
                    <Link href="/auth" className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-blue-700">
                        Entrar na Comunidade
                    </Link>
                )}
            </div>
        </header>
    );

    return (
        <div className="min-h-screen bg-[#f0f2f5]">
            <DesktopNavigation />

            <div className="lg:pl-64 lg:pt-20">
                <div className="brasilrun-container min-h-screen flex flex-col shadow-xl lg:shadow-none relative">
                    {/* Mobile Header */}
                    <header className="lg:hidden bg-blue-600 text-white p-3 flex justify-between items-center sticky top-0 z-50 shadow-md">
                        <Link href="/" className="text-xl font-black flex items-center gap-1 group">
                            <span className="bg-green-500 text-white px-2 py-0.5 rounded italic text-sm">BRASIL</span>
                            <span className="tracking-tighter">RUN</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            {user ? (
                                <Link href="/profile">
                                    <img src={user.avatar_url} className="w-8 h-8 rounded-full border border-white/50 object-cover" alt="Avatar" />
                                </Link>
                            ) : (
                                <Link href="/auth" className="text-[10px] uppercase font-black bg-white/20 px-3 py-1.5 rounded-full">
                                    Entrar
                                </Link>
                            )}
                        </div>
                    </header>

                    {/* Desktop Header Component */}
                    <DesktopHeader />

                    {/* Mobile Navigation */}
                    <nav className="lg:hidden bg-blue-100 p-2 flex gap-4 overflow-x-auto text-[10px] border-b border-blue-200 whitespace-nowrap scrollbar-hide">
                        <Link href="/" className={`font-black uppercase tracking-wider px-2 py-1 rounded-md ${isActive('/') ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-700/60'}`}>Início</Link>
                        <Link href="/communities" className={`font-black uppercase tracking-wider px-2 py-1 rounded-md ${isActive('/communities') ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-700/60'}`}>Comunidades</Link>
                        <Link href="/reviews" className={`font-black uppercase tracking-wider px-2 py-1 rounded-md ${isActive('/reviews') ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-700/60'}`}>Vitrine</Link>
                        <Link href="/assessorias" className={`font-black uppercase tracking-wider px-2 py-1 rounded-md ${isActive('/assessorias') ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-700/60'}`}>Assessorias</Link>
                        <Link href="/eventos" className={`font-black uppercase tracking-wider px-2 py-1 rounded-md ${isActive('/eventos') ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-700/60'}`}>Eventos</Link>
                        <Link href="/blog" className={`font-black uppercase tracking-wider px-2 py-1 rounded-md ${isActive('/blog') ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-700/60'}`}>Conteúdo</Link>
                        <button onClick={() => setShowSearch(true)} className="font-black uppercase tracking-wider text-blue-700/60 px-2">Busca</button>
                    </nav>

                    {/* Main Content Area */}
                    <div className="flex-1 lg:flex lg:p-8 gap-8">
                        <main className="flex-1 flex flex-col pb-24 lg:pb-0 overflow-y-auto">
                            {/* Video Section — hidden on admin pages */}
                            {!pathname.startsWith('/admin') && (
                                <section className="animate-in fade-in slide-in-from-top-4 duration-700">
                                    <div className={`relative w-full bg-black overflow-hidden group transition-all duration-500 ease-in-out lg:rounded-[2rem] lg:mb-8 ${pathname.startsWith('/blog') && !isPlayerExpanded ? 'h-0 opacity-0' : 'aspect-video opacity-100'}`}>
                                        <iframe
                                            className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                                            src={(() => {
                                                const normalize = (p: string) => {
                                                    if (!p) return '/';
                                                    let path = p.trim().toLowerCase();
                                                    if (!path.startsWith('/')) path = '/' + path;
                                                    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
                                                    return path;
                                                };
                                                
                                                const current = normalize(pathname);
                                                
                                                // Tenta encontrar o melhor match (Hierarquia)
                                                // 1. Match Exato
                                                let ad = adPlacements.find(a => normalize(a.page_path) === current);
                                                
                                                // 2. Match por Categoria/Pai (ex: /eventos/meia-rio -> /eventos)
                                                if (!ad) {
                                                    const segments = current.split('/').filter(Boolean);
                                                    if (segments.length > 0) {
                                                        const parent = '/' + segments[0];
                                                        ad = adPlacements.find(a => normalize(a.page_path) === parent);
                                                    }
                                                }
                                                
                                                // 3. Fallback para Home
                                                if (!ad) {
                                                    ad = adPlacements.find(a => normalize(a.page_path) === '/');
                                                }

                                                const url = ad?.video_url;
                                                
                                                if (!url) return "https://www.youtube.com/embed/sEIZEYLlUtA?controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3";
                                                
                                                // Convert standard YouTube URLs to Embed URLs
                                                if (url.includes('youtube.com/embed/')) return url;
                                                const videoIdMatch = url.match(/(?:v=|v\/|vi=|vi\/|youtu\.be\/|embed\/|watch\?v=)([^#?&]*)/);
                                                const videoId = videoIdMatch ? videoIdMatch[1] : null;
                                                return videoId ? `https://www.youtube.com/embed/${videoId}?controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3` : url;
                                            })()}
                                            title="BrasilRun Featured Video"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-50/20 via-transparent to-transparent pointer-events-none"></div>
                                    </div>
                                </section>
                            )}

                            <div className="flex-1 bg-transparent lg:rounded-none">
                                {children}
                            </div>

                            {/* Health Disclaimer */}
                            <div className="p-6 bg-gray-50 border-t border-gray-100 lg:rounded-[2rem] lg:bg-white lg:mt-8">
                                <div className="bg-amber-50/50 border border-amber-200/50 p-4 rounded-3xl">
                                    <p className="text-[9px] font-black text-amber-900 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <AlertTriangle className="w-3 h-3" />
                                        Aviso Importante
                                    </p>
                                    <p className="text-[9px] text-amber-800/70 font-bold leading-relaxed uppercase italic">
                                        O conteúdo do BrasilRun é estritamente informativo. Ele não substitui o diagnóstico, aconselhamento ou acompanhamento de médicos.
                                    </p>
                                </div>
                                <p className="mt-4 text-[8px] text-center text-gray-300 font-black uppercase tracking-[0.2em]">BrasilRun © 2026 - A Sua Comunidade no Asfalto</p>
                            </div>
                        </main>

                        {/* Desktop Right Sidebar — hidden on admin pages */}
                        {!pathname.startsWith('/admin') && (
                            <aside className="hidden lg:block w-80 space-y-6">
                                <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Em Destaque Agora</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 group cursor-pointer">
                                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                                                <TrendingUp className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-blue-900 uppercase italic">Maratona SP 2025</p>
                                                <p className="text-[10px] font-bold text-gray-400">145 corredores ativos</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 group cursor-pointer">
                                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <Hash className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-blue-900 uppercase italic">Ranking de Tênis</p>
                                                <p className="text-[10px] font-bold text-gray-400">Review da semana</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <Star className="w-8 h-8 text-yellow-400 mb-4 animate-pulse" />
                                        <h4 className="text-xl font-black italic uppercase leading-tight mb-2">Seja Membro Premium</h4>
                                        <p className="text-xs text-blue-100 font-medium mb-4">Acesso a treinos exclusivos e descontos em provas.</p>
                                        <button className="bg-white text-blue-600 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-green-500 hover:text-white transition-all border border-white/30">Descobrir Vantagens</button>
                                    </div>
                                    <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-125 transition-all">
                                        <Users className="w-48 h-48" />
                                    </div>
                                </div>
                                {/* ── Ad Block 1 ─────────────────────────── */}
                                <a
                                    href="#"
                                    target="_blank"
                                    rel="sponsored noopener noreferrer"
                                    className="block rounded-[2rem] overflow-hidden border border-gray-100 bg-white group relative"
                                >
                                    <div className="relative h-36 overflow-hidden">
                                        <img
                                            src="https://images.unsplash.com/photo-1608231387042-66d1773d3028?auto=format&fit=crop&w=600&q=80"
                                            alt="Ad – Tênis de Corrida"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                        <span className="absolute top-3 right-3 text-[8px] font-black bg-black/30 backdrop-blur-md text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Patrocinado</span>
                                        <div className="absolute bottom-3 left-4 right-4">
                                            <p className="text-[9px] font-black text-green-400 uppercase tracking-[0.15em] leading-none mb-0.5">Nova Temporada</p>
                                            <h4 className="text-sm font-black text-white italic uppercase leading-tight">Tênis & Acessórios</h4>
                                        </div>
                                    </div>
                                    <div className="p-4 flex items-center justify-between">
                                        <p className="text-[10px] font-bold text-gray-500">Equipamentos para corredores</p>
                                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider">Ver ofertas →</span>
                                    </div>
                                </a>

                                {/* ── Ad Block 2 ─────────────────────────── */}
                                <a
                                    href="#"
                                    target="_blank"
                                    rel="sponsored noopener noreferrer"
                                    className="block rounded-[2rem] overflow-hidden border border-gray-100 bg-white group relative"
                                >
                                    <div className="relative h-36 overflow-hidden">
                                        <img
                                            src="https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=600&q=80"
                                            alt="Ad – Corrida de Rua"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                        <span className="absolute top-3 right-3 text-[8px] font-black bg-black/30 backdrop-blur-md text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Patrocinado</span>
                                        <div className="absolute bottom-3 left-4 right-4">
                                            <p className="text-[9px] font-black text-orange-400 uppercase tracking-[0.15em] leading-none mb-0.5">Inscrições Abertas</p>
                                            <h4 className="text-sm font-black text-white italic uppercase leading-tight">Corridas de Rua 2025</h4>
                                        </div>
                                    </div>
                                    <div className="p-4 flex items-center justify-between">
                                        <p className="text-[10px] font-bold text-gray-500">Garanta sua vaga agora</p>
                                        <span className="text-[9px] font-black text-orange-500 uppercase tracking-wider">Inscrever-se →</span>
                                    </div>
                                </a>
                            </aside>

                        )}
                    </div>

                    {/* Mobile Bottom Navigation */}
                    <footer className="lg:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[448px] bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-around items-center p-2 z-50 shadow-[0_-5px_25px_rgba(0,0,0,0.1)]">
                        <Link href="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-blue-600 scale-110' : 'text-gray-400'}`}>
                            <Home className="w-4 h-4" />
                            <span className="text-[8px] font-bold uppercase tracking-tighter">Início</span>
                        </Link>
                        <Link href="/communities" className={`flex flex-col items-center gap-1 ${isActive('/communities') ? 'text-blue-600 scale-110' : 'text-gray-400'}`}>
                            <Users className="w-4 h-4" />
                            <span className="text-[8px] font-bold uppercase tracking-tighter">Grupos</span>
                        </Link>
                        <Link href="/c/dicas-tenis/new" className="relative -top-5 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-2xl p-3 border-4 border-white text-white active:scale-90 transition-all">
                            <Plus className="w-6 h-6" strokeWidth={3} />
                        </Link>
                        <button onClick={() => setShowSearch(true)} className="flex flex-col items-center gap-1 text-gray-400">
                            <Search className="w-4 h-4" />
                            <span className="text-[8px] font-bold uppercase tracking-tighter">Busca</span>
                        </button>
                        <Link href="/profile" className={`flex flex-col items-center gap-1 ${isActive('/profile') ? 'text-blue-600 scale-110' : 'text-gray-400'}`}>
                            <UserIcon className="w-4 h-4" />
                            <span className="text-[8px] font-bold uppercase tracking-tighter">Perfil</span>
                        </Link>
                    </footer>
                </div>
            </div>

            {/* Global Search Overlay (shared) */}
            {showSearch && (
                <div className="fixed inset-0 bg-blue-900/40 z-[100] flex flex-col backdrop-blur-md p-4">
                    <div className="bg-white rounded-3xl p-5 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 max-h-[80vh] flex flex-col max-w-2xl mx-auto w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-black text-blue-900 uppercase italic tracking-tighter text-sm">Explorar BrasilRun</h2>
                            <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="bg-gray-100 p-2 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Pesquisar..." className="w-full p-4 bg-blue-50 rounded-2xl border-none outline-none font-medium text-blue-900 text-sm mb-4" />
                        <div className="overflow-y-auto flex-1 space-y-4 pr-2">
                            {isSearching ? <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 text-blue-500 animate-spin" /></div> : (
                                <>
                                    {searchResults.communities.map((c: any) => (
                                        <Link key={c.id} href={`/c/${c.slug}`} onClick={() => setShowSearch(false)} className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-xl transition-colors">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><Users className="w-5 h-5" /></div>
                                            <div><p className="text-sm font-bold text-blue-900">{c.name}</p></div>
                                        </Link>
                                    ))}
                                    {searchResults.topics.map((t: any) => (
                                        <Link key={t.id} href={`/t/${t.id}`} onClick={() => setShowSearch(false)} className="flex items-start gap-3 p-3 hover:bg-green-50 rounded-xl transition-colors">
                                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mt-1"><MessageSquare className="w-4 h-4" /></div>
                                            <div><p className="text-sm font-bold text-gray-800">{t.title}</p></div>
                                        </Link>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Layout;
