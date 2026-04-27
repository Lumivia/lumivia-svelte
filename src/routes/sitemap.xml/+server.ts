import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

const BASE_URL = 'https://www.lumivia.app';

export const GET: RequestHandler = async ({ setHeaders }) => {
    // 1. Configurar Caché en el Edge de Cloudflare por 1 hora
    // No queremos que los bots saturen la base de datos cada que revisan el sitemap
    setHeaders({
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
    });

    // 2. Conectar a la Bóveda (Supabase)
    const supabaseUrl = env.PUBLIC_SUPABASE_URL || '';
    const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Extraer todas las ofertas activas (Solo pedimos IDs y fechas para no gastar red)
    const { data: deals } = await supabase
        .from('publicaciones_lumivia')
        .select('id, created_at, pais_mercado')
        .eq('activo', true)
        .order('created_at', { ascending: false });

    const activeDeals = deals || [];

    // 4. Construir el XML Estándar
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 5. Rutas Core (Las vitrinas principales de países)
    const paises = ['mx', 'co', 'cl', 'cr'];
    for (const pais of paises) {
        xml += `  <url>\n`;
        xml += `    <loc>${BASE_URL}/paises/${pais}</loc>\n`;
        xml += `    <changefreq>hourly</changefreq>\n`;
        xml += `    <priority>1.0</priority>\n`;
        xml += `  </url>\n`;
    }

    // 6. Catálogo Global
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/masdestinos</loc>\n`;
    xml += `    <changefreq>hourly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;

    // 7. 🔥 EL ORO DEL SEO: Vuelos Individuales Dinámicos
    // Esto inyecta cada vuelo único en Google
    for (const deal of activeDeals) {
        const lastMod = new Date(deal.created_at).toISOString().split('T')[0];
        xml += `  <url>\n`;
        xml += `    <loc>${BASE_URL}/masdestinos?vuelo=${deal.id}</loc>\n`;
        xml += `    <lastmod>${lastMod}</lastmod>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
    }

    // 8. Páginas Estáticas / Legales
    const legales = ['terminos', 'privacidad', 'afiliacion'];
    for (const pagina of legales) {
        xml += `  <url>\n`;
        xml += `    <loc>${BASE_URL}/${pagina}</loc>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.3</priority>\n`;
        xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    return new Response(xml);
};
