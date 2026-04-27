<script lang="ts">
  import { formatearFechaCorta } from '$lib/utils/fechas';
  import { obtenerImagen } from '$lib/utils/imagenes';
  import { copiarUrlUnica } from '$lib/utils/clipboard';

  // 🔥 SVELTE 5: Recibimos la función onclick directamente como prop
  const { deal, monedaActual, onclick } = $props();

  // Reactividad derivada (Runes)
  const imgFinal = $derived(obtenerImagen(deal, 150));

  const fechasCortas = $derived(
    `${formatearFechaCorta(deal.fecha_salida)} - ${formatearFechaCorta(deal.fecha_regreso)}`
  );

  const precio = $derived(
    Number(deal.precio ?? deal.price ?? 0).toLocaleString('en-US')
  );

  const monedaDeal = $derived(
    (deal.moneda || deal.currency || monedaActual).toUpperCase()
  );

  const esHot = $derived(deal.calidad_oferta >= 9);

  // Función aislada para evitar que el clic se propague y abra el modal
  async function handleCopiar(e: Event) {
    e.stopPropagation();
    await copiarUrlUnica(deal.id);
  }
</script>

<li class="list-none">
  <div
    role="button"
    tabindex="0"
    onclick={onclick}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onclick(e); } }}
    class="w-full p-3 sm:px-6 sm:py-4 hover:bg-gray-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left cursor-pointer rounded-xl"
    aria-label={`Ver oferta de ${deal.origen} a ${deal.destino}`}
  >

    <div class="flex items-center gap-4">
      <img
        src={imgFinal}
        loading="lazy"
        class="h-12 w-12 rounded-lg object-cover shadow-sm border border-gray-200 hidden sm:block"
        alt={deal.titulo_gancho}
      />

      <div>
        <h4 class="font-bold text-lumiDark text-base flex items-center flex-wrap gap-1">
          {deal.titulo_gancho || 'Destino Sorpresa'}
          {#if esHot}
            <span class="text-red-500 font-bold ml-1" title="Alta Demanda">🔥</span>
          {/if}
        </h4>

        <div class="flex flex-wrap items-center text-xs text-gray-500 mt-1 font-medium gap-2">
          <div class="flex items-center">
            {#if deal.origen}
              <span class="font-bold text-gray-400">{deal.origen}</span>
              <span class="mx-1 text-gray-300">➔</span>
            {/if}
            <span class="font-bold text-gray-400">{deal.destino}</span>
          </div>

          <div class="flex items-center text-gray-400 text-[11px] font-bold">
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            {fechasCortas}
          </div>

          <span class="hidden sm:inline text-gray-400 text-[10px]">• Verificado</span>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">

      <div class="text-left sm:text-right mr-2">
        <p class="text-lg font-extrabold text-lumiDark">
          ${precio}
          <span class="text-xs font-normal text-gray-400">{monedaDeal}</span>
        </p>
      </div>

      <button
        type="button"
        onclick={handleCopiar}
        title="Copiar enlace"
        class="bg-gray-50 hover:bg-gray-200 text-gray-500 p-2 rounded-lg transition-colors shadow-sm cursor-pointer"
        aria-label="Copiar enlace de la oferta al portapapeles"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
        </svg>
      </button>

      <span class="text-lumiCyan hover:text-lumiCyanDark font-semibold text-sm flex items-center gap-1 transition-colors">
        Explorar
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 5l7 7-7 7"></path>
        </svg>
      </span>
    </div>
  </div>
</li>
