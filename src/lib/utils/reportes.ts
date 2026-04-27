import { createClient } from '@supabase/supabase-js';
// ✅ Importamos las variables de entorno de forma segura al estilo SvelteKit
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

/**
 * Registra un reporte de cambio de precio.
 * Funciona solo en navegador (SSR-safe).
 * El frontend SOLO reporta. La inteligencia de borrar vive en la base de datos.
 */
export async function reportarCambioPrecio(id: string | number) {
  if (typeof window === 'undefined') return false;

  try {
    // 1. Insertar el reporte en la base de datos
    const { error: insertError } = await supabase
      .from('reportes_cambio_precio')
      .insert([{ publicacion_id: id, origen: 'lumivia_web' }]);

    if (insertError) throw insertError;

    // 2. Feedback inmediato al usuario (CRO Premium)
    alert('¡Gracias por tu reporte, partner! 🕵️‍♂️ Acabas de ayudarnos a auditar esta tarifa.');

    return true;

  } catch (err) {
    console.error('Error inesperado al reportar precio:', err);
    alert('Hubo un problema de conexión al enviar el reporte, pero lo intentaremos de nuevo.');
    return false;
  }
}
