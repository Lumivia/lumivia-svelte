import { supabase } from '$lib/supabaseClient';

/**
 * Llama al motor de la base de datos para registrar un reporte.
 * La IP se detecta automáticamente en el servidor (Supabase).
 */
export async function reportarCambioPrecio(id: string | number) {
  if (typeof window === 'undefined') return false;

  try {
    // Solo mandamos el ID. La base de datos identifica quién eres y si ya votaste.
    const { error } = await supabase.rpc('incrementar_reporte', { 
      p_deal_id: id.toString()
    });

    if (error) throw error;

    alert('¡Gracias por tu reporte, partner! 🕵️‍♂️ Acabas de ayudarnos a limpiar nuestra bóveda.');
    return true;

  } catch (err) {
    console.error('Error al ejecutar el reporte:', err);
    alert('Hubo un problema. Quizá ya habías reportado esta oferta.');
    return false;
  }
}
