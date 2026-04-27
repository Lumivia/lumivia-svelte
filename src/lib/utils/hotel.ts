/**
 * Motor Dinámico de Hoteles (Stay22 / Booking)
 * Lógica a prueba de balas para garantizar siempre un enlace válido.
 */

export type Hotel = {
  url: string;
};

const STAY22_AID = 'lumivia'; // ✅ Tu Affiliate ID de Stay22

/**
 * Obtiene el enlace de hotel priorizando la base de datos.
 * Si falla, genera un Deep Link inteligente a Stay22.
 */
export function obtenerHoteles(destino: string, salida: string, regreso: string, url_hotel?: string): Hotel | null {
  
  // 1. Verificación a prueba de balas de la URL de la base de datos
  if (url_hotel && typeof url_hotel === 'string' && url_hotel.trim() !== '') {
    // Verificamos que al menos parezca un enlace real
    if (url_hotel.startsWith('http://') || url_hotel.startsWith('https://')) {
      return { url: url_hotel.trim() };
    }
  }

  // 2. Si no hay URL válida y no hay destino, abortamos (no mostramos tarjeta)
  if (!destino) return null;

  // 3. Motor de Respaldo: Deep Link de Stay22
  const ciudad = destino.trim().toUpperCase();
  
  // Limpiamos las fechas para asegurar formato YYYY-MM-DD
  const ida = salida ? salida.split('T')[0] : '';
  const vuelta = regreso ? regreso.split('T')[0] : '';

  // Construimos la URL de Stay22 con el mapa interactivo
  const urlFinal = `https://www.stay22.com/allez/roam?aid=${STAY22_AID}&address=${encodeURIComponent(ciudad)}&checkin=${ida}&checkout=${vuelta}`;

  return { url: urlFinal };
}
