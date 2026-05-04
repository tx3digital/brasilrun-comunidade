'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { AdPlacement } from '@/lib/types';
import {
    Shield, Play, Save, Plus, Trash2, 
    ChevronLeft, Loader2, RefreshCw, AlertCircle,
    Layout as LayoutIcon, Globe, Settings, ExternalLink
} from 'lucide-react';

export default function AdminAdsPanel() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [ads, setAds] = useState<AdPlacement[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('brasilrun_user');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            if (user.role === 'admin') {
                setIsAdmin(true);
            } else {
                router.push('/');
            }
        } else {
            router.push('/auth');
        }
    }, [router]);

    useEffect(() => {
        if (isAdmin) {
            fetchAds();
        }
    }, [isAdmin]);

    const fetchAds = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('ad_placements')
                .select('*')
                .order('page_path', { ascending: true });
            
            if (error) throw error;
            setAds(data || []);
        } catch (err: any) {
            console.error('Error fetching ads:', err);
            // Better error reporting for debugging
            if (err.message) console.error('Error message:', err.message);
            if (err.details) console.error('Error details:', err.details);
            if (err.hint) console.error('Error hint:', err.hint);
            
            // Se a tabela não existir ainda, vamos usar um estado inicial vazio
            setAds([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRow = () => {
        const newAd: AdPlacement = {
            id: crypto.randomUUID(),
            placement_id: 'video_top',
            page_path: '/',
            video_url: '',
            is_active: true,
            updated_at: new Date().toISOString()
        };
        setAds([...ads, newAd]);
    };

    const handleRemoveRow = (id: string) => {
        setAds(ads.filter(ad => ad.id !== id));
    };

    const handleUpdateAd = (id: string, field: keyof AdPlacement, value: any) => {
        setAds(ads.map(ad => ad.id === id ? { ...ad, [field]: value } : ad));
    };

    const saveAds = async () => {
        setSaving(true);
        setMessage(null);
        try {
            // No Supabase real, faríamos um upsert ou deletaríamos todos e inseriríamos os novos
            // Para garantir que a tabela existe e o usuário tem permissão:
            const { error } = await supabase
                .from('ad_placements')
                .upsert(ads.map(ad => ({
                    placement_id: ad.placement_id,
                    page_path: ad.page_path,
                    video_url: ad.video_url,
                    is_active: ad.is_active,
                    updated_at: new Date().toISOString()
                })), { onConflict: 'page_path' });

            if (error) throw error;
            
            setMessage({ type: 'success', text: 'Configurações de publicidade salvas com sucesso!' });
            fetchAds();
        } catch (err: any) {
            console.error('Error saving ads:', err);
            // Better error reporting for debugging
            if (err.message) console.error('Error message:', err.message);
            
            setMessage({ 
                type: 'error', 
                text: (err.message?.includes('relation "ad_placements" does not exist') || err.message?.includes('404'))
                    ? 'Erro: A tabela "ad_placements" ainda não foi criada no Supabase. Por favor, execute o SQL fornecido abaixo.'
                    : `Erro ao salvar: ${err.message || 'Erro desconhecido'}`
            });
        } finally {
            setSaving(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center p-20 bg-slate-950 min-h-screen">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            {/* Top Bar */}
            <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Settings className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black uppercase italic tracking-tighter leading-none">Gestão de Publicidade</h1>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Controle de Vídeos e Banners</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={saveAds}
                        disabled={saving}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
                    >
                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Salvar Alterações
                    </button>
                </div>
            </div>

            <div className="p-6 max-w-6xl mx-auto">
                {message && (
                    <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                        message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}>
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-xs font-bold uppercase tracking-tight">{message.text}</p>
                    </div>
                )}

                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                        <div>
                            <h2 className="text-lg font-black italic uppercase tracking-tighter text-white">Vídeos de Destaque por Página</h2>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Defina URLs diferentes para cada área do site</p>
                        </div>
                        <button 
                            onClick={handleAddRow}
                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                        >
                            <Plus className="w-3 h-3" />
                            Adicionar Área
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-950/50">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Página / Rota</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">URL do Vídeo (YouTube Embed)</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest w-24 text-center">Ativo</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest w-20 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {ads.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <LayoutIcon className="w-8 h-8 text-slate-700" />
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nenhuma configuração encontrada</p>
                                                <button onClick={handleAddRow} className="text-blue-500 text-[10px] font-black uppercase hover:underline">Começar a configurar</button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    ads.map((ad) => (
                                        <tr key={ad.id} className="group hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Globe className="w-4 h-4 text-slate-500" />
                                                    <input 
                                                        type="text" 
                                                        value={ad.page_path}
                                                        onChange={(e) => handleUpdateAd(ad.id, 'page_path', e.target.value)}
                                                        placeholder="/"
                                                        className="bg-slate-800 border-none rounded-xl px-3 py-2 text-xs font-bold text-blue-400 w-40 outline-none focus:ring-2 focus:ring-blue-500/50"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-3 py-2 border border-transparent focus-within:border-blue-500/50 transition-all">
                                                    <Play className="w-4 h-4 text-slate-500" />
                                                    <input 
                                                        type="text" 
                                                        value={ad.video_url}
                                                        onChange={(e) => handleUpdateAd(ad.id, 'video_url', e.target.value)}
                                                        placeholder="https://www.youtube.com/embed/..."
                                                        className="bg-transparent border-none w-full text-xs font-medium text-slate-300 outline-none"
                                                    />
                                                    {ad.video_url && (
                                                        <a 
                                                            href={(() => {
                                                                const url = ad.video_url;
                                                                if (url.includes('youtube.com/embed/')) return url;
                                                                const videoIdMatch = url.match(/(?:v=|v\/|vi=|vi\/|youtu\.be\/|embed\/|watch\?v=)([^#?&]*)/);
                                                                const videoId = videoIdMatch ? videoIdMatch[1] : null;
                                                                return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
                                                            })()} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="text-slate-500 hover:text-white"
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => handleUpdateAd(ad.id, 'is_active', !ad.is_active)}
                                                    className={`w-10 h-5 rounded-full relative transition-all ${ad.is_active ? 'bg-green-600' : 'bg-slate-700'}`}
                                                >
                                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${ad.is_active ? 'right-1' : 'left-1'}`} />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => handleRemoveRow(ad.id)}
                                                    className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SQL Help */}
                <div className="mt-8 bg-blue-500/5 border border-blue-500/20 rounded-3xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Shield className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black italic uppercase tracking-tight text-white mb-2">Instruções Técnicas</h3>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed mb-4">
                                Se você receber um erro ao salvar, certifique-se de que a tabela <code className="text-blue-400">ad_placements</code> existe no seu banco de dados. 
                                Execute o seguinte comando SQL no editor do Supabase:
                            </p>
                            <div className="bg-slate-950 rounded-2xl p-4 font-mono text-[10px] text-blue-300 border border-slate-800 overflow-x-auto">
                                <pre>{`CREATE TABLE ad_placements (
  id uuid default uuid_generate_v4() primary key,
  placement_id text not null,
  page_path text unique not null,
  video_url text,
  is_active boolean default true,
  updated_at timestamp with time zone default now()
);

-- Habilitar RLS e permissões (Exemplo simples)
ALTER TABLE ad_placements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON ad_placements FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON ad_placements FOR ALL USING (true);`}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
