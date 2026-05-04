import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';

export async function POST({ request, fetch }) {
    try {
        const body = await request.json();
        
        // 1. Sanitización de datos
        const rawEmail = body.email || '';
        const email = rawEmail.trim().toLowerCase();
        const pais = body.pais || 'MX';
        const nombre = (body.nombre || 'Viajero').trim();

        // 2. Escudo de Validación (Regex para email)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return json({ success: false, message: 'Formato de correo inválido.' }, { status: 400 });
        }

        // 3. Credenciales
        const supabaseUrl = env.PUBLIC_SUPABASE_URL || '';
        // 🔥 La Llave de Dios: oculta y segura en el backend
        const supabaseKey = privateEnv.SUPABASE_SERVICE_ROLE_KEY || '';

        if (!supabaseUrl || !supabaseKey) {
            console.error('CRÍTICO: Faltan variables de entorno en el servidor.');
            return json({ success: false, message: 'Error interno de configuración.' }, { status: 500 });
        }

        // 4. Conexión VIP (Apagando el RLS)
        const supabase = createClient(supabaseUrl, supabaseKey, {
            global: { fetch },
            auth: { persistSession: false }
        });

        // 5. El UPSERT a prueba de fallos
        const { error } = await supabase.from('suscriptores_radar').upsert(
            { 
                email: email, 
                pais: pais, 
                nombre: nombre, 
                activo: true // Si ya existía y estaba false, lo revive.
            },
            { onConflict: 'email' } // La regla que le dice a Supabase que no duplique
        );

        if (error) {
            console.error('Supabase rechazó el upsert:', error.message);
            return json({ success: false, message: 'No pudimos registrar tu correo en la base de datos.' }, { status: 500 });
        }

        // 6. Victoria
        return json({ success: true });

    } catch (err) {
        console.error('Error catastrófico en el endpoint de suscripción:', err);
        return json({ success: false, message: 'Error inesperado del servidor.' }, { status: 500 });
    }
}
