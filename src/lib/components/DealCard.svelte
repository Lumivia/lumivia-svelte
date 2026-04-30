<script lang="ts">
  import { formatearFechaCorta } from '$lib/utils/fechas';
  import { obtenerImagen } from '$lib/utils/imagenes';
  import { copiarUrlUnica } from '$lib/utils/clipboard';
  import { reportarCambioPrecio } from '$lib/utils/reportes';
  import AmenidadesLinea from '$lib/components/AmenidadesLinea.svelte';

  const { deal, monedaActual, paisActual, onclick } = $props();

  let reportado = $state(false);

  const imgOriginal = $derived(obtenerImagen(deal));
  const fallbackPremium = 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=800&q=80';
  
  // 🔥 BLINDAJE TITANIO MEJORADO: Destruye las URLs falsas que genera la base de datos
  const urlEsValida = (url: any) => {
    if (!url) return false;
    const s = String(url);
    return s.startsWith('http') && !s.includes('null') && !s.includes('undefined') && !s.includes('REVISION_MANUAL');
  };

  const imgFinal = $derived(
    urlEsValida(imgOriginal) ? imgOriginal :
    urlEsValida(deal?.imagen_fallback) ? deal?.imagen_fallback :
    fallbackPremium
  );

  const fechasCortas = $derived(
    `${formatearFechaCorta(deal?.fecha_salida)} - ${formatearFechaCorta(deal?.fecha_regreso)}`
  );

  const precio = $derived(
    Number(deal?.precio ?? deal?.price ?? 0).toLocaleString('en-US')
  );

  const monedaDeal = $derived(
    String(deal?.moneda || deal?.currency || monedaActual || 'MXN').toUpperCase()
  );

  const origenSeguro = $derived(String(deal?.origen_nombre || deal?.origen || '').toUpperCase());
  const destinoSeguro = $derived(String(deal?.destino_nombre || deal?.destino || '').toUpperCase());

  const esVip = $derived(deal?.tipo_vuelo === 'directo');

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
  class="card-minimal flex-none w-[85vw] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-center flex flex-col group/card hover:shadow-2xl transition-all duration-300 bg-white rounded-2xl overflow-hidden text-left cursor-pointer border border-gray-100 {reportado ? 'opacity-40 grayscale' : ''}"
  aria-label={`Ver oferta de ${origenSeguro} a ${destinoSeguro}`}
>

  <div class="relative h-56 overflow-hidden bg-gray-100 shrink-0">
    <img
      src={imgFinal}
      alt={deal?.titulo_gancho || 'Oferta'}
      loading="lazy"
      class="w-full h-full object-cover transform group-hover/card:scale-105 transition-transform duration-700 ease-out"
      onerror={(e) => { e.currentTarget.src = fallbackPremium; }}
    />

    <div class="absolute inset-0 bg-gradient-to-t from-lumiDark/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>

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
    
    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="text-[11px] sm:text-[12px] font-black text-lumiDark uppercase tracking-widest leading-snug break-words">
        {origenSeguro} <span class="text-gray-300 font-bold mx-1.5 text-[10px] align-middle">➔</span> {destinoSeguro}
      </div>

      <div class="shrink-0 text-[9.5px] font-extrabold text-gray-400 uppercase tracking-widest text-right mt-[2px]">
        {fechasCortas}
      </div>
    </div>

    <h3 class="text-xl font-bold mb-4 text-gray-800 group-hover/card:text-lumiDark transition-colors leading-snug line-clamp-2">
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
      
      <div class="flex items-center gap-1.5">
        <button type="button" onclick={handleCopiar} title="Compartir enlace" class="text-gray-400 hover:text-lumiCyan hover:bg-lumiCyan/10 transition-colors p-2.5 rounded-full cursor-pointer">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
          </svg>
        </button>
        
        <div class="bg-lumiDark text-white group-hover/card:bg-lumiCyan group-hover/card:text-lumiDark px-5 py-2.5 rounded-full font-black text-[11px] sm:text-xs transition-all shadow-md group-hover/card:shadow-lg active:scale-95 cursor-pointer flex items-center gap-1.5 uppercase tracking-wider">
          Ver Vuelo
          <svg class="w-4 h-4 transition-transform group-hover/card:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </div>
      </div>

    </div>
  </div>
</div>
