export function obtenerImagen(deal: any, width = 800): string {
  const FALLBACK_PREMIUM = `https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=${width}&q=80`;
  const ALA_PROHIBIDA = '1436491865332-7a61a109cc05';

  if (!deal) return FALLBACK_PREMIUM;

  const isValid = (url: any) => {
    if (!url) return false;
    const s = String(url).trim();
    return s.startsWith('http') && !s.includes('null') && !s.includes('undefined') && !s.includes('REVISION_MANUAL') && !s.includes(ALA_PROHIBIDA);
  };

  if (isValid(deal.url_imagen)) return String(deal.url_imagen).trim();
  if (isValid(deal.imagen_url_verificada)) return String(deal.imagen_url_verificada).trim();
  if (isValid(deal.imagen_fallback)) return String(deal.imagen_fallback).trim();

  // Captura final
  const raw = String(deal.url_imagen || deal.imagen_url_verificada || deal.imagen_fallback || '').trim();
  
  if (!raw || raw === 'null' || raw === 'undefined' || raw === 'REVISION_MANUAL' || raw.includes('null') || raw.includes(ALA_PROHIBIDA)) {
    return FALLBACK_PREMIUM;
  }

  if (!raw.startsWith('http')) {
    return `https://images.unsplash.com/photo-${raw}?auto=format&fit=crop&w=${width}&q=80&fm=webp`;
  }

  return FALLBACK_PREMIUM;
}
