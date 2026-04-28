import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// ==========================================
// LUMIVIA - LINK INTEL ENGINE v16.0 (DESTINATION FOCUS)
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

// MOTOR AIRALO: Detecta el DESTINO y saca el país correcto
function getAiraloSlug(destinoIATA: string, ciudadName: string): string {
    const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    const iata = normalize(destinoIATA);
    const city = normalize(ciudadName);

    const map: Record<string, string> = {
        'BOG': 'colombia-esim', 'MDE': 'colombia-esim', 'CTG': 'colombia-esim', 'ADZ': 'colombia-esim', 'SMR': 'colombia-esim', 'CLO': 'colombia-esim', 'PEI': 'colombia-esim',
        'BOGOTA': 'colombia-esim', 'MEDELLIN': 'colombia-esim', 'CARTAGENA': 'colombia-esim', 'SAN ANDRES': 'colombia-esim', 'SANTA MARTA': 'colombia-esim', 'CALI': 'colombia-esim',
        
        'CUN': 'mexico-esim', 'MEX': 'mexico-esim', 'GDL': 'mexico-esim', 'MTY': 'mexico-esim', 'SJD': 'mexico-esim', 'PVR': 'mexico-esim', 'OAX': 'mexico-esim', 'TIJ': 'mexico-esim',
        'CANCUN': 'mexico-esim', 'CIUDAD DE MEXICO': 'mexico-esim', 'GUADALAJARA': 'mexico-esim', 'MONTERREY': 'mexico-esim', 'LOS CABOS': 'mexico-esim', 'TIJUANA': 'mexico-esim',
        
        'MAD': 'spain-esim', 'BCN': 'spain-esim', 'AGP': 'spain-esim',
        'MADRID': 'spain-esim', 'BARCELONA': 'spain-esim', 'MALAGA': 'spain-esim',
        
        'MIA': 'united-states-esim', 'JFK': 'united-states-esim', 'LAX': 'united-states-esim', 'MCO': 'united-states-esim', 'LAS': 'united-states-esim',
        'MIAMI': 'united-states-esim', 'NUEVA YORK': 'united-states-esim', 'LOS ANGELES': 'united-states-esim', 'ORLANDO': 'united-states-esim', 'LAS VEGAS': 'united-states-esim',
        
        'SCL': 'chile-esim', 'PUQ': 'chile-esim', 'SANTIAGO': 'chile-esim', 'PUNTA ARENAS': 'chile-esim',
        'SJO': 'costa-rica-esim', 'LIR': 'costa-rica-esim', 'SAN JOSE': 'costa-rica-esim',
        'CDG': 'france-esim', 'ORY': 'france-esim', 'PARIS': 'france-esim',
        'FCO': 'italy-esim', 'MXP': 'italy-esim', 'ROMA': 'italy-esim', 'MILAN': 'italy-esim', 'VENECIA': 'italy-esim',
        'LHR': 'united-kingdom-esim', 'LONDRES': 'united-kingdom-esim',
        'NRT': 'japan-esim', 'HND': 'japan-esim', 'TOKIO': 'japan-esim',
        'EZE': 'argentina-esim', 'BUENOS AIRES': 'argentina-esim',
        'LIM': 'peru-esim', 'LIMA': 'peru-esim',
        'PUJ': 'dominican-republic-esim', 'PUNTA CANA': 'dominican-republic-esim',
        'GRU': 'brazil-esim', 'GIG': 'brazil-esim', 'SAO PAULO': 'brazil-esim', 'RIO DE JANEIRO': 'brazil-esim',
        'YYZ': 'canada-esim', 'TORONTO': 'canada-esim',
        'GUA': 'guatemala-esim', 'CIUDAD DE GUATEMALA': 'guatemala-esim'
    };

    return map[city] || map[iata] || 'global-esim';
}

export const GET: RequestHandler = async ({ url }) => {
    const destinoRaw = url.searchParams.get('destino') || '';
    const ciudadRaw = url.searchParams.get('ciudad') || destinoRaw;
    
    const destinoSeguro = String(destinoRaw);
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
    // 🎯 1. AIRALO (DEEP LINK DE IMPACT AL DESTINO)
    // ==========================================
    const slugDestinoAiralo = getAiraloSlug(destinoSeguro, ciudadSegura);
    const urlFinalAiralo = `https://www.airalo.com/es/${slugDestinoAiralo}`;
    const linkEsim = `${AIRALO_IMPACT_RAW_LINK}?u=${encodeURIComponent(urlFinalAiralo)}`;

    // ==========================================
    // 2. EKTA
    // ==========================================
    const linkSeguro = `https://ektatraveling.com/es/?marker=${MARKER_EKTA}`;

    // ==========================================
    // 3. CIVITATIS (Slug Directo)
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
