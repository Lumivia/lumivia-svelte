import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { env as envPublic } from '$env/dynamic/public';
import { json } from '@sveltejs/kit';
import { headersLimite, limitarSolicitud, obtenerClaveCliente } from '$lib/server/rate-limit';
import { registrarAdvertencia, registrarError, registrarEvento } from '$lib/server/observabilidad';
import { ErrorSolicitud, leerObjetoJson } from '$lib/server/request';

export async function POST({ request, getClientAddress, locals }) {
  const cliente = obtenerClaveCliente(request, getClientAddress);
  const limite = limitarSolicitud(`admin-oferta:${cliente}`, 10, 10 * 60 * 1000);
  const rateHeaders = headersLimite(limite);

  if (!limite.permitido) {
    const retryAfter = Math.max(1, Math.ceil((limite.reinicio - Date.now()) / 1000));
    registrarAdvertencia('admin_offer.rate_limited', { requestId: locals.requestId });
    return json(
      { error: 'Demasiados intentos. Espera unos minutos antes de volver a intentar.' },
      { status: 429, headers: { ...rateHeaders, 'Retry-After': String(retryAfter) } }
    );
  }

  let body;
  try {
    body = await leerObjetoJson(request);
  } catch (error) {
    if (error instanceof ErrorSolicitud) {
      return json({ error: error.message }, { status: error.status, headers: rateHeaders });
    }
    registrarError('admin_offer.parse_error', error, { requestId: locals.requestId });
    return json({ error: 'No pudimos procesar la solicitud.' }, { status: 500, headers: rateHeaders });
  }

  const id = Number(body.id);
  const secret = String(body.secret ?? '');

  if (!Number.isSafeInteger(id) || id <= 0) {
    return json({ error: 'Identificador inválido.' }, { status: 400, headers: rateHeaders });
  }

  // 1. BLINDAJE PROFESIONAL: Jalamos la contraseña desde tu archivo .env
  const MI_CONTRASEÑA_SECRETA = env.ADMIN_PASSWORD; 

  // Verificamos que exista la variable y que la contraseña coincida
  if (!MI_CONTRASEÑA_SECRETA || secret !== MI_CONTRASEÑA_SECRETA) {
    registrarAdvertencia('admin_offer.access_denied', { requestId: locals.requestId });
    return json({ error: 'Acceso denegado.' }, { status: 401, headers: rateHeaders });
  }

  // 2. Conexión con Supabase (Usamos la Service Role Key para tener permisos de escritura)
  const supabaseUrl = envPublic.PUBLIC_SUPABASE_URL;
  const supabaseAdminKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAdminKey) {
    registrarError('admin_offer.config_error', 'Variables de Supabase ausentes', { requestId: locals.requestId });
    return json({ error: 'Servicio administrativo no configurado.' }, { status: 503, headers: rateHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseAdminKey);

  // 3. Matamos la oferta en la base de datos
  const { error } = await supabase
    .from('publicaciones_lumivia')
    .update({ expirada_manualmente: true })
    .eq('id', id);

  if (error) {
    registrarError('admin_offer.database_error', error, { requestId: locals.requestId });
    return json({ error: 'No pudimos actualizar la oferta.' }, { status: 503, headers: rateHeaders });
  }

  registrarEvento('admin_offer.expired', { requestId: locals.requestId, offerId: id });
  return json({ success: true }, { headers: rateHeaders });
}
