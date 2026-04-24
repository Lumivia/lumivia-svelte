/**
 * Curación de ofertas Lumivia
 *
 * - Separa ofertas en:
 *   - hookDeals → carrusel principal (máximo 10)
 *   - radarDeals → lista secundaria
 *
 * - Ordena por calidad, precio y fecha
 * - Filtra duplicados
 * - Asegura variedad de destinos
 */

export function curarOfertas(ofertas: any[], paisActual: string) {
  if (!ofertas || ofertas.length === 0) {
    return { hookDeals: [], radarDeals: [] };
  }

  // 1) Normalizar datos
  const limpias = ofertas
    .filter((d) => d.destino && d.origen)
    .map((d) => ({
      ...d,
      precioNum: Number(d.precio || d.price || 999999),
      calidad: Number(d.calidad_oferta || 0),
      destinoUpper: (d.destino || '').trim().toUpperCase(),
      origenUpper: (d.origen || '').trim().toUpperCase()
    }));

  // 2) Ordenar por calidad primero, luego precio, luego fecha
  limpias.sort((a, b) => {
    if (b.calidad !== a.calidad) return b.calidad - a.calidad;
    if (a.precioNum !== b.precioNum) return a.precioNum - b.precioNum;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // 3) Evitar duplicados por destino
  const destinosVistos = new Set<string>();
  const unicas = limpias.filter((d) => {
    if (destinosVistos.has(d.destinoUpper)) return false;
    destinosVistos.add(d.destinoUpper);
    return true;
  });

  // 4) Seleccionar hookDeals (máximo 10)
  const hookDeals = unicas.slice(0, 10);

  // 5) El resto va al radar
  const radarDeals = unicas.slice(10);

  return { hookDeals, radarDeals };
}
