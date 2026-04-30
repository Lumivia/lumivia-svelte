import type { PageServerLoad } from './$types';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

const PAGE_SIZE = 18;
const BASE_URL = 'https://www.lumivia.app/masdestinos';

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

    // 🔥 CLAVE KV: Generamos un nombre único
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

    // 2) INICIALIZACIÓN DE SUPABASE
    const supabaseUrl = env.PUBLIC_SUPABASE_URL || '';
    const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY || '';

    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false }
    });

    let ofertasCrudas: any[] = [];
    let total = 0;
    let totalPages = 1;
    let paisMercadoResult = paisQuery;

    // 3A) LÓGICA: Vuelo Único
    if (vueloId && !Number.isNaN(vueloId)) {
        const { data, error } = await supabase
            .from('publicaciones_lumivia')
            .select('*')
            .eq('activo', true)
            .eq('id', vueloId)
            .limit(1);

        if (!error && data && data.length > 0) {
            ofertasCrudas = data;
            paisMercadoResult = data[0].pais_mercado || paisQuery;
            total = 1;
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

        if (!error && deals) {
            ofertasCrudas = deals;
            total = count ?? 0;
            totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        }
    }

    // 🔥 3.5) EL BISTURÍ: ENRIQUECIMIENTO DE DATOS (JOIN EN MEMORIA)
    if (ofertasCrudas.length > 0) {
        // Extraemos IATAs únicos
        const codigosIata = [...new Set([
            ...ofertasCrudas.map(o => o.origen),
            ...ofertasCrudas.map(o => o.destino)
        ])];

        // Consultamos el diccionario
        const { data: diccionario } = await supabase
            .from('diccionario_destinos')
            .select('iata_code, nombre_hotel, imagen_url_verificada')
            .in('iata_code', codigosIata);

        // Creamos mapa ultrarrápido
        const mapaDestinos = (diccionario || []).reduce((acc, curr) => {
            acc[curr.iata_code] = curr;
            return acc;
        }, {} as Record<string, any>);

        // Inyectamos nombres e imágenes
        ofertasCrudas = ofertasCrudas.map(oferta => ({
            ...oferta,
            origen_nombre: mapaDestinos[oferta.origen]?.nombre_hotel || oferta.origen,
            destino_nombre: mapaDestinos[oferta.destino]?.nombre_hotel || oferta.destino,
            imagen_fallback: mapaDestinos[oferta.destino]?.imagen_url_verificada || null
        }));
    }

    const responseData = { 
        pais: paisMercadoResult, 
        page: pageFromQuery, 
        pageSize: PAGE_SIZE, 
        total, 
        totalPages, 
        deals: ofertasCrudas, 
        schemaJSON, 
        canonicalURL 
    };

    // 4) GUARDADO EN CACHÉ
    try {
        if (platform?.env?.KV_CACHE && responseData.deals.length > 0) {
            await platform.env.KV_CACHE.put(cacheKey, JSON.stringify(responseData), { 
                expirationTtl: 300 
            });
            console.log(`💾 Nuevo caché guardado: ${cacheKey}`);
        }
    } catch (e) {
        console.error("Error guardando en KV Cache:", e);
    }

    // 5) Retornamos los datos frescos
    return { ...responseData, fromCache: false };
};
