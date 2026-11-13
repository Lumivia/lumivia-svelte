import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { headersLimite, limitarSolicitud, obtenerClaveCliente } from '$lib/server/rate-limit';
import { registrarAdvertencia, registrarError, registrarEvento } from '$lib/server/observabilidad';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function limpiar(valor: unknown, maximo: number): string {
  return String(valor ?? '').trim().slice(0, maximo);
}

export const POST: RequestHandler = async ({ request, fetch, getClientAddress, locals }) => {
  const cliente = obtenerClaveCliente(request, getClientAddress);
  const limite = limitarSolicitud(`radar:${cliente}`, 5, 10 * 60 * 1000);
  const rateHeaders = headersLimite(limite);

  if (!limite.permitido) {
    const retryAfter = Math.max(1, Math.ceil((limite.reinicio - Date.now()) / 1000));
    registrarAdvertencia('radar.rate_limited', { requestId: locals.requestId });
    return json(
      { success: false, message: 'Demasiados intentos. Espera unos minutos antes de volver a intentar.' },
      { status: 429, headers: { ...rateHeaders, 'Retry-After': String(retryAfter) } }
    );
  }

  try {
    const body = await request.json();
    const nombre = limpiar(body.nombre, 80);
    const origen = limpiar(body.origen, 80);
    const destino = limpiar(body.destino, 80);
    const mes = limpiar(body.mes, 60);
    const contacto = limpiar(body.contacto, 254).toLowerCase();
    const website = limpiar(body.website, 200);

    if (website) {
      registrarAdvertencia('radar.honeypot', { requestId: locals.requestId });
      return json({ success: true }, { headers: rateHeaders });
    }

    if (nombre.length < 2 || origen.length < 2 || destino.length < 2 || mes.length < 2 || !emailRegex.test(contacto)) {
      return json(
        { success: false, message: 'Revisa los datos del radar e intenta nuevamente.' },
        { status: 400, headers: rateHeaders }
      );
    }

    const supabaseUrl = env.PUBLIC_SUPABASE_URL || '';
    const supabaseKey = privateEnv.SUPABASE_SERVICE_ROLE_KEY || env.PUBLIC_SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseKey) {
      registrarError('radar.config_error', 'Variables de Supabase ausentes', { requestId: locals.requestId });
      return json({ success: false, message: 'El radar no está disponible temporalmente.' }, { status: 503, headers: rateHeaders });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { fetch },
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { error } = await supabase.from('radares_personales').insert([{
      nombre,
      origen,
      destino,
      mes_esperado: mes,
      contacto,
      status: 'pendiente_verificacion'
    }]);

    if (error) {
      registrarError('radar.database_error', error, { requestId: locals.requestId });
      return json({ success: false, message: 'No pudimos activar el radar en este momento.' }, { status: 503, headers: rateHeaders });
    }

    registrarEvento('radar.created', { requestId: locals.requestId });
    return json({ success: true }, { headers: rateHeaders });
  } catch (error) {
    registrarError('radar.unexpected_error', error, { requestId: locals.requestId });
    return json({ success: false, message: 'No pudimos procesar la solicitud.' }, { status: 500, headers: rateHeaders });
  }
};
