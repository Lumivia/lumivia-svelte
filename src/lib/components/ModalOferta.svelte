<script lang="ts">
  import { onMount } from 'svelte';
  import { obtenerImagen } from '$lib/utils/imagenes';
  import { formatearFechaCorta } from '$lib/utils/fechas';
  import { obtenerEsims } from '$lib/utils/airalo';
  import { obtenerTours } from '$lib/utils/tours';
  import { obtenerHoteles } from '$lib/utils/hotel';
  import { obtenerSeguro } from '$lib/utils/seguro'; 
  import ExtrasOferta from '$lib/components/ExtrasOferta.svelte';
  import AmenidadesLinea from '$lib/components/AmenidadesLinea.svelte';

  const { deal, abierto, cerrar } = $props();

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape') cerrar();
  }

  onMount(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  // Utilidad interna para convertir "YYYY-MM-DD" a "DDMM" (Formato Aviasales)
  function formatoAviasales(fechaIso: string) {
    if (!fechaIso) return '';
    const partes = fechaIso.split('T')[0].split('-'); // Asegurar que sea solo fecha
    if (partes.length !== 3) return '';
    const [, mes, dia] = partes;
    return `${dia}${mes}`;
  }

  // Reactividad Svelte 5
  const imgFinal = $derived(deal ? obtenerImagen(deal, 800) : '');
  const fechasCortas = $derived(deal ? `${formatearFechaCorta(deal.fecha_salida)} - ${formatearFechaCorta(deal.fecha_regreso)}` : '');
  const monedaDeal = $derived(deal ? (deal.moneda || 'MXN').toUpperCase() : 'MXN');
  
  // ✅ Constructor dinámico PERFECTO para vuelos.lumivia.app
  const linkVuelo = $derived(() => {
    if (!deal) return '#';
    // Si ya trae link y es el correcto, lo usamos
    if (deal.url?.includes('?flightSearch=')) return deal.url;
    if (deal.url_vuelo?.includes('?flightSearch=')) return deal.url_vuelo;

    const origen = (deal.origen || '').trim().toUpperCase();
    const destino = (deal.destino || '').trim().toUpperCase();
    const fechaIda = formatoAviasales(deal.fecha_salida);
    const fechaVuelta = formatoAviasales(deal.fecha_regreso);
    const pasajeros = '1'; // 1 adulto por defecto

    // Armamos la estructura: Ej. GDL0111MUC15111
    const searchParam = `${origen}${fechaIda}${destino}${fechaVuelta}${pasajeros}`;

    return `https://vuelos.lumivia.app/?flightSearch=${searchParam}`;
  });

  const esims = $derived(deal ? obtenerEsims(deal.destino) : []);
  const tours = $derived(deal ? obtenerTours(deal.destino, deal.fecha_salida, deal.fecha_regreso) : []);
  const hoteles = $derived(deal ? obtenerHoteles(deal.destino, deal.fecha_salida, deal.fecha_regreso, deal.url_hotel) : null);
  const seguro = $derived(deal ? obtenerSeguro(deal.destino) : null); 
</script>

{#if abierto && deal}
  <div class="fixed inset-0 bg-lumiDark/60 backdrop-blur-sm z-[999] transition-opacity" onclick={cerrar} role="button" tabindex="0" onkeydown={handleKey} aria-label="Cerrar modal"></div>

  <div class="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-none" aria-modal="true" role="dialog">
    <div class="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto relative animate-fadeIn pointer-events-auto border border-gray-100" onclick={(e) => e.stopPropagation()} role="document">
      
      <button class="absolute top-4 right-4 bg-white/50 backdrop-blur-md p-2 rounded-full shadow-sm hover:bg-white hover:shadow transition-all z-20" onclick={cerrar} aria-label="Cerrar modal">
        <svg class="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>

      <div class="h-56 w-full overflow-hidden relative">
        <img src={imgFinal} alt={deal.titulo_gancho} class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
      </div>

      <div class="px-6 pb-8 -mt-2 relative z-10 space-y-6">
        
        <div>
          <h2 class="text-2xl font-black text-lumiDark leading-tight tracking-tight mb-3">
            {deal.titulo_gancho}
          </h2>
          <div class="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500">
            <div class="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <svg class="w-3.5 h-3.5 text-lumiCyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {fechasCortas}
            </div>
            <AmenidadesLinea {deal} paisActual={deal.pais} />
          </div>
        </div>

        {#if deal.cuerpo_post || deal.descripcion}
          <div class="text-sm text-gray-600 leading-relaxed font-medium">
            {@html deal.cuerpo_post || deal.descripcion}
          </div>
        {/if}

        <div class="flex items-center justify-between border-y border-gray-100 py-5">
          <div>
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Precio final</p>
            <div class="text-3xl font-black text-lumiDark leading-none">
              ${Number(deal.precio ?? deal.price ?? 0).toLocaleString('en-US')}
              <span class="text-xs font-bold text-gray-400 uppercase">{monedaDeal}</span>
            </div>
          </div>

          <a href={linkVuelo()} target="_blank" rel="noopener noreferrer" class="bg-lumiCyan hover:bg-lumiCyanDark text-lumiDark font-black px-6 py-3.5 rounded-xl transition-all shadow-md text-sm uppercase tracking-wide">
            Ver Vuelo
          </a>
        </div>

        <div class="pt-2">
          <h3 class="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Mejora tu experiencia</h3>
          <ExtrasOferta {esims} {tours} {hoteles} {seguro} />
        </div>

      </div>
    </div>
  </div>
{/if}

<style>
  .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
  @keyframes fadeIn { from { opacity: 0; transform: scale(0.98) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
</style>
