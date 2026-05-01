import { error } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient'; 

export async function load({ params }) {
    const { influencer_slug } = params;

    try {
        // 1. Buscamos al creador (Modificado a prueba de duplicados)
        const { data: creatorsArray, error: creatorError } = await supabase
            .from('creators')
            .select('*')
            .eq('slug', influencer_slug)
            .limit(1); // Si hay 5 'viajexmemorias', solo toma el primero.

        if (creatorError) {
            console.error("Error DB Creators:", creatorError);
            throw error(500, `Error de DB: ${creatorError.message}`);
        }

        // Extraemos el primer resultado del array
        const creator = creatorsArray?.[0];

        if (!creator) {
            throw error(404, 'Radar de viajero no encontrado');
        }

        // 2. Traemos las ofertas
        const { data: publicaciones, error: vuelosError } = await supabase
            .from('publicaciones_lumivia') 
            .select('origen, destino, precio, link_compra')
            .eq('activo', true) 
            .order('created_at', { ascending: false })
            .limit(10); 

        if (vuelosError) {
            console.error("Error DB Publicaciones:", vuelosError);
            throw error(500, `Error cargando ofertas: ${vuelosError.message}`);
        }

        // 3. Mapeamos
        const flights = publicaciones ? publicaciones.map(pub => ({
            origin: pub.origen,
            destination: pub.destino,
            price: pub.precio,
            url: pub.link_compra
        })) : [];

        // 4. Mandamos al Frontend
        return {
            creator,
            flights
        };

    } catch (err) {
        console.error("Error fatal en el servidor:", err);
        throw error(err.status || 500, err.body?.message || err.message || 'Error interno del servidor');
    }
}
