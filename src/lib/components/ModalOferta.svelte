<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { obtenerImagen } from '$lib/utils/imagenes';
  import { formatearFechaCorta } from '$lib/utils/fechas';
  import { obtenerEsims } from '$lib/utils/airalo';
  import { obtenerTours } from '$lib/utils/tours';
  import { obtenerHoteles } from '$lib/utils/hotel';
  import ExtrasOferta from '$lib/components/ExtrasOferta.svelte';
  import AmenidadesLinea from '$lib/components/AmenidadesLinea.svelte';

  // Runes: reemplazo de export let
  const { deal, abierto, cerrar } = $props();

  // Estado interno
  let imgFinal = '';
  let fechasCortas = '';
  let esims = [];
  let tours = [];
  let hoteles: any = null;

  // Cerrar con tecla ESC
  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape') cerrar();
  }

  onMount(() => {
    window.addEventListener('keydown', handleKey);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKey);
  });

  // Reactividad derivada del deal
  $: if (deal) {
    imgFinal = obtenerImagen(deal, 800);
    fechasCortas = `${formatearFechaCorta(deal.fecha_salida)} - ${formatearFechaCorta(deal.fecha_regreso)}`;
    esims = obtenerEsims(deal.destino);
    tours = obtenerTours(deal.destino);
    hoteles = obtenerHoteles(deal.destino, deal.fecha_salida, deal.fecha_regreso);
  }
</script>

{#if abierto && deal}
  <!-- Overlay -->
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] transition-opacity"
    on:click={() => cerrar()}
  ></div>

  <!-- Modal -->
  <div
    class="fixed inset-0 z-[1000] flex items-center justify-center p-4"
    aria-modal="true"
    role="dialog"
  >
    <div
      class="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative animate-fadeIn"
      on:click|stopPropagation
    >
      <!-- Botón cerrar -->
      <button
        class="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow hover:bg-gray-100 transition"
        on:click={cerrar}
      >
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      <!-- Imagen -->
      <div class="h-64 w-full overflow-hidden rounded-t-3xl">
        <img
          src={imgFinal}
          alt={deal.titulo_gancho}
          class="w-full h-full object-cover"
        />
      </div>

      <!-- Contenido -->
      <div class="p-6 space-y-6">

        <!-- Título -->
        <h2 class="text-2xl font-bold text-lumiDark leading-tight">
          {deal.titulo_gancho}
        </h2>

        <!-- Amenidades -->
        <AmenidadesLinea {deal} paisActual={deal.pais} />

        <!-- Fechas -->
        <div class="text-sm text-gray-500 font-medium flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          {fechasCortas}
        </div>

        <!-- Precio -->
        <div class="text-3xl font-black text-lumiDark">
          ${Number(deal.precio).toLocaleString('en-US')}
          <span class="text-sm text-gray-400 font-semibold">{deal.moneda}</span>
        </div>

        <!-- Extras (tours, hoteles, esims) -->
        <ExtrasOferta {esims} {tours} {hoteles} />

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
