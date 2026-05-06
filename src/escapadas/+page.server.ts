import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

const mercadosPermitidos = {
  mx: { nombre: 'México', moneda: 'MXN', bandera: 'https://flagcdn.com/w20/mx.png' },
  co: { nombre: 'Colombia', moneda: 'COP', bandera: 'https://flagcdn.com/w20/co.png' },
  cl: { nombre: 'Chile', moneda: 'CLP', bandera: 'https://flagcdn.com/w20/cl.png' },
  cr: { nombre: 'Costa Rica', moneda: 'USD', bandera: 'https://flagcdn.com/w20/cr.png' }
} as const;

type CodigoPais = keyof typeof mercadosPermitidos;

export const load: PageServerLoad = async ({ url, setHeaders, fetch }) => {
  const paisQuery = url.searchParams.get('pais')?.toLowerCase();
  if (!paisQuery || !mercadosPermitidos[paisQuery as CodigoPais]) {
    throw redirect(302, '/');
  }

  const paisUpper = paisQuery.toUpperCase();
  
  // Paginación
  const pageParam = url.searchParams.get('page');
  const page = pageParam ? parseInt(pageParam) : 1;
  const itemsPerPage = 21; // Múltiplo de 3 para el grid
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage - 1;

  const supabaseUrl = env.PUBLIC_SUPABASE_URL;
  const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { pais: paisQuery, deals: [], page: 1, totalPages: 1 };
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch }
  });

  // 🚨 EL TRUCO: Solo pedimos escapadas de fin de semana
  const { data: ofertasCrudas, count, error: err } = await supabase
    .from('publicaciones_lumivia')
    .select('*', { count: 'exact' })
    .eq('activo', true)
    .eq('pais_mercado', paisUpper)
    .eq('tipo_vuelo', 'escapada_finde') 
    .order('created_at', { ascending: false })
    .range(start, end);

  if (err) console.error('Error fetching escapadas:', err);

  let ofertasEnriquecidas = ofertasCrudas || [];

  if (ofertasEnriquecidas.length > 0) {
    const codigosIata = [...new Set([
      ...ofertasEnriquecidas.map(o => o.origen),
      ...ofertasEnriquecidas.map(o => o.destino)
    ])];

    const { data: diccionario } = await supabase
      .from('diccionario_destinos')
      .select('iata_code, nombre_ciudad, imagen_url_verificada')
      .in('iata_code', codigosIata);

    const mapaDestinos = (diccionario || []).reduce((acc, curr) => {
      acc[curr.iata_code] = curr;
      return acc;
    }, {} as Record<string, any>);

    ofertasEnriquecidas = ofertasEnriquecidas.map(oferta => ({
      ...oferta,
      origen_nombre: mapaDestinos[oferta.origen]?.nombre_ciudad || oferta.origen,
      destino_nombre: mapaDestinos[oferta.destino]?.nombre_ciudad || oferta.destino,
      imagen_fallback: mapaDestinos[oferta.destino]?.imagen_url_verificada || null
    }));
  }

  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const schemaAEO = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Escapadas de Fin de Semana desde ${mercadosPermitidos[paisQuery as CodigoPais].nombre} - Lumivia`,
    description: `Ofertas de vuelos cortos y escapadas de fin de semana para desconectar de la rutina sin gastar mucho.`,
    url: `https://www.lumivia.app/escapadas?pais=${paisQuery}`
  });

  setHeaders({
    'Cache-Control': 'public, max-age=60, s-maxage=60'
  });

  return {
    pais: paisQuery,
    deals: ofertasEnriquecidas,
    page,
    totalPages,
    schemaJSON: schemaAEO
  };
};
