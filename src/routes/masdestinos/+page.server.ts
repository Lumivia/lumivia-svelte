// src/routes/masdestinos/+page.server.ts
import type { PageServerLoad } from './$types';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://khmkpkbhlzpvowesbkgu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_uyjRiobM7d6m7IdMPUQi9Q_-RPZuIvt';
// Idealmente mover a variables de entorno, pero por ahora respetamos tu setup actual.
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PAGE_SIZE = 18;

export const load: PageServerLoad = async ({ url }) => {
    // Página actual
    const pageParam = Number(url.searchParams.get('page') ?? '1');
    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

    // País de mercado (antes lo resolvías en el cliente)
    const pais = (url.searchParams.get('pais') ?? 'MX').toUpperCase();

    // Rango para Supabase
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // 1) Ofertas globales para schema.org (igual que en Astro)
    const { data: ofertasGlobales } = await supabase
        .from('publicaciones_lumivia')
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: false })
        .limit(20);

    let schemaJSON: string | null = null;

    if (ofertasGlobales && ofertasGlobales.length > 0) {
        const schemaOffers = ofertasGlobales.map((deal, index) => ({
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
                    departureAirport: {
                        '@type': 'Airport',
                        iataCode: deal.origen
                    },
                    arrivalAirport: {
                        '@type': 'Airport',
                        iataCode: deal.destino
                    }
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

    // 2) Catálogo paginado por país
    const { data: deals, count, error } = await supabase
        .from('publicaciones_lumivia')
        .select('*', { count: 'exact' })
        .eq('activo', true)
        .eq('pais_mercado', pais)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error cargando catálogo:', error);
        return {
            pais,
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
        pais,
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages,
        deals: deals ?? [],
        schemaJSON
    };
};
