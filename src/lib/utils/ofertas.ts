type Oferta = Record<string, any>;

function normalizarFecha(valor: unknown): string | null {
  if (!valor) return null;

  const texto = String(valor).trim();
  const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const local = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (local) return `${local[3]}-${local[2]}-${local[1]}`;

  return null;
}

export function fechaDeHoy(): string {
  return new Date().toISOString().slice(0, 10);
}

export function esOfertaVigente(oferta: Oferta, hoy = fechaDeHoy()): boolean {
  if (!oferta || oferta.expirada_manualmente === true) return false;

  const salida = normalizarFecha(oferta.fecha_salida);
  return salida !== null && salida >= hoy;
}

export function deduplicarOfertas(ofertas: Oferta[]): Oferta[] {
  const mejores = new Map<string, Oferta>();

  for (const oferta of ofertas) {
    const clave = [
      oferta.origen_nombre || oferta.origen,
      oferta.destino_nombre || oferta.destino,
      normalizarFecha(oferta.fecha_salida),
      normalizarFecha(oferta.fecha_regreso),
      Number(oferta.precio ?? oferta.price ?? 0)
    ].map((valor) => String(valor ?? '').trim().toUpperCase()).join('|');

    const existente = mejores.get(clave);
    if (!existente) {
      mejores.set(clave, oferta);
      continue;
    }

    const calidadActual = Number(oferta.calidad_oferta ?? 0);
    const calidadExistente = Number(existente.calidad_oferta ?? 0);
    const fechaActual = new Date(oferta.created_at ?? 0).getTime();
    const fechaExistente = new Date(existente.created_at ?? 0).getTime();

    if (calidadActual > calidadExistente || (calidadActual === calidadExistente && fechaActual > fechaExistente)) {
      mejores.set(clave, oferta);
    }
  }

  return [...mejores.values()];
}

export function filtrarOfertasPublicables(ofertas: Oferta[], hoy = fechaDeHoy()): Oferta[] {
  return deduplicarOfertas((ofertas || []).filter((oferta) => esOfertaVigente(oferta, hoy)));
}

export function tituloOferta(oferta: Oferta): string {
  const titulo = String(oferta?.titulo_gancho ?? '').trim();
  const generico = /^(oferta|vuelo)\s+(especial|imperdible)$/i.test(titulo);
  if (titulo && !generico) return titulo;

  const origen = String(oferta?.origen_nombre || oferta?.origen || '').trim();
  const destino = String(oferta?.destino_nombre || oferta?.destino || '').trim();
  if (origen && destino) return `${origen} → ${destino}`;
  if (destino) return `Vuelo a ${destino}`;
  return 'Vuelo disponible';
}
