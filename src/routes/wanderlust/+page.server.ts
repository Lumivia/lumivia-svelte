import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const PAISES = new Set(['mx', 'co', 'cl', 'cr']);

export const load: PageServerLoad = ({ url }) => {
  const paisSolicitado = url.searchParams.get('pais')?.toLowerCase() ?? 'mx';
  const pais = PAISES.has(paisSolicitado) ? paisSolicitado : 'mx';

  throw redirect(307, `/paises/${pais}`);
};
