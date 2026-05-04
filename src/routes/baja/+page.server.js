import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

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
        
        // 🔥 LA LLAVE DE DIOS: Llamamos a la variable privada que pusiste en Cloudflare
        const supabaseKey = privateEnv.SUPABASE_SERVICE_ROLE_KEY || '';
        
        if (!supabaseUrl || !supabaseKey) {
            console.error("Faltan credenciales del servidor.");
            return { success: false, message: 'Error interno del servidor.' };
        }

        // Al usar la Service Role, Supabase apaga el cadenero (RLS) y obedece sin preguntar.
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
            console.error("Supabase rechazó la baja:", error);
            return { success: false, message: 'No encontramos tu suscripción o ya estabas dado de baja.' };
        }

        return { 
            success: true, 
            email: data.email,
            nombre: data.nombre
        };

    } catch (err) {
        console.error('Error catastrófico en baja:', err);
        return { success: false, message: 'Ocurrió un error inesperado. Intenta de nuevo.' };
    }
};
