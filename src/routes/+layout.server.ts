import type { LayoutServerLoad } from './$types';

/**
 * @description Proveedor de datos maestro para el Layout global.
 * Garantiza que cada rincón de Lumivia tenga metadatos SEO válidos,
 * incluso si la página individual no los define.
 */
export const load: LayoutServerLoad = async ({ url }) => {
    // 1. Normalización de URL: 
    // Tomamos el origen (https://www.lumivia.app) y el pathname (/escapadas).
    // Esto ignora automáticamente los query params (?vuelo=123, ?admin=true)
    // que son los que causan los errores de "Contenido Duplicado" en Google.
    const canonicalURL = `${url.origin}${url.pathname}`;

    return {
        // Este valor fluye hacia el +layout.svelte de forma automática
        canonicalURL,
        pathActual: url.pathname
    };
};
