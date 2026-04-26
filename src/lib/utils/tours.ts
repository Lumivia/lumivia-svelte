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

/**
 * Genera automáticamente el card de búsqueda para Civitatis
 * con Ciudad + Fecha Salida + Fecha Regreso.
 */
export function obtenerTours(destino: string, salida: string, regreso: string): Tour[] {
  if (!destino) return [];

  const ciudad = destino.trim().toUpperCase();
  
  // ✅ Construcción de la URL Maestra con Deep Linking de fechas
  // Parámetros: query (ciudad), fechadesde (salida), fechahasta (regreso)
  const urlFinal = `https://www.civitatis.com/es/buscar/?query=${ciudad}&fechadesde=${salida}&fechahasta=${regreso}&aid=${AID}`;

  return [
    {
      titulo: `Actividades y tours en ${ciudad}`,
      precio: 'Mejor precio garantizado',
      duracion: 'Disponibilidad inmediata',
      url: urlFinal,
      // Usamos una imagen genérica de alta calidad de viajes para el card de búsqueda
      imagen: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=400&q=80'
    }
  ];
}
