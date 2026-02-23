'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Heart, Zap, Sparkles, Send, Loader2, ChevronRight } from 'lucide-react';
import { Reply } from '@/lib/types';
import { MOCK_TOPICS, MOCK_REPLIES, MOCK_COMMUNITIES } from '@/lib/mockData';

export default function TopicDetail() {
    const params = useParams();
    const id = params?.id as string;
    const topic = MOCK_TOPICS.find(t => t.id === id);
    const community = MOCK_COMMUNITIES.find(c => c.id === topic?.community_id);
    const [replies, setReplies] = useState<Reply[]>(MOCK_REPLIES.filter(r => r.topic_id === id));
    const [newReply, setNewReply] = useState('');
    const [isLiking, setIsLiking] = useState(false);
    const [coachResponse, setCoachResponse] = useState<string | null>(null);
    const [isCoachLoading, setIsCoachLoading] = useState(false);
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!topic) {
        return <div className="p-8 text-center font-bold text-gray-400 uppercase tracking-widest py-32">Tópico não encontrado.</div>;
    }

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReply.trim() || isSubmittingReply) return;

        // Simplification for now, original code used Gemini AI which we'll handle better later with Supabase
        setIsSubmittingReply(true);
        setTimeout(() => {
            const reply: any = {
                id: Math.random().toString(36).substr(2, 9),
                topic_id: topic.id,
                user_id: '1',
                content: newReply,
                created_at: new Date().toISOString(),
                status: 'approved',
                profile: { id: '1', username: 'Você', avatar_url: 'https://i.pravatar.cc/150?u=me', trust_score: 100 },
                likes_count: 0
            };
            setReplies([...replies, reply]);
            setNewReply('');
            setIsSubmittingReply(false);
        }, 500);
    };

    return (
        <div className="pb-32 bg-gray-50 min-h-screen">
            <div className="bg-blue-600 p-2 px-4 text-[10px] text-white font-black uppercase tracking-widest flex items-center gap-2">
                <Link href="/" className="hover:underline">BrasilRun</Link>
                <span>&raquo;</span>
                <Link href={`/c/${community?.slug}`} className="hover:underline">{community?.name}</Link>
            </div>

            <div className="bg-white p-6 border-b border-gray-200 shadow-sm mb-4 space-y-2">
                <div className="flex items-center gap-3 mb-4">
                    <img src={topic.profile?.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-blue-50 shadow-sm" />
                    <div>
                        <h3 className="text-sm font-black text-blue-900 uppercase italic leading-none">{topic.profile?.username}</h3>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Autor do Tópico</span>
                    </div>
                </div>

                <h1 className="text-3xl font-black text-blue-900 leading-tight italic uppercase tracking-tighter">{topic.title}</h1>
                <p className="text-xs text-gray-500 font-medium">Discussão iniciada na comunidade {community?.name}.</p>

                <div className="pt-4">
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">{topic.content}</p>
                </div>

                <div className="mt-8 flex items-center justify-between gap-3">
                    <button
                        onClick={() => setIsLiking(!isLiking)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isLiking ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}
                    >
                        <Heart className={`w-3 h-3 ${isLiking ? 'fill-current' : ''}`} />
                        <span>{topic.likes_count! + (isLiking ? 1 : 0)} Gostei</span>
                    </button>

                    <button
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                        <Sparkles className="w-3 h-3" />
                        ✨ Dica do Coach
                    </button>
                </div>
            </div>

            <div className="px-4 space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    Comentários <span className="h-0.5 bg-gray-200 flex-1"></span>
                </h4>

                {replies.map(reply => (
                    <div key={reply.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 mb-2">
                            <img src={reply.profile?.avatar_url} alt="Avatar" className="w-6 h-6 rounded-full border border-blue-50" />
                            <span className="text-[10px] font-black text-blue-800 uppercase italic tracking-tighter">{reply.profile?.username}</span>
                            <span className="text-[9px] text-gray-300 font-bold ml-auto">Há pouco</span>
                        </div>
                        <p className="text-sm text-gray-700 font-medium leading-relaxed">{reply.content}</p>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 p-4 pb-24 shadow-2xl z-50">
                <form onSubmit={handleReply} className="flex items-center gap-2">
                    <input
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        disabled={isSubmittingReply}
                        placeholder="Sua resposta..."
                        className="flex-1 p-4 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white p-4 rounded-2xl font-black shadow-lg"
                    >
                        <Send className="w-5 h-5" strokeWidth={3} />
                    </button>
                </form>
            </div>
        </div>
    );
}
