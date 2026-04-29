/**
 * Curación de ofertas Lumivia (Motor Híbrido 2026)
 *
 * - Separa ofertas en:
 * - hookDeals -> carrusel principal (máximo 10)
 * - radarDeals -> lista secundaria
 *
 * - ESTRATEGIA: Reserva 3 slots (30%) VIP para Frescura + Meritocracia (< 72 hrs ordenado por Calidad/Precio).
 * - El resto (70%) compite a muerte por Calidad y Precio (Factor WOW histórico).
 * - Cero duplicados de destinos.
 */

export function curarOfertas(ofertas: any[], paisActual: string) {
  if (!ofertas || ofertas.length === 0) {
    return { hookDeals: [], radarDeals: [] };
  }

  // 1) Normalizar datos y agregar timestamp 
  const limpias = ofertas
    .filter((d) => d.destino && d.origen)
    .map((d) => ({
      ...d,
      precioNum: Number(d.precio ?? d.price ?? Infinity),
      calidad: Number(d.calidad_oferta || 0),
      destinoUpper: (d.destino || '').trim().toUpperCase(),
      origenUpper: (d.origen || '').trim().toUpperCase(),
      esDirecto: d.tipo_vuelo === 'directo',
      // 🔥 Validación correcta de mercado
      esDelPaisActual: d.pais_mercado 
        ? String(d.pais_mercado).toUpperCase() === paisActual.toUpperCase() 
        : true,
      timestamp: new Date(d.created_at).getTime()
    }));

  const destinosVistos = new Set<string>();
  const hookDeals: any[] = [];

  // Separamos las ofertas que sí son del mercado actual
  const ofertasPais = limpias.filter(d => d.esDelPaisActual);

  // 2) ESTRATEGIA VIP: Frescura + Meritocracia (Máximo 72 horas)
  const limiteFrescura = Date.now() - (3 * 24 * 60 * 60 * 1000);

  // Filtramos la barrera de tiempo y ordenamos por FACTOR WOW interno
  const ofertasFrescas = [...ofertasPais].filter(d => d.timestamp >= limiteFrescura);
  
  ofertasFrescas.sort((a, b) => {
    // 1ro: La de mayor calidad gana
    if (a.calidad !== b.calidad) return b.calidad - a.calidad;
    // 2do: Si empatan en calidad, la más barata gana
    if (a.precioNum !== b.precioNum) return a.precioNum - b.precioNum;
    // 3ro: Si empatan en todo, la más reciente gana
    return b.timestamp - a.timestamp;
  });

  for (const d of ofertasFrescas) {
    if (hookDeals.length >= 3) break; 
    
    // Mantenemos la elegancia visual
    if (!destinosVistos.has(d.destinoUpper)) {
      hookDeals.push(d);
      destinosVistos.add(d.destinoUpper);
    }
  }

  // 3) EL FACTOR WOW HISTÓRICO: El resto compite por Calidad y Precio general
  const restoOfertas = limpias.filter(d => !destinosVistos.has(d.destinoUpper));

  restoOfertas.sort((a, b) => {
    if (a.esDelPaisActual !== b.esDelPaisActual) {
      return Number(b.esDelPaisActual) - Number(a.esDelPaisActual);
    }
    if (a.esDirecto !== b.esDirecto) {
      return Number(b.esDirecto) - Number(a.esDirecto);
    }
    if (a.calidad !== b.calidad) return b.calidad - a.calidad;
    if (a.precioNum !== b.precioNum) return a.precioNum - b.precioNum;
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
