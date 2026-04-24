/**
 * Generador de enlaces Stay22 para hoteles.
 * Seguro para SSR, sin dependencias externas.
 */

type HotelLink = {
  url: string;
  titulo: string;
  descripcion: string;
};

/**
 * Construye un enlace de Stay22 basado en destino y fechas.
 * Si faltan datos, usa fallback seguro.
 */
export function obtenerHoteles(
  destino: string,
  fechaSalida?: string,
  fechaRegreso?: string
): HotelLink {
  const destinoClean = destino?.trim() || 'Destino';
  const checkin = fechaSalida || '';
  const checkout = fechaRegreso || '';

  // Afiliado Lumivia
  const AID = 'lumivia';

  // Base Stay22
  const base = 'https://www.stay22.com/allez';

  // Construcción del enlace
  const params = new URLSearchParams({
    aid: AID,
    lat: '',
    lng: '',
    address: destinoClean,
    checkin,
    checkout
  });

  const url = `${base}/map?${params.toString()}`;

  return {
    url,
    titulo: `Hoteles en ${destinoClean}`,
    descripcion: `Encuentra hospedaje cerca de ${destinoClean} con Stay22.`
  };
}
