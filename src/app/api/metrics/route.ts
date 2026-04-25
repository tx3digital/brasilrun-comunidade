// app/api/metrics/route.ts
// ─────────────────────────────────────────────────────────────
// Endpoint que entrega as métricas do setor de corrida.
//
// Estratégia de atualização recorrente:
//   1. Next.js ISR (revalidate: 43200) → revalida a cada 12h automaticamente
//   2. Supabase como fonte primária → atualizável pelo dashboard admin
//   3. Fallback estático com dados reais (ABRACEO/CBAt) se Supabase falhar
//   4. Webhook manual: POST /api/metrics?secret=... → força revalidação
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { FALLBACK_METRICS, type Metric } from '@/lib/metrics';

// Revalida automaticamente a cada 12 horas (43200 segundos)
export const revalidate = 43200;

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('metrics')
            .select('*')
            .eq('is_active', true)
            .order('key');

        if (error || !data || data.length === 0) {
            console.warn('[metrics] Supabase indisponível ou vazio — usando fallback.');
            return NextResponse.json(
                { data: FALLBACK_METRICS, source: 'fallback', fetched_at: new Date().toISOString() },
                {
                    headers: {
                        'Cache-Control': 'public, s-maxage=43200, stale-while-revalidate=3600',
                    },
                }
            );
        }

        return NextResponse.json(
            { data: data as Metric[], source: 'supabase', fetched_at: new Date().toISOString() },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=43200, stale-while-revalidate=3600',
                },
            }
        );
    } catch (err) {
        console.error('[metrics] Erro ao buscar métricas:', err);
        return NextResponse.json(
            { data: FALLBACK_METRICS, source: 'fallback', fetched_at: new Date().toISOString() },
            { status: 200 }
        );
    }
}

// ─────────────────────────────────────────────────────────────
// POST /api/metrics — Atualiza uma métrica (requer admin token)
// Body: { key, value, sublabel?, source_name?, last_updated? }
// Header: Authorization: Bearer <METRICS_ADMIN_SECRET>
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    const authHeader = req.headers.get('authorization') ?? '';
    const secret = process.env.METRICS_ADMIN_SECRET;

    if (!secret || authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { key, value, sublabel, source_name, last_updated } = body;

        if (!key || !value) {
            return NextResponse.json({ error: 'key e value são obrigatórios' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('metrics')
            .upsert(
                {
                    key,
                    value,
                    ...(sublabel && { sublabel }),
                    ...(source_name && { source_name }),
                    last_updated: last_updated ?? new Date().toISOString(),
                },
                { onConflict: 'key' }
            )
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
