<script lang="ts">
  import { formatearFechaCorta } from '$lib/utils/fechas';
  import { obtenerImagen } from '$lib/utils/imagenes';
  import { copiarUrlUnica } from '$lib/utils/clipboard';

  const { deal, monedaActual, onclick } = $props();

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

  const origenSeguro = $derived(String(deal.origen_nombre || deal.origen || '').toUpperCase());
  const destinoSeguro = $derived(String(deal.destino_nombre || deal.destino || '').toUpperCase());

  async function handleCopiar(e: Event) {
    e.stopPropagation();
    await copiarUrlUnica(deal.id);
  }
</script>

<li class="list-none border-b border-gray-50 last:border-0">
  <div
    role="button"
    tabindex="0"
    onclick={onclick}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if(onclick) onclick(e); } }}
    class="w-full p-4 sm:px-6 sm:py-5 hover:bg-gray-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left cursor-pointer group/item"
    aria-label={`Ver oferta de ${origenSeguro} a ${destinoSeguro}`}
  >
    <div class="flex items-center gap-4 flex-1 min-w-0">
      <img
        src={imgFinal}
        loading="lazy"
        class="h-14 w-14 shrink-0 rounded-xl object-cover shadow-sm border border-gray-200 hidden sm:block transform group-hover/item:scale-105 transition-transform duration-500 ease-out"
        alt={deal.titulo_gancho || destinoSeguro}
        onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=150&q=80';"
      />
      <div class="min-w-0 flex-1">
        <h4 class="font-bold text-gray-800 text-base group-hover/item:text-lumiDark transition-colors line-clamp-1">
          {deal.titulo_gancho || `Oferta a ${destinoSeguro}`}
        </h4>
        <div class="flex flex-wrap items-center text-xs mt-1.5 gap-2.5">
          <div class="flex items-center text-[10.5px] font-black text-lumiDark uppercase tracking-widest break-words leading-snug">
            {#if origenSeguro}
              <span>{origenSeguro}</span><span class="mx-1.5 text-[9px] font-bold text-gray-300 align-middle">➔</span>
            {/if}
            <span class="text-lumiCyan">{destinoSeguro}</span>
          </div>
          <span class="text-gray-200 font-normal hidden sm:inline">|</span>
          <div class="text-[9.5px] font-extrabold text-gray-400 uppercase tracking-widest mt-[1px]">{fechasCortas}</div>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 shrink-0">
      <div class="text-left sm:text-right">
        <p class="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-0.5 sm:hidden">Precio por persona</p>
        <p class="text-xl font-black text-lumiDark leading-none tracking-tight">
          ${precio} <span class="text-xs font-semibold text-gray-400 ml-0.5">{monedaDeal}</span>
        </p>
      </div>
      <div class="flex items-center gap-1.5">
        <button type="button" onclick={handleCopiar} title="Compartir enlace" class="text-gray-400 hover:text-lumiCyan hover:bg-lumiCyan/10 p-2.5 rounded-full transition-colors cursor-pointer shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
        </button>
        <span class="text-lumiCyan group-hover/item:text-lumiDark font-extrabold text-[11px] sm:text-xs flex items-center gap-1 transition-colors uppercase tracking-wider shrink-0 cursor-pointer">
          Ver Vuelo <svg class="w-4 h-4 transition-transform group-hover/item:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </span>
      </div>
    </div>
  </div>
</li>
