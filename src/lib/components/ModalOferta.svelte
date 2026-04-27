<script lang="ts">
  import { onMount } from 'svelte';
  import { obtenerImagen } from '$lib/utils/imagenes';
  import { formatearFechaCorta } from '$lib/utils/fechas';
  import AmenidadesLinea from '$lib/components/AmenidadesLinea.svelte';

  const { deal, abierto, cerrar } = $props();

  // Estado para los links protegidos (BFF)
  let links = $state({ tours: '', hotel: '', esim: '', seguro: '' });

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape') cerrar();
  }

  onMount(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  // Utilidad interna para Aviasales
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

  // ✅ Integración BFF: Pedimos los links al servidor cuando se abre el modal
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
    <div class="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto relative animate-fadeIn pointer-events-auto border border-gray-100">
      
      <button class="absolute top-4 right-4 bg-white/50 backdrop-blur-md hover:bg-white p-2 rounded-full shadow-sm z-20 transition-colors" onclick={cerrar} aria-label="Cerrar ventana de oferta">
        <svg class="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>

      <div class="h-56 w-full overflow-hidden relative">
        <img src={imgFinal} alt={deal.titulo_gancho} class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
      </div>

      <div class="px-6 pb-8 -mt-2 relative z-10 space-y-6">
        <div>
          <h2 class="text-2xl font-black text-lumiDark leading-tight mb-3">{deal.titulo_gancho}</h2>
          <div class="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500">
            <div class="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
              <svg class="w-3.5 h-3.5 text-lumiCyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {fechasCortas}
            </div>
            <AmenidadesLinea {deal} paisActual={deal.pais} />
          </div>
        </div>

        <div class="text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-line text-justify">
          {@html cuerpoPostLimpiado()}
        </div>

        <div class="pt-6 border-t border-gray-100 mt-6">
          <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Mejora tu experiencia</h4>
          <div class="grid grid-cols-2 gap-4">
            
            {#if links.esim && !esNacional()}
              <a href={links.esim} target="_blank" rel="noopener noreferrer" class="group block bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:border-lumiCyan transition-all hover:shadow-lg">
                <div class="relative h-24 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80&fm=webp" alt="Conectividad Global" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"/>
                  <div class="absolute top-2 right-2 bg-lumiCyan text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider shadow-md">LUMIVIA</div>
                </div>
                <div class="p-4">
                  <p class="text-sm font-bold text-lumiDark mb-1">Conectividad eSIM</p>
                  <p class="text-xs text-emerald-500 font-semibold">Código: LUMIVIA (15% OFF)</p>
                </div>
              </a>
            {/if}

            {#if links.tours}
              <a href={links.tours} target="_blank" rel="noopener noreferrer" class="group block bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:border-blue-500 transition-all hover:shadow-lg">
                <div class="relative h-24 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1520638029751-2402746991e2?auto=format&fit=crop&w=400&q=80&fm=webp" alt="Tours y Actividades" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"/>
                  <div class="absolute top-2 right-2 bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider shadow-md">TOURS</div>
                </div>
                <div class="p-4">
                  <p class="text-sm font-bold text-lumiDark mb-1">Actividades &amp; Tours</p>
                  <p class="text-xs text-gray-500">Mejores precios en español</p>
                </div>
              </a>
            {/if}

            {#if links.hotel}
              <a href={links.hotel} target="_blank" rel="noopener noreferrer" class="group block bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:border-amber-500 transition-all hover:shadow-lg col-span-2">
                <div class="relative h-24 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&w=400&q=80&fm=webp" alt="Reserva Hotel" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"/>
                  <div class="absolute top-2 right-2 bg-amber-600 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider shadow-md">HOTEL</div>
                </div>
                <div class="p-4 flex flex-col justify-center">
                  <p class="text-sm font-bold text-lumiDark mb-1">Hospedaje de Diseño</p>
                  <p class="text-xs text-gray-500">Zonas recomendadas y tarifas exclusivas</p>
                </div>
              </a>
            {/if}

            {#if links.seguro && !esNacional()}
              <a href={links.seguro} target="_blank" rel="noopener noreferrer" class="group block bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:border-rose-500 transition-all hover:shadow-lg col-span-2">
                <div class="p-4 flex items-center gap-4">
                  <div class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100 p-2 flex items-center justify-center">
                    <svg class="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9y"/></svg>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-lumiDark mb-1 group-hover:text-rose-600 transition-colors">Seguro de Viaje Global</p>
                    <p class="text-xs text-gray-500">Soporte médico 24/7 y cancelación (Socio EKTA)</p>
                  </div>
                  <svg class="w-5 h-5 text-gray-300 ml-auto group-hover:text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </div>
              </a>
            {/if}
          </div>
        </div>

        <div class="flex items-center justify-between border-t border-gray-100 pt-6 mt-2">
          <div>
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Precio final</p>
            <div class="text-3xl font-black text-lumiDark leading-none">
              ${Number(deal.precio ?? 0).toLocaleString('en-US')}
              <span class="text-xs font-bold text-gray-400 uppercase">{monedaDeal}</span>
            </div>
          </div>

          <a href={linkVuelo} target="_blank" rel="noopener noreferrer" class="bg-lumiCyan hover:bg-lumiCyanDark text-lumiDark font-black px-8 py-3.5 rounded-xl transition-all shadow-md text-sm uppercase">
            Ver Vuelo
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
