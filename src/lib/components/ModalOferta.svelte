<script lang="ts">
  import { onMount } from 'svelte';
  import { obtenerImagen } from '$lib/utils/imagenes';
  import { formatearFechaCorta } from '$lib/utils/fechas';
  import AmenidadesLinea from '$lib/components/AmenidadesLinea.svelte';

  const { deal, abierto, cerrar } = $props();

  let links = $state({ tours: '', hotel: '', esim: '', seguro: '' });

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape') cerrar();
  }

  onMount(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  function formatoAviasales(fechaIso: string) {
    if (!fechaIso) return '';
    const partes = fechaIso.split('T')[0].split('-');
    return partes.length === 3 ? `${partes[2]}${partes[1]}` : '';
  }

  const destinosNacionales: Record<string, string[]> = {
    MX: ['CUN', 'MID', 'SJD', 'PVR', 'PXM', 'OAX', 'TRC', 'CUU', 'MEX', 'GDL', 'MTY', 'TIJ'],
    CO: ['CTG', 'SMR', 'ADZ', 'BGA', 'PEI', 'BOG', 'MDE', 'CLO'],
    CL: ['CJC', 'PUQ', 'PMC', 'IQQ', 'SCL', 'LSC', 'ZCO', 'BBA'],
    CR: ['SJO', 'LIR']
  };

  const imgFinal = $derived(deal ? obtenerImagen(deal, 800) : '');
  const fechasCortas = $derived(deal ? `${formatearFechaCorta(deal.fecha_salida)} - ${formatearFechaCorta(deal.fecha_regreso)}` : '');
  const monedaDeal = $derived(deal ? (deal.moneda || 'MXN').toUpperCase() : 'MXN');
  
  const esNacional = $derived(() => {
    if (!deal?.pais || !deal?.destino) return false;
    return (destinosNacionales[deal.pais.toUpperCase()] || []).includes(deal.destino.toUpperCase());
  });

  $effect(() => {
    if (abierto && deal) {
      const params = new URLSearchParams({
        destino: deal.destino,
        salida: deal.fecha_salida,
        regreso: deal.fecha_regreso,
        url_hotel: deal.url_hotel || ''
      });
      
      fetch(`/api/links?${params.toString()}`)
        .then(res => res.json())
        .then(data => links = data)
        .catch(err => console.error("Error recuperando links seguros:", err));
    }
  });

  const linkVuelo = $derived.by(() => {
    if (!deal) return '#';
    const origen = (deal.origen || '').toUpperCase();
    const destino = (deal.destino || '').toUpperCase();
    const searchParam = `${origen}${formatoAviasales(deal.fecha_salida)}${destino}${formatoAviasales(deal.fecha_regreso)}1`;
    return `https://vuelos.lumivia.app/?flightSearch=${searchParam}`;
  });

  const cuerpoPostLimpiado = $derived(() => {
    if (!deal || (!deal.cuerpo_post && !deal.descripcion)) return "";
    let original = deal.cuerpo_post || deal.descripcion;
    const regexRedes = /(👉 )?Comenta la palabra DIRECTO y te mando.*?reserva para esta experiencia\./gis;
    return original.replace(regexRedes, "");
  });
</script>

{#if abierto && deal}
  <div class="fixed inset-0 bg-lumiDark/60 backdrop-blur-sm z-[999]" onclick={cerrar} role="button" tabindex="0" onkeydown={handleKey} aria-label="Cerrar modal"></div>

  <div class="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-none">
    <div class="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto relative animate-fadeIn pointer-events-auto border border-gray-100 flex flex-col">
      
      <button class="absolute top-4 right-4 bg-white/50 backdrop-blur-md hover:bg-white p-2 rounded-full shadow-sm z-20 transition-colors" onclick={cerrar} aria-label="Cerrar ventana de oferta">
        <svg class="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>

      <div class="h-48 sm:h-56 w-full overflow-hidden relative flex-shrink-0">
        <img src={imgFinal} alt={deal.titulo_gancho} class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
      </div>

      <div class="px-6 pb-6 -mt-4 relative z-10 flex-grow flex flex-col">
        
        <div class="mb-4">
          <h2 class="text-2xl font-black text-lumiDark leading-tight mb-3">{deal.titulo_gancho}</h2>
          <div class="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500">
            <div class="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <svg class="w-3.5 h-3.5 text-lumiCyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {fechasCortas}
            </div>
            <AmenidadesLinea {deal} paisActual={deal.pais} />
          </div>
        </div>

        <div class="text-[13px] text-gray-600 leading-relaxed font-medium whitespace-pre-line text-justify mb-6">
          {@html cuerpoPostLimpiado()}
        </div>

        <div class="mt-auto">
          <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Complementos de Viaje</h4>
          
          <div class="grid grid-cols-2 gap-3">
            
            {#if links.esim && !esNacional()}
              <a href={links.esim} target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl hover:border-lumiCyan hover:shadow-md transition-all group">
                <div class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-lumiCyan transition-colors">
                  <svg class="w-4 h-4 text-lumiCyan group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 117.778 0M12 20h.01m-7.08-7.071a10 10 0 1114.142 0M3.182 16.318a14 14 0 0117.636 0"></path></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[11px] font-black text-lumiDark truncate">Internet eSIM</p>
                  <p class="text-[9px] font-bold text-emerald-500 truncate tracking-wide uppercase">CÓDIGO: LUMIVIA</p>
                </div>
              </a>
            {/if}

            {#if links.tours}
              <a href={links.tours} target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl hover:border-indigo-500 hover:shadow-md transition-all group">
                <div class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500 transition-colors">
                  <svg class="w-4 h-4 text-indigo-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[11px] font-black text-lumiDark truncate">Tours & Guías</p>
                  <p class="text-[9px] text-gray-500 font-semibold truncate">En español</p>
                </div>
              </a>
            {/if}

            {#if links.hotel}
              <a href={links.hotel} target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl hover:border-amber-500 hover:shadow-md transition-all group">
                <div class="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500 transition-colors">
                  <svg class="w-4 h-4 text-amber-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[11px] font-black text-lumiDark truncate">Hospedaje</p>
                  <p class="text-[9px] text-gray-500 font-semibold truncate">Mapa Interactivo</p>
                </div>
              </a>
            {/if}

            {#if links.seguro && !esNacional()}
              <a href={links.seguro} target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl hover:border-rose-500 hover:shadow-md transition-all group">
                <div class="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0 group-hover:bg-rose-500 transition-colors">
                  <svg class="w-4 h-4 text-rose-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[11px] font-black text-lumiDark truncate">Asistencia</p>
                  <p class="text-[9px] text-gray-500 font-semibold truncate">Seguro Global</p>
                </div>
              </a>
            {/if}
          </div>
        </div>

        <div class="flex items-center justify-between border-t border-gray-100 pt-5 mt-5">
          <div>
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Vuelo Id / Vt</p>
            <div class="text-3xl font-black text-lumiDark leading-none">
              ${Number(deal.precio ?? 0).toLocaleString('en-US')}
              <span class="text-[11px] font-bold text-gray-400 uppercase ml-0.5">{monedaDeal}</span>
            </div>
          </div>

          <a href={linkVuelo} target="_blank" rel="noopener noreferrer" class="bg-lumiDark hover:bg-black text-white font-bold px-8 py-3.5 rounded-full transition-all shadow-lg active:scale-95 text-[13px] uppercase tracking-wider flex items-center gap-2">
            Ver Vuelo
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </a>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
  @keyframes fadeIn { from { opacity: 0; transform: scale(0.98) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
</style>
