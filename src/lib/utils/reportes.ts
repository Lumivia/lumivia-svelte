import { supabase } from '$lib/supabaseClient';

/**
 * Genera o recupera una huella digital anónima del navegador.
 */
function obtenerFingerprint(): string {
  let fp = localStorage.getItem('lumivia_fp');
  if (!fp) {
    fp = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    localStorage.setItem('lumivia_fp', fp);
  }
  return fp;
}

export async function reportarCambioPrecio(id: string | number) {
  if (typeof window === 'undefined') return false;

  try {
    const fingerprint = obtenerFingerprint();

    // Enviamos el ID del vuelo y la huella digital del usuario
    const { error } = await supabase.rpc('incrementar_reporte', { 
      p_deal_id: id.toString(),
      p_fingerprint: fingerprint
    });

    if (error) throw error;

    alert('¡Gracias por tu reporte, partner! 🕵️‍♂️ Acabas de ayudarnos a limpiar nuestra bóveda.');
    return true;

  } catch (err) {
    console.error('Error al ejecutar el RPC de reportes:', err);
    alert('Hubo un problema al enviar el reporte. Quizá ya lo habías reportado.');
    return false;
  }
}
