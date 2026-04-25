import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';

// 🔥 Sincronización con el entorno de Cloudflare: Usamos dynamic para evitar llaves vacías en el SSR
import { env } from '$env/dynamic/public';
export const ssr = false;

const mercadosPermitidos = {
  mx: { nombre: 'México', moneda: 'MXN', bandera: 'https://flagcdn.com/w20/mx.png' },
  co: { nombre: 'Colombia', moneda: 'COP', bandera: 'https://flagcdn.com/w20/co.png' },
  cl: { nombre: 'Chile', moneda: 'CLP', bandera: 'https://flagcdn.com/w20/cl.png' },
  cr: { nombre: 'Costa Rica', moneda: 'USD', bandera: 'https://flagcdn.com/w20/cr.png' }
} as const;

type CodigoPais = keyof typeof mercadosPermitidos;

// 🔥 CAMBIO: Extraemos 'fetch' de los argumentos del load
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

  // 🔥 CAMBIO VITAL: Pasamos el fetch de SvelteKit para que funcione en Cloudflare Edge
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch }
  });

  // 3) Configuración de Cache para Cloudflare Edge
  setHeaders({
    'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=60'
  });

  // 4) Ejecución de Consultas
  
  // 🔥 6 destacadas
  const { data: destacadas, error: err1 } = await supabase
    .from('publicaciones_lumivia')
    .select('*')
    .eq('activo', true)
    .eq('pais_mercado', paisUpper)
    .order('created_at', { ascending: false })
    .limit(6);

  if (err1) console.error('Error destacadas:', err1);

  // 🔥 8 adicionales (usando range para evitar solapamiento)
  const { data: masDestinos, error: err2 } = await supabase
    .from('publicaciones_lumivia')
    .select('*')
    .eq('activo', true)
    .eq('pais_mercado', paisUpper)
    .order('created_at', { ascending: false })
    .range(6, 13);

  if (err2) console.error('Error masDestinos:', err2);

  // 5) Generación de Metadata / Schema
  const schemaAEO = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Vuelos baratos desde ${mercado.nombre} - Lumivia`,
    description: `Ofertas destacadas y destinos populares desde ${mercado.nombre}.`,
    url: `https://www.lumivia.app/paises/${codigoPais}`
  });

  // 6) Retorno de Datos Garantizado
  return {
    pais: codigoPais,
    paisUpper,
    mercado,
    destacadas: destacadas || [],
    masDestinos: masDestinos || [],
    schemaAEO
  };
};
