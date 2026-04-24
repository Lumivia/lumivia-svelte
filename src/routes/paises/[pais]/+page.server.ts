import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Cliente Supabase (server)
const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Mercados permitidos
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

  // Validación
  const mercado = mercadosPermitidos[codigoPais as CodigoPais];
  if (!mercado) throw redirect(302, '/');

  const paisUpper = codigoPais.toUpperCase();

  // Cache-Control
  setHeaders({
    'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=60'
  });

  // 🔥 6 destacadas
  const { data: destacadas, error: err1 } = await supabase
    .from('publicaciones_lumivia')
    .select('*')
    .eq('activo', true)
    .eq('pais_mercado', paisUpper)
    .order('created_at', { ascending: false })
    .limit(6);

  if (err1) console.error('Error destacadas:', err1);

  // 🔥 8 adicionales
  const { data: masDestinos, error: err2 } = await supabase
    .from('publicaciones_lumivia')
    .select('*')
    .eq('activo', true)
    .eq('pais_mercado', paisUpper)
    .order('created_at', { ascending: false })
    .range(6, 13);

  if (err2) console.error('Error masDestinos:', err2);

  // Schema ligero (NO OfferCatalog para evitar duplicado con MasDestinos)
  const schemaAEO = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Vuelos baratos desde ${mercado.nombre} - Lumivia`,
    description: `Ofertas destacadas y destinos populares desde ${mercado.nombre}.`,
    url: `https://www.lumivia.app/${codigoPais}`
  });

  return {
    pais: codigoPais,
    paisUpper,
    mercado,
    destacadas: destacadas ?? [],
    masDestinos: masDestinos ?? [],
    schemaAEO
  };
};
