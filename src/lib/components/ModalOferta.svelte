<script lang="ts">
  import { onMount } from 'svelte';
  import { obtenerImagen } from '$lib/utils/imagenes';
  import { formatearFechaCorta } from '$lib/utils/fechas';
  import { obtenerEsims } from '$lib/utils/airalo';
  import { obtenerTours } from '$lib/utils/tours';
  import { obtenerHoteles } from '$lib/utils/hotel';
  import ExtrasOferta from '$lib/components/ExtrasOferta.svelte';
  import AmenidadesLinea from '$lib/components/AmenidadesLinea.svelte';

  // Runes: props
  const { deal, abierto, cerrar } = $props();

  // Cerrar con tecla ESC (Seguro para SSR, sin onDestroy)
  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape') cerrar();
  }

  onMount(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  // 🔥 SVELTE 5 PURO: Usamos $derived en lugar de $effect para evitar datos en blanco
  const imgFinal = $derived(deal ? obtenerImagen(deal, 800) : '');
  
  const fechasCortas = $derived(deal ? 
    `${formatearFechaCorta(deal.fecha_salida)} - ${formatearFechaCorta(deal.fecha_regreso)}` 
  : '');

  const monedaDeal = $derived(deal ? (deal.moneda || 'MXN').toUpperCase() : 'MXN');

  // Estos llaman a tus utilitarios (si están rotos, es culpa de los utilitarios)
  const esims = $derived(deal ? obtenerEsims(deal.destino) : []);
  const tours = $derived(deal ? obtenerTours(deal.destino) : []);
  const hoteles = $derived(deal ? obtenerHoteles(deal.destino, deal.fecha_salida, deal.fecha_regreso) : null);
</script>

{#if abierto && deal}
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] transition-opacity"
    onclick={cerrar}
    aria-label="Cerrar modal"
    role="button"
    tabindex="0"
    onkeydown={handleKey}
  ></div>

  <div
    class="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-none"
    aria-modal="true"
    role="dialog"
  >
    <div
      class="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative animate-fadeIn pointer-events-auto"
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      <button
        class="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow hover:bg-gray-100 transition z-10"
        onclick={cerrar}
        aria-label="Cerrar modal"
      >
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      <div class="h-64 w-full overflow-hidden rounded-t-3xl relative">
        <img
          src={imgFinal}
          alt={deal.titulo_gancho}
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      <div class="p-6 md:p-8 space-y-6">

        <h2 class="text-3xl font-black text-lumiDark leading-tight">
          {deal.titulo_gancho}
        </h2>

        {#if deal.cuerpo_post || deal.descripcion}
          <div class="text-gray-600 text-base leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-2xl border border-gray-100">
            {@html deal.cuerpo_post || deal.descripcion}
          </div>
        {/if}

        <AmenidadesLinea {deal} paisActual={deal.pais} />

        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-y border-gray-100 py-4 gap-4">
          <div class="text-sm text-gray-500 font-medium flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
            <svg class="w-4 h-4 text-lumiCyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            {fechasCortas}
          </div>

          <div class="text-4xl font-black text-lumiDark">
            ${Number(deal.precio ?? deal.price ?? 0).toLocaleString('en-US')}
            <span class="text-sm text-gray-400 font-semibold">{monedaDeal}</span>
          </div>
        </div>

        {#if deal.url || deal.url_vuelo}
          <a
            href={deal.url || deal.url_vuelo}
            target="_blank"
            rel="noopener noreferrer"
            class="block w-full text-center bg-lumiCyan hover:bg-lumiCyanDark text-lumiDark font-black py-4 rounded-xl transition-all active:scale-95 shadow-[0_4px_20px_rgba(0,210,255,0.3)] text-lg tracking-wide uppercase"
          >
            Ir a la Oferta Original ✈️
          </a>
        {:else}
          <div class="w-full text-center bg-gray-100 text-gray-400 font-bold py-4 rounded-xl">
            Enlace no disponible
          </div>
        {/if}

        <div class="pt-4">
          <h3 class="text-lg font-bold text-lumiDark mb-4">Mejora tu experiencia</h3>
          <ExtrasOferta esims={esims} tours={tours} hoteles={hoteles} dealDestino={deal.destino} dealSalida={deal.fecha_salida} dealRegreso={deal.fecha_regreso} />
        </div>

      </div>
    </div>
  </div>
{/if}

<style>
  .animate-fadeIn {
    animation: fadeIn 0.25s ease-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
