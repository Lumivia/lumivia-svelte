import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';
import { fail } from '@sveltejs/kit';
import { registrarError, registrarEvento } from '$lib/server/observabilidad';

const TOKEN_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const load = async ({ url, setHeaders }) => {
    setHeaders({ 'Cache-Control': 'no-store' });
    const token = url.searchParams.get('token') || '';

    if (!TOKEN_REGEX.test(token)) {
        return { valid: false, message: 'El enlace es inválido o ha caducado.' };
    }

    return { valid: true, token };
};

export const actions = {
    default: async ({ request, fetch, locals }) => {
        const formData = await request.formData();
        const token = String(formData.get('token') ?? '');

        if (!TOKEN_REGEX.test(token)) {
            return fail(400, { success: false, message: 'El enlace es inválido o ha caducado.' });
        }

        const supabaseUrl = env.PUBLIC_SUPABASE_URL || '';
        const supabaseKey = privateEnv.SUPABASE_SERVICE_ROLE_KEY || '';

        if (!supabaseUrl || !supabaseKey) {
            registrarError('subscription.unsubscribe_config_error', 'Variables de Supabase ausentes', { requestId: locals.requestId });
            return fail(503, { success: false, message: 'El servicio no está disponible temporalmente.' });
        }

        try {
            const supabase = createClient(supabaseUrl, supabaseKey, {
                global: { fetch },
                auth: { persistSession: false, autoRefreshToken: false }
            });

            const { data, error } = await supabase
                .from('suscriptores_radar')
                .update({ activo: false })
                .eq('token_baja', token)
                .select('email')
                .maybeSingle();

            if (error) {
                registrarError('subscription.unsubscribe_database_error', error, { requestId: locals.requestId });
                return fail(503, { success: false, message: 'No pudimos procesar la baja en este momento.' });
            }

            if (!data) {
                return fail(404, { success: false, message: 'No encontramos tu suscripción o ya estaba dada de baja.' });
            }

            registrarEvento('subscription.unsubscribed', { requestId: locals.requestId });
            return { success: true, email: data.email };
        } catch (error) {
            registrarError('subscription.unsubscribe_unexpected_error', error, { requestId: locals.requestId });
            return fail(500, { success: false, message: 'Ocurrió un error inesperado. Intenta nuevamente.' });
        }
    }
};
