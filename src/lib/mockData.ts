import { Community, Topic, Profile, Reply, RunningEvent, Review, BlogPost, BlogComment, Product } from './types';

export const MOCK_PROFILES: Profile[] = [
    { id: 'admin-1', username: 'BrasilRunAdmin', avatar_url: 'https://i.pravatar.cc/150?u=admin', created_at: new Date().toISOString(), trust_score: 100, role: 'admin' },
    { id: '1', username: 'MaratonistaPro', avatar_url: 'https://i.pravatar.cc/150?u=1', created_at: new Date().toISOString(), trust_score: 98, role: 'user' },
    { id: '2', username: 'CorredorAmador', avatar_url: 'https://i.pravatar.cc/150?u=2', created_at: new Date().toISOString(), trust_score: 82, role: 'user' },
    { id: '3', username: 'TrailQueen', avatar_url: 'https://i.pravatar.cc/150?u=3', created_at: new Date().toISOString(), trust_score: 91, role: 'user' },
    { id: '4', username: 'PaceMaker88', avatar_url: 'https://i.pravatar.cc/150?u=4', created_at: new Date().toISOString(), trust_score: 75, role: 'user' },
    { id: '5', username: 'NutriRun', avatar_url: 'https://i.pravatar.cc/150?u=5', created_at: new Date().toISOString(), trust_score: 88, role: 'user' },
];

export const MOCK_BLOG_POSTS: BlogPost[] = [
    {
        id: 'b1',
        title: 'Os 5 Melhores Tênis de Placa de Carbono para 2024',
        excerpt: 'Analisamos os lançamentos da Nike, Adidas e ASICS para ajudar você a escolher seu próximo recorde pessoal.',
        content: 'A revolução da placa de carbono não para. Neste ano, vimos a introdução de espumas ainda mais leves e geometrias agressivas...',
        author: 'BrasilRun Editorial',
        category: 'Equipamento',
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
        read_time: '6 min',
        published_at: '2024-03-20'
    }
];

export const MOCK_COMMUNITIES: Community[] = [
    { id: 'c1', name: 'Maratona de São Paulo', slug: 'maratona-sp', description: 'Espaço para quem vai encarar os 42km na capital paulista.', topic_count: 145, created_at: new Date().toISOString() },
    { id: 'c2', name: 'Dicas de Tênis', slug: 'dicas-tenis', description: 'Qual o melhor pisante para sua rodagem? Poste aqui!', topic_count: 312, created_at: new Date().toISOString() },
    { id: 'c6', name: 'INSPIRE-SE', slug: 'inspire-se', description: 'Espaço para compartilhar histórias de superação.', topic_count: 89, created_at: new Date().toISOString() },
];

export const MOCK_TOPICS: Topic[] = [
    {
        id: 't-pending-1', community_id: 'c2', user_id: '4',
        title: 'Vendo Tênis Nike Novo - Chama no DM',
        content: 'Galera, comprei o Alphafly mas ficou apertado. Vendo barato, manda mensagem no privado ou me chama no zap.',
        created_at: new Date().toISOString(),
        status: 'pending_review', profile: MOCK_PROFILES[4], likes_count: 0,
        moderation_reason: 'Engenharia social / Link externo / Comercial'
    },
    {
        id: 't-inspire-1', community_id: 'c6', user_id: '3',
        title: 'Como a corrida curou minha mente',
        content: 'Passei por um momento difícil ano passado...',
        created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
        status: 'approved', profile: MOCK_PROFILES[3], likes_count: 124
    }
];

export const MOCK_EVENTS: RunningEvent[] = [
    { id: 'e1', title: 'Maratona Internacional de SP 2025', date: '06 ABR 2025', location: 'São Paulo, SP', category: '42K | 21K | 10K', price_from: 'R$ 189,00', image_url: 'https://images.unsplash.com/photo-1530549387631-f31f9a247f6a?auto=format&fit=crop&w=800&q=80', affiliate_url: '#' }
];

export const MOCK_REPLIES: Reply[] = [
    {
        id: 'rep1',
        topic_id: 't-inspire-1',
        user_id: 'admin-1',
        content: 'Parabéns pela história! A corrida realmente transforma vidas.',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        status: 'approved',
        profile: MOCK_PROFILES[0],
        likes_count: 5
    },
    {
        id: 'rep2',
        topic_id: 't-pending-1',
        user_id: 'admin-1',
        content: 'Tópico bloqueado. Por favor, leia as regras sobre vendas na comunidade.',
        created_at: new Date(Date.now() - 3600000 * 0.5).toISOString(),
        status: 'approved',
        profile: MOCK_PROFILES[0],
        likes_count: 0
    }
];

export const MOCK_PRODUCTS: Product[] = [
    {
        id: 'p1',
        name: 'Vaporfly 3',
        brand: 'Nike',
        category: 'tenis',
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
        description: 'O ápice da velocidade para maratonas.',
        average_rating: 4.8,
        review_count: 12,
        specifications: {
            'Peso': '185g (tamanho 42)',
            'Drop': '8mm',
            'Placa': 'Carbono Flyplate',
            'Espuma': 'ZoomX'
        }
    }
];

export const MOCK_REVIEWS: Review[] = [
    {
        id: 'r1',
        product_id: 'p1',
        user_id: '1',
        rating: 5,
        content: 'Simplesmente o melhor tênis que já usei.',
        pros: 'Leveza',
        cons: 'Preço',
        likes_count: 15,
        created_at: new Date().toISOString(),
        profile: MOCK_PROFILES[1]
    }
];
