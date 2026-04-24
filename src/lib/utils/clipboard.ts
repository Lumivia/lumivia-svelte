/**
 * Copia la URL única de una oferta al portapapeles.
 * Funciona en navegador y evita errores en SSR.
 */
export async function copiarUrlUnica(id: string) {
  if (typeof window === 'undefined') return;

  const url = `${window.location.origin}${window.location.pathname}?vuelo=${id}`;

  try {
    await navigator.clipboard.writeText(url);
    console.log('URL copiada:', url);
  } catch (err) {
    console.error('Error al copiar:', err);
    fallbackCopy(url);
  }
}

/**
 * Fallback para navegadores que no soportan navigator.clipboard
 */
function fallbackCopy(text: string) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Fallback copy error:', err);
  }

  document.body.removeChild(textarea);
}
