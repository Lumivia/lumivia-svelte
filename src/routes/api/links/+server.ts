import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// ==========================================
// LUMIVIA - LINK INTEL ENGINE v11.0 (TITANIUM MODE)
// Blindaje contra nulls y crasheos 500
// ==========================================

const AID_CIVITATIS = '112603';
const AID_STAY22 = 'lumivia';
const MARKER_AIRALO = '7136059';
const MARKER_EKTA = '708095';

const limpiarFecha = (fechaRaw: any) => {
    if (!fechaRaw || fechaRaw === 'null' || fechaRaw === 'undefined') return '';
    return String(fechaRaw).substring(0, 10);
};

const airaloPaises: Record<string, string> = {
    'MX': 'mexico-esim',
    'CO': 'colombia-esim',
    'CL': 'chile-esim',
    'CR': 'costa-rica-esim',
    'US': 'united-states-esim',
    'ES': 'spain-esim'
};

export const GET: RequestHandler = async ({ url }) => {
    const destinoRaw = url.searchParams.get('destino') || '';
    const ciudadRaw = url.searchParams.get('ciudad') || destinoRaw;
    const pais = String(url.searchParams.get('pais') || 'MX').toUpperCase();
    
    // 🛡️ BLINDAJE: Cast seguro a string antes de manipular para evitar el 500 Server Error
    const ciudadSegura = String(ciudadRaw);
    
    const ciudadSlug = ciudadSegura
        .normalize("NFD")                 
        .replace(/[\u0300-\u036f]/g, "")  
        .toLowerCase()                    
        .trim()                           
        .replace(/[^a-z0-9\s-]/g, "")     
        .replace(/\s+/g, "-");

    const ciudadEncoded = encodeURIComponent(ciudadSegura.trim());
    
    const fSalida = limpiarFecha(url.searchParams.get('salida'));
    const fRegreso = limpiarFecha(url.searchParams.get('regreso'));
    const url_hotel_db = url.searchParams.get('url_hotel') || '';

    // 1. AIRALO
    const slugAiralo = airaloPaises[pais] || 'global-esim';
    const linkEsim = `https://www.airalo.com/es/${slugAiralo}?marker=${MARKER_AIRALO}`;

    // 2. EKTA
    const linkSeguro = `https://ektatraveling.com/es/?marker=${MARKER_EKTA}`;

    // 3. CIVITATIS (Slug Directo + Fechas intactas)
    let linkTours = `https://www.civitatis.com/es/${ciudadSlug}/?aid=${AID_CIVITATIS}`;
    if (fSalida && fRegreso) {
        linkTours += `&fromDate=${fSalida}&toDate=${fRegreso}`;
    }

    // 4. STAY22
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
