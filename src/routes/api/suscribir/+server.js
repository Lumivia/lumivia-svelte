import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import { headersLimite, limitarSolicitud, obtenerClaveCliente } from '$lib/server/rate-limit';
import { registrarAdvertencia, registrarError, registrarEvento } from '$lib/server/observabilidad';
import { ErrorSolicitud, leerObjetoJson } from '$lib/server/request';

export async function POST({ request, fetch, getClientAddress, locals }) {
    const cliente = obtenerClaveCliente(request, getClientAddress);
    const limite = limitarSolicitud(`suscripcion:${cliente}`, 5, 10 * 60 * 1000);
    const rateHeaders = headersLimite(limite);

    if (!limite.permitido) {
        const retryAfter = Math.max(1, Math.ceil((limite.reinicio - Date.now()) / 1000));
        registrarAdvertencia('subscription.rate_limited', { requestId: locals.requestId });
        return json(
            { success: false, message: 'Demasiados intentos. Espera unos minutos antes de volver a intentar.' },
            { status: 429, headers: { ...rateHeaders, 'Retry-After': String(retryAfter) } }
        );
    }

    try {
        const body = await leerObjetoJson(request);
        
        // 1. Sanitización de datos
        const email = String(body.email ?? '').trim().toLowerCase().slice(0, 254);
        const paisSolicitado = String(body.pais ?? 'MX').trim().toUpperCase();
        const pais = ['MX', 'CO', 'CL', 'CR'].includes(paisSolicitado) ? paisSolicitado : 'MX';
        const nombre = String(body.nombre ?? 'Viajero').trim().slice(0, 80) || 'Viajero';

        // 2. Escudo de Validación (Regex para email)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return json({ success: false, message: 'Formato de correo inválido.' }, { status: 400, headers: rateHeaders });
        }

        // 3. Credenciales
        const supabaseUrl = env.PUBLIC_SUPABASE_URL || '';
        // 🔥 La Llave de Dios: oculta y segura en el backend
        const supabaseKey = privateEnv.SUPABASE_SERVICE_ROLE_KEY || '';

        if (!supabaseUrl || !supabaseKey) {
            registrarError('subscription.config_error', 'Variables de Supabase ausentes', { requestId: locals.requestId });
            return json({ success: false, message: 'Error interno de configuración.' }, { status: 503, headers: rateHeaders });
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
            registrarError('subscription.database_error', error, { requestId: locals.requestId });
            return json({ success: false, message: 'No pudimos registrar tu correo en la base de datos.' }, { status: 503, headers: rateHeaders });
        }

        // 6. Victoria
        registrarEvento('subscription.created', { requestId: locals.requestId });
        return json({ success: true }, { headers: rateHeaders });

    } catch (err) {
        if (err instanceof ErrorSolicitud) {
            return json({ success: false, message: err.message }, { status: err.status, headers: rateHeaders });
        }
        registrarError('subscription.unexpected_error', err, { requestId: locals.requestId });
        return json({ success: false, message: 'Error inesperado del servidor.' }, { status: 500, headers: rateHeaders });
    }
}
