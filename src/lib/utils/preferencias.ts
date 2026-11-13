const PAISES_SOPORTADOS = ['MX', 'CO', 'CL', 'CR'] as const;

export type PaisSoportado = (typeof PAISES_SOPORTADOS)[number];

export function normalizarPais(valor: unknown, fallback: PaisSoportado = 'MX'): PaisSoportado {
  const pais = String(valor ?? '').trim().toUpperCase();
  return PAISES_SOPORTADOS.includes(pais as PaisSoportado) ? (pais as PaisSoportado) : fallback;
}

export function leerPaisGuardado(): PaisSoportado;
export function leerPaisGuardado(fallback: null): PaisSoportado | null;
export function leerPaisGuardado(fallback: PaisSoportado): PaisSoportado;
export function leerPaisGuardado(fallback: PaisSoportado | null = 'MX'): PaisSoportado | null {
  if (typeof window === 'undefined') return fallback;

  try {
    const pais = String(window.localStorage.getItem('lumivia_pais') ?? '').trim().toUpperCase();
    return PAISES_SOPORTADOS.includes(pais as PaisSoportado) ? (pais as PaisSoportado) : fallback;
  } catch {
    return fallback;
  }
}

export function guardarPais(pais: unknown): PaisSoportado {
  const paisNormalizado = normalizarPais(pais);

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem('lumivia_pais', paisNormalizado);
    } catch {
      // La navegación sigue funcionando si el navegador bloquea el almacenamiento.
    }
  }

  return paisNormalizado;
}
