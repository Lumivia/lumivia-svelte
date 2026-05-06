import type { PageServerLoad } from './$types';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

const PAGE_SIZE = 18;
const BASE_URL = 'https://www.lumivia.app/masdestinos';

export const load: PageServerLoad = async ({ url, setHeaders, platform }) => {
    const pageParam = Number(url.searchParams.get('page') ?? '1');
    const pageFromQuery = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    
    // 🔥 BLINDAJE 1: Prevención de strings vacíos que causaban el Error 500
    const rawPais = url.searchParams.get('pais');
    const paisQuery = (rawPais && rawPais.trim() !== '' ? rawPais : 'MX').toUpperCase();
    
    const vueloParam = url.searchParams.get('vuelo');
    const vueloId = vueloParam ? Number(vueloParam) : null;

    setHeaders({
        'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=60'
    });

    let schemaJSON: string | null = null;
    let canonicalURL = `${BASE_URL}?pais=${paisQuery}`;
    if (vueloId) canonicalURL = `${BASE_URL}?vuelo=${vueloId}`;
    if (!vueloId && pageFromQuery > 1) canonicalURL = `${BASE_URL}?pais=${paisQuery}&page=${pageFromQuery}`;

    const cacheKey = vueloId 
        ? `lumivia_vuelo_${vueloId}` 
        : `lumivia_catalogo_${paisQuery}_p${pageFromQuery}`;

    // 1) LECTURA DE CACHÉ EDGE
    try {
        if (platform?.env?.KV_CACHE) {
            const cached = await platform.env.KV_CACHE.get(cacheKey, 'json');
            if (cached) {
                return { ...cached, fromCache: true };
            }
        }
    } catch (e) {
        console.error("Error leyendo KV Cache:", e);
    }

    const supabaseUrl = env.PUBLIC_SUPABASE_URL || '';
    const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY || '';

    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false }
    });

    let ofertasCrudas: any[] = [];
    let total = 0;
    let totalPages = 1;
    let paisMercadoResult = paisQuery;

    // 🔥 BLINDAJE 2: Try-Catch global para evitar caída de SvelteKit si falla la DB
    try {
        let dealEncontrado = false;

        // 3A) INTENTO 1: Buscar el Vuelo Único (Del Boletín)
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
                dealEncontrado = true;
            }
        } 
        
        // 🔥 EL PARACAÍDAS (Graceful Degradation)
        // 3B) INTENTO 2: Si no venía Vuelo ID, o si venía pero ya expiró/no existe -> Carga el catálogo
        if (!dealEncontrado) {
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

        // 3.5) ENRIQUECIMIENTO DE DATOS
        if (ofertasCrudas.length > 0) {
            // 🔥 BLINDAJE 3: .filter(Boolean) asegura que no pasen nulls a PostgREST
            const codigosIata = [...new Set([
                ...ofertasCrudas.map(o => o.origen),
                ...ofertasCrudas.map(o => o.destino)
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

                ofertasCrudas = ofertasCrudas.map(oferta => ({
                    ...oferta,
                    origen_nombre: mapaDestinos[oferta.origen]?.nombre_ciudad || oferta.origen,
                    destino_nombre: mapaDestinos[oferta.destino]?.nombre_ciudad || oferta.destino,
                    imagen_fallback: mapaDestinos[oferta.destino]?.imagen_url_verificada || null
                }));
            }
        }
    } catch (dbError) {
        console.error("Error crítico procesando ofertas en DB:", dbError);
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

    // 4) GUARDADO EN CACHÉ EDGE
    try {
        if (platform?.env?.KV_CACHE && responseData.deals.length > 0) {
            await platform.env.KV_CACHE.put(cacheKey, JSON.stringify(responseData), { 
                expirationTtl: 300 
            });
        }
    } catch (e) {
        console.error("Error guardando en KV Cache:", e);
    }

    return { ...responseData, fromCache: false };
};
