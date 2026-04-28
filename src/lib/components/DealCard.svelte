<script lang="ts">
  import { formatearFechaCorta } from '$lib/utils/fechas';
  import { obtenerImagen } from '$lib/utils/imagenes';
  import { copiarUrlUnica } from '$lib/utils/clipboard';
  import { reportarCambioPrecio } from '$lib/utils/reportes';
  import AmenidadesLinea from '$lib/components/AmenidadesLinea.svelte';

  const { deal, monedaActual, paisActual, onclick } = $props();

  let reportado = $state(false);

  // 🛡️ BLINDAJE EXTREMO: Conversión forzada a String para evitar Crash 500
  const imgFinal = $derived(obtenerImagen(deal));

  const fechasCortas = $derived(
    `${formatearFechaCorta(deal?.fecha_salida)} - ${formatearFechaCorta(deal?.fecha_regreso)}`
  );

  const precio = $derived(
    Number(deal?.precio ?? deal?.price ?? 0).toLocaleString('en-US')
  );

  const monedaDeal = $derived(
    String(deal?.moneda || deal?.currency || monedaActual || 'MXN').toUpperCase()
  );

  const origenSeguro = $derived(String(deal?.origen || '').toUpperCase());
  const destinoSeguro = $derived(String(deal?.destino || '').toUpperCase());

  const esVip = $derived(deal?.tipo_vuelo === 'directo');
  const esHot = $derived((deal?.calidad_oferta ?? 0) >= 9);

  async function handleReportar(e: Event) {
    e.stopPropagation(); 
    if (reportado) return;
    reportado = true;
    try {
      if (deal?.id) await reportarCambioPrecio(deal.id);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCopiar(e: Event) {
    e.stopPropagation(); 
    if (deal?.id) await copiarUrlUnica(deal.id);
  }
</script>

<div
  role="button"
  tabindex="0"
  onclick={onclick} 
  onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onclick(e); } }}
  class="card-minimal flex-none w-[85vw] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-center flex flex-col group hover:shadow-xl transition-all duration-300 bg-white rounded-2xl overflow-hidden text-left cursor-pointer {reportado ? 'opacity-40 grayscale' : ''}"
  aria-label={`Ver oferta de ${origenSeguro} a ${destinoSeguro}`}
>

  <div class="relative h-56 overflow-hidden bg-gray-100">
    <img
      src={imgFinal}
      alt={deal?.titulo_gancho || 'Oferta'}
      loading="lazy"
      class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
    />

    <div class="absolute inset-0 bg-gradient-to-t from-lumiDark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

    {#if deal?.tiempoTranscurrido}
      <div class="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-lumiDark text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm tracking-wide border border-white/50 uppercase flex items-center gap-1">
        ⏱️ {deal.tiempoTranscurrido}
      </div>
    {/if}

    {#if esVip}
      <div class="absolute top-4 right-4 badge-vip-glass text-white text-[10px] font-black px-3 py-1.5 rounded-full z-10 flex items-center gap-1.5 uppercase tracking-widest shadow-lg">
        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
        </svg>
        Directo
      </div>
    {/if}

    <button type="button" onclick={handleReportar} title="¿El precio subió? Repórtalo" class="absolute bottom-3 right-3 bg-white/80 hover:bg-red-50 text-gray-500 hover:text-red-500 backdrop-blur-sm p-2.5 rounded-full shadow-sm border border-white/50 transition-colors z-10 cursor-pointer">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-1 6-1-1H11.5l-1-1H5v10m0 0h4"></path>
      </svg>
    </button>
  </div>

  <div class="p-6 flex flex-col flex-grow bg-white relative">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">
          <span>{origenSeguro}</span>
          <span class="mx-0.5 font-normal text-gray-300">➔</span>
          <span>{destinoSeguro}</span>
        </div>

        {#if esHot}
          <span class="text-red-500 font-extrabold flex items-center gap-1 text-[10px] uppercase tracking-wider">
            HOT
          </span>
        {/if}
      </div>
      <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
        {fechasCortas}
      </div>
    </div>

    <h3 class="text-xl font-bold mb-4 text-lumiDark group-hover:text-lumiCyan transition-colors leading-snug line-clamp-2">
      {deal?.titulo_gancho || 'Vuelo Especial'}
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
        <button type="button" onclick={handleCopiar} class="bg-gray-50 hover:bg-gray-200 p-2 rounded-lg text-gray-500 cursor-pointer">
          Copiar
        </button>
      </div>
    </div>
  </div>
</div>
