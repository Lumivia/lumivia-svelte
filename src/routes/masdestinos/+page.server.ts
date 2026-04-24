import type { PageServerLoad } from './$types';
import { createClient } from '@supabase/supabase-js';
import { error } from '@sveltejs/kit';

// ⚠️ Por ahora dejamos las keys aquí como en Astro.
// Luego las movemos a variables de entorno privadas.
const SUPABASE_URL = 'https://khmkpkbhlzpvowesbkgu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_uyjRiobM7d6m7IdMPUQi9Q_-RPZuIvt';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const load: PageServerLoad = async ({ setHeaders, url }) => {
    // 1. Cache-Control equivalente al de Astro
    setHeaders({
        'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=60'
    });

    // 2. Consulta global para SEO / bots (últimas 20 ofertas activas)
    const { data: ofertasGlobales, error: supaError } = await supabase
        .from('publicaciones_lumivia')
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: false })
        .limit(20);

    if (supaError) {
        console.error('Error Supabase publicaciones_lumivia (masdestinos SSR):', supaError);
        // No rompemos la página, pero devolvemos sin schema
        return {
            ofertasGlobales: [],
            schemaAEO: null
        };
    }

    // 3. Construcción de schema SEO dinámico (igual que en Astro)
    let schemaAEO: string | null = null;
    const baseUrl = 'https://www.lumivia.app';

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
                url: `${baseUrl}/masdestinos?vuelo=${deal.id}`,
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

        schemaAEO = JSON.stringify({
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

    return {
        ofertasGlobales: ofertasGlobales ?? [],
        schemaAEO
    };
};
