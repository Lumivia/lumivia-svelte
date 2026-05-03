import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

export const load = async ({ url, fetch }) => {
    // 1. Extraemos el token de la URL (?token=...)
    const token = url.searchParams.get('token');

    if (!token) {
        return { success: false, message: 'Enlace inválido o caducado.' };
    }

    // 2. Conectamos a Supabase
    const supabaseUrl = env.PUBLIC_SUPABASE_URL || '';
    const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
        return { success: false, message: 'Error de configuración del servidor.' };
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { fetch }
    });

    // 3. Ejecutamos la baja lógica (UPDATE activo = false)
    const { data, error } = await supabase
        .from('suscriptores_radar')
        .update({ activo: false })
        .eq('token_baja', token)
        .select('email, nombre')
        .single();

    if (error || !data) {
        console.error('Error al dar de baja:', error);
        return { success: false, message: 'No encontramos tu suscripción o ya estabas dado de baja.' };
    }

    // 4. Retornamos el éxito al frontend
    return { 
        success: true, 
        email: data.email,
        nombre: data.nombre
    };
};
