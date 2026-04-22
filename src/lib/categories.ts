export interface BlogCategory {
    slug: string;
    label: string;
    emoji: string;
    description: string;
    color: string;       // Tailwind bg color for chips
    textColor: string;   // Tailwind text color
    accentColor: string; // hex for gradients/borders
}

export const BLOG_CATEGORIES: BlogCategory[] = [
    {
        slug: 'Treinamento',
        label: 'Treinamento',
        emoji: '🏋️',
        description: 'Planilhas, dicas de corrida, musculação e recuperação',
        color: 'bg-blue-100',
        textColor: 'text-blue-700',
        accentColor: '#3b82f6',
    },
    {
        slug: 'Nutrição',
        label: 'Nutrição',
        emoji: '🥗',
        description: 'Alimentação pré/pós treino, suplementação e hidratação',
        color: 'bg-green-100',
        textColor: 'text-green-700',
        accentColor: '#22c55e',
    },
    {
        slug: 'Equipamentos',
        label: 'Equipamentos',
        emoji: '👟',
        description: 'Tênis, relógios, roupas, acessórios e reviews',
        color: 'bg-amber-100',
        textColor: 'text-amber-700',
        accentColor: '#f59e0b',
    },
    {
        slug: 'Provas & Eventos',
        label: 'Provas & Eventos',
        emoji: '🏅',
        description: 'Maratonas, corridas de rua, calendário e relatos',
        color: 'bg-purple-100',
        textColor: 'text-purple-700',
        accentColor: '#a855f7',
    },
    {
        slug: 'Saúde & Mentalidade',
        label: 'Saúde & Mentalidade',
        emoji: '🧠',
        description: 'Lesões, fisioterapia, mindset, sono e motivação',
        color: 'bg-rose-100',
        textColor: 'text-rose-700',
        accentColor: '#f43f5e',
    },
];

export const getCategoryBySlug = (slug: string): BlogCategory | undefined =>
    BLOG_CATEGORIES.find(c => c.slug === slug);
