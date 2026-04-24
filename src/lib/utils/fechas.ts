// Formatea una fecha YYYY-MM-DD a "12 Ene"
export function formatearFechaCorta(fechaCadena: string): string {
  if (!fechaCadena) return '';
  if (!fechaCadena.includes('-')) return fechaCadena;

  const partes = fechaCadena.split('-');
  if (partes.length !== 3) return fechaCadena;

  const año = parseInt(partes[0]);
  const mes = parseInt(partes[1]) - 1;
  const dia = parseInt(partes[2]);

  const fechaObj = new Date(año, mes, dia);
  const opciones = { day: 'numeric', month: 'short' } as const;

  let formateada = fechaObj.toLocaleDateString('es-ES', opciones);
  return formateada.replace('.', '');
}

// Corrige el año según si el mes ya pasó
export function corregirAño(fechaCadena: string): string {
  if (!fechaCadena || !fechaCadena.includes('-')) return fechaCadena;

  let [y, m, d] = fechaCadena.split('-');
  const hoy = new Date();
  const mesActual = hoy.getMonth() + 1;
  const añoActual = hoy.getFullYear();

  if (parseInt(m) < mesActual) {
    y = (añoActual + 1).toString();
  } else {
    y = añoActual.toString();
  }

  return `${y}-${m}-${d}`;
}

// Calcula "hace 2h", "hace 3 días", etc.
export function calcularTiempoTranscurrido(fechaISO: string): string {
  const fecha = new Date(fechaISO);
  const ahora = new Date();
  const diffMs = ahora.getTime() - fecha.getTime();

  const minutos = Math.floor(diffMs / 60000);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);

  if (minutos < 60) return `${minutos}m`;
  if (horas < 24) return `${horas}h`;
  return `${dias}d`;
}
