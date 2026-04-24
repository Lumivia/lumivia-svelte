import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';

// 🔥 Variables de entorno (Cloudflare Pages + .env local)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// 🔥 Cliente Supabase exclusivo para servidor
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Catálogo de mercados permitidos
const mercadosPermitidos = {
  mx: { nombre: 'México', moneda: 'MXN', bandera: 'https://flagcdn.com/w20/mx.png' },
  co: { nombre: 'Colombia', moneda: 'COP', bandera: 'https://flagcdn.com/w20/co.png' },
  cl: { nombre: 'Chile', moneda: 'CLP', bandera: 'https://flagcdn.com/w20/cl.png' },
  cr: { nombre: 'Costa Rica', moneda: 'USD', bandera: 'https://flagcdn.com/w20/cr.png' }
} as const;

type CodigoPais = keyof typeof mercadosPermitidos;

export const load: PageServerLoad = async ({ params, setHeaders }) => {
  const paisParam = params.pais ?? '';
  const codigoPais = paisParam.toLowerCase();

  // Validamos país
  const mercado = mercadosPermitidos[codigoPais as CodigoPais];
  if (!mercado) {
    throw redirect(302, '/');
  }

  const paisUpper = codigoPais.toUpperCase();

  // Cache-Control
  setHeaders({
    'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=60'
  });

  // Consulta dinámica a Supabase
  const { data: ofertas, error } = await supabase
    .from('publicaciones_lumivia')
    .select('*')
    .eq('activo', true)
    .eq('pais_mercado', paisUpper)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error Supabase publicaciones_lumivia:', error);
  }

  // Construcción de schema SEO dinámico
  const baseUrl = 'https://www.lumivia.app';
  let schemaAEO: string | null = null;

  if (ofertas && ofertas.length > 0) {
    const schemaOffers = ofertas.map((deal: any, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Offer',
        name: `Vuelo a ${deal.destino} desde ${deal.origen}`,
        description: deal.titulo_gancho,
        price: deal.price ?? deal.precio,
        priceCurrency: mercado.moneda,
        availability: 'https://schema.org/InStock',
        url: `${baseUrl}/paises/${codigoPais}/?vuelo=${deal.id}`,
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
      name: `Catálogo en vivo de Vuelos Baratos desde ${mercado.nombre} - Lumivia`,
      description: `Las mejores tarifas aéreas detectadas en tiempo real desde ${mercado.nombre}.`,
      mainEntity: {
        '@type': 'OfferCatalog',
        name: `Radar de Vuelos Lumivia ${paisUpper}`,
        itemListElement: schemaOffers
      }
    });
  }

  return {
    pais: codigoPais,
    paisUpper,
    mercado,
    ofertas: ofertas ?? [],
    schemaAEO
  };
};
