import type { PageServerLoad } from './$types';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

const PAGE_SIZE = 18;
const BASE_URL = 'https://www.lumivia.app/masdestinos';

// Agregamos 'platform' a los parámetros para acceder a Cloudflare KV
export const load: PageServerLoad = async ({ url, setHeaders, platform }) => {
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

    // 🔥 CLAVE KV: Generamos un nombre único dependiendo de lo que el cliente pida
    const cacheKey = vueloId 
        ? `lumivia_vuelo_${vueloId}` 
        : `lumivia_catalogo_${paisQuery}_p${pageFromQuery}`;

    // 1) INTENTO DE LECTURA DESDE CLOUDFLARE EDGE
    try {
        if (platform?.env?.KV_CACHE) {
            const cached = await platform.env.KV_CACHE.get(cacheKey, 'json');
            if (cached) {
                console.log(`⚡ Servido desde KV Edge: ${cacheKey}`);
                return { ...cached, fromCache: true };
            }
        }
    } catch (e) {
        console.error("Error leyendo KV Cache:", e);
    }

    // 2) INICIALIZACIÓN DE SUPABASE (Solo se ejecuta si el caché falló o expiró)
    const supabaseUrl = env.PUBLIC_SUPABASE_URL || '';
    const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY || '';

    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false }
    });

    let responseData;

    // 3A) LÓGICA: Vuelo Único
    if (vueloId && !Number.isNaN(vueloId)) {
        const { data, error } = await supabase
            .from('publicaciones_lumivia')
            .select('*')
            .eq('activo', true)
            .eq('id', vueloId)
            .limit(1);

        if (error || !data || data.length === 0) {
            responseData = { pais: paisQuery, page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1, deals: [], schemaJSON, canonicalURL };
        } else {
            responseData = { pais: data[0].pais_mercado || paisQuery, page: 1, pageSize: PAGE_SIZE, total: 1, totalPages: 1, deals: [data[0]], schemaJSON, canonicalURL };
        }
    } 
    // 3B) LÓGICA: Catálogo Paginado
    else {
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
            responseData = { pais: paisQuery, page, pageSize: PAGE_SIZE, total: 0, totalPages: 1, deals: [], schemaJSON, canonicalURL };
        } else {
            const total = count ?? 0;
            const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
            responseData = { pais: paisQuery, page, pageSize: PAGE_SIZE, total, totalPages, deals: deals ?? [], schemaJSON, canonicalURL };
        }
    }

    // 4) GUARDADO EN CACHÉ (TTL de 5 minutos = 300 segundos)
    try {
        // Solo guardamos en caché si realmente encontramos ofertas, para no cachear pantallas en blanco
        if (platform?.env?.KV_CACHE && responseData.deals.length > 0) {
            await platform.env.KV_CACHE.put(cacheKey, JSON.stringify(responseData), { 
                expirationTtl: 300 
            });
            console.log(`💾 Nuevo caché guardado: ${cacheKey}`);
        }
    } catch (e) {
        console.error("Error guardando en KV Cache:", e);
    }

    // 5) Retornamos los datos frescos a la web
    return { ...responseData, fromCache: false };
};
