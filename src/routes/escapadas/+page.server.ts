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
  const mercadoInfo = mercadosPermitidos[paisQuery as CodigoPais];
  
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

  let ofertasEnriquecidas: any[] = [];
  let totalItems = 0;

  // 🔥 BLINDAJE 1: Try/Catch global para evitar Error 500 si la DB falla
  try {
    const { data: ofertasCrudas, count, error: err } = await supabase
      .from('publicaciones_lumivia')
      .select('*', { count: 'exact' })
      .eq('activo', true)
      .eq('pais_mercado', paisUpper)
      .eq('tipo_vuelo', 'escapada_finde') 
      .order('created_at', { ascending: false })
      .range(start, end);

    if (err) {
      console.error('Error fetching escapadas:', err);
    } else {
      ofertasEnriquecidas = ofertasCrudas || [];
      totalItems = count || 0;
    }

    if (ofertasEnriquecidas.length > 0) {
      // 🔥 BLINDAJE 2: .filter(Boolean) aniquila los nulls antes de llamar a Diccionario
      const codigosIata = [...new Set([
        ...ofertasEnriquecidas.map(o => o.origen),
        ...ofertasEnriquecidas.map(o => o.destino)
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

        ofertasEnriquecidas = ofertasEnriquecidas.map(oferta => ({
          ...oferta,
          origen_nombre: mapaDestinos[oferta.origen]?.nombre_ciudad || oferta.origen,
          destino_nombre: mapaDestinos[oferta.destino]?.nombre_ciudad || oferta.destino,
          imagen_fallback: mapaDestinos[oferta.destino]?.imagen_url_verificada || null
        }));
      }
    }
  } catch (dbError) {
    console.error('Error crítico procesando DB en página de escapadas:', dbError);
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // 🔥 BLINDAJE 3: Metadatos SEO Únicos y Paginación Perfecta
  const metaTitle = `Escapadas de Fin de Semana desde ${mercadoInfo.nombre} | Lumivia`;
  const metaDescription = `Descubre vuelos baratos y escapadas curadas para viajar el fin de semana desde ${mercadoInfo.nombre}. Poco presupuesto, máxima desconexión.`;
  
  // Canonical Dinámico respetando la Paginación
  const canonicalClean = page > 1 
    ? `https://www.lumivia.app/escapadas?pais=${paisUpper}&page=${page}`
    : `https://www.lumivia.app/escapadas?pais=${paisUpper}`;

  const schemaAEO = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: metaTitle,
    description: metaDescription,
    url: canonicalClean
  });

  setHeaders({
    'Cache-Control': 'public, max-age=60, s-maxage=60'
  });

  return {
    pais: paisQuery,
    deals: ofertasEnriquecidas,
    page,
    totalPages,
    schemaJSON: schemaAEO,
    title: page > 1 ? `${metaTitle} - Página ${page}` : metaTitle,
    description: metaDescription,
    canonicalURL: canonicalClean
  };
};
