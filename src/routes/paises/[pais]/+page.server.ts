import type { PageServerLoad } from './$types';
import { error as httpError, redirect } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';
import { curarOfertas } from '$lib/utils/curacion';
import { fechaDeHoy } from '$lib/utils/ofertas';

const mercadosPermitidos = {
  mx: { nombre: 'México', moneda: 'MXN', bandera: 'https://flagcdn.com/w20/mx.png' },
  co: { nombre: 'Colombia', moneda: 'COP', bandera: 'https://flagcdn.com/w20/co.png' },
  cl: { nombre: 'Chile', moneda: 'CLP', bandera: 'https://flagcdn.com/w20/cl.png' },
  cr: { nombre: 'Costa Rica', moneda: 'USD', bandera: 'https://flagcdn.com/w20/cr.png' }
} as const;

type CodigoPais = keyof typeof mercadosPermitidos;

export const load: PageServerLoad = async ({ params, setHeaders, fetch, depends }) => {
  const paisParam = params.pais ?? '';
  const codigoPais = paisParam.toLowerCase();

  depends(`app:paises:${codigoPais}`);

  const mercado = mercadosPermitidos[codigoPais as CodigoPais];
  if (!mercado) throw redirect(302, '/');

  const paisUpper = codigoPais.toUpperCase();
  const supabaseUrl = env.PUBLIC_SUPABASE_URL;
  const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw httpError(503, 'El radar no está configurado temporalmente');
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch }
  });

  let ofertasEnriquecidas: any[] = [];

  // 🔥 BLINDAJE 1: Try/Catch global para que el servidor nunca arroje un 500 fatal a SvelteKit
  try {
    const { data: ofertasCrudas, error: err } = await supabase
      .from('publicaciones_lumivia')
      .select('*')
      .eq('activo', true)
      .eq('pais_mercado', paisUpper)
      .gte('fecha_salida', fechaDeHoy())
      .or('expirada_manualmente.is.null,expirada_manualmente.eq.false')
      .order('created_at', { ascending: false })
      .limit(50);

    if (err) {
      throw err;
    } else {
      ofertasEnriquecidas = ofertasCrudas || [];
    }

    if (ofertasEnriquecidas.length > 0) {
      // 🔥 BLINDAJE 2: El .filter(Boolean) aniquila los nulls antes de que lleguen a Supabase
      const codigosIata = [...new Set([
        ...ofertasEnriquecidas.map(o => o.origen),
        ...ofertasEnriquecidas.map(o => o.destino)
      ].filter(Boolean))];

      if (codigosIata.length > 0) {
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
    }
  } catch (dbError) {
    console.error("Error crítico procesando DB en página de países:", dbError);
    throw httpError(503, 'No pudimos cargar las ofertas en este momento');
  }

  // Obtenemos solo las variables que necesita la página principal
  const { hookDeals, radarDeals } = curarOfertas(ofertasEnriquecidas, paisUpper);

  const schemaAEO = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Vuelos baratos desde ${mercado.nombre} - Lumivia`,
    description: `Compara vuelos vigentes desde ${mercado.nombre} y completa la reserva con la aerolínea o agencia.`,
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

  setHeaders({
    'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=60'
  });

  return responseData;
};
