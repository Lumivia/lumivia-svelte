import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';
import { error } from '@sveltejs/kit';

export const load = async ({ params, fetch }) => {
    // 1. Atrapamos el ID de la URL
    const { id } = params;

    const supabaseUrl = env.PUBLIC_SUPABASE_URL || '';
    const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY || ''; // Aquí usamos la pública porque las ofertas son de lectura libre

    if (!supabaseUrl || !supabaseKey) {
        throw error(500, 'Error de conexión con la base de datos.');
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { fetch },
        auth: { persistSession: false }
    });

    // 2. Buscamos la oferta específica en la bóveda
    const { data: deal, error: dealError } = await supabase
        .from('publicaciones_lumivia')
        .select('*')
        .eq('id', id)
        .single();

    // Si el usuario pone un ID inventado o la oferta ya no existe, tiramos un 404 elegante
    if (dealError || !deal) {
        console.error('Error al buscar la oferta:', dealError);
        throw error(404, 'No pudimos encontrar esta oferta. Es posible que el enlace haya expirado o sea incorrecto.');
    }

    // 3. Traducción de IATA en tiempo real (Cruzar con el Diccionario)
    const codigosIata = [deal.origen, deal.destino].filter(Boolean); // Filtramos nulos
    
    let origenReal = deal.origen || 'Origen';
    let destinoReal = deal.destino || 'Destino';

    if (codigosIata.length > 0) {
        const { data: diccionario } = await supabase
            .from('diccionario_destinos')
            .select('iata_code, nombre_ciudad')
            .in('iata_code', codigosIata);

        if (diccionario && diccionario.length > 0) {
            // Creamos un mapa rápido como en n8n
            const traductor = {};
            diccionario.forEach(d => {
                traductor[d.iata_code.toUpperCase()] = d.nombre_ciudad;
            });

            // Asignamos los nombres reales si existen en el diccionario
            if (deal.origen && traductor[deal.origen.toUpperCase()]) {
                origenReal = traductor[deal.origen.toUpperCase()];
            }
            if (deal.destino && traductor[deal.destino.toUpperCase()]) {
                destinoReal = traductor[deal.destino.toUpperCase()];
            }
        }
    }

    // 4. Le entregamos la oferta pre-masticada al Frontend (el archivo +page.svelte)
    return {
        deal: {
            ...deal,
            origenNombre: origenReal,
            destinoNombre: destinoReal
        }
    };
};
