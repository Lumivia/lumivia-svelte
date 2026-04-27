import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// ==========================================
// LUMIVIA - LINK INTEL ENGINE v7.0 (EXACT CANONICAL MODE)
// Redirección Pura - Sin atajos, sin redirecciones 301
// ==========================================

const AID_CIVITATIS = '112603';
const AID_STAY22 = 'lumivia';
const MARKER_AIRALO = '7136059';
const MARKER_EKTA = '708095';

// Extractor estricto y universal de YYYY-MM-DD
const limpiarFecha = (fechaRaw: string | null) => {
    if (!fechaRaw) return '';
    return fechaRaw.substring(0, 10);
};

export const GET: RequestHandler = async ({ url }) => {
    const destinoRaw = url.searchParams.get('destino') || '';
    const destino = destinoRaw.toUpperCase().trim();
    const destinoEncoded = encodeURIComponent(destino);
    
    const fSalida = limpiarFecha(url.searchParams.get('salida'));
    const fRegreso = limpiarFecha(url.searchParams.get('regreso'));
    const url_hotel_db = url.searchParams.get('url_hotel') || '';

    // 1. AIRALO (Redirección Canónica de Afiliado)
    const linkEsim = `https://www.airalo.com/es/?marker=${MARKER_AIRALO}`;

    // 2. EKTA
    const linkSeguro = `https://ektatraveling.com/es/?marker=${MARKER_EKTA}`;

    // 3. CIVITATIS (Constructor Exacto SIN slash final)
    let linkTours = `https://www.civitatis.com/es/buscar?q=${destinoEncoded}&aid=${AID_CIVITATIS}`;
    if (fSalida && fRegreso) {
        linkTours += `&fromDate=${fSalida}&toDate=${fRegreso}`;
    }

    // 4. STAY22
    let linkHotel = url_hotel_db;
    if (!linkHotel || linkHotel === 'undefined' || linkHotel === 'null') {
        linkHotel = `https://www.stay22.com/allez/roam?aid=${AID_STAY22}&address=${destinoEncoded}`;
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
