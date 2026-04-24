/**
 * Tours y actividades recomendadas por destino.
 * Datos estáticos, seguros para SSR y fáciles de extender.
 */

type Tour = {
  titulo: string;
  precio: string;
  duracion: string;
  url: string;
  imagen: string;
};

const toursPorDestino: Record<string, Tour[]> = {
  // 🇪🇸 Madrid
  'MAD': [
    {
      titulo: 'Tour al Palacio Real',
      precio: '€28',
      duracion: '1.5 horas',
      url: 'https://getyourguide.tp.st/madrid1',
      imagen: 'https://cdn.getyourguide.com/img/tour/5c1b1f9c9f.jpeg'
    },
    {
      titulo: 'Museo del Prado – Entrada rápida',
      precio: '€22',
      duracion: 'Flexible',
      url: 'https://getyourguide.tp.st/madrid2',
      imagen: 'https://cdn.getyourguide.com/img/tour/5c1b1f9c9e.jpeg'
    },
    {
      titulo: 'Free Tour por el Centro Histórico',
      precio: 'Gratis',
      duracion: '2 horas',
      url: 'https://getyourguide.tp.st/madrid3',
      imagen: 'https://cdn.getyourguide.com/img/tour/5c1b1f9c9d.jpeg'
    }
  ],

  // 🇺🇸 Miami
  'MIA': [
    {
      titulo: 'Paseo en lancha rápida por la Bahía',
      precio: '$29',
      duracion: '45 minutos',
      url: 'https://getyourguide.tp.st/miami1',
      imagen: 'https://cdn.getyourguide.com/img/tour/miami1.jpeg'
    },
    {
      titulo: 'Tour Everglades + Paseo en Airboat',
      precio: '$39',
      duracion: '3 horas',
      url: 'https://getyourguide.tp.st/miami2',
      imagen: 'https://cdn.getyourguide.com/img/tour/miami2.jpeg'
    }
  ],

  // 🇯🇵 Tokio
  'NRT': [
    {
      titulo: 'Tour de comida callejera en Shibuya',
      precio: '¥6,000',
      duracion: '3 horas',
      url: 'https://getyourguide.tp.st/tokyo1',
      imagen: 'https://cdn.getyourguide.com/img/tour/tokyo1.jpeg'
    },
    {
      titulo: 'Templo Senso-ji + Asakusa',
      precio: '¥4,500',
      duracion: '2 horas',
      url: 'https://getyourguide.tp.st/tokyo2',
      imagen: 'https://cdn.getyourguide.com/img/tour/tokyo2.jpeg'
    }
  ]
};

// Fallback global
const toursGlobales: Tour[] = [
  {
    titulo: 'Free Tour por la ciudad',
    precio: 'Gratis',
    duracion: '2 horas',
    url: 'https://getyourguide.tp.st/global1',
    imagen: 'https://cdn.getyourguide.com/img/tour/global1.jpeg'
  },
  {
    titulo: 'Paseo panorámico en autobús turístico',
    precio: '$25',
    duracion: '1 día',
    url: 'https://getyourguide.tp.st/global2',
    imagen: 'https://cdn.getyourguide.com/img/tour/global2.jpeg'
  }
];

/**
 * Obtiene tours recomendados según el destino.
 * Si no existe el destino, devuelve tours globales.
 */
export function obtenerTours(destino: string): Tour[] {
  const key = destino.trim().toUpperCase();
  return toursPorDestino[key] || toursGlobales;
}
