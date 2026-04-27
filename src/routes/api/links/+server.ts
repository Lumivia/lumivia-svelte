import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Los declaramos aquí directo. Como este es un archivo de servidor, 
// el código fuente NUNCA llega al navegador del usuario.
const AID_CIVITATIS = '112603';
const AID_STAY22 = 'lumivia';

export const GET: RequestHandler = async ({ url }) => {
    const destino = url.searchParams.get('destino') || '';
    const salida = url.searchParams.get('salida')?.split('T')[0] || '';
    const regreso = url.searchParams.get('regreso')?.split('T')[0] || '';
    const url_hotel_db = url.searchParams.get('url_hotel') || '';

    // 1. Lógica de Tours (Civitatis)
    const linkTours = `https://www.civitatis.com/es/buscar/?q=${encodeURIComponent(destino)}&fromDate=${salida}&toDate=${regreso}&aid=${AID_CIVITATIS}`;

    // 2. Lógica de Hoteles (Stay22 / DB)
    let linkHotel = url_hotel_db;
    if (!linkHotel || linkHotel === 'undefined') {
        linkHotel = `https://www.stay22.com/allez/roam?aid=${AID_STAY22}&address=${encodeURIComponent(destino)}&checkin=${salida}&checkout=${regreso}`;
    }

    // 3. Lógica de eSIM (Airalo)
    // Cuando tengas tu ID de Airalo, solo reemplazas 'YOUR_SECRET_ID'
    const linkEsim = `https://airalo.tp.st/YOUR_SECRET_ID?subid=${destino}`;

    // 4. Lógica de Seguros (Mondo)
    const linkSeguro = `https://heymondo.es/seguro-de-viaje/?rta=YOUR_SECRET_ID&destino=${destino}`;

    return json({
        tours: linkTours,
        hotel: linkHotel,
        esim: linkEsim,
        seguro: linkSeguro
    });
};
