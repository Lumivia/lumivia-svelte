import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

export const load = async ({ url, fetch }) => {
    try {
        const token = url.searchParams.get('token');

        // 🔥 ESCUDO 1: Validar que sea un UUID real antes de tocar la Base de Datos
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        
        if (!token || !uuidRegex.test(token)) {
            return { success: false, message: 'El enlace es inválido o ha caducado.' };
        }

        // Conexión a Supabase
        const supabaseUrl = env.PUBLIC_SUPABASE_URL || '';
        const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY || '';
        
        if (!supabaseUrl || !supabaseKey) {
            return { success: false, message: 'Error interno del servidor.' };
        }

        const supabase = createClient(supabaseUrl, supabaseKey, {
            global: { fetch },
            auth: { persistSession: false }
        });

        // 🔥 ESCUDO 2: Ejecutamos la baja (UPDATE activo = false)
        const { data, error } = await supabase
            .from('suscriptores_radar')
            .update({ activo: false })
            .eq('token_baja', token)
            .select('email, nombre')
            .single();

        if (error || !data) {
            return { success: false, message: 'No encontramos tu suscripción o ya estabas dado de baja.' };
        }

        return { 
            success: true, 
            email: data.email,
            nombre: data.nombre
        };

    } catch (err) {
        // Si todo falla, atrapamos el error para que NUNCA salga el "500 Internal Error"
        console.error('Error catastrófico en baja:', err);
        return { success: false, message: 'Ocurrió un error inesperado. Intenta de nuevo.' };
    }
};
