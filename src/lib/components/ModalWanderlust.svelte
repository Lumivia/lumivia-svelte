<script lang="ts">
  import { onMount } from 'svelte';
  import { obtenerImagen } from '$lib/utils/imagenes';
  import { formatDatesLumivia } from '$lib/utils/formatters';

  const { deal, abierto, cerrar } = $props();
  let links = $state({ tours: '', hotel: '', esim: '', seguro: '' });

  function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') cerrar(); }

  onMount(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  function formatoAviasales(fechaIso: any) {
    if (!fechaIso) return '';
    const partes = String(fechaIso).split('T')[0].split('-');
    return partes.length === 3 ? `${partes[2]}${partes[1]}` : '';
  }

  const destinosNacionales: Record<string, string[]> = {
    MX: ['CUN', 'CANCUN', 'MID', 'MERIDA', 'SJD', 'LOS CABOS', 'PVR', 'PUERTO VALLARTA', 'PXM', 'PUERTO ESCONDIDO', 'OAX', 'OAXACA', 'TRC', 'TORREON', 'CUU', 'CHIHUAHUA', 'MEX', 'CIUDAD DE MEXICO', 'CDMX', 'GDL', 'GUADALAJARA', 'MTY', 'MONTERREY', 'TIJ', 'TIJUANA'],
    CO: ['CTG', 'CARTAGENA', 'SMR', 'SANTA MARTA', 'ADZ', 'SAN ANDRES', 'BGA', 'BUCARAMANGA', 'PEI', 'PEREIRA', 'BOG', 'BOGOTA', 'MDE', 'MEDELLIN', 'CLO', 'CALI'],
    CL: ['CJC', 'CALAMA', 'PUQ', 'PUNTA ARENAS', 'PMC', 'PUERTO MONTT', 'IQQ', 'IQUIQUE', 'SCL', 'SANTIAGO', 'LSC', 'LA SERENA', 'ZCO', 'TEMUCO', 'BBA', 'BALMACEDA'],
    CR: ['SJO', 'SAN JOSE', 'LIR', 'LIBERIA']
  };

  const normalizar = (texto: any) => String(texto || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

  const imgFinal = $derived(obtenerImagen(deal));
  
  function handleImageError(e: Event) {
    const img = e.target as HTMLImageElement;
    img.onerror = null;
    img.src = 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=800&q=80';
  }

  const origenNombre = $derived(String(deal?.origen_nombre || deal?.origen || '').toUpperCase());
  const destinoNombre = $derived(String(deal?.destino_nombre || deal?.destino || '').toUpperCase());
  const fechasCortas = $derived(deal ? formatDatesLumivia(deal.fecha_salida, deal.fecha_regreso) : '');
  
  const monedaDeal = $derived.by(() => {
    if (deal?.moneda) return String(deal.moneda).toUpperCase();
    if (deal?.currency) return String(deal.currency).toUpperCase();
    return 'MXN';
  });

  const ciudadExtraida = $derived.by(() => {
    if (!deal?.titulo_gancho) return deal?.destino_nombre || deal?.destino || '';
    const match = String(deal.titulo_gancho).match(/:\s*(.*?)\s*desde/i);
    return match && match[1] ? match[1].trim() : (deal?.destino_nombre || deal?.destino || '');
  });
  
  const esNacional = $derived.by(() => {
    if (!deal) return false;
    let mercado = deal.pais ? String(deal.pais).toUpperCase() : 'MX';
    const listaLocal = destinosNacionales[mercado] || [];
    const destinoNorm = normalizar(deal.destino);
    const tituloNorm = normalizar(deal.titulo_gancho);
    return listaLocal.some(keyword => destinoNorm.includes(keyword) || tituloNorm.includes(keyword));
  });

  $effect(() => {
    if (abierto && deal) {
      const params = new URLSearchParams({
        destino: deal.destino || '', ciudad: ciudadExtraida || '', pais: deal.pais || 'MX',
        salida: deal.fecha_salida || '', regreso: deal.fecha_regreso || '', url_hotel: deal.url_hotel || ''
      });
      fetch(`/api/links?${params.toString()}`).then(res => res.json()).then(data => links = data).catch(err => console.error(err));
    }
  });

  const linkVuelo = $derived.by(() => {
    if (!deal) return '#';
    const origen = String(deal.origen || '').toUpperCase();
    const destino = String(deal.destino || '').toUpperCase();
    const searchParam = `${origen}${formatoAviasales(deal.fecha_salida)}${destino}${formatoAviasales(deal.fecha_regreso)}1`;
    return `https://vuelos.lumivia.app/?flightSearch=${searchParam}`;
  });

  const cuerpoPostLimpiado = $derived.by(() => {
    let original = String(deal?.cuerpo_post || deal?.descripcion || "");
    const splitText = original.split(/👉|👇|✨|Comenta la palabra/i);
    return splitText[0].trim().replace(/[\(\[\{\-\:\s]+$/, '');
  });
</script>

{#if abierto && deal}
  <div class="fixed inset-0 bg-black/60 backdrop-blur-md z-[999]" onclick={cerrar} role="button" tabindex="0" onkeydown={handleKey} aria-label="Cerrar modal"></div>

  <div class="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-none">
    <div class="bg-[#161616] border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-fadeIn pointer-events-auto flex flex-col">
      
      <button class="absolute top-4 right-4 bg-black/40 backdrop-blur-md hover:bg-white text-white hover:text-black p-2.5 rounded-full shadow-lg z-20 transition-all duration-300" onclick={cerrar} aria-label="Cerrar ventana">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>

      <div class="h-64 w-full overflow-hidden relative flex-shrink-0 bg-gray-900">
        <img src={imgFinal} alt={deal?.titulo_gancho || 'Destino'} class="w-full h-full object-cover" onerror={handleImageError} />
        <div class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#161616] via-[#161616]/60 to-transparent"></div>
        
        <div class="absolute bottom-6 left-8">
          <div class="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg shadow-sm">
            <span class="text-[12px] font-black uppercase tracking-widest">{origenNombre}</span>
            <svg class="w-4 h-4 text-[#00E5B5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            <span class="text-[12px] font-black uppercase tracking-widest">{destinoNombre}</span>
          </div>
          <h2 class="text-4xl font-black text-white leading-tight drop-shadow-xl">{deal?.titulo_gancho || ''}</h2>
        </div>
      </div>

      <div class="px-8 pb-8 pt-2 relative z-10 flex-grow flex flex-col">
        
        <div class="flex items-center gap-2 mb-6">
          <div class="bg-[#00E5B5]/10 px-3 py-1.5 rounded-full border border-[#00E5B5]/20 text-[#00E5B5] font-black uppercase tracking-widest text-[11px]">
            {fechasCortas}
          </div>
        </div>

        <div class="text-[15px] text-gray-300 leading-relaxed font-medium whitespace-pre-line mb-8">
          {@html cuerpoPostLimpiado}
        </div>

        {#if links.esim && !esNacional}
          <div class="bg-[#0A0A0A] border border-[#00E5B5]/30 rounded-2xl p-5 mb-8 flex items-start gap-4 shadow-inner">
            <span class="text-[#00E5B5] text-2xl">💡</span>
            <p class="text-gray-300 text-sm leading-relaxed font-medium">
              <strong class="text-white block mb-1 text-[15px]">Beneficios Lumivia en Airalo:</strong>
              Nuevos usuarios: <span class="text-[#00E5B5] font-black px-1">LUMIVIA</span> (15% OFF) <br class="sm:hidden">
              <span class="hidden sm:inline">|</span> Recurrentes: <span class="text-[#00E5B5] font-black px-1">LUMIVIA10</span> (10% OFF)
            </p>
          </div>
        {/if}

        <div class="mt-auto">
          <h4 class="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Complementos de Viaje</h4>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {#if links.esim && !esNacional}
              <a href={links.esim} target="_blank" rel="noopener noreferrer" class="flex items-center gap-4 p-3 bg-[#0A0A0A] border border-white/5 rounded-2xl hover:border-[#00E5B5]/50 hover:bg-[#111111] transition-all group">
                <div class="w-12 h-12 rounded-full bg-gray-800 overflow-hidden flex-shrink-0 border border-white/10"><img src="https://images.unsplash.com/photo-1488509082528-cefbba5ad692?q=80&w=2070&auto=format&fit=crop" alt="eSIM" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /></div>
                <div class="flex-1 min-w-0"><p class="text-[13px] font-black text-white mb-0.5">Internet eSIM</p><p class="text-[11px] text-gray-400">Sin Roaming</p></div>
              </a>
            {/if}
            {#if links.tours}
              <a href={links.tours} target="_blank" rel="noopener noreferrer" class="flex items-center gap-4 p-3 bg-[#0A0A0A] border border-white/5 rounded-2xl hover:border-[#00E5B5]/50 hover:bg-[#111111] transition-all group">
                <div class="w-12 h-12 rounded-full bg-gray-800 overflow-hidden flex-shrink-0 border border-white/10"><img src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=150&q=80" alt="Tours" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /></div>
                <div class="flex-1 min-w-0"><p class="text-[13px] font-black text-white mb-0.5">Tours & Guías</p><p class="text-[11px] text-gray-400">En español</p></div>
              </a>
            {/if}
            {#if links.hotel}
              <a href={links.hotel} target="_blank" rel="noopener noreferrer" class="flex items-center gap-4 p-3 bg-[#0A0A0A] border border-white/5 rounded-2xl hover:border-[#00E5B5]/50 hover:bg-[#111111] transition-all group">
                <div class="w-12 h-12 rounded-full bg-gray-800 overflow-hidden flex-shrink-0 border border-white/10"><img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=150&q=80" alt="Hoteles" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /></div>
                <div class="flex-1 min-w-0"><p class="text-[13px] font-black text-white mb-0.5">Hospedaje</p><p class="text-[11px] text-gray-400">Mapa Interactivo</p></div>
              </a>
            {/if}
            {#if links.seguro && !esNacional}
              <a href={links.seguro} target="_blank" rel="noopener noreferrer" class="flex items-center gap-4 p-3 bg-[#0A0A0A] border border-white/5 rounded-2xl hover:border-[#00E5B5]/50 hover:bg-[#111111] transition-all group">
                <div class="w-12 h-12 rounded-full bg-gray-800 overflow-hidden flex-shrink-0 border border-white/10"><img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=150&q=80" alt="Seguro Viaje" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /></div>
                <div class="flex-1 min-w-0"><p class="text-[13px] font-black text-white mb-0.5">Asistencia</p><p class="text-[11px] text-gray-400">Seguro Global</p></div>
              </a>
            {/if}
          </div>

          <div class="flex items-center justify-between border-t border-white/10 pt-6">
            <div>
              <p class="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">Vuelo Id / Vt</p>
              <div class="text-3xl sm:text-4xl font-black text-white leading-none">
                ${Number(deal?.precio ?? 0).toLocaleString('en-US')}
                <span class="text-[12px] font-bold text-gray-500 uppercase ml-1">{monedaDeal}</span>
              </div>
            </div>
            <a href={linkVuelo} target="_blank" rel="noopener noreferrer" class="bg-[#00E5B5] hover:bg-white text-[#0A0A0A] font-black px-8 py-4 rounded-full transition-all shadow-[0_10px_30px_rgba(0,229,181,0.2)] hover:shadow-[0_10px_30px_rgba(255,255,255,0.3)] active:scale-95 text-[13px] uppercase tracking-widest flex items-center gap-2">
              Ver Vuelo <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .animate-fadeIn { animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
  @keyframes fadeIn { from { opacity: 0; transform: scale(0.98) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
</style>
