// ID prohibido (ala prohibida)
const ALA_PROHIBIDA = '1436491865332-7a61a109cc05';

// Diccionario infalible (puedes completarlo con todos los destinos que ya usabas)
const diccionarioInfalible: Record<string, string[]> = {
  // Ejemplos:
  // 'CDMX': ['1519085360753-3a39c9c1c6c8', '1526481280695-3c687fd543c0'],
  // 'MAD': ['1505761671935-60b3a7427bad'],
};

// Imagen genérica fallback
const FALLBACK_BASE = 'https://images.unsplash.com/photo-1488085061387-422e15b40b18';

// Construye URL de Unsplash con tamaño y calidad
function construirUrlUnsplash(id: string, width: number, quality = 70): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=${quality}&fm=webp`;
}

// Fallback genérico con tamaño
function fallbackGenerico(width: number, quality = 70): string {
  return `${FALLBACK_BASE}?auto=format&fit=crop&w=${width}&q=${quality}&fm=webp`;
}

/**
 * Obtiene la mejor imagen posible para un deal.
 * - Respeta url_imagen si es válida
 * - Bloquea la "ala prohibida"
 * - Usa diccionarioInfalible por destino
 * - Usa fallback genérico si no hay nada más
 *
 * @param deal Objeto de oferta
 * @param width Ancho deseado (600 para cards, 150 para radar, 800 para modal, etc.)
 */
export function obtenerImagen(deal: any, width = 600): string {
  let img = (deal?.url_imagen || '').trim();
  const destinoLimpio = (deal?.destino || '').trim().toUpperCase();

  // Si está vacía, es null, o contiene el ID prohibido → ignorar
  if (!img || img === 'null' || img.includes(ALA_PROHIBIDA)) {
    // Intentar diccionario infalible
    const lista = diccionarioInfalible[destinoLimpio];
    if (lista && lista.length > 0) {
      const fotoId = lista[Math.floor(Math.random() * lista.length)];
      return construirUrlUnsplash(fotoId, width);
    }
    // Fallback genérico
    return fallbackGenerico(width);
  }

  // Si no empieza con http, asumimos que es un ID de Unsplash
  if (!img.startsWith('http')) {
    return construirUrlUnsplash(img, width);
  }

  // Si ya es URL completa, la respetamos
  return img;
}
