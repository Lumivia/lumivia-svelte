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

  // 🛡️ BLINDAJE: Safe cast a string antes de normalizar
  const normalizar = (texto: any) => {
    if (!texto) return '';
    return String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
  };

  const mapaMonedas: Record<string, string> = {
    MX: 'MXN', CO: 'COP', CL: 'CLP', CR: 'USD'
  };

  const imgFinal = $derived(deal ? obtenerImagen(deal, 800) : '');
  const fechasCortas = $derived(deal ? `${formatearFechaCorta(deal.fecha_salida)} - ${formatearFechaCorta(deal.fecha_regreso)}` : '');
  
  const monedaDeal = $derived.by(() => {
    if (deal?.moneda) return String(deal.moneda).toUpperCase();
    if (deal?.currency) return String(deal.currency).toUpperCase();
    if (deal?.titulo_gancho) {
      const match = String(deal.titulo_gancho).match(/(MXN|COP|CLP|USD)/i);
      if (match) return match[1].toUpperCase();
    }
    return 'MXN';
  });

  const ciudadExtraida = $derived.by(() => {
    if (!deal?.titulo_gancho) return deal?.destino || '';
    const match = String(deal.titulo_gancho).match(/:\s*(.*?)\s*desde/i);
    return match && match[1] ? match[1].trim() : (deal.destino || '');
  });
  
  const esNacional = $derived.by(() => {
    if (!deal) return false;
    let mercado = deal.pais ? String(deal.pais).toUpperCase() : 'MX';
    if (!deal.pais && deal.titulo_gancho) {
      const txt = String(deal.titulo_gancho).toUpperCase();
      if (txt.includes('COP')) mercado = 'CO';
      else if (txt.includes('CLP')) mercado = 'CL';
      else if (txt.includes('USD')) mercado = 'CR';
    }
    
    const listaLocal = destinosNacionales[mercado] || [];
    const destinoNorm = normalizar(deal.destino);
    const tituloNorm = normalizar(deal.titulo_gancho);
    
    return listaLocal.some(keyword => destinoNorm.includes(keyword) || tituloNorm.includes(keyword));
  });

  $effect(() => {
    if (abierto && deal) {
      const params = new URLSearchParams({
        destino: deal.destino || '', 
        ciudad: ciudadExtraida || '', 
        pais: deal.pais || 'MX',
        salida: deal.fecha_salida || '',
        regreso: deal.fecha_regreso || '',
        url_hotel: deal.url_hotel || ''
      });
      
      fetch(`/api/links?${params.toString()}`)
        .then(res => res.json())
        .then(data => links = data)
        .catch(err => console.error("Error recuperando links:", err));
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
    return splitText[0].trim(); 
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
        <img src={imgFinal} alt={deal?.titulo_gancho || 'Destino'} class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
      </div>

      <div class="px-6 pb-6 -mt-4 relative z-10 flex-grow flex flex-col">
        
        <div class="mb-4">
          <h2 class="text-2xl font-black text-lumiDark leading-tight mb-3">{deal?.titulo_gancho || ''}</h2>
          <div class="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500">
            <div class="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <svg class="w-3.5 h-3.5 text-lumiCyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {fechasCortas}
            </div>
            <AmenidadesLinea {deal} paisActual={deal?.pais} />
          </div>
        </div>

        <div class="text-[13px] text-gray-600 leading-relaxed font-medium whitespace-pre-line text-justify mb-6">
          {@html cuerpoPostLimpiado}
        </div>

        <div class="mt-auto">
          <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Complementos de Viaje</h4>
          
          {#if links.esim && !esNacional}
            <div class="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 mb-3">
              <p class="text-[11px] text-emerald-900 leading-relaxed">
                ✨ <strong>Beneficios Lumivia en Airalo:</strong><br>
                • Nuevos usuarios: <strong class="text-emerald-700 font-black">LUMIVIA</strong> (15% OFF)<br>
                • Usuarios recurrentes: <strong class="text-emerald-700 font-black">LUMIVIA10</strong> (10% OFF)
              </p>
            </div>
          {/if}

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {#if links.esim && !esNacional}
              <a href={links.esim} target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 p-2.5 bg-white border border-gray-100 rounded-2xl hover:border-emerald-400 hover:shadow-md transition-all group">
                <div class="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
                  <img src="https://images.unsplash.com/photo-1488509082528-cefbba5ad692?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="eSIM Airalo" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[11px] font-black text-lumiDark truncate">Internet eSIM</p>
                  <p class="text-[10px] text-gray-500 truncate">Sin Roaming</p>
                </div>
              </a>
            {/if}

            {#if links.tours}
              <a href={links.tours} target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 p-2.5 bg-white border border-gray-100 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all group">
                <div class="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
                  <img src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=150&q=80" alt="Tours Civitatis" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[11px] font-black text-lumiDark truncate">Tours & Guías</p>
                  <p class="text-[10px] text-gray-500 truncate">En español</p>
                </div>
              </a>
            {/if}

            {#if links.hotel}
              <a href={links.hotel} target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 p-2.5 bg-white border border-gray-100 rounded-2xl hover:border-amber-500 hover:shadow-md transition-all group">
                <div class="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
                  <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=150&q=80" alt="Hoteles" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[11px] font-black text-lumiDark truncate">Hospedaje</p>
                  <p class="text-[10px] text-gray-500 truncate">Mapa Interactivo</p>
                </div>
              </a>
            {/if}

            {#if links.seguro && !esNacional}
              <a href={links.seguro} target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 p-2.5 bg-white border border-gray-100 rounded-2xl hover:border-rose-500 hover:shadow-md transition-all group">
                <div class="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
                  <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=150&q=80" alt="Seguro Viaje" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[11px] font-black text-lumiDark truncate">Asistencia</p>
                  <p class="text-[10px] text-gray-500 truncate">Seguro Global</p>
                </div>
              </a>
            {/if}
          </div>
        </div>

        <div class="flex items-center justify-between border-t border-gray-100 pt-5 mt-5">
          <div>
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Vuelo Id / Vt</p>
            <div class="text-3xl font-black text-lumiDark leading-none">
              ${Number(deal?.precio ?? 0).toLocaleString('en-US')}
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
