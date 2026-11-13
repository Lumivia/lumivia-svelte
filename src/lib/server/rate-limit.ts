type Ventana = { cantidad: number; reinicio: number };
const ventanas = new Map<string, Ventana>();

export type ResultadoLimite = {
  permitido: boolean;
  limite: number;
  restante: number;
  reinicio: number;
};

export function obtenerClaveCliente(request: Request, getClientAddress?: () => string): string {
  const ipCloudflare = request.headers.get('cf-connecting-ip');
  const ipProxy = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

  if (ipCloudflare) return ipCloudflare;
  if (ipProxy) return ipProxy;

  try {
    return getClientAddress?.() || 'cliente-desconocido';
  } catch {
    return 'cliente-desconocido';
  }
}

export function limitarSolicitud(clave: string, limite = 5, ventanaMs = 10 * 60 * 1000): ResultadoLimite {
  const ahora = Date.now();
  const actual = ventanas.get(clave);

  if (!actual || actual.reinicio <= ahora) {
    const reinicio = ahora + ventanaMs;
    ventanas.set(clave, { cantidad: 1, reinicio });
    return { permitido: true, limite, restante: limite - 1, reinicio };
  }

  actual.cantidad += 1;

  if (ventanas.size > 1000) {
    for (const [llave, ventana] of ventanas) {
      if (ventana.reinicio <= ahora) ventanas.delete(llave);
    }
  }

  return {
    permitido: actual.cantidad <= limite,
    limite,
    restante: Math.max(0, limite - actual.cantidad),
    reinicio: actual.reinicio
  };
}

export function headersLimite(resultado: ResultadoLimite): Record<string, string> {
  return {
    'RateLimit-Limit': String(resultado.limite),
    'RateLimit-Remaining': String(resultado.restante),
    'RateLimit-Reset': String(Math.ceil(resultado.reinicio / 1000))
  };
}
