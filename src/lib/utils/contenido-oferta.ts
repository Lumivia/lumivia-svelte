export type SugerenciaOferta = {
  tipo: 'Hospedaje sugerido' | 'Actividad sugerida';
  detalle: string;
};

export type ContenidoOfertaSeparado = {
  descripcion: string;
  sugerencias: SugerenciaOferta[];
};

const LINEA_SUGERENCIA = /^\s*[—–-]?\s*(Hospedaje|Hotel|Actividad|Experiencia|Tour)\s*:\s*(.+?)\s*$/i;

export function separarContenidoOferta(valor: unknown): ContenidoOfertaSeparado {
  const original = String(valor ?? '');
  const contenidoUtil = original.split(/👉|👇|✨|Comenta la palabra/i)[0];
  const sugerencias: SugerenciaOferta[] = [];
  const lineasDescripcion: string[] = [];

  for (const linea of contenidoUtil.split(/\r?\n/)) {
    const coincidencia = linea.match(LINEA_SUGERENCIA);
    if (!coincidencia) {
      lineasDescripcion.push(linea);
      continue;
    }

    const categoria = coincidencia[1].toLowerCase();
    sugerencias.push({
      tipo: categoria === 'hospedaje' || categoria === 'hotel' ? 'Hospedaje sugerido' : 'Actividad sugerida',
      detalle: coincidencia[2].trim()
    });
  }

  const descripcion = lineasDescripcion
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .replace(/[\(\[\{\-\:\s]+$/, '');

  return { descripcion, sugerencias };
}
