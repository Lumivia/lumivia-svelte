import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// ==========================================
// LUMIVIA - LINK INTEL ENGINE v11.5 (TITANIUM + IMPACT RADIUS)
// Blindaje contra nulls, crasheos 500 y Deep Link Oficial
// ==========================================

const AID_CIVITATIS = '112603';
const AID_STAY22 = 'lumivia';
const MARKER_EKTA = '708095';

// 🚨 IMPACT RADIUS: Tu Llave Maestra Oficial (Full Tracking URL)
const AIRALO_IMPACT_RAW_LINK = 'https://airalo.pxf.io/c/7136059/1268485/15608';

const limpiarFecha = (fechaRaw: any) => {
    if (!fechaRaw || fechaRaw === 'null' || fechaRaw === 'undefined') return '';
    return String(fechaRaw).substring(0, 10);
};

// Ampliamos el diccionario por si el país viene en distintos formatos
const airaloPaises: Record<string, string> = {
    'MX': 'mexico-esim',
    'CO': 'colombia-esim',
    'CL': 'chile-esim',
    'CR': 'costa-rica-esim',
    'US': 'united-states-esim',
    'ES': 'spain-esim',
    'AR': 'argentina-esim',
    'PE': 'peru-esim',
    'BR': 'brazil-esim',
    'CA': 'canada-esim',
    'FR': 'france-esim',
    'IT': 'italy-esim',
    'UK': 'united-kingdom-esim',
    'JP': 'japan-esim'
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

    // ==========================================
    // 🎯 1. AIRALO (IMPACT RADIUS DEEP LINK)
    // ==========================================
    const slugAiralo = airaloPaises[pais] || 'global-esim';
    
    // Construimos la URL destino final en Airalo
    const urlFinalAiralo = `https://www.airalo.com/es/${slugAiralo}`;
    
    // La inyectamos dentro del enlace de Impact usando ?u=
    const linkEsim = `${AIRALO_IMPACT_RAW_LINK}?u=${encodeURIComponent(urlFinalAiralo)}`;

    // ==========================================
    // 2. EKTA
    // ==========================================
    const linkSeguro = `https://ektatraveling.com/es/?marker=${MARKER_EKTA}`;

    // ==========================================
    // 3. CIVITATIS (Slug Directo + Fechas intactas)
    // ==========================================
    let linkTours = `https://www.civitatis.com/es/${ciudadSlug}/?aid=${AID_CIVITATIS}`;
    if (fSalida && fRegreso) {
        linkTours += `&fromDate=${fSalida}&toDate=${fRegreso}`;
    }

    // ==========================================
    // 4. STAY22
    // ==========================================
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
