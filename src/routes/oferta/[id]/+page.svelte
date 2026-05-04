<script lang="ts">
  import { onMount } from 'svelte';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import AmenidadesLinea from '$lib/components/AmenidadesLinea.svelte';
  import { obtenerImagen } from '$lib/utils/imagenes';
  import { formatearFechaCorta } from '$lib/utils/fechas';

  let { data } = $props();
  const deal = data.deal;

  let links = $state({ tours: '', hotel: '', esim: '', seguro: '' });

  const ofertaExpirada = $derived.by(() => {
    if (!deal?.fecha_salida) return false;
    try {
      const fechaStr = String(deal.fecha_salida).split('T')[0];
      const partes = fechaStr.split(/[-/]/);
      if (partes.length === 3) {
        let y, m, d;
        if (partes[0].length === 4) { y = partes[0]; m = partes[1]; d = partes[2]; }
        else if (partes[2].length === 4) { y = partes[2]; m = partes[1]; d = partes[0]; }
        else return false;
        
        const fechaSalida = new Date(Number(y), Number(m)-1, Number(d));
        const hoy = new Date();
        hoy.setHours(0,0,0,0);
        return fechaSalida < hoy;
      }
    } catch(e) {}
    return false;
  });

  function formatoAviasales(fechaIso: any) {
    if (!fechaIso) return '';
    try {
      const soloFecha = String(fechaIso).split('T')[0];
      const partes = soloFecha.split(/[-/]/);
      if (partes.length === 3) {
        let year, month, day;
        if (partes[0].length === 4) { year = partes[0]; month = partes[1]; day = partes[2]; }
        else if (partes[2].length === 4) { year = partes[2]; month = partes[1]; day = partes[0]; }
        else return '';
        return `${day}${month}`;
      }
    } catch(e) {}
    return '';
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

  const origenNombre = $derived(String(deal?.origenNombre || deal?.origen_nombre || deal?.origen || '').toUpperCase());
  const destinoNombre = $derived(String(deal?.destinoNombre || deal?.destino_nombre || deal?.destino || '').toUpperCase());
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
    if (!deal?.titulo_gancho) return deal?.destino_nombre || deal?.destino || '';
    const match = String(deal.titulo_gancho).match(/:\s*(.*?)\s*desde/i);
    return match && match[1] ? match[1].trim() : (deal?.destino_nombre || deal?.destino || '');
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
    if (deal) {
      const params = new URLSearchParams({
        destino: deal.destino || '', ciudad: ciudadExtraida || '', pais: deal.pais || 'MX',
        salida: deal.fecha_salida || '', regreso: deal.fecha_regreso || '', url_hotel: deal.url_hotel || ''
      });
      fetch(`/api/links?${params.toString()}`).then(res => res.json()).then(data => links = data).catch(err => console.error(err));
    }
  });

  const linkVuelo = $derived.by(() => {
    if (!deal) return 'https://vuelos.lumivia.app/';
    const origen = String(deal.origen || '').toUpperCase();
    const destino = String(deal.destino || '').toUpperCase();

    if (ofertaExpirada) {
      return `https://vuelos.lumivia.app/?origin_iata=${origen}&destination_iata=${destino}`;
    }

    const salidaOk = formatoAviasales(deal.fecha_salida);
    const regresoOk = formatoAviasales(deal.fecha_regreso);
    if (!salidaOk || !regresoOk) return `https://vuelos.lumivia.app/?origin_iata=${origen}&destination_iata=${destino}`;

    const searchParam = `${origen}${salidaOk}${destino}${regresoOk}1`;
    return `https://vuelos.lumivia.app/?flightSearch=${searchParam}`;
  });

  const cuerpoPostLimpiado = $derived.by(() => {
    let original = String(deal?.cuerpo_post || deal?.descripcion || "");
    const splitText = original.split(/👉|👇|✨|Comenta la palabra/i);
    return splitText[0].trim().replace(/[\(\[\{\-\:\s]+$/, '');
  });
</script>

<svelte:head>
  <title>{deal?.titulo_gancho} | Lumivia Selección</title>
  <meta name="description" content="Vuelo de oportunidad desde {origenNombre} a {destinoNombre} por solo ${deal?.precio} {monedaDeal}. Impuestos incluidos." />
  
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://lumivia.app/oferta/{deal?.id}" />
  <meta property="og:title" content="✈️ ${deal?.precio} {monedaDeal} | {deal?.titulo_gancho}" />
  <meta property="og:description" content="Vuelo desde {origenNombre} a {destinoNombre}. Tasas e impuestos incluidos." />
  <meta property="og:image" content={imgFinal} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="✈️ ${deal?.precio} {monedaDeal} | {deal?.titulo_gancho}" />
  <meta name="twitter:description" content="Vuelo desde {origenNombre} a {destinoNombre}. Tasas e impuestos incluidos." />
  <meta name="twitter:image" content={imgFinal} />

  {@html `<script type="application/ld+json">
    {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Vuelo: ${deal?.titulo_gancho}",
      "image": "${imgFinal}",
      "description": "Vuelo redondo desde ${origenNombre} a ${destinoNombre}",
      "brand": { "@type": "Brand", "name": "Lumivia" },
      "offers": {
        "@type": "Offer",
        "url": "https://lumivia.app/oferta/${deal?.id}",
        "priceCurrency": "${monedaDeal}",
        "price": "${deal?.precio}",
        "availability": "https://schema.org/InStock"
      }
    }
  </script>`}
</svelte:head>

<div class="bg-gray-50 min-h-screen flex flex-col font-sans">
  <header class="bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 px-6 sticky top-0 z-50">
    <div class="max-w-5xl mx-auto flex justify-between items-center">
      <a href="/" class="text-xl font-black tracking-tighter text-lumiDark hover:scale-105 transition-transform">LUMIVIA</a>
      <a href="/" class="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-lumiCyan transition-colors">← Ver más ofertas</a>
    </div>
  </header>

  <main class="flex-grow flex items-start justify-center p-4 py-8 md:py-12">
    <div class="bg-white rounded-3xl shadow-xl max-w-2xl w-full relative border border-gray-100 flex flex-col animate-fadeIn overflow-hidden">
      
      <div class="h-56 sm:h-[320px] w-full relative flex-shrink-0">
        <img src={imgFinal} alt={deal?.titulo_gancho || 'Destino'} class="w-full h-full object-cover" onerror={handleImageError} />
        <div class="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
      </div>

      <div class="px-6 sm:px-10 pb-8 -mt-8 relative z-10 flex-grow flex flex-col">
        <div class="mb-6">
          <div class="inline-flex h-7 items-center gap-2 mb-4 px-3 bg-lumiDark text-white rounded-xl shadow-md border border-gray-800">
            <span class="text-[11px] sm:text-[12px] font-black uppercase tracking-widest">{origenNombre}</span>
            <svg class="w-3.5 h-3.5 text-lumiCyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            <span class="text-[11px] sm:text-[12px] font-black uppercase tracking-widest">{destinoNombre}</span>
          </div>

          <h1 class="text-2xl sm:text-3xl md:text-4xl font-black text-lumiDark leading-tight mb-4">
            {deal?.titulo_gancho || ''}
          </h1>
          
          <div class="flex flex-wrap items-center gap-2 text-xs font-bold text-gray-500">
            <div class="inline-flex h-7 items-center justify-center gap-1.5 {ofertaExpirada ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-500 border-gray-100'} px-3 rounded-full border uppercase tracking-widest text-[10.5px]">
              {ofertaExpirada ? '⚠️ FECHAS PASADAS' : fechasCortas}
            </div>
            <div class="inline-flex h-7 items-center">
              <AmenidadesLinea {deal} paisActual={deal?.pais} />
            </div>
          </div>
        </div>

        <div class="text-[15px] sm:text-[16px] text-gray-600 leading-relaxed font-medium whitespace-pre-line text-justify mb-10">
          {#if ofertaExpirada}
            <div class="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-4 rounded-xl mb-6 font-bold flex items-center gap-3">
              <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <span>Las fechas específicas de este vuelo ya pasaron, pero puedes consultar los precios actuales haciendo clic abajo.</span>
            </div>
          {/if}
          {@html cuerpoPostLimpiado}
        </div>

        <div class="mt-auto bg-gray-50/80 -mx-6 sm:-mx-10 px-6 sm:px-10 pt-8 pb-6 border-t border-gray-100">
          <h4 class="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 text-center sm:text-left">Planifica tu viaje</h4>
          
          {#if links.esim && !esNacional}
            <div class="bg-emerald-50/80 border border-emerald-100 rounded-xl p-3 mb-4">
              <p class="text-[12px] text-emerald-900 leading-relaxed text-center sm:text-left">
                ✨ <strong>Beneficios Lumivia en Airalo:</strong> Nuevos usuarios <strong class="text-emerald-700 font-black">LUMIVIA</strong> (15% OFF) | Recurrentes <strong class="text-emerald-700 font-black">LUMIVIA10</strong> (10% OFF)
              </p>
            </div>
          {/if}

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {#if links.esim && !esNacional}
              <a href={links.esim} target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-2xl hover:border-emerald-400 hover:shadow-md transition-all group">
                <div class="w-11 h-11 rounded-full overflow-hidden border border-gray-100 shadow-sm flex-shrink-0"><img src="https://images.unsplash.com/photo-1488509082528-cefbba5ad692?q=80&w=2070&auto=format&fit=crop" alt="eSIM Airalo" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" /></div>
                <div class="flex-1 min-w-0"><p class="text-[12px] font-black text-lumiDark truncate">Internet eSIM</p><p class="text-[11px] text-gray-500 truncate">Sin Roaming</p></div>
              </a>
            {/if}
            {#if links.tours}
              <a href={links.tours} target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all group">
                <div class="w-11 h-11 rounded-full overflow-hidden border border-gray-100 shadow-sm flex-shrink-0"><img src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=150&q=80" alt="Tours Civitatis" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" /></div>
                <div class="flex-1 min-w-0"><p class="text-[12px] font-black text-lumiDark truncate">Tours & Guías</p><p class="text-[11px] text-gray-500 truncate">En español</p></div>
              </a>
            {/if}
            {#if links.hotel}
              <a href={links.hotel} target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-2xl hover:border-amber-500 hover:shadow-md transition-all group">
                <div class="w-11 h-11 rounded-full overflow-hidden border border-gray-100 shadow-sm flex-shrink-0"><img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=150&q=80" alt="Hoteles" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" /></div>
                <div class="flex-1 min-w-0"><p class="text-[12px] font-black text-lumiDark truncate">Hospedaje</p><p class="text-[11px] text-gray-500 truncate">Mapa Interactivo</p></div>
              </a>
            {/if}
            {#if links.seguro && !esNacional}
              <a href={links.seguro} target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-2xl hover:border-rose-500 hover:shadow-md transition-all group">
                <div class="w-11 h-11 rounded-full overflow-hidden border border-gray-100 shadow-sm flex-shrink-0"><img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=150&q=80" alt="Seguro Viaje" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" /></div>
                <div class="flex-1 min-w-0"><p class="text-[12px] font-black text-lumiDark truncate">Asistencia</p><p class="text-[11px] text-gray-500 truncate">Seguro Global</p></div>
              </a>
            {/if}
          </div>

          <div class="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 pt-6 gap-6">
            <div class="text-center sm:text-left w-full sm:w-auto">
              <p class="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">
                {ofertaExpirada ? 'Precio Histórico' : 'Vuelo Id / Vt'}
              </p>
              <div class="text-4xl font-black {ofertaExpirada ? 'text-gray-400 line-through' : 'text-lumiDark'} leading-none">
                ${Number(deal?.precio ?? 0).toLocaleString('en-US')}
                <span class="text-[13px] font-bold text-gray-400 uppercase ml-0.5">{monedaDeal}</span>
              </div>
            </div>
            
            <a href={linkVuelo} target="_blank" rel="noopener noreferrer" class="{ofertaExpirada ? 'bg-amber-500 hover:bg-amber-600' : 'bg-lumiDark hover:bg-black'} text-white font-bold w-full sm:w-auto px-8 h-14 rounded-full transition-all shadow-xl active:scale-95 text-[13px] uppercase tracking-wider flex items-center justify-center gap-2">
              {ofertaExpirada ? 'Buscar Fechas Actuales' : 'Ver Vuelo En Directo'} 
              <svg class="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
          </div>
        </div>

      </div>
    </div>
  </main>

  <Footer />
</div>

<style>
  .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
</style>
