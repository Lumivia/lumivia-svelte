import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

// 🔥 IMPORTANTE: Importamos tu cerebro algorítmico (Ajusta la ruta si es diferente)
import { curarOfertas } from '$lib/utils/curacion';

const mercadosPermitidos = {
  mx: { nombre: 'México', moneda: 'MXN', bandera: 'https://flagcdn.com/w20/mx.png' },
  co: { nombre: 'Colombia', moneda: 'COP', bandera: 'https://flagcdn.com/w20/co.png' },
  cl: { nombre: 'Chile', moneda: 'CLP', bandera: 'https://flagcdn.com/w20/cl.png' },
  cr: { nombre: 'Costa Rica', moneda: 'USD', bandera: 'https://flagcdn.com/w20/cr.png' }
} as const;

type CodigoPais = keyof typeof mercadosPermitidos;

export const load: PageServerLoad = async ({ params, setHeaders, fetch }) => {
  const paisParam = params.pais ?? '';
  const codigoPais = paisParam.toLowerCase();

  // 1) Validación de Mercado
  const mercado = mercadosPermitidos[codigoPais as CodigoPais];
  if (!mercado) throw redirect(302, '/');

  const paisUpper = codigoPais.toUpperCase();

  // 2) Inicialización Segura de Supabase
  const supabaseUrl = env.PUBLIC_SUPABASE_URL;
  const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("🔥 Error Crítico: Llaves de Supabase no detectadas en el servidor.");
    return {
      pais: codigoPais, paisUpper, mercado, destacadas: [], masDestinos: [], schemaAEO: null
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch }
  });

  // 3) Configuración de Cache para Cloudflare Edge
  setHeaders({
    'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=60'
  });

  // 4) Ejecución de Consultas: Extraemos un lote generoso (ej. 50 ofertas) 
  // para que el algoritmo tenga de dónde escoger la verdadera "crema y nata".
  const { data: ofertasCrudas, error: err } = await supabase
    .from('publicaciones_lumivia')
    .select('*')
    .eq('activo', true)
    .eq('pais_mercado', paisUpper)
    .order('created_at', { ascending: false })
    .limit(50);

  if (err) console.error('Error al extraer ofertas:', err);

  // 5) 🔥 EL CEREBRO EN ACCIÓN: Curamos las ofertas usando tu algoritmo V12
  const { hookDeals, radarDeals } = curarOfertas(ofertasCrudas || [], paisUpper);

  // 6) Generación de Metadata / Schema
  const schemaAEO = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Vuelos baratos desde ${mercado.nombre} - Lumivia`,
    description: `Ofertas destacadas y destinos populares desde ${mercado.nombre}.`,
    url: `https://www.lumivia.app/paises/${codigoPais}`
  });

  // 7) Retorno de Datos Garantizado
  return {
    pais: codigoPais,
    paisUpper,
    mercado,
    destacadas: hookDeals,           // 👈 Ahora sí llevan orden algorítmico
    masDestinos: radarDeals.slice(0, 8), // 👈 Tomamos las siguientes 8 para el radar
    schemaAEO
  };
};
