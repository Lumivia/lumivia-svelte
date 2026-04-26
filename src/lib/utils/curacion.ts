/**
 * Curación de ofertas Lumivia (Premium + Frescura)
 *
 * - Separa ofertas en:
 * - hookDeals -> carrusel principal (máximo 10)
 * - radarDeals -> lista secundaria
 *
 * - ESTRATEGIA: Reserva 2 slots para las ofertas más recientes (de hoy/ayer).
 * - Ordena el resto por relevancia, calidad, precio y fecha.
 * - Evita duplicados por destino.
 */

export function curarOfertas(ofertas: any[], paisActual: string) {
  if (!ofertas || ofertas.length === 0) {
    return { hookDeals: [], radarDeals: [] };
  }

  // 1) Normalizar datos y agregar timestamp para precisión milimétrica
  const limpias = ofertas
    .filter((d) => d.destino && d.origen)
    .map((d) => ({
      ...d,
      precioNum: Number(d.precio ?? d.price ?? Infinity),
      calidad: Number(d.calidad_oferta || 0),
      destinoUpper: (d.destino || '').trim().toUpperCase(),
      origenUpper: (d.origen || '').trim().toUpperCase(),
      esDirecto: d.tipo_vuelo === 'directo',
      esDelPaisActual:
        typeof d.origen === 'string' &&
        d.origen.trim().toUpperCase().startsWith(paisActual.toUpperCase()),
      timestamp: new Date(d.created_at).getTime()
    }));

  const destinosVistos = new Set<string>();
  const hookDeals: any[] = [];

  // 2) ESTRATEGIA DE FRESCURA: Las 2 más recientes tienen pase VIP
  // Ordenamos temporalmente solo por fecha (más reciente a más antigua)
  const porFecha = [...limpias].sort((a, b) => b.timestamp - a.timestamp);

  for (const d of porFecha) {
    if (hookDeals.length >= 2) break; // Solo 2 slots de frescura
    
    // Si es del país y no hemos puesto este destino, la inyectamos al inicio
    if (d.esDelPaisActual && !destinosVistos.has(d.destinoUpper)) {
      hookDeals.push(d);
      destinosVistos.add(d.destinoUpper);
    }
  }

  // 3) ORDENAMIENTO PREMIUM: El resto compite por Calidad y Precio
  // Filtramos las que ya entraron por frescura para que no compitan doble
  const restoOfertas = limpias.filter(d => !destinosVistos.has(d.destinoUpper));

  restoOfertas.sort((a, b) => {
    // A) Priorizar vuelos del país actual
    if (a.esDelPaisActual !== b.esDelPaisActual) {
      return Number(b.esDelPaisActual) - Number(a.esDelPaisActual);
    }

    // B) Priorizar vuelos directos
    if (a.esDirecto !== b.esDirecto) {
      return Number(b.esDirecto) - Number(a.esDirecto);
    }

    // C) Calidad
    if (a.calidad !== b.calidad) {
      return b.calidad - a.calidad;
    }

    // D) Precio (más barato primero)
    if (a.precioNum !== b.precioNum) {
      return a.precioNum - b.precioNum;
    }

    // E) Desempate por fecha
    return b.timestamp - a.timestamp;
  });

  // 4) Llenar el resto del carrusel (hasta 10) y luego el radar
  const radarDeals: any[] = [];

  for (const d of restoOfertas) {
    if (!destinosVistos.has(d.destinoUpper)) {
      destinosVistos.add(d.destinoUpper);
      
      if (hookDeals.length < 10) {
        hookDeals.push(d);
      } else {
        radarDeals.push(d);
      }
    }
  }

  return { hookDeals, radarDeals };
}
