import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
  const { mercado, schemaJSON } = data;

  return {
    ...data,

    // SEO dinámico
    title: `Vuelos Baratos desde ${mercado.nombre} | Lumivia`,
    description: `Encuentra las mejores ofertas de vuelos y viajes desde ${mercado.nombre}. Lumivia rastrea tarifas ocultas diariamente para que viajes más pagando menos.`,
    robots: 'index, follow',

    // Pasamos el schema al layout
    schemaAEO: schemaJSON
  };
};
