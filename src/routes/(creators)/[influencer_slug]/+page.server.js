import { error } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient'; 

export async function load({ params }) {
    const { influencer_slug } = params;

    try {
        // 1. Buscamos al creador
        const { data: creatorsArray, error: creatorError } = await supabase
            .from('creators')
            .select('*')
            .eq('slug', influencer_slug)
            .limit(1);

        if (creatorError) throw error(500, `Error DB Creators: ${creatorError.message}`);
        
        const creator = creatorsArray?.[0];
        if (!creator) throw error(404, 'Radar de viajero no encontrado');

        // 2. EL NUEVO MOTOR DE REGLAS (Filtros MX y Calidad 9/10)
        const { data: publicaciones, error: vuelosError } = await supabase
            .from('publicaciones_lumivia') 
            .select('origen, destino, precio, link_compra')
            .eq('activo', true) 
            .eq('pais_mercado', 'MX')         // 👈 Regla 1: Solo mercado mexicano
            .gte('calidad_oferta', 9)         // 👈 Regla 2: Calidad Mayor o Igual a 9
            .order('created_at', { ascending: false })
            .limit(10); 

        if (vuelosError) throw error(500, `Error DB Publicaciones: ${vuelosError.message}`);

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
        console.error("Error fatal en servidor:", err);
        throw error(err.status || 500, err.body?.message || err.message || 'Error interno');
    }
}
