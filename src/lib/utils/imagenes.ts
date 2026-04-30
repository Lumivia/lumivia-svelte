// Imagen genérica fallback (Nubes Premium)
const FALLBACK_PREMIUM = 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&q=80';

// ID de la infame "Ala de Avión" que ya no queremos ver
const ALA_PROHIBIDA = '1436491865332-7a61a109cc05';

/**
 * Obtiene la mejor imagen posible para una oferta (deal).
 * Purgado de errores SSR (Server-Side Rendering) y strings basura ("null").
 */
export function obtenerImagen(deal: any, width = 800): string {
  // Candado de seguridad: si no hay deal, regresamos el fallback de inmediato
  if (!deal) return FALLBACK_PREMIUM;
  
  let img = '';
  
  // 1. Cascada ultra segura: Extrae la URL válida de mayor prioridad
  // Usamos String() para asegurar que no evalúe objetos nulos o undefined
  if (deal.url_imagen && String(deal.url_imagen).startsWith('http') && !String(deal.url_imagen).includes('null')) {
      img = String(deal.url_imagen);
  } else if (deal.imagen_url_verificada && String(deal.imagen_url_verificada).startsWith('http') && !String(deal.imagen_url_verificada).includes('null')) {
      img = String(deal.imagen_url_verificada);
  } else if (deal.imagen_fallback && String(deal.imagen_fallback).startsWith('http') && !String(deal.imagen_fallback).includes('null')) {
      img = String(deal.imagen_fallback);
  } else {
      // Captura de último recurso (por si mandaron solo un ID en lugar del link con http)
      img = String(deal.url_imagen || deal.imagen_url_verificada || deal.imagen_fallback || '');
  }

  // Limpiamos espacios en blanco
  img = img.trim();

  // 2. Escudo Anti-Basura: Si se filtró algo inútil, lo matamos aquí
  if (
    !img || 
    img === 'null' || 
    img === 'undefined' || 
    img === 'REVISION_MANUAL' || 
    img.includes(ALA_PROHIBIDA)
  ) {
    return FALLBACK_PREMIUM;
  }

  // 3. Formateo de IDs de Unsplash perdidos
  if (!img.startsWith('http')) {
    return `https://images.unsplash.com/photo-${img}?auto=format&fit=crop&w=${width}&q=80&fm=webp`;
  }

  // 4. Si pasó todos los filtros, es una URL perfecta
  return img;
}
