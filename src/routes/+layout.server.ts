import type { LayoutServerLoad } from './$types';

// 🔥 BLINDAJE 1: SvelteKit estricto. Cero diagonales finales.
export const trailingSlash = 'never';

// 🔥 BLINDAJE 2: La Fuente de la Verdad Absoluta.
const SITE_URL = 'https://www.lumivia.app';

// 🔥 BLINDAJE 3: LA MATRIZ DE AISLAMIENTO (El Nivel Dios del AEO)
// Define exactamente qué parámetros tienen derecho a existir en qué carpetas.
// Cualquier parámetro fuera de su jurisdicción es aniquilado instantáneamente.
const PARAMETROS_VITALES: Record<string, { 
    forceLowercase: boolean, 
    tipo: 'string' | 'number',
    defaultValue?: string,
    allowedValues?: string[],
    rutasPermitidas: string[] // 🚀 EL CANDADO DEFINITIVO
}> = {
    'page': { 
        forceLowercase: false, 
        tipo: 'number',
        // La paginación es válida en catálogos y en vitrinas de países
        rutasPermitidas: ['', 'escapadas', 'masdestinos', 'paises'] 
    },
    'pais': { 
        forceLowercase: true, 
        tipo: 'string', 
        defaultValue: 'mx', 
        allowedValues: ['mx', 'co', 'cl', 'cr'],
        // El parámetro de país SOLO existe donde NO hay carpeta de país
        rutasPermitidas: ['', 'escapadas', 'masdestinos'] 
    },
    'vuelo': { 
        forceLowercase: false, 
        tipo: 'string',
        // El ID de vuelo individual SOLO tiene jurisdicción en el catálogo global
        rutasPermitidas: ['masdestinos'] 
    } 
};

export const load: LayoutServerLoad = async ({ url }) => {
    const canonicalUrlBuilder = new URL(`${SITE_URL}${url.pathname}`);
    const segmentoBase = url.pathname.split('/')[1] || '';

    // ==========================================
    // 1. EL MOTOR DE PURIFICACIÓN MILITAR
    // ==========================================
    Object.keys(PARAMETROS_VITALES).forEach(param => {
        const rawValue = url.searchParams.get(param);
        
        if (rawValue) {
            const config = PARAMETROS_VITALES[param];

            // 🔥 BLINDAJE 12: EJECUCIÓN JURISDICCIONAL
            // Si la URL actual no está en la lista de rutas permitidas para este parámetro,
            // (ej. /privacidad?page=2 o /escapadas?vuelo=123), se elimina de la existencia.
            if (!config.rutasPermitidas.includes(segmentoBase)) {
                return; 
            }

            const value = rawValue.trim();
            if (!value) return;

            let safeValue = value;

            if (config.tipo === 'number') {
                const parsedNum = parseInt(value, 10); 
                if (isNaN(parsedNum) || parsedNum <= 1) return; 
                safeValue = parsedNum.toString();
            } else if (config.forceLowercase) {
                safeValue = value.toLowerCase();
            }

            if (config.allowedValues && !config.allowedValues.includes(safeValue)) {
                return;
            }

            if (config.defaultValue && safeValue === config.defaultValue) {
                return; 
            }
            
            canonicalUrlBuilder.searchParams.set(param, safeValue);
        }
    });

    canonicalUrlBuilder.searchParams.sort();
    const canonicalURL = canonicalUrlBuilder.toString();

    // ==========================================
    // 2. EL MOTOR DE EXPANSIÓN GLOBAL (HREFLANG ESTÉRIL)
    // ==========================================
    const hreflangs: Array<{locale: string, url: string}> = [];
    
    // Solo generamos mapa de idiomas si el parámetro 'pais' tiene jurisdicción aquí
    const requiereHreflangParametrico = PARAMETROS_VITALES['pais'].rutasPermitidas.includes(segmentoBase);

    if (requiereHreflangParametrico) {
        const mercados = { mx: 'es-MX', co: 'es-CO', cl: 'es-CL', cr: 'es-CR' };
        
        Object.entries(mercados).forEach(([codigoPais, locale]) => {
            const alternateUrl = new URL(canonicalURL);
            alternateUrl.searchParams.delete('pais');
            
            if (codigoPais !== PARAMETROS_VITALES['pais'].defaultValue) {
                alternateUrl.searchParams.set('pais', codigoPais);
            }
            
            alternateUrl.searchParams.sort();
            hreflangs.push({ locale, url: alternateUrl.toString() });
        });

        const defaultUrl = new URL(canonicalURL);
        defaultUrl.searchParams.delete('pais');
        defaultUrl.searchParams.sort();
        hreflangs.push({ locale: 'x-default', url: defaultUrl.toString() });
    }

    return {
        canonicalURL,
        hreflangs,
        pathActual: url.pathname
    };
};
