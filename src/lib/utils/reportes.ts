import { createClient } from '@supabase/supabase-js';

// ⚠️ Idealmente mover a variables de entorno (.env)
const SUPABASE_URL = 'https://khmkpkbhlzpvowesbkgu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_uyjRiobM7d6m7IdMPUQi9Q_-RPZuIvt';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Registra un reporte de cambio de precio.
 * Funciona solo en navegador (SSR-safe).
 */
export async function reportarCambioPrecio(id: string) {
  if (typeof window === 'undefined') return;

  try {
    const { error } = await supabase
      .from('reportes_cambio_precio')
      .insert([{ publicacion_id: id, origen: 'lumivia_web' }]);

    if (error) {
      console.error('Error al reportar cambio de precio:', error);
    } else {
      console.log('Reporte registrado para ID:', id);
    }
  } catch (err) {
    console.error('Error inesperado al reportar precio:', err);
  }
}
