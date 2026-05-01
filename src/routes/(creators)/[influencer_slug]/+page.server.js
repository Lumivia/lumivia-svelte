import { error } from '@sveltejs/kit';

export async function load({ params, locals: { supabase } }) {
    // 1. Atrapamos el slug de la URL (ej. "viajexmemorias")
    const { influencer_slug } = params;

    // 2. Buscamos al creador en Supabase
    const { data: creator, error: creatorError } = await supabase
        .from('creators')
        .select('*')
        .eq('slug', influencer_slug)
        .single();

    // 3. Si alguien escribe un nombre que no existe, le mandamos un 404 automático
    if (creatorError || !creator) {
        throw error(404, 'Radar de viajero no encontrado');
    }

    // 4. Traemos las ofertas activas de TU tabla principal (asumo que se llama 'flights')
    const { data: flights } = await supabase
        .from('flights') 
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10); // Solo las 10 mejores para no saturar

    // Mandamos todo al Frontend
    return {
        creator,
        flights: flights || []
    };
}
