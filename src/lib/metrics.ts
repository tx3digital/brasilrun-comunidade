// ─────────────────────────────────────────────────────────────
// lib/metrics.ts
// Tipos, dados fallback e helper de fetch para métricas do setor.
//
// SUPABASE TABLE SETUP (executar no SQL Editor do Supabase):
// ─────────────────────────────────────────────────────────────
// CREATE TABLE IF NOT EXISTS public.metrics (
//   id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//   key         text UNIQUE NOT NULL,
//   value       text NOT NULL,
//   label       text NOT NULL,
//   sublabel    text,
//   source_name text NOT NULL,
//   source_url  text,
//   last_updated timestamptz DEFAULT now(),
//   is_active   boolean DEFAULT true
// );
//
// -- Dados iniciais:
// INSERT INTO public.metrics (key, value, label, sublabel, source_name, source_url, last_updated)
// VALUES
//   ('runners_brazil',  '13 Milhões', 'Corredores no Brasil',
//    'Estimativa de praticantes de corrida de rua',
//    'ABRACEO / Strava 2024', 'https://www.abraceo.org.br', '2024-12-01'),
//   ('official_races',  '5.241', 'Provas Oficiais em 2025',
//    '+85% em relação a 2024 (ABRACEO + CBAt)',
//    'ABRACEO + CBAt', 'https://www.cbat.org.br', '2025-04-01');
//
// -- RLS: permitir leitura pública
// ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Public read metrics" ON public.metrics FOR SELECT USING (true);
// ─────────────────────────────────────────────────────────────

export interface Metric {
    id?: string;
    key: string;
    value: string;
    label: string;
    sublabel?: string;
    source_name: string;
    source_url?: string;
    last_updated: string;
    is_active?: boolean;
}

/** Dados fallback caso o Supabase não esteja disponível */
export const FALLBACK_METRICS: Metric[] = [
    {
        key: 'runners_brazil',
        value: '13 Milhões',
        label: 'Corredores no Brasil',
        sublabel: 'Estimativa de praticantes de corrida de rua',
        source_name: 'ABRACEO / Strava 2024',
        source_url: 'https://www.abraceo.org.br',
        last_updated: '2024-12-01',
    },
    {
        key: 'official_races',
        value: '5.241',
        label: 'Provas Oficiais em 2025',
        sublabel: '+85% em relação a 2024 (ABRACEO + CBAt)',
        source_name: 'ABRACEO + CBAt',
        source_url: 'https://www.cbat.org.br',
        last_updated: '2025-04-01',
    },
];

/** Formata a data de última atualização de forma legível */
export function formatLastUpdated(dateString: string): string {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return dateString;
    }
}
