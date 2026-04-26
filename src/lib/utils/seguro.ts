/**
 * Motor de Seguros Médicos (Ekta)
 * Genera enlaces dinámicos con Marker de afiliado.
 */

export type Seguro = {
  titulo: string;
  descripcion: string;
  url: string;
};

// ✅ Tu Marker de Afiliado para Ekta
const MARKER = '708095';

/**
 * Genera la información del seguro personalizada por destino.
 * @param destino Código IATA del destino (ej. MAD, CUN)
 */
export function obtenerSeguro(destino: string): Seguro {
  const lugar = destino?.trim().toUpperCase() || 'tu destino';

  // Enlace directo con tu marcador de afiliado
  const urlFinal = `https://ekta.travel/?marker=${MARKER}`;

  return {
    titulo: `Seguro Médico para ${lugar}`,
    descripcion: 'Protección total ante imprevistos, pérdida de equipaje y emergencias médicas durante tu viaje.',
    url: urlFinal
  };
}
