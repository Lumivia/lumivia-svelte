import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// ==========================================
// LUMIVIA - LINK INTEL ENGINE v10.0 (FINAL)
// Modo: Slug Directo & Blindaje de Parámetros
// ==========================================

const AID_CIVITATIS = '112603';
const AID_STAY22 = 'lumivia';
const MARKER_AIRALO = '7136059';
const MARKER_EKTA = '708095';

const limpiarFecha = (fechaRaw: string | null) => {
    if (!fechaRaw || fechaRaw === 'null' || fechaRaw === 'undefined') return '';
    return String(fechaRaw).substring(0, 10);
};

export const GET: RequestHandler = async ({ url }) => {
    const destinoRaw = url.searchParams.get('destino') || '';
    // Usamos la ciudad real extraída (Ej: "San Andrés")
    const ciudadRaw = url.searchParams.get('ciudad') || destinoRaw;
    
    // 🔥 MOTOR DE SLUGIFICACIÓN (Convierte "San Andrés" en "san-andres")
    // Esto es vital para que Civitatis no haga redirecciones 301 que borran las fechas.
    const ciudadSlug = ciudadRaw
        .normalize("NFD")                 
        .replace(/[\u0300-\u036f]/g, "")  
        .toLowerCase()                    
        .trim()                           
        .replace(/[^a-z0-9\s-]/g, "")     
        .replace(/\s+/g, "-");

    const ciudadEncoded = encodeURIComponent(ciudadRaw.trim());
    
    const fSalida = limpiarFecha(url.searchParams.get('salida'));
    const fRegreso = limpiarFecha(url.searchParams.get('regreso'));
    const url_hotel_db = url.searchParams.get('url_hotel') || '';

    // 1. AIRALO (Búsqueda Directa con Marker Oficial)
    const linkEsim = `https://www.airalo.com/es/search?search=${ciudadEncoded}&marker=${MARKER_AIRALO}`;

    // 2. EKTA (Asistencia Canónica)
    const linkSeguro = `https://ektatraveling.com/es/?marker=${MARKER_EKTA}`;

    // 3. CIVITATIS (Slug Directo + Fechas)
    // Apuntamos directamente a la ruta /es/ciudad/ para evitar el rebote del buscador.
    let linkTours = `https://www.civitatis.com/es/${ciudadSlug}/?aid=${AID_CIVITATIS}`;
    if (fSalida && fRegreso) {
        linkTours += `&fromDate=${fSalida}&toDate=${fRegreso}`;
    }

    // 4. STAY22 (Hoteles por Ciudad)
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
