'use client';

import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { AuthUser } from '@/lib/types';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('brasilrun_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const logout = () => {
        setUser(null);
        localStorage.removeItem('brasilrun_user');
    };

    return (
        <Layout user={user} onLogout={logout}>
            {children}
        </Layout>
    );
}
