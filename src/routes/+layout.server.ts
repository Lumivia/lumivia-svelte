import type { LayoutServerLoad } from './$types';

// 🔥 BLINDAJE 1: SvelteKit estricto. Cero diagonales finales.
export const trailingSlash = 'never';

// 🔥 BLINDAJE 2: La Fuente de la Verdad Absoluta.
const SITE_URL = 'https://www.lumivia.app';

// 🔥 BLINDAJE 3: LISTA BLANCA OMNISCIENTE CON LÍMITES DE DOMINIO
const PARAMETROS_VITALES: Record<string, { 
    forceLowercase: boolean, 
    tipo: 'string' | 'number',
    defaultValue?: string,
    allowedValues?: string[] // El candado final
}> = {
    'page': { forceLowercase: false, tipo: 'number' },
    // Si no es uno de tus mercados, no existe para Google.
    'pais': { forceLowercase: true, tipo: 'string', defaultValue: 'mx', allowedValues: ['mx', 'co', 'cl', 'cr'] },
    'vuelo': { forceLowercase: false, tipo: 'string' } 
};

const RUTAS_LOCALIZADAS_POR_PARAMETRO = ['', 'escapadas', 'masdestinos'];

export const load: LayoutServerLoad = async ({ url }) => {
    const canonicalUrlBuilder = new URL(`${SITE_URL}${url.pathname}`);

    // ==========================================
    // 1. EL MOTOR DE PURIFICACIÓN (AEO & SEO)
    // ==========================================
    Object.keys(PARAMETROS_VITALES).forEach(param => {
        const rawValue = url.searchParams.get(param);
        
        if (rawValue) {
            const value = rawValue.trim();
            if (!value) return;

            const config = PARAMETROS_VITALES[param];
            let safeValue = value;

            if (config.tipo === 'number') {
                const parsedNum = parseInt(value, 10); 
                if (isNaN(parsedNum) || parsedNum <= 1) return; 
                safeValue = parsedNum.toString();
            } else if (config.forceLowercase) {
                safeValue = value.toLowerCase();
            }

            // 🔥 BLINDAJE 10: FIREWALL DE VALORES PERMITIDOS (El Aniquilador de Spam)
            // Si el config exige valores específicos y el usuario manda basura (?pais=rusia), lo matamos.
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
    // 2. EL MOTOR DE EXPANSIÓN GLOBAL (ZERO-BLEED)
    // ==========================================
    const hreflangs: Array<{locale: string, url: string}> = [];
    
    const segmentoBase = url.pathname.split('/')[1] || '';
    const isRutaLocalizada = RUTAS_LOCALIZADAS_POR_PARAMETRO.includes(segmentoBase);

    if (isRutaLocalizada) {
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
