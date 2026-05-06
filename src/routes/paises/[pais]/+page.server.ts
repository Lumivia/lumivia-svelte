import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';
import { curarOfertas } from '$lib/utils/curacion';

const mercadosPermitidos = {
  mx: { nombre: 'México', moneda: 'MXN', bandera: 'https://flagcdn.com/w20/mx.png' },
  co: { nombre: 'Colombia', moneda: 'COP', bandera: 'https://flagcdn.com/w20/co.png' },
  cl: { nombre: 'Chile', moneda: 'CLP', bandera: 'https://flagcdn.com/w20/cl.png' },
  cr: { nombre: 'Costa Rica', moneda: 'USD', bandera: 'https://flagcdn.com/w20/cr.png' }
} as const;

type CodigoPais = keyof typeof mercadosPermitidos;

export const load: PageServerLoad = async ({ params, setHeaders, fetch, platform, depends }) => {
  const paisParam = params.pais ?? '';
  const codigoPais = paisParam.toLowerCase();

  depends(`app:paises:${codigoPais}`);

  const mercado = mercadosPermitidos[codigoPais as CodigoPais];
  if (!mercado) throw redirect(302, '/');

  const paisUpper = codigoPais.toUpperCase();
  const cacheKey = `lumivia_cache_${codigoPais}`;

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

  const supabaseUrl = env.PUBLIC_SUPABASE_URL;
  const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { pais: codigoPais, paisUpper, mercado, destacadas: [], masDestinos: [], schemaAEO: null };
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch }
  });

  const { data: ofertasCrudas, error: err } = await supabase
    .from('publicaciones_lumivia')
    .select('*')
    .eq('activo', true)
    .eq('pais_mercado', paisUpper)
    .order('created_at', { ascending: false })
    .limit(50);

  if (err) console.error('Error al extraer ofertas:', err);

  let ofertasEnriquecidas = ofertasCrudas || [];

  if (ofertasEnriquecidas.length > 0) {
    const codigosIata = [...new Set([
      ...ofertasEnriquecidas.map(o => o.origen),
      ...ofertasEnriquecidas.map(o => o.destino)
    ])];

    const { data: diccionario, error: errDiccionario } = await supabase
      .from('diccionario_destinos')
      .select('iata_code, nombre_ciudad, imagen_url_verificada')
      .in('iata_code', codigosIata);
      
    if (errDiccionario) console.error('Error al consultar diccionario:', errDiccionario);

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

  // Obtenemos solo las variables que necesita la página principal
  const { hookDeals, radarDeals } = curarOfertas(ofertasEnriquecidas, paisUpper);

  const schemaAEO = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Vuelos baratos desde ${mercado.nombre} - Lumivia`,
    description: `Ofertas destacadas y destinos populares desde ${mercado.nombre}. Planifica tu próxima gran historia con nuestra bóveda secreta.`,
    url: `https://www.lumivia.app/paises/${codigoPais}`
  });

  const responseData = {
    pais: codigoPais,
    paisUpper,
    mercado,
    destacadas: hookDeals,
    masDestinos: radarDeals.slice(0, 10),
    schemaAEO
  };

  try {
    if (platform?.env?.KV_CACHE && hookDeals.length > 0) {
      await platform.env.KV_CACHE.put(cacheKey, JSON.stringify(responseData), { 
        expirationTtl: 300 
      });
    }
  } catch (e) {
    console.error("Error guardando en KV Cache:", e);
  }

  setHeaders({
    'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=60'
  });

  return { ...responseData, fromCache: false };
};
