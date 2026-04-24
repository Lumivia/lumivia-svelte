/**
 * Curación de ofertas Lumivia
 *
 * - Separa ofertas en:
 *   - hookDeals → carrusel principal (máximo 10)
 *   - radarDeals → lista secundaria
 *
 * - Ordena por relevancia, calidad, precio y fecha
 * - Prioriza vuelos del país actual
 * - Evita duplicados por destino (prioriza vuelos directos)
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
      precioNum: Number(d.precio || d.price ?? Infinity),
      calidad: Number(d.calidad_oferta || 0),
      destinoUpper: (d.destino || '').trim().toUpperCase(),
      origenUpper: (d.origen || '').trim().toUpperCase(),
      esDirecto: d.tipo_vuelo === 'directo',
      esDelPaisActual: d.origen?.toUpperCase().startsWith(paisActual.toUpperCase())
    }));

  // 2) Ordenar por relevancia
  limpias.sort((a, b) => {
    // A) Priorizar vuelos del país actual
    if (a.esDelPaisActual !== b.esDelPaisActual) {
      return b.esDelPaisActual - a.esDelPaisActual;
    }

    // B) Priorizar vuelos directos
    if (a.esDirecto !== b.esDirecto) {
      return b.esDirecto - a.esDirecto;
    }

    // C) Calidad
    if (a.calidad !== b.calidad) {
      return b.calidad - a.calidad;
    }

    // D) Precio
    if (a.precioNum !== b.precioNum) {
      return a.precioNum - b.precioNum;
    }

    // E) Fecha (más reciente primero)
    const fechaDiff =
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (fechaDiff !== 0) return fechaDiff;

    // F) Desempate estable
    return (a.id || '').toString().localeCompare((b.id || '').toString());
  });

  // 3) Evitar duplicados por destino (priorizando directos)
  const destinosVistos = new Set<string>();
  const unicas = limpias.filter((d) => {
    if (!destinosVistos.has(d.destinoUpper)) {
      destinosVistos.add(d.destinoUpper);
      return true;
    }
    return false;
  });

  // 4) Seleccionar hookDeals (máximo 10)
  const hookDeals = unicas.slice(0, 10);

  // 5) El resto va al radar
  const radarDeals = unicas.slice(10);

  return { hookDeals, radarDeals };
}
