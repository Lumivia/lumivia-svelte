function esUnsplash(url: string): boolean {
  try {
    return new URL(url).hostname === 'images.unsplash.com';
  } catch {
    return false;
  }
}

export function optimizarImagen(url: string, width: number, quality = 76): string {
  if (!esUnsplash(url)) return url;

  const imagen = new URL(url);
  imagen.searchParams.set('auto', 'format');
  imagen.searchParams.set('fit', 'crop');
  imagen.searchParams.set('w', String(width));
  imagen.searchParams.set('q', String(quality));
  return imagen.toString();
}

export function crearSrcsetImagen(url: string, widths: number[]): string | undefined {
  if (!esUnsplash(url)) return undefined;

  return [...new Set(widths)]
    .sort((a, b) => a - b)
    .map((width) => `${optimizarImagen(url, width)} ${width}w`)
    .join(', ');
}

export function obtenerImagen(deal: any, width = 800): string {
  const FALLBACK_PREMIUM = `https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=${width}&q=80`;
  const ALA_PROHIBIDA = '1436491865332-7a61a109cc05';

  if (!deal) return FALLBACK_PREMIUM;

  const isValid = (url: any) => {
    if (!url) return false;
    const s = String(url).trim();
    return s.startsWith('http') && !s.includes('null') && !s.includes('undefined') && !s.includes('REVISION_MANUAL') && !s.includes(ALA_PROHIBIDA);
  };

  if (isValid(deal.url_imagen)) return optimizarImagen(String(deal.url_imagen).trim(), width);
  if (isValid(deal.imagen_url_verificada)) return optimizarImagen(String(deal.imagen_url_verificada).trim(), width);
  if (isValid(deal.imagen_fallback)) return optimizarImagen(String(deal.imagen_fallback).trim(), width);

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
