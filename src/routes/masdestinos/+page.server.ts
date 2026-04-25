import type { PageServerLoad } from './$types';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

const PAGE_SIZE = 18;
const BASE_URL = 'https://www.lumivia.app/masdestinos';

export const load: PageServerLoad = async ({ url, setHeaders }) => {
    // Creamos el cliente DENTRO de load con variables dinámicas
    const supabaseUrl = env.PUBLIC_SUPABASE_URL || '';
    const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY || '';

    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false }
    });

    const pageParam = Number(url.searchParams.get('page') ?? '1');
    const pageFromQuery = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const paisQuery = (url.searchParams.get('pais') ?? 'MX').toUpperCase();
    const vueloParam = url.searchParams.get('vuelo');
    const vueloId = vueloParam ? Number(vueloParam) : null;

    setHeaders({
        'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=60'
    });

    let schemaJSON: string | null = null;
    let canonicalURL = `${BASE_URL}?pais=${paisQuery}`;
    if (vueloId) canonicalURL = `${BASE_URL}?vuelo=${vueloId}`;
    if (!vueloId && pageFromQuery > 1) canonicalURL = `${BASE_URL}?pais=${paisQuery}&page=${pageFromQuery}`;

    // Vuelo Único
    if (vueloId && !Number.isNaN(vueloId)) {
        const { data, error } = await supabase
            .from('publicaciones_lumivia')
            .select('*')
            .eq('activo', true)
            .eq('id', vueloId)
            .limit(1);

        if (error || !data || data.length === 0) {
            return { pais: paisQuery, page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1, deals: [], schemaJSON, canonicalURL };
        }
        return { pais: data[0].pais_mercado || paisQuery, page: 1, pageSize: PAGE_SIZE, total: 1, totalPages: 1, deals: [data[0]], schemaJSON, canonicalURL };
    }

    // Catálogo Paginado
    const page = pageFromQuery;
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data: deals, count, error } = await supabase
        .from('publicaciones_lumivia')
        .select('*', { count: 'exact' })
        .eq('activo', true)
        .eq('pais_mercado', paisQuery)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        return { pais: paisQuery, page, pageSize: PAGE_SIZE, total: 0, totalPages: 1, deals: [], schemaJSON, canonicalURL };
    }

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return { pais: paisQuery, page, pageSize: PAGE_SIZE, total, totalPages, deals: deals ?? [], schemaJSON, canonicalURL };
};
