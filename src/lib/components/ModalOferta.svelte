<script lang="ts">
  import { onMount } from 'svelte';
  import { obtenerImagen } from '$lib/utils/imagenes';
  import { formatearFechaCorta } from '$lib/utils/fechas';
  import ExtrasOferta from '$lib/components/ExtrasOferta.svelte';
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

  // Mapeo dinámico hacia ExtrasOferta
  const esims = $derived(deal && !esNacional() && links.esim ? [{ url: links.esim, cupon: 'LUMIVIA' }] : []);
  const tours = $derived(deal && links.tours ? [{ url: links.tours }] : []);
  const hoteles = $derived(links.hotel ? { url: links.hotel } : null);
  const seguro = $derived(deal && !esNacional() && links.seguro ? { url: links.seguro } : null);

  const cuerpoPostLimpiado = $derived(() => {
    if (!deal || (!deal.cuerpo_post && !deal.descripcion)) return "";
    let original = deal.cuerpo_post || deal.descripcion;
    const regexRedes = /(👉 )?Comenta la palabra DIRECTO y te mando.*?reserva para esta experiencia\./gis;
    return original.replace(regexRedes, "");
  });
</script>

{#if abierto && deal}
  <div class="fixed inset-0 bg-lumiDark/60 backdrop-blur-sm z-[999]" onclick={cerrar} role="button" tabindex="0" onkeydown={handleKey}></div>

  <div class="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-none">
    <div class="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto relative animate-fadeIn pointer-events-auto border border-gray-100" onclick={(e) => e.stopPropagation()} role="document">
      
      <button class="absolute top-4 right-4 bg-white/50 backdrop-blur-md p-2 rounded-full shadow-sm z-20" onclick={cerrar}>
        <svg class="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
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

        <div class="pt-4 border-t border-gray-50">
          <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Mejora tu experiencia</h3>
          <ExtrasOferta {esims} {tours} {hoteles} {seguro} />
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
