/**
 * Paquetes de eSIM de Airalo por destino.
 * Estos datos son estáticos y seguros para SSR.
 */

type Esim = {
  nombre: string;
  precio: string;
  data: string;
  validez: string;
  url: string;
  imagen: string;
};

const paquetesPorPais: Record<string, Esim[]> = {
  // 🇪🇸 España
  'MAD': [
    {
      nombre: 'HolaFly España',
      precio: '€19',
      data: '5 GB',
      validez: '10 días',
      url: 'https://airalo.tp.st/xxxxx',
      imagen: 'https://images.airalo.com/esim/spain.png'
    },
    {
      nombre: 'Eurolink',
      precio: '€20',
      data: '3 GB',
      validez: '30 días',
      url: 'https://airalo.tp.st/yyyyy',
      imagen: 'https://images.airalo.com/esim/europe.png'
    }
  ],

  // 🇺🇸 Estados Unidos
  'MIA': [
    {
      nombre: 'USA eSIM',
      precio: '$4.50',
      data: '1 GB',
      validez: '7 días',
      url: 'https://airalo.tp.st/zzzzz',
      imagen: 'https://images.airalo.com/esim/usa.png'
    }
  ],

  // 🇯🇵 Japón
  'NRT': [
    {
      nombre: 'Sakura Mobile',
      precio: '$6',
      data: '1 GB',
      validez: '7 días',
      url: 'https://airalo.tp.st/japan1',
      imagen: 'https://images.airalo.com/esim/japan.png'
    }
  ]
};

// Paquetes globales (fallback)
const paquetesGlobales: Esim[] = [
  {
    nombre: 'Discover Global',
    precio: '$9',
    data: '1 GB',
    validez: '7 días',
    url: 'https://airalo.tp.st/global1',
    imagen: 'https://images.airalo.com/esim/global.png'
  },
  {
    nombre: 'Discover Global+',
    precio: '$16',
    data: '3 GB',
    validez: '30 días',
    url: 'https://airalo.tp.st/global2',
    imagen: 'https://images.airalo.com/esim/global.png'
  }
];

/**
 * Obtiene paquetes de eSIM según el destino.
 * Si no existe el destino, devuelve paquetes globales.
 */
export function obtenerEsims(destino: string): Esim[] {
  const key = destino.trim().toUpperCase();
  return paquetesPorPais[key] || paquetesGlobales;
}
