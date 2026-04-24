// src/routes/masdestinos/+page.server.ts
import type { PageServerLoad } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

const PAGE_SIZE = 18;

export const load: PageServerLoad = async ({ url }) => {
    const pageParam = Number(url.searchParams.get('page') ?? '1');
    const pageFromQuery = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

    const paisQuery = (url.searchParams.get('pais') ?? 'MX').toUpperCase();
    const vueloParam = url.searchParams.get('vuelo');
    const vueloId = vueloParam ? Number(vueloParam) : null;

    // 1) Schema global
    const { data: ofertasGlobales } = await supabase
        .from('publicaciones_lumivia')
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: false })
        .limit(20);

    let schemaJSON: string | null = null;

    if (ofertasGlobales && ofertasGlobales.length > 0) {
        const schemaOffers = ofertasGlobales.map((deal: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'Offer',
                name: `Vuelo a ${deal.destino} desde ${deal.origen}`,
                description: deal.titulo_gancho,
                price: deal.precio,
                priceCurrency: deal.moneda || deal.currency || 'USD',
                availability: 'https://schema.org/InStock',
                url: `https://www.lumivia.app/masdestinos?vuelo=${deal.id}`,
                itemOffered: {
                    '@type': 'Flight',
                    departureAirport: { '@type': 'Airport', iataCode: deal.origen },
                    arrivalAirport: { '@type': 'Airport', iataCode: deal.destino }
                }
            }
        }));

        schemaJSON = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Catálogo Global de Oportunidades - Lumivia',
            description:
                'Explora todos los destinos y tarifas ocultas globales rastreadas por Lumivia en tiempo real.',
            mainEntity: {
                '@type': 'OfferCatalog',
                name: 'Radar Global Lumivia',
                itemListElement: schemaOffers
            }
        });
    }

    // 2) Vuelo único
    if (vueloId && !Number.isNaN(vueloId)) {
        const { data, error } = await supabase
            .from('publicaciones_lumivia')
            .select('*')
            .eq('activo', true)
            .eq('id', vueloId)
            .limit(1);

        if (error) {
            console.error('Error cargando vuelo único:', error);
            return {
                pais: paisQuery,
                page: 1,
                pageSize: PAGE_SIZE,
                total: 0,
                totalPages: 1,
                deals: [],
                schemaJSON
            };
        }

        const dealUnico = data && data.length > 0 ? data[0] : null;

        if (!dealUnico) {
            return {
                pais: paisQuery,
                page: 1,
                pageSize: PAGE_SIZE,
                total: 0,
                totalPages: 1,
                deals: [],
                schemaJSON
            };
        }

        const paisReal = (dealUnico as any).pais_mercado || paisQuery;

        return {
            pais: paisReal,
            page: 1,
            pageSize: PAGE_SIZE,
            total: 1,
            totalPages: 1,
            deals: [dealUnico],
            schemaJSON
        };
    }

    // 3) Catálogo paginado
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
        console.error('Error cargando catálogo:', error);
        return {
            pais: paisQuery,
            page,
            pageSize: PAGE_SIZE,
            total: 0,
            totalPages: 1,
            deals: [],
            schemaJSON
        };
    }

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return {
        pais: paisQuery,
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages,
        deals: deals ?? [],
        schemaJSON
    };
};
