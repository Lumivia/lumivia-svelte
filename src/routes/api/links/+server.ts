import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Credenciales blindadas en el servidor
const AID_CIVITATIS = '112603';
const AID_STAY22 = 'lumivia';

export const GET: RequestHandler = async ({ url }) => {
    const destino = url.searchParams.get('destino') || '';
    const salida = url.searchParams.get('salida')?.split('T')[0] || '';
    const regreso = url.searchParams.get('regreso')?.split('T')[0] || '';
    const url_hotel_db = url.searchParams.get('url_hotel') || '';

    // 1. Motor de Tours
    const linkTours = `https://www.civitatis.com/es/buscar/?q=${encodeURIComponent(destino)}&fromDate=${salida}&toDate=${regreso}&aid=${AID_CIVITATIS}`;

    // 2. Motor de Hoteles (Stay22 con Respaldo de DB)
    let linkHotel = url_hotel_db;
    if (!linkHotel || linkHotel === 'undefined' || linkHotel === 'null') {
        linkHotel = `https://www.stay22.com/allez/roam?aid=${AID_STAY22}&address=${encodeURIComponent(destino)}&checkin=${salida}&checkout=${regreso}`;
    }

    // 3. Motor de Conectividad (Airalo)
    const linkEsim = `https://airalo.tp.st/YOUR_ID?subid=${destino}`;

    // 4. Motor de Asistencia (Mondo)
    const linkSeguro = `https://heymondo.es/seguro-de-viaje/?rta=YOUR_ID&destino=${destino}`;

    return json({
        tours: linkTours,
        hotel: linkHotel,
        esim: linkEsim,
        seguro: linkSeguro
    });
};
