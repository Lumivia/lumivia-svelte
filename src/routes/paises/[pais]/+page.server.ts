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

export const load: PageServerLoad = async ({ params, setHeaders, fetch, platform }) => {
  const paisParam = params.pais ?? '';
  const codigoPais = paisParam.toLowerCase();

  // 1) Validación de Mercado
  const mercado = mercadosPermitidos[codigoPais as CodigoPais];
  if (!mercado) throw redirect(302, '/');

  const paisUpper = codigoPais.toUpperCase();
  
  // 🔥 CLAVE KV: Usamos una llave única por país (ej: cache_mx, cache_co)
  const cacheKey = `lumivia_cache_${codigoPais}`;

  // 2) INTENTO DE LECTURA DESDE CLOUDFLARE EDGE
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

  // 3) INICIALIZACIÓN DE SUPABASE (Solo si el caché falló)
  const supabaseUrl = env.PUBLIC_SUPABASE_URL;
  const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { pais: codigoPais, paisUpper, mercado, destacadas: [], masDestinos: [], schemaAEO: null };
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch }
  });

  // 4) EXTRACCIÓN DE DATOS FRESCOS
  const { data: ofertasCrudas, error: err } = await supabase
    .from('publicaciones_lumivia')
    .select('*')
    .eq('activo', true)
    .eq('pais_mercado', paisUpper)
    .order('created_at', { ascending: false })
    .limit(50);

  if (err) console.error('Error al extraer ofertas:', err);

  let ofertasEnriquecidas = ofertasCrudas || [];

  // 🔥 4.5) EL BISTURÍ: ENRIQUECIMIENTO DE DATOS (JOIN EN MEMORIA)
  if (ofertasEnriquecidas.length > 0) {
    // 1. Sacamos todos los códigos IATA únicos de esta tanda (orígenes y destinos)
    const codigosIata = [...new Set([
      ...ofertasEnriquecidas.map(o => o.origen),
      ...ofertasEnriquecidas.map(o => o.destino)
    ])];

    // 2. Traemos el diccionario solo para esos códigos (Rapidísimo)
    const { data: diccionario } = await supabase
      .from('diccionario_destinos')
      .select('iata_code, nombre_hotel, imagen_url_verificada')
      .in('iata_code', codigosIata);

    // 3. Creamos un mapa de búsqueda instantánea
    const mapaDestinos = (diccionario || []).reduce((acc, curr) => {
      acc[curr.iata_code] = curr;
      return acc;
    }, {} as Record<string, any>);

    // 4. Inyectamos los nombres e imágenes a cada oferta antes de curarla
    ofertasEnriquecidas = ofertasEnriquecidas.map(oferta => ({
      ...oferta,
      // Si encuentra el nombre en el diccionario lo pone, si no, deja el IATA como fallback de emergencia
      origen_nombre: mapaDestinos[oferta.origen]?.nombre_hotel || oferta.origen,
      destino_nombre: mapaDestinos[oferta.destino]?.nombre_hotel || oferta.destino,
      // Guardamos la imagen verificada del destino
      imagen_fallback: mapaDestinos[oferta.destino]?.imagen_url_verificada || null
    }));
  }

  // 5) EL CEREBRO: Curación y procesamiento (Ahora usa las enriquecidas)
  const { hookDeals, radarDeals } = curarOfertas(ofertasEnriquecidas, paisUpper);

  const schemaAEO = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Vuelos baratos desde ${mercado.nombre} - Lumivia`,
    description: `Ofertas destacadas y destinos populares desde ${mercado.nombre}.`,
    url: `https://www.lumivia.app/paises/${codigoPais}`
  });

  // 6) PREPARACIÓN DE RESPUESTA
  const responseData = {
    pais: codigoPais,
    paisUpper,
    mercado,
    destacadas: hookDeals,
    masDestinos: radarDeals.slice(0, 8),
    schemaAEO
  };

  // 7) GUARDADO EN CACHÉ
  try {
    if (platform?.env?.KV_CACHE && hookDeals.length > 0) {
      await platform.env.KV_CACHE.put(cacheKey, JSON.stringify(responseData), { 
        expirationTtl: 300 
      });
    }
  } catch (e) {
    console.error("Error guardando en KV Cache:", e);
  }

  // 8) Configuración de headers
  setHeaders({
    'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=60'
  });

  return { ...responseData, fromCache: false };
};
