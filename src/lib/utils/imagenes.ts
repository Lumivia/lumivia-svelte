// Imagen genérica fallback (Nubes Premium)
const FALLBACK_PREMIUM = 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&q=80';

// ID de la infame "Ala de Avión" que ya no queremos ver
const ALA_PROHIBIDA = '1436491865332-7a61a109cc05';

/**
 * Filtra basura de la base de datos y retorna una imagen limpia.
 * (La lógica de buscar en el diccionario ya la hace tu +page.server.ts)
 */
export function obtenerImagen(deal: any, width = 800): string {
  // 1. Extraemos la imagen que trae la oferta original
  let img = String(deal?.url_imagen || deal?.imagen_url_verificada || '').trim();

  // 2. Si es basura de la base de datos o el Ala Prohibida, regresamos vacío
  // para que el SvelteKit active el Escudo de Titanio.
  if (
    !img || 
    img === 'null' || 
    img === 'undefined' || 
    img === 'REVISION_MANUAL' || 
    img.includes(ALA_PROHIBIDA)
  ) {
    return ''; // Regresamos vacío para que Svelte aplique el fallback
  }

  // 3. Si por alguna razón la base de datos guardó solo el ID de Unsplash en vez de la URL completa
  if (!img.startsWith('http')) {
    return `https://images.unsplash.com/photo-${img}?auto=format&fit=crop&w=${width}&q=80&fm=webp`;
  }

  // 4. Si es una URL válida y limpia, la regresamos
  return img;
}
