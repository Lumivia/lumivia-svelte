import type { PageServerLoad } from './$types';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

const PAGE_SIZE = 9; 
const BASE_URL = 'https://www.lumivia.app/wanderlust';

export const load: PageServerLoad = async ({ url, setHeaders, platform }) => {
    const pageParam = Number(url.searchParams.get('page') ?? '1');
    const pageFromQuery = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    
    // Blindaje de País
    const rawPais = url.searchParams.get('pais');
    const paisQuery = (rawPais && rawPais.trim() !== '' ? rawPais : 'MX').toUpperCase();

    // Caché estricto (300s = 5 min)
    setHeaders({
        'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=60'
    });

    let canonicalURL = pageFromQuery > 1 
        ? `${BASE_URL}?pais=${paisQuery}&page=${pageFromQuery}`
        : `${BASE_URL}?pais=${paisQuery}`;

    const cacheKey = `lumivia_wanderlust_${paisQuery}_p${pageFromQuery}`;

    // 1) LECTURA DE CACHÉ EDGE
    try {
        if (platform?.env?.KV_CACHE) {
            const cached = await platform.env.KV_CACHE.get(cacheKey, 'json');
            if (cached) {
                return { ...cached, fromCache: true };
            }
        }
    } catch (e) {
        console.error("Error leyendo KV Cache en Wanderlust:", e);
    }

    const supabaseUrl = env.PUBLIC_SUPABASE_URL || '';
    const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false }
    });

    let ofertasWanderlust: any[] = [];
    let total = 0;
    let totalPages = 1;

    // 2) CONSULTA A BASE DE DATOS (Filtro Wanderlust)
    try {
        const from = (pageFromQuery - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data: deals, count, error } = await supabase
            .from('publicaciones_lumivia')
            .select('*', { count: 'exact' })
            .eq('activo', true)
            .eq('pais_mercado', paisQuery)
            .like('titulo_gancho', 'WANDERLUST:%')
            .order('created_at', { ascending: false })
            .range(from, to);

        if (!error && deals) {
            ofertasWanderlust = deals;
            total = count ?? 0;
            totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        }

        // 3) ENRIQUECIMIENTO DE DATOS (Diccionario)
        if (ofertasWanderlust.length > 0) {
            const codigosIata = [...new Set([
                ...ofertasWanderlust.map(o => o.origen),
                ...ofertasWanderlust.map(o => o.destino)
            ].filter(Boolean))];

            if (codigosIata.length > 0) {
                const { data: diccionario } = await supabase
                    .from('diccionario_destinos')
                    .select('iata_code, nombre_ciudad, imagen_url_verificada')
                    .in('iata_code', codigosIata);

                const mapaDestinos = (diccionario || []).reduce((acc, curr) => {
                    acc[curr.iata_code] = curr;
                    return acc;
                }, {} as Record<string, any>);

                ofertasWanderlust = ofertasWanderlust.map(oferta => ({
                    ...oferta,
                    origen_nombre: mapaDestinos[oferta.origen]?.nombre_ciudad || oferta.origen,
                    destino_nombre: mapaDestinos[oferta.destino]?.nombre_ciudad || oferta.destino,
                    imagen_fallback: mapaDestinos[oferta.destino]?.imagen_url_verificada || null
                }));
            }
        }
    } catch (dbError) {
        console.error("Error crítico procesando ofertas Wanderlust:", dbError);
    }

    const responseData = { 
        pais: paisQuery, 
        page: pageFromQuery, 
        pageSize: PAGE_SIZE, 
        total, 
        totalPages, 
        deals: ofertasWanderlust, 
        canonicalURL 
    };

    // 4) GUARDADO EN CACHÉ EDGE
    try {
        if (platform?.env?.KV_CACHE && responseData.deals.length > 0) {
            await platform.env.KV_CACHE.put(cacheKey, JSON.stringify(responseData), { 
                expirationTtl: 300 
            });
        }
    } catch (e) {
        console.error("Error guardando en KV Cache (Wanderlust):", e);
    }

    return { ...responseData, fromCache: false };
};
