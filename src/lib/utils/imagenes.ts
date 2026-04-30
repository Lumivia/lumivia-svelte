const FALLBACK_PREMIUM = 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&q=80';
const ALA_PROHIBIDA = '1436491865332-7a61a109cc05';

export function obtenerImagen(deal: any, width = 800): string {
  if (!deal) return FALLBACK_PREMIUM;
  
  let img = '';
  
  // 1. Cascada inteligente: Busca la primera URL real que no sea "null"
  if (deal.url_imagen && String(deal.url_imagen).startsWith('http') && !String(deal.url_imagen).includes('null')) {
      img = String(deal.url_imagen);
  } else if (deal.imagen_url_verificada && String(deal.imagen_url_verificada).startsWith('http') && !String(deal.imagen_url_verificada).includes('null')) {
      img = String(deal.imagen_url_verificada);
  } else if (deal.imagen_fallback && String(deal.imagen_fallback).startsWith('http') && !String(deal.imagen_fallback).includes('null')) {
      img = String(deal.imagen_fallback);
  } else {
      img = String(deal.url_imagen || deal.imagen_url_verificada || deal.imagen_fallback || '');
  }

  img = img.trim();

  // 2. Destrucción de basura y errores
  if (!img || img === 'null' || img === 'undefined' || img === 'REVISION_MANUAL' || img.includes(ALA_PROHIBIDA)) {
    return FALLBACK_PREMIUM;
  }

  // 3. Formateo de IDs de Unsplash perdidos
  if (!img.startsWith('http')) {
    return `https://images.unsplash.com/photo-${img}?auto=format&fit=crop&w=${width}&q=80&fm=webp`;
  }

  return img;
}
