import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// ==========================================
// LUMIVIA - LINK INTEL ENGINE v8.0 (CITY-NAME MODE)
// Diferenciación estricta entre Código IATA y Nombre de Ciudad
// ==========================================

const AID_CIVITATIS = '112603';
const AID_STAY22 = 'lumivia';
const MARKER_AIRALO = '7136059';
const MARKER_EKTA = '708095';

const limpiarFecha = (fechaRaw: string | null) => {
    if (!fechaRaw) return '';
    return fechaRaw.substring(0, 10);
};

export const GET: RequestHandler = async ({ url }) => {
    // IATA (Ej. ADZ, MEX) -> Usado para trackers internos
    const destinoRaw = url.searchParams.get('destino') || '';
    const destinoIATA = destinoRaw.toUpperCase().trim();
    
    // CIUDAD REAL (Ej. San Andrés, Madrid) -> Usado para Civitatis y Stay22
    const ciudadRaw = url.searchParams.get('ciudad') || destinoRaw;
    const ciudadEncoded = encodeURIComponent(ciudadRaw.trim());
    
    const fSalida = limpiarFecha(url.searchParams.get('salida'));
    const fRegreso = limpiarFecha(url.searchParams.get('regreso'));
    const url_hotel_db = url.searchParams.get('url_hotel') || '';

    // 1. AIRALO
    const linkEsim = `https://www.airalo.com/es/?marker=${MARKER_AIRALO}`;

    // 2. EKTA
    const linkSeguro = `https://ektatraveling.com/es/?marker=${MARKER_EKTA}`;

    // 3. CIVITATIS (Búsqueda por CIUDAD REAL, no por IATA)
    let linkTours = `https://www.civitatis.com/es/buscar?q=${ciudadEncoded}&aid=${AID_CIVITATIS}`;
    if (fSalida && fRegreso) {
        linkTours += `&fromDate=${fSalida}&toDate=${fRegreso}`;
    }

    // 4. STAY22 (Búsqueda por CIUDAD REAL)
    let linkHotel = url_hotel_db;
    if (!linkHotel || linkHotel === 'undefined' || linkHotel === 'null') {
        linkHotel = `https://www.stay22.com/allez/roam?aid=${AID_STAY22}&address=${ciudadEncoded}`;
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
