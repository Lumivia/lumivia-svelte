type Nivel = 'info' | 'warn' | 'error';
type DatosEvento = Record<string, string | number | boolean | null | undefined>;

function escribir(nivel: Nivel, evento: string, datos: DatosEvento = {}) {
  const entrada = JSON.stringify({
    timestamp: new Date().toISOString(),
    nivel,
    evento,
    ...datos
  });

  if (nivel === 'error') console.error(entrada);
  else if (nivel === 'warn') console.warn(entrada);
  else console.info(entrada);
}

export function registrarEvento(evento: string, datos: DatosEvento = {}) {
  escribir('info', evento, datos);
}

export function registrarAdvertencia(evento: string, datos: DatosEvento = {}) {
  escribir('warn', evento, datos);
}

export function registrarError(evento: string, error: unknown, datos: DatosEvento = {}) {
  const mensaje = error instanceof Error
    ? error.message
    : typeof error === 'object' && error && 'message' in error
      ? String(error.message)
      : String(error);

  escribir('error', evento, {
    ...datos,
    error: mensaje
  });
}
