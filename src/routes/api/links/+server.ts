import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// ==========================================
# LUMIVIA - LINK INTEL ENGINE v2.0
# Centralización de Credenciales y Lógica Dinámica
# ==========================================

// 🛡️ Credenciales Premium (Solo visibles en servidor, jamás en frontend)
const AID_CIVITATIS = '112603';     // De tu image_10.png
const AID_STAY22 = 'lumivia';       // De tu image_10.png
const MARKER_EKTA = '708095';       // ID de Ekta que me diste
const ID_AIRALO = '7136059';        // ID de Airalo de tu image_11.png

// Helper para asegurar formato fecha YYYY-MM-DD que requieren los partners
const limpiarFechaISO = (iso: string | null) => iso ? iso.split('T')[0] : '';

export const GET: RequestHandler = async ({ url }) => {
    // 1. Extraer contexto de la oferta desde la URL del BFF
    const destinoRaw = url.searchParams.get('destino');
    const destino = (destinoRaw || '').toUpperCase().trim();
    const salidaISO = url.searchParams.get('salida');
    const regresoISO = url.searchParams.get('regreso');
    const url_hotel_db = url.searchParams.get('url_hotel') || '';

    // Asegurar fechas limpias YYYY-MM-DD
    const fSalida = limpiarFechaISO(salidaISO);
    const fRegreso = limpiarFechaISO(regresoISO);

    // Contexto de Búsqueda para motores de viaje
    const searchParam = `${fSalida}/${fRegreso}/${destino}`;

    // 2. CONSTRUCCIÓN DE ENLACES DINÁMICOS INTELIGENTES

    // 2A) Motor de Conectividad (Airalo eSIM) con 0% Error 404
    // Usamos el ID oficial 7136059 y pasamos el destino como subid
    const linkEsim = `https://airalo.tp.st/${ID_AIRALO}?subid=${destino}`;

    // 2B) Motor de Tours y Actividades (Civitatis) con Contexto Total
    // Inyectamos destino, fechas limpias y tu AID 112603
    const linkTours = `https://www.civitatis.com/es/buscar/?q=${encodeURIComponent(destino)}&fromDate=${fSalida}&toDate=${fRegreso}&aid=${AID_CIVITATIS}`;

    // 2C) Motor de Seguros y Asistencia (EKTA) - Reemplaza Heymondo
    const linkSeguro = `https://ektatraveling.tp.st/${MARKER_EKTA}?subid=${destino}`;

    // 2D) Motor de Hoteles (Stay22 con Respaldo de DB)
    let linkHotel = url_hotel_db;
    if (!linkHotel || linkHotel === 'undefined' || linkHotel === 'null') {
        // Si la DB no tiene hotel específico, abrimos el mapa de Stay22 con el destino y fechas
        linkHotel = `https://www.stay22.com/allez/roam?aid=${AID_STAY22}&address=${encodeURIComponent(destino)}&checkin=${fSalida}&checkout=${fRegreso}`;
    }

    // 3. Retornar los enlaces blindados al frontend
    return json({
        esim: linkEsim,
        tours: linkTours,
        hotel: linkHotel,
        seguro: linkSeguro
    });
};
