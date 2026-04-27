/**
 * Motor Dinámico de Tours (Civitatis)
 * Genera enlaces directos basados en el destino y fechas del vuelo.
 */

export type Tour = {
  titulo: string;
  precio: string;
  duracion: string;
  url: string;
  imagen: string;
};

const AID = '112603'; // ✅ Tu ID de Afiliado Civitatis

// ✅ Diccionario de traducción: Ayuda a Civitatis a encontrar la ciudad exacta en lugar del código de aeropuerto
const nombresCiudades: Record<string, string> = {
  'CUN': 'Cancún', 'MEX': 'Ciudad de México', 'GDL': 'Guadalajara', 'MTY': 'Monterrey',
  'BOG': 'Bogotá', 'MDE': 'Medellín', 'CTG': 'Cartagena', 'CLO': 'Cali',
  'SCL': 'Santiago de Chile', 'EZE': 'Buenos Aires', 'LIM': 'Lima', 'GRU': 'São Paulo',
  'MAD': 'Madrid', 'BCN': 'Barcelona', 'CDG': 'París', 'LHR': 'Londres', 'FCO': 'Roma',
  'JFK': 'Nueva York', 'MIA': 'Miami', 'LAX': 'Los Ángeles', 'LAS': 'Las Vegas', 'ORD': 'Chicago',
  'NRT': 'Tokio', 'DXB': 'Dubai', 'SYD': 'Sídney', 'YYZ': 'Toronto'
};

/**
 * Genera automáticamente el card de búsqueda para Civitatis
 * con Ciudad + Fecha Salida + Fecha Regreso.
 */
export function obtenerTours(destino: string, salida: string, regreso: string): Tour[] {
  if (!destino) return [];

  const iata = destino.trim().toUpperCase();
  const ciudadQuery = nombresCiudades[iata] || iata;
  
  // ✅ FIX FECHAS: Extraemos solo la parte YYYY-MM-DD, cortando la "T" del ISO
  const ida = salida ? salida.split('T')[0] : '';
  const vuelta = regreso ? regreso.split('T')[0] : '';

  // ✅ URL Maestra estructurada. Usamos 'q=' y parámetros de fecha estándar (fromDate / toDate)
  const urlFinal = `https://www.civitatis.com/es/buscar/?q=${encodeURIComponent(ciudadQuery)}&fromDate=${ida}&toDate=${vuelta}&aid=${AID}`;

  return [
    {
      titulo: `Actividades en ${iata}`,
      precio: 'Mejor precio garantizado',
      duracion: 'Disponibilidad inmediata',
      url: urlFinal,
      // Dejamos la imagen vacía para que ExtrasOferta.svelte inyecte la imagen premium de Unsplash
      imagen: '' 
    }
  ];
}
