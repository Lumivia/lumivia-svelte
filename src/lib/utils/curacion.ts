export function curarOfertas(ofertas: any[], paisActual: string) {
  if (!ofertas || ofertas.length === 0) {
    return { hookDeals: [], escapadasDeals: [], radarDeals: [] };
  }

  // 1) Normalizar datos y agregar flag de Escapada
  const limpias = ofertas
    .filter((d) => d.destino && d.origen)
    .map((d) => ({
      ...d,
      precioNum: Number(d.precio ?? d.price ?? Infinity),
      calidad: Number(d.calidad_oferta || 0),
      destinoUpper: (d.destino || '').trim().toUpperCase(),
      origenUpper: (d.origen || '').trim().toUpperCase(),
      esDirecto: d.tipo_vuelo === 'directo',
      esEscapada: d.tipo_vuelo === 'escapada_finde', // NUEVO FLAG
      esDelPaisActual: d.pais_mercado 
        ? String(d.pais_mercado).toUpperCase() === paisActual.toUpperCase() 
        : true,
      timestamp: new Date(d.created_at).getTime()
    }));

  const destinosVistos = new Set<string>();
  const hookDeals: any[] = [];
  const escapadasDeals: any[] = [];
  const radarDeals: any[] = [];

  const ofertasPais = limpias.filter(d => d.esDelPaisActual);

  // --- NUEVO ORDEN DE EXTRACCIÓN ---

  // Pre-ordenamos TODAS las ofertas para evaluar las escapadas (Factor WOW)
  const escapadasDisponibles = [...ofertasPais]
    .filter(d => d.esEscapada)
    .sort((a, b) => {
      if (a.calidad !== b.calidad) return b.calidad - a.calidad;
      if (a.precioNum !== b.precioNum) return a.precioNum - b.precioNum;
      return b.timestamp - a.timestamp;
    });

  // PASO 1: El Tributo del Hero (1 Escapada obligatoria a Destacadas)
  for (const d of escapadasDisponibles) {
    if (hookDeals.length < 1 && !destinosVistos.has(d.destinoUpper)) {
      hookDeals.push(d);
      destinosVistos.add(d.destinoUpper);
      break; 
    }
  }

  // PASO 2: El Carrusel de Escapadas (Las siguientes 6 mejores)
  for (const d of escapadasDisponibles) {
    if (escapadasDeals.length < 6 && !destinosVistos.has(d.destinoUpper)) {
      escapadasDeals.push(d);
      destinosVistos.add(d.destinoUpper);
    }
  }

  // PASO 3: Estrategia VIP Original (Frescura + Meritocracia para rellenar el Hero)
  const limiteFrescura = Date.now() - (3 * 24 * 60 * 60 * 1000);
  const ofertasFrescas = [...ofertasPais].filter(d => d.timestamp >= limiteFrescura);
  
  ofertasFrescas.sort((a, b) => {
    if (a.calidad !== b.calidad) return b.calidad - a.calidad;
    if (a.precioNum !== b.precioNum) return a.precioNum - b.precioNum;
    return b.timestamp - a.timestamp;
  });

  for (const d of ofertasFrescas) {
    if (hookDeals.length >= 3) break; 
    if (!destinosVistos.has(d.destinoUpper)) {
      hookDeals.push(d);
      destinosVistos.add(d.destinoUpper);
    }
  }

  // PASO 4: El Factor WOW Histórico (Llenamos el resto del Hero hasta 10 y el radar)
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

  return { hookDeals, escapadasDeals, radarDeals };
}
