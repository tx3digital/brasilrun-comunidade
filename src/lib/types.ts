export interface AuthUser {
    id: string;
    username: string;
    avatar_url: string;
    role: 'admin' | 'user';
}

export interface Community {
    id: string;
    name: string;
    slug: string;
    description: string;
    topic_count: number;
    image: string;
}

export interface Topic {
    id: string;
    community_id: string;
    author_id: string;
    title: string;
    content: string;
    created_at: string;
    author?: AuthUser;
}

export interface Post {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    image: string;
    date: string;
    author: string;
}

export interface Product {
    id: string;
    name: string;
    category: string;
    price: string;
    rating: number;
    image: string;
    description: string;
}
