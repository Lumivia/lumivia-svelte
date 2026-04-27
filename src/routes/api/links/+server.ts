import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// ==========================================
// LUMIVIA - LINK INTEL ENGINE v6.0 (FLAWLESS MODE)
// Redirección Pura y Estricta
// ==========================================

const AID_CIVITATIS = '112603';
const AID_STAY22 = 'lumivia';
const MARKER_AIRALO = '7136059';
const MARKER_EKTA = '708095';

const limpiarFechaEstricta = (iso: string | null) => {
    if (!iso) return '';
    const match = iso.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : '';
};

export const GET: RequestHandler = async ({ url }) => {
    const destinoRaw = url.searchParams.get('destino') || '';
    const destino = destinoRaw.toUpperCase().trim();
    const destinoEncoded = encodeURIComponent(destino);
    
    const fSalida = limpiarFechaEstricta(url.searchParams.get('salida'));
    const fRegreso = limpiarFechaEstricta(url.searchParams.get('regreso'));
    const url_hotel_db = url.searchParams.get('url_hotel') || '';

    // 1. AIRALO (Redirección Canónica de Búsqueda)
    const linkEsim = `https://www.airalo.com/es/search?search=${destinoEncoded}&marker=${MARKER_AIRALO}`;

    // 2. EKTA
    const linkSeguro = `https://ektatraveling.com/es/?marker=${MARKER_EKTA}`;

    // 3. CIVITATIS (Constructor URL Blindado)
    let linkTours = `https://www.civitatis.com/es/buscar/?q=${destinoEncoded}&aid=${AID_CIVITATIS}`;
    if (fSalida && fRegreso) {
        // Concatenación garantizada sin romper la query string
        linkTours = `${linkTours}&fromDate=${fSalida}&toDate=${fRegreso}`;
    }

    // 4. STAY22
    let linkHotel = url_hotel_db;
    if (!linkHotel || linkHotel === 'undefined' || linkHotel === 'null') {
        linkHotel = `https://www.stay22.com/allez/roam?aid=${AID_STAY22}&address=${destinoEncoded}`;
        if (fSalida && fRegreso) {
            linkHotel = `${linkHotel}&checkin=${fSalida}&checkout=${fRegreso}`;
        }
    }

    return json({
        esim: linkEsim,
        tours: linkTours,
        hotel: linkHotel,
        seguro: linkSeguro
    });
};
