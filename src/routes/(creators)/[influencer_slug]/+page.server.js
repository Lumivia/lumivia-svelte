import { error } from '@sveltejs/kit';
// Importamos tu cliente estático que nos mostraste (asumiendo que vive en src/lib/)
import { supabase } from '$lib/supabaseClient'; 

export async function load({ params }) {
    const { influencer_slug } = params;

    try {
        // 1. Buscamos al creador en la tabla 'creators'
        const { data: creator, error: creatorError } = await supabase
            .from('creators')
            .select('*')
            .eq('slug', influencer_slug)
            .single();

        // Si hay error de conexión
        if (creatorError) {
            console.error("Error DB Creators:", creatorError);
            throw error(500, `Error cargando perfil: ${creatorError.message}`);
        }

        // Si el slug no existe (ej. alguien tecleó mal el nombre)
        if (!creator) {
            throw error(404, 'Radar de viajero no encontrado');
        }

        // 2. Traemos las ofertas de TU tabla real 'publicaciones_lumivia'
        const { data: publicaciones, error: vuelosError } = await supabase
            .from('publicaciones_lumivia') 
            .select('origen, destino, precio, link_compra')
            .eq('activo', true) // Filtramos solo las que están activas
            .order('created_at', { ascending: false })
            .limit(10); 

        if (vuelosError) {
            console.error("Error DB Publicaciones:", vuelosError);
            throw error(500, `Error cargando ofertas: ${vuelosError.message}`);
        }

        // 3. Mapeamos (Traducimos) las columnas de tu DB al formato que espera nuestro Svelte
        const flights = publicaciones ? publicaciones.map(pub => ({
            origin: pub.origen,
            destination: pub.destino,
            price: pub.precio,
            url: pub.link_compra
        })) : [];

        // 4. Mandamos todo limpio al Frontend
        return {
            creator,
            flights
        };

    } catch (err) {
        console.error("Error fatal en el servidor (Load):", err);
        throw error(err.status || 500, err.body?.message || err.message || 'Error interno del servidor');
    }
}
