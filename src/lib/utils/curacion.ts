export function curarOfertas(ofertas: any[], paisActual: string) {
  if (!ofertas || ofertas.length === 0) {
    return { hookDeals: [], radarDeals: [] };
  }

  const limpias = ofertas
    .filter((d) => d.destino && d.origen)
    .map((d) => ({
      ...d,
      precioNum: Number(d.precio ?? d.price ?? Infinity),
      calidad: Number(d.calidad_oferta || 0),
      destinoUpper: (d.destino || '').trim().toUpperCase(),
      origenUpper: (d.origen || '').trim().toUpperCase(),
      esDirecto: d.tipo_vuelo === 'directo',
      esEscapada: d.tipo_vuelo === 'escapada_finde',
      esDelPaisActual: d.pais_mercado 
        ? String(d.pais_mercado).toUpperCase() === paisActual.toUpperCase() 
        : true,
      timestamp: new Date(d.created_at).getTime()
    }));

  const destinosVistos = new Set<string>();
  const hookDeals: any[] = [];
  const radarDeals: any[] = [];
  let escapadasEnHero = 0; // 🔥 El contador clave

  const ofertasPais = limpias.filter(d => d.esDelPaisActual);

  const escapadasDisponibles = [...ofertasPais]
    .filter(d => d.esEscapada)
    .sort((a, b) => {
      if (a.calidad !== b.calidad) return b.calidad - a.calidad;
      if (a.precioNum !== b.precioNum) return a.precioNum - b.precioNum;
      return b.timestamp - a.timestamp;
    });

  // PASO 1: Metemos exactamente 1 escapada al Hero
  for (const d of escapadasDisponibles) {
    if (hookDeals.length < 1 && !destinosVistos.has(d.destinoUpper)) {
      hookDeals.push(d);
      destinosVistos.add(d.destinoUpper);
      escapadasEnHero++;
      break; 
    }
  }

  const limiteFrescura = Date.now() - (3 * 24 * 60 * 60 * 1000);
  const ofertasFrescas = [...ofertasPais].filter(d => d.timestamp >= limiteFrescura);
  
  ofertasFrescas.sort((a, b) => {
    if (a.calidad !== b.calidad) return b.calidad - a.calidad;
    if (a.precioNum !== b.precioNum) return a.precioNum - b.precioNum;
    return b.timestamp - a.timestamp;
  });

  // PASO 2: Rellenamos frescura, vigilando las escapadas
  for (const d of ofertasFrescas) {
    if (hookDeals.length >= 3) break; 
    if (!destinosVistos.has(d.destinoUpper)) {
      if (d.esEscapada && escapadasEnHero >= 1) continue; // Si ya hay escapada, nos la saltamos en el Hero
      hookDeals.push(d);
      destinosVistos.add(d.destinoUpper);
      if (d.esEscapada) escapadasEnHero++;
    }
  }

  // PASO 3: Llenamos el resto
  const restoOfertas = limpias.filter(d => !destinosVistos.has(d.destinoUpper));
  restoOfertas.sort((a, b) => {
    if (a.esDelPaisActual !== b.esDelPaisActual) return Number(b.esDelPaisActual) - Number(a.esDelPaisActual);
    if (a.esDirecto !== b.esDirecto) return Number(b.esDirecto) - Number(a.esDirecto);
    if (a.calidad !== b.calidad) return b.calidad - a.calidad;
    if (a.precioNum !== b.precioNum) return a.precioNum - b.precioNum;
    return b.timestamp - a.timestamp;
  });

  for (const d of restoOfertas) {
    if (!destinosVistos.has(d.destinoUpper)) {
      destinosVistos.add(d.destinoUpper);
      
      // 🔥 Lógica maestra: ¿Cabe en el Hero y no rompe la regla de la escapada?
      if (hookDeals.length < 8) {
        if (d.esEscapada && escapadasEnHero >= 1) {
          radarDeals.push(d); // No cabe en hero, pero SÍ se va al radar
        } else {
          hookDeals.push(d);
          if (d.esEscapada) escapadasEnHero++;
        }
      } else {
        radarDeals.push(d); // El Hero está lleno, todo al radar
      }
    }
  }

  return { hookDeals, radarDeals };
}
