import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { env as envPublic } from '$env/dynamic/public';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  const { id, secret } = await request.json();

  // 1. BLINDAJE: Solo tú sabes esta contraseña. Cámbiala por algo seguro.
  const MI_CONTRASEÑA_SECRETA = "LumiviaGod2026!"; 

  if (secret !== MI_CONTRASEÑA_SECRETA) {
    return json({ error: 'Acceso denegado.' }, { status: 401 });
  }

  // 2. Conexión con privilegios máximos (Service Role Key) para poder actualizar la tabla
  // OJO: Asegúrate de tener SUPABASE_SERVICE_ROLE_KEY en tu archivo .env
  const supabaseUrl = envPublic.PUBLIC_SUPABASE_URL;
  const supabaseAdminKey = env.SUPABASE_SERVICE_ROLE_KEY || envPublic.PUBLIC_SUPABASE_ANON_KEY; 

  const supabase = createClient(supabaseUrl, supabaseAdminKey);

  // 3. Matamos la oferta en la base de datos
  const { error } = await supabase
    .from('publicaciones_lumivia')
    .update({ expirada_manualmente: true })
    .eq('id', id);

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json({ success: true });
}
