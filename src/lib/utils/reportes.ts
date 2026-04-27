// ✅ Usamos tu cliente maestro de siempre
import { supabase } from '$lib/supabaseClient';

/**
 * Llama al motor de la base de datos para registrar un reporte.
 * Todo el trabajo pesado (sumar y borrar) lo hace el RPC en Supabase.
 */
export async function reportarCambioPrecio(id: string | number) {
  if (typeof window === 'undefined') return false;

  try {
    // 1. Disparamos la función RPC que acabamos de crear en Supabase
    // Le pasamos el ID convertido a string por seguridad
    const { error } = await supabase.rpc('incrementar_reporte', { deal_id: id.toString() });

    if (error) throw error;

    // 2. Feedback premium y agradecimiento al cliente
    alert('¡Gracias por tu reporte, partner! 🕵️‍♂️ Acabas de ayudarnos a limpiar nuestra bóveda.');

    return true;

  } catch (err) {
    console.error('Error al ejecutar el RPC de reportes:', err);
    alert('Hubo un problema de conexión al enviar el reporte, pero lo intentaremos de nuevo.');
    return false;
  }
}
