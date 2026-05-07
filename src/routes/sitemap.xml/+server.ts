import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

// 🔥 TIER 1 SVELTEKIT: Bloqueo de prerenderizado estático.
// Garantiza a Google que este endpoint procesará datos frescos en cada petición.
export const prerender = false;

const BASE_URL = 'https://www.lumivia.app';

// 🔥 HIGIENE XML: Vital para que Google/Bing no rechacen el sitemap por caracteres inválidos.
const escapeXml = (unsafe: string) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
};

export const GET: RequestHandler = async () => {
    const supabaseUrl = env.PUBLIC_SUPABASE_URL || '';
    const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 🔥 ESCUDO DE RENDIMIENTO EDGE: 
    // Limitamos a 10,000 para evitar Timeouts (Error 504) cuando el catálogo crezca masivamente.
    const { data: deals } = await supabase
        .from('publicaciones_lumivia')
        .select('id, created_at, pais_mercado')
        .eq('activo', true)
        .order('created_at', { ascending: false })
        .limit(10000);

    const activeDeals = deals || [];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Rutas Core (Mercados)
    const paises = ['mx', 'co', 'cl', 'cr'];
    for (const pais of paises) {
        xml += `  <url>\n    <loc>${BASE_URL}/paises/${pais}</loc>\n    <changefreq>hourly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
        xml += `  <url>\n    <loc>${BASE_URL}/escapadas?pais=${pais}</loc>\n    <changefreq>hourly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    }

    // 2. Rutas Core (Global)
    xml += `  <url>\n    <loc>${BASE_URL}/masdestinos</loc>\n    <changefreq>hourly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;

    // 3. URLs Dinámicas (Ofertas)
    for (const deal of activeDeals) {
        const lastMod = deal.created_at ? new Date(deal.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const loc = escapeXml(`${BASE_URL}/masdestinos?vuelo=${deal.id}`);
        
        xml += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    // 4. Rutas Estáticas
    const legales = ['terminos', 'privacidad', 'afiliacion'];
    for (const pagina of legales) {
        xml += `  <url>\n    <loc>${BASE_URL}/${pagina}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.3</priority>\n  </url>\n`;
    }

    xml += `</urlset>`;

    // API de SvelteKit moderna para Headers y respuestas estandarizadas
    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            // Caché CDN: Vive 1 hora en Cloudflare/Vercel. Si caduca, sirve el viejo mientras actualiza el nuevo en background (stale-while-revalidate).
            'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
        }
    });
};
