/**
 * Copia la URL única de una oferta al portapapeles.
 * Funciona en navegador y evita errores en SSR.
 */
export async function copiarUrlUnica(id: string | number) {
  if (typeof window === 'undefined') return;

  // Unificamos el formato para que sea un Shortlink limpio (estilo premium)
  const url = `${window.location.origin}/r/${id}`;

  try {
    await navigator.clipboard.writeText(url);
    alert('🔗 ¡Enlace copiado! Listo para compartir la aventura.');
  } catch (err) {
    console.error('Error al copiar (usando fallback):', err);
    fallbackCopy(url);
    alert('🔗 ¡Enlace copiado! Listo para compartir la aventura.');
  }
}

/**
 * Fallback para navegadores antiguos o webviews (Instagram/Facebook)
 * que no soportan la API moderna de navigator.clipboard
 */
function fallbackCopy(text: string) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  
  // Lo hacemos invisible y lo sacamos del flujo visual
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.left = '-9999px';
  textarea.style.opacity = '0';
  
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Fallback copy error:', err);
  }

  document.body.removeChild(textarea);
}
