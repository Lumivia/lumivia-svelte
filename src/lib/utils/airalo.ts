/**
 * Motor Dinámico de eSIMs (Airalo)
 * Configurado con ID de Partner y Cupón de Descuento.
 */

export type Esim = {
  nombre: string;
  precio: string;
  data: string;
  validez: string;
  url: string;
  imagen: string;
  cupon: string; // ✅ Campo obligatorio para destacar el DTO
};

// ✅ Tus credenciales recuperadas
const AIRALO_ID = '7136059'; 
const CUPON = 'LUMIVIA15';

/**
 * Genera el enlace dinámico y la metadata de la eSIM.
 */
export function obtenerEsims(destino: string): Esim[] {
  if (!destino) return [];

  const lugar = destino.trim().toUpperCase();
  
  // 🔗 Landing del país destino:
  // Usamos el parámetro 'q' que Airalo reconoce para hacer el matching 
  // automático con el país y aplicamos tu affiliate_id.
  const urlFinal = `https://www.airalo.com/es/search?q=${encodeURIComponent(lugar)}&affiliate_id=${AIRALO_ID}`;

  return [
    {
      nombre: `eSIM para ${lugar}`,
      precio: 'Desde $4.50 USD',
      data: 'Datos de alta velocidad',
      validez: 'Planes de 7 a 30 días',
      url: urlFinal,
      cupon: CUPON, // ✅ Inyectamos el cupón para el componente
      imagen: 'https://images.unsplash.com/photo-1520113412956-621360d2b7c4?auto=format&fit=crop&w=400&q=80'
    }
  ];
}
