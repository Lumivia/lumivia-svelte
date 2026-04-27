import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// ==========================================
// LUMIVIA - LINK INTEL ENGINE v4.0 (EXACT CANONICAL MODE)
// Cero acortadores. Cero redirecciones sucias.
// ==========================================

const AID_CIVITATIS = '112603';
const AID_STAY22 = 'lumivia';
const MARKER_AIRALO = '7136059';
const MARKER_EKTA = '708095';

// Formato obligatorio: YYYY-MM-DD
const limpiarFechaISO = (iso: string | null) => iso ? iso.split('T')[0] : '';

export const GET: RequestHandler = async ({ url }) => {
    const destinoRaw = url.searchParams.get('destino');
    const destino = (destinoRaw || '').toUpperCase().trim();
    
    const fSalida = limpiarFechaISO(url.searchParams.get('salida'));
    const fRegreso = limpiarFechaISO(url.searchParams.get('regreso'));
    const url_hotel_db = url.searchParams.get('url_hotel') || '';

    // 1. AIRALO (Deep Link Canónico)
    // El tráfico va directo a la web matriz con tu marker inyectado
    const linkEsim = `https://www.airalo.com/es/?marker=${MARKER_AIRALO}`;

    // 2. EKTA (Deep Link Canónico)
    const linkSeguro = `https://ektatraveling.com/es/?marker=${MARKER_EKTA}`;

    // 3. CIVITATIS (Búsqueda Perfecta de Fechas)
    // Usando fromDate y toDate tal cual exige el core de Civitatis
    let linkTours = `https://www.civitatis.com/es/buscar/?q=${encodeURIComponent(destino)}&aid=${AID_CIVITATIS}`;
    if (fSalida && fRegreso) {
        linkTours += `&fromDate=${fSalida}&toDate=${fRegreso}`;
    }

    // 4. STAY22 (Motor Principal de Hoteles)
    let linkHotel = url_hotel_db;
    if (!linkHotel || linkHotel === 'undefined' || linkHotel === 'null') {
        linkHotel = `https://www.stay22.com/allez/roam?aid=${AID_STAY22}&address=${encodeURIComponent(destino)}`;
        if (fSalida && fRegreso) {
            linkHotel += `&checkin=${fSalida}&checkout=${fRegreso}`;
        }
    }

    return json({
        esim: linkEsim,
        tours: linkTours,
        hotel: linkHotel,
        seguro: linkSeguro
    });
};
