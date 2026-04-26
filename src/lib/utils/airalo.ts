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

// ✅ Traductor MASIVO de aeropuertos a las rutas exactas de Airalo
const rutasAiralo: Record<string, string> = {
  // NORTEAMÉRICA
  'MIA': 'united-states-esim', 'JFK': 'united-states-esim', 'LAX': 'united-states-esim', 
  'LAS': 'united-states-esim', 'MCO': 'united-states-esim', 'EWR': 'united-states-esim', 
  'SFO': 'united-states-esim', 'ORD': 'united-states-esim', 'DFW': 'united-states-esim', 
  'ATL': 'united-states-esim', 'BOS': 'united-states-esim', 'HNL': 'united-states-esim',
  'YYZ': 'canada-esim', 'YVR': 'canada-esim', 'YUL': 'canada-esim', 'YYC': 'canada-esim',
  'CUN': 'mexico-esim', 'MEX': 'mexico-esim', 'GDL': 'mexico-esim', 'MTY': 'mexico-esim', 
  'SJD': 'mexico-esim', 'PVR': 'mexico-esim', 'TIJ': 'mexico-esim', 'MID': 'mexico-esim',

  // LATAM Y CARIBE
  'BOG': 'colombia-esim', 'MDE': 'colombia-esim', 'CTG': 'colombia-esim', 'CLO': 'colombia-esim',
  'EZE': 'argentina-esim', 'AEP': 'argentina-esim', 'MDZ': 'argentina-esim', 'COR': 'argentina-esim',
  'SCL': 'chile-esim', 'CJC': 'chile-esim', 'PUQ': 'chile-esim',
  'GRU': 'brazil-esim', 'GIG': 'brazil-esim', 'BSB': 'brazil-esim', 'SSA': 'brazil-esim',
  'LIM': 'peru-esim', 'CUZ': 'peru-esim',
  'SJO': 'costa-rica-esim', 'LIR': 'costa-rica-esim',
  'PUJ': 'dominican-republic-esim', 'SDQ': 'dominican-republic-esim',
  'PTY': 'panama-esim', 'UIO': 'ecuador-esim', 'GYE': 'ecuador-esim',

  // EUROPA
  'MAD': 'spain-esim', 'BCN': 'spain-esim', 'PMI': 'spain-esim', 'AGP': 'spain-esim', 'ALC': 'spain-esim', 'SVQ': 'spain-esim',
  'CDG': 'france-esim', 'ORY': 'france-esim', 'NCE': 'france-esim', 'LYS': 'france-esim', 'MRS': 'france-esim',
  'LHR': 'united-kingdom-esim', 'LGW': 'united-kingdom-esim', 'STN': 'united-kingdom-esim', 'MAN': 'united-kingdom-esim', 'EDI': 'united-kingdom-esim',
  'FCO': 'italy-esim', 'MXP': 'italy-esim', 'VCE': 'italy-esim', 'NAP': 'italy-esim', 'BLQ': 'italy-esim',
  'FRA': 'germany-esim', 'MUC': 'germany-esim', 'BER': 'germany-esim', 'DUS': 'germany-esim', 'HAM': 'germany-esim',
  'AMS': 'netherlands-esim', 'EIN': 'netherlands-esim',
  'LIS': 'portugal-esim', 'OPO': 'portugal-esim', 'FAO': 'portugal-esim',
  'ZRH': 'switzerland-esim', 'GVA': 'switzerland-esim', 'BSL': 'switzerland-esim',
  'ATH': 'greece-esim', 'JTR': 'greece-esim', 'JMK': 'greece-esim', 'HER': 'greece-esim',
  'BRU': 'belgium-esim', 'VIE': 'austria-esim', 'CPH': 'denmark-esim', 'DUB': 'ireland-esim', 'PRG': 'czech-republic-esim',

  // ASIA Y OCEANÍA
  'NRT': 'japan-esim', 'HND': 'japan-esim', 'KIX': 'japan-esim', 'CTS': 'japan-esim', 'FUK': 'japan-esim',
  'ICN': 'south-korea-esim', 'GMP': 'south-korea-esim', 'CJU': 'south-korea-esim',
  'BKK': 'thailand-esim', 'DMK': 'thailand-esim', 'HKT': 'thailand-esim', 'CNX': 'thailand-esim',
  'DPS': 'indonesia-esim', 'CGK': 'indonesia-esim',
  'SGN': 'vietnam-esim', 'HAN': 'vietnam-esim', 'DAD': 'vietnam-esim',
  'PEK': 'china-esim', 'PVG': 'china-esim', 'CAN': 'china-esim',
  'SIN': 'singapore-esim', 'KUL': 'malaysia-esim',
  'SYD': 'australia-esim', 'MEL': 'australia-esim', 'BNE': 'australia-esim', 'PER': 'australia-esim',
  'AKL': 'new-zealand-esim', 'WLG': 'new-zealand-esim',

  // MEDIO ORIENTE Y ÁFRICA
  'DXB': 'united-arab-emirates-esim', 'AUH': 'united-arab-emirates-esim', 'SHJ': 'united-arab-emirates-esim',
  'IST': 'turkey-esim', 'SAW': 'turkey-esim', 'AYT': 'turkey-esim',
  'CAI': 'egypt-esim', 'HRG': 'egypt-esim', 'SSH': 'egypt-esim',
  'CMN': 'morocco-esim', 'RAK': 'morocco-esim',
  'JNB': 'south-africa-esim', 'CPT': 'south-africa-esim', 'DOH': 'qatar-esim', 'RUH': 'saudi-arabia-esim', 'JED': 'saudi-arabia-esim'
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
