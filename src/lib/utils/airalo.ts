/**
 * Motor Dinámico de eSIMs (Airalo)
 * Traductor inteligente de código IATA a URL de país para evitar 404s.
 */

export type Esim = {
  nombre: string;
  url: string;
  imagen: string;
  cupon: string;
};

const AIRALO_ID = '7136059'; 
const CUPON = 'LUMIVIA15';

// ✅ Traductor de aeropuertos a las rutas exactas de Airalo
const rutasAiralo: Record<string, string> = {
  'MAD': 'spain-esim', 'BCN': 'spain-esim',
  'MIA': 'united-states-esim', 'JFK': 'united-states-esim', 'LAX': 'united-states-esim', 'LAS': 'united-states-esim',
  'CDG': 'france-esim',
  'NRT': 'japan-esim', 'HND': 'japan-esim',
  'FCO': 'italy-esim',
  'LHR': 'united-kingdom-esim',
  'CUN': 'mexico-esim', 'MEX': 'mexico-esim',
  'BOG': 'colombia-esim',
  'EZE': 'argentina-esim'
};

export function obtenerEsims(destino: string): Esim[] {
  const iata = (destino || '').trim().toUpperCase();
  
  // Si conocemos el país del aeropuerto, lo mandamos directo. Si no, lo mandamos al Home en Español.
  const slug = rutasAiralo[iata];
  const urlFinal = slug 
    ? `https://www.airalo.com/es/${slug}?affiliate_id=${AIRALO_ID}` 
    : `https://www.airalo.com/es/?affiliate_id=${AIRALO_ID}`;

  return [{
    nombre: slug ? 'eSIM para tu viaje' : 'eSIM Global',
    url: urlFinal,
    cupon: CUPON,
    // ✅ Imagen Premium de un chip/conectividad garantizada
    imagen: 'https://images.unsplash.com/photo-1614064641913-6d66af761c9b?auto=format&fit=crop&w=150&q=80'
  }];
}
