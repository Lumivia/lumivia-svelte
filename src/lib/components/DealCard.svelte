<script lang="ts">
  import { formatearFechaCorta } from '$lib/utils/fechas';
  import { obtenerImagen } from '$lib/utils/imagenes';
  import { copiarUrlUnica } from '$lib/utils/clipboard';
  import { reportarCambioPrecio } from '$lib/utils/reportes';
  import AmenidadesLinea from '$lib/components/AmenidadesLinea.svelte';

  // 🔥 SVELTE 5: Recibimos la función onclick directamente como prop
  const { deal, monedaActual, paisActual, onclick } = $props();

  // Estado local para opacar la tarjeta al instante al reportarla
  let reportado = $state(false);

  // Reactividad derivada (Runes)
  const imgFinal = $derived(obtenerImagen(deal));

  const fechasCortas = $derived(
    `${formatearFechaCorta(deal.fecha_salida)} - ${formatearFechaCorta(deal.fecha_regreso)}`
  );

  const precio = $derived(
    Number(deal.precio ?? deal.price ?? 0).toLocaleString('en-US')
  );

  const monedaDeal = $derived(
    (deal.moneda || deal.currency || monedaActual).toUpperCase()
  );

  const esVip = $derived(deal.tipo_vuelo === 'directo');
  const esHot = $derived(deal.calidad_oferta >= 9);

  // Manejadores de clics internos
  async function handleReportar(e: Event) {
    e.stopPropagation(); // Evita que se abra el modal
    if (reportado) return;
    reportado = true;
    try {
      await reportarCambioPrecio(deal.id);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCopiar(e: Event) {
    e.stopPropagation(); // Evita que se abra el modal
    await copiarUrlUnica(deal.id);
  }

</script>

<article
  {onclick} 
  class="card-minimal flex-none w-[85vw] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-center flex flex-col group hover:shadow-xl transition-all duration-300 bg-white rounded-2xl overflow-hidden text-left cursor-pointer {reportado ? 'opacity-40 grayscale' : ''}"
  aria-label={`Ver oferta de ${deal.origen} a ${deal.destino}`}
>

  <div class="relative h-56 overflow-hidden bg-gray-100">
    <img
      src={imgFinal}
      alt={deal.titulo_gancho}
      loading="lazy"
      class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
    />

    <div class="absolute inset-0 bg-gradient-to-t from-lumiDark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

    <div class="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-lumiDark text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm tracking-wide border border-white/50 uppercase flex items-center gap-1">
      ⏱️ {deal.tiempoTranscurrido}
    </div>

    {#if esVip}
      <div class="absolute top-4 right-4 badge-vip-glass text-white text-[10px] font-black px-3 py-1.5 rounded-full z-10 flex items-center gap-1.5 uppercase tracking-widest shadow-lg">
        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
        </svg>
        Directo
      </div>
    {/if}

    <button
      type="button"
      onclick={handleReportar}
      title="¿El precio subió? Repórtalo"
      class="absolute bottom-3 right-3 bg-white/80 hover:bg-red-50 text-gray-500 hover:text-red-500 backdrop-blur-sm p-2.5 rounded-full shadow-sm border border-white/50 transition-colors z-10 cursor-pointer"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-1 6-1-1H11.5l-1-1H5v10m0 0h4"></path>
      </svg>
    </button>
  </div>

  <div class="p-6 flex flex-col flex-grow bg-white relative">

    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">
          <span>{deal.origen}</span>
          <span class="mx-0.5 font-normal text-gray-300">➔</span>
          <span>{deal.destino}</span>
        </div>

        {#if esHot}
          <span class="text-red-500 font-extrabold flex items-center gap-1 text-[10px] uppercase tracking-wider">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                clip-rule="evenodd"></path>
            </svg>
            HOT
          </span>
        {/if}
      </div>

      <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        {fechasCortas}
      </div>
    </div>

    <h3 class="text-xl font-bold mb-4 text-lumiDark group-hover:text-lumiCyan transition-colors leading-snug line-clamp-2">
      {deal.titulo_gancho}
    </h3>

    <AmenidadesLinea {deal} {paisActual} />

    <div class="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
      <div>
        <p class="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">Vuelo Id/Vt</p>
        <p class="text-2xl font-black text-lumiDark leading-none tracking-tight">
          ${precio} <span class="text-xs font-semibold text-gray-400">{monedaDeal}</span>
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          onclick={handleCopiar}
          title="Copiar enlace"
          class="bg-gray-50 hover:bg-gray-200 text-gray-500 p-2 rounded-lg transition-colors shadow-sm cursor-pointer"
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
  </div>
</article>
