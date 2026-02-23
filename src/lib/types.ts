export interface AuthUser {
    id: string;
    email?: string;
    username: string;
    avatar_url: string;
    role: 'admin' | 'user';
    trust_score?: number;
    instagram_handle?: string;
    strava_link?: string;
}

export interface Profile {
    id: string;
    username: string;
    avatar_url: string;
    created_at: string;
    trust_score: number;
    role?: 'admin' | 'user';
    instagram_handle?: string;
    strava_link?: string;
}

export interface Community {
    id: string;
    name: string;
    slug: string;
    description: string;
    topic_count?: number;
    created_at: string;
    image_url?: string;
}

export interface Topic {
    id: string;
    community_id: string;
    user_id: string;
    title: string;
    content: string;
    created_at: string;
    status: 'approved' | 'pending_review' | 'flagged';
    profile?: Profile;
    likes_count?: number;
    is_pinned?: boolean;
    image_url?: string;
    moderation_reason?: string;
}

export interface Reply {
    id: string;
    topic_id: string;
    user_id: string;
    content: string;
    created_at: string;
    status: 'pending' | 'approved' | 'hidden';
    profile?: Profile;
    likes_count?: number;
}

export interface Product {
    id: string;
    name: string;
    brand: string;
    category: 'tenis' | 'relogio' | 'suplemento';
    description: string;
    image_url: string;
    average_rating: number;
    review_count: number;
    specifications: Record<string, string>;
}

export interface Review {
    id: string;
    product_id: string;
    user_id: string;
    rating: number;
    content: string;
    pros: string;
    cons: string;
    created_at: string;
    likes_count: number;
    profile?: Profile;
}

export interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    image_url: string;
    category: string;
    author: string;
    published_at: string;
    read_time: string;
}

export interface BlogComment {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
    profile?: Profile;
}

export interface RunningEvent {
    id: string;
    title: string;
    date: string;
    location: string;
    category: string;
    price_from: string;
    participants_count?: number;
    image_url: string;
    slug?: string;
    affiliate_url?: string;
}
