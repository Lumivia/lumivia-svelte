/**
 * Generador de enlaces de hospedaje (Stay22).
 * Prioriza el enlace directo del deal o genera uno dinámico.
 */

type HotelLink = {
  url: string;
  titulo: string;
  descripcion: string;
};

/**
 * Obtiene el enlace de hoteles.
 * @param destino Código de aeropuerto o ciudad.
 * @param fechaSalida Fecha de inicio del viaje.
 * @param fechaRegreso Fecha de fin del viaje.
 * @param urlDirecta El campo 'url_hotel' proveniente de la base de datos.
 */
export function obtenerHoteles(
  destino: string,
  fechaSalida?: string,
  fechaRegreso?: string,
  urlDirecta?: string
): HotelLink {
  const AID = 'lumivia'; // ✅ Tu ID de Stay22
  const destinoClean = destino?.trim() || 'tu destino';

  // 1. Si existe URL directa en el deal, la usamos (Prioridad 1)
  if (urlDirecta && urlDirecta.startsWith('http')) {
    return {
      url: urlDirecta,
      titulo: `Hospedaje seleccionado en ${destinoClean}`,
      descripcion: `Reserva el hotel recomendado para tu viaje a ${destinoClean}.`
    };
  }

  // 2. Si no hay URL directa, construimos el mapa dinámico de Stay22 (Prioridad 2)
  const base = 'https://www.stay22.com/allez/map';
  const params = new URLSearchParams({
    aid: AID,
    address: destinoClean,
    checkin: fechaSalida || '',
    checkout: fechaRegreso || ''
  });

  return {
    url: `${base}?${params.toString()}`,
    titulo: `Explorar hoteles en ${destinoClean}`,
    descripcion: `Compara las mejores opciones de hospedaje para tus fechas en ${destinoClean}.`
  };
}
