import type { LayoutServerLoad } from './$types';

// 🔥 BLINDAJE 1: SvelteKit estricto. Cero diagonales finales.
export const trailingSlash = 'never';

// 🔥 BLINDAJE 2: La Fuente de la Verdad Absoluta.
const SITE_URL = 'https://www.lumivia.app';

// 🔥 BLINDAJE 3: LISTA BLANCA OMNISCIENTE
const PARAMETROS_VITALES: Record<string, { 
    forceLowercase: boolean, 
    tipo: 'string' | 'number',
    defaultValue?: string 
}> = {
    'pais': { forceLowercase: true, tipo: 'string', defaultValue: 'mx' },
    'page': { forceLowercase: false, tipo: 'number' },
    'vuelo': { forceLowercase: false, tipo: 'string' } 
};

export const load: LayoutServerLoad = async ({ url }) => {
    const canonicalUrlBuilder = new URL(`${SITE_URL}${url.pathname}`);

    Object.keys(PARAMETROS_VITALES).forEach(param => {
        // Al leer solo las llaves vitales, SvelteKit ahorra memoria y no recarga
        // la página si cambian los rastreadores de marketing (fbclid, etc).
        const rawValue = url.searchParams.get(param);
        
        if (rawValue) {
            // 🔥 BLINDAJE 7: EL ANIQUILADOR DE ENTROPÍA (Whitespace Injection)
            // Elimina los espacios invisibles (%20) que los scrapers usan para crear URLs fantasma.
            const value = rawValue.trim();

            // Si después de limpiar la basura solo quedó un string vacío, lo ignoramos.
            if (!value) return;

            const config = PARAMETROS_VITALES[param];
            let safeValue = value;

            // Firewall Numérico
            if (config.tipo === 'number') {
                const parsedNum = parseInt(value, 10); 
                if (isNaN(parsedNum) || parsedNum <= 1) return; 
                safeValue = parsedNum.toString();
                
            } else if (config.forceLowercase) {
                safeValue = value.toLowerCase();
            }

            // Firewall de Estado por Defecto
            if (config.defaultValue && safeValue === config.defaultValue) {
                return; 
            }
            
            canonicalUrlBuilder.searchParams.set(param, safeValue);
        }
    });

    return {
        // El Canonical Absoluto. Cero entropía. 100% esterilizado.
        canonicalURL: canonicalUrlBuilder.toString(),
        pathActual: url.pathname
    };
};
