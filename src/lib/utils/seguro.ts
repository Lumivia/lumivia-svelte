/**
 * Motor Dinámico de Seguros de Viaje (Ekta)
 * Genera enlaces seguros con Marker de afiliado para SSR.
 */

export type Seguro = {
  titulo: string;
  descripcion: string;
  url: string;
};

// ✅ Tu Marker de Afiliado (Travelpayouts / Ekta)
const MARKER = '708095';

/**
 * Obtiene la tarjeta de seguro recomendada según el destino.
 */
export function obtenerSeguro(destino: string): Seguro {
  const lugar = destino?.trim().toUpperCase() || 'tu destino';

  // 🔗 Enlace de Afiliado Ekta
  // Usamos el formato estándar de redirección con tu Marker.
  // Si en el portal te dieron un link corto tipo "https://ekta.tp.st/...", 
  // puedes reemplazar esta URL y solo agregarle "?marker=708095" al final.
  const urlFinal = `https://ekta.travel/?marker=${MARKER}`;

  return {
    titulo: `Seguro Médico para ${lugar}`,
    descripcion: 'Cobertura global ante imprevistos, pérdida de equipaje y emergencias médicas.',
    url: urlFinal
  };
}
