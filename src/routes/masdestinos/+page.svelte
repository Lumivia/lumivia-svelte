<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  
  import { supabase } from '$lib/supabaseClient';
  import Header from '$lib/components/Header.svelte';
  import ModalOferta from '$lib/components/ModalOferta.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import WhatsAppButton from '$lib/components/WhatsAppButton.svelte'; 
  import AmenidadesLinea from '$lib/components/AmenidadesLinea.svelte';
  import { obtenerImagen } from '$lib/utils/imagenes'; 

  let { data } = $props<PageData>();

  const configMercado: Record<string, { moneda: string; bandera: string }> = {
    MX: { moneda: 'MXN', bandera: 'https://flagcdn.com/w20/mx.png' },
    CO: { moneda: 'COP', bandera: 'https://flagcdn.com/w20/co.png' },
    CL: { moneda: 'CLP', bandera: 'https://flagcdn.com/w20/cl.png' },
    CR: { moneda: 'USD', bandera: 'https://flagcdn.com/w20/cr.png' }
  };

  const destinosNacionales: Record<string, string[]> = {
    MX: ['CUN', 'MID', 'SJD', 'PVR', 'PXM', 'OAX', 'TRC', 'CUU', 'MEX', 'GDL', 'MTY', 'TIJ'],
    CO: ['CTG', 'SMR', 'ADZ', 'BGA', 'PEI', 'BOG', 'MDE', 'CLO'],
    CL: ['CJC', 'PUQ', 'PMC', 'IQQ', 'SCL', 'LSC', 'ZCO', 'BBA'],
    CR: ['SJO', 'LIR']
  };

  const paisActual = $derived(data.pais || 'MX');
  const monedaActual = $derived(configMercado[paisActual]?.moneda ?? 'MXN');
  const banderaActual = $derived(configMercado[paisActual]?.bandera ?? 'https://flagcdn.com/w20/mx.png');
  
  let dropdownAbierto = $state(false);
  let modalAbierto = $state(false);
  let dealSeleccionado = $state<any | null>(null);

  let leadNombre = $state('');
  let leadOrigen = $state('');
  let leadDestino = $state('');
  let leadMes = $state('');
  let leadContacto = $state('');
  let radarEnviando = $state(false);
  let radarExito = $state(false);

  let nlEmail = $state('');
  let nlMensaje = $state('');
  let nlEstado = $state<'ok' | 'ya' | 'error' | ''>('');
  let nlEnviando = $state(false);

  let mesesDisponibles = $state<string[]>([]);
  let vuelosReportados = $state(new Set<number | string>());

  // 🔥 EL ESCUDO DE TITANIO
  const fallbackPremium = 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=800&q=80';
  
  function handleImageError(e: Event) {
    (e.target as HTMLImageElement).src = fallbackPremium;
  }

  const urlEsValida = (url: any) => {
    if (!url) return false;
    const s = String(url);
    return s.startsWith('http') && !s.includes('null') && !s.includes('undefined') && !s.includes('REVISION_MANUAL');
  };

  function toggleDropdown() { dropdownAbierto = !dropdownAbierto; }
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('#selector-pais-catalogo')) dropdownAbierto = false;
  }
  function volverAlPais() {
    const paisGuardado = typeof window !== 'undefined' ? localStorage.getItem('lumivia_pais') : null;
    goto('/paises/' + (paisGuardado?.toLowerCase() || 'mx'));
  }
  function seleccionarPais(codigoPais: string) {
    dropdownAbierto = false;
    if (typeof window !== 'undefined') localStorage.setItem('lumivia_pais', codigoPais);
    goto(`/masdestinos?pais=${codigoPais.toUpperCase()}&page=1`);
  }
  function irAPagina(n: number) {
    if (n < 1 || n > data.totalPages) return;
    goto(`/masdestinos?pais=${paisActual.toUpperCase()}&page=${n}`);
  }

  function calcularTiempoTranscurrido(fechaISO: string | null) {
    if (!fechaISO) return 'Recientemente';
    const fechaCreacion = new Date(fechaISO);
    const ahora = new Date();
    const diferenciaSegundos = Math.floor((+ahora - +fechaCreacion) / 1000);
    if (diferenciaSegundos < 60) return `Hace ${diferenciaSegundos} seg`;
    const diferenciaMinutos = Math.floor(diferenciaSegundos / 60);
    if (diferenciaMinutos < 60) return `Hace ${diferenciaMinutos} min`;
    const diferenciaHoras = Math.floor(diferenciaMinutos / 60);
    if (diferenciaHoras < 24) return `Hace ${diferenciaHoras} horas`;
    const diferenciaDias = Math.floor(diferenciaHoras / 24);
    return `Hace ${diferenciaDias} días`;
  }

  function formatearFechaCorta(fechaCadena: string | null) {
    if (!fechaCadena) return '';
    if (!fechaCadena.includes('-')) return fechaCadena;
    const partes = fechaCadena.split('-');
    if (partes.length !== 3) return fechaCadena;
    const año = parseInt(partes[0]);
    const mes = parseInt(partes[1]) - 1;
    const dia = parseInt(partes[2]);
    const fechaObj = new Date(año, mes, dia);
    const opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return fechaObj.toLocaleDateString('es-ES', opciones).replace('.', '');
  }

  function handleSubmitNewsletter(e: Event) { e.preventDefault(); enviarNewsletter(); }
  function handleSubmitRadar(e: Event) { e.preventDefault(); enviarRadar(); }

  async function enviarNewsletter() {
    nlEnviando = true; nlMensaje = ''; nlEstado = '';
    const { error } = await supabase.from('suscriptores_radar').insert([{ email: nlEmail.toLowerCase(), pais: paisActual, nombre: 'Viajero' }]);
    nlEnviando = false;
    if (!error) { nlMensaje = '¡Listo! Te avisaremos de las mejores gangas.'; nlEstado = 'ok'; nlEmail = ''; } 
    else if ((error as any).code === '23505') { nlMensaje = '¡Ya estás en nuestra lista!'; nlEstado = 'ya'; } 
    else { nlMensaje = 'Error de conexión. Intenta de nuevo.'; nlEstado = 'error'; }
  }

  async function enviarRadar() {
    radarEnviando = true; radarExito = false;
    const { error } = await supabase.from('radares_personales').insert([{ nombre: leadNombre, origen: leadOrigen, destino: leadDestino, mes_esperado: leadMes, contacto: leadContacto, status: 'pendiente_verificacion' }]);
    radarEnviando = false;
    if (!error) { radarExito = true; leadNombre = leadOrigen = leadDestino = leadMes = leadContacto = ''; } 
    else { alert('Hubo un error al guardar. Intenta de nuevo.'); console.error(error); }
  }

  async function reportarCambioPrecio(id: number | string, e?: Event) {
    if (e) e.stopPropagation();
    if (vuelosReportados.has(id)) return;
    const nuevoSet = new Set(vuelosReportados);
    nuevoSet.add(id); vuelosReportados = nuevoSet;
    try { const { error } = await supabase.rpc('incrementar_reporte', { p_deal_id: id.toString() }); if (error) throw error; } catch (err) { console.error('Error al reportar:', err); }
  }

  async function copiarUrlUnica(id: number | string, e?: Event) {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}/r/${id}`;
    try { await navigator.clipboard.writeText(url); alert('¡Enlace copiado! Listo para compartir.'); } catch (err) { console.error(err); }
  }

  function abrirModal(deal: any) { dealSeleccionado = deal; modalAbierto = true; }
  function cerrarModal() { modalAbierto = false; setTimeout(() => { dealSeleccionado = null; }, 200); }

  onMount(() => {
    if (typeof window !== 'undefined') window.addEventListener('click', handleClickOutside);
    const fechaActual = new Date();
    const meses: string[] = [];
    for (let i = 0; i < 12; i++) {
      const fechaFutura = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + i, 1);
      const mesTexto = fechaFutura.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      meses.push(mesTexto.charAt(0).toUpperCase() + mesTexto.slice(1));
    }
    mesesDisponibles = meses;

    if (typeof window !== 'undefined') {
      let paisLocal = localStorage.getItem('lumivia_pais');
      if (!paisLocal) {
        fetch('https://1.1.1.1/cdn-cgi/trace').then((res) => res.text()).then((text) => {
            const locLine = text.split('\n').find((line) => line.startsWith('loc='));
            const countryCode = locLine ? locLine.split('=')[1] : 'MX';
            const paisesAprobados = ['MX', 'CO', 'CL', 'CR'];
            paisLocal = paisesAprobados.includes(countryCode) ? countryCode : 'MX';
            localStorage.setItem('lumivia_pais', paisLocal!);
          }).catch(() => { localStorage.setItem('lumivia_pais', 'MX'); });
      }
    }
    return () => { if (typeof window !== 'undefined') window.removeEventListener('click', handleClickOutside); };
  });
</script>

<svelte:head>
  <title>Lumivia | Catálogo de Oportunidades</title>
  <meta name="description" content="Descubre oportunidades únicas de vuelos baratos. Catálogo completo de tarifas ocultas." />
  {#if data.schemaJSON}
    {@html `<script type="application/ld+json">${data.schemaJSON}</script>`}
  {/if}
</svelte:head>

<div class="bg-gray-50 text-lumiDark min-h-screen flex flex-col relative">

  <header class="bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-200/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button onclick={volverAlPais} class="text-gray-400 hover:text-lumiDark transition-colors cursor-pointer" title="Volver al inicio" type="button">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <span class="text-2xl font-extrabold tracking-tighter text-lumiDark">Lumivia <span class="text-lumiCyan font-light">| Catálogo</span></span>
      </div>

      <div class="flex items-center gap-4">
        <a href="https://vuelos.lumivia.app/" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-lumiDark transition-colors hidden sm:flex">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> Vuelos
        </a>
        <a href="https://www.stay22.com/allez/roam?aid=lumivia" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-lumiCyan transition-colors hidden sm:flex">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> Hoteles
        </a>
        <div class="h-4 w-px bg-gray-200 hidden sm:block"></div>

        <div id="selector-pais-catalogo" class="relative inline-block text-left">
          <button type="button" onclick={toggleDropdown} aria-expanded={dropdownAbierto} class="inline-flex items-center justify-center w-full rounded-full border border-gray-200 shadow-sm px-4 py-1.5 bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 focus:outline-none focus:border-lumiCyan transition-colors gap-2 cursor-pointer">
            <img src={banderaActual} alt={paisActual} class="w-4 h-auto rounded-sm shadow-sm" />
            <span>{monedaActual}</span>
            <svg class="w-3 h-3 text-gray-400 transition-transform" style={`transform: rotate(${dropdownAbierto ? '180deg' : '0deg'})`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </button>

          {#if dropdownAbierto}
            <div class="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black/5 focus:outline-none z-50 overflow-hidden border border-gray-100 animate-fadeIn" role="menu">
              <div class="py-1">
                <a href={`/masdestinos?pais=MX&page=1`} onclick={() => seleccionarPais('MX')} data-sveltekit-preload-data="hover" class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors"><img src="https://flagcdn.com/w20/mx.png" alt="MX" class="w-5 h-auto rounded-sm shadow-sm" /> México (MXN)</a>
                <a href={`/masdestinos?pais=CO&page=1`} onclick={() => seleccionarPais('CO')} data-sveltekit-preload-data="hover" class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors"><img src="https://flagcdn.com/w20/co.png" alt="CO" class="w-5 h-auto rounded-sm shadow-sm" /> Colombia (COP)</a>
                <a href={`/masdestinos?pais=CL&page=1`} onclick={() => seleccionarPais('CL')} data-sveltekit-preload-data="hover" class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors"><img src="https://flagcdn.com/w20/cl.png" alt="CL" class="w-5 h-auto rounded-sm shadow-sm" /> Chile (CLP)</a>
                <a href={`/masdestinos?pais=CR&page=1`} onclick={() => seleccionarPais('CR')} data-sveltekit-preload-data="hover" class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors"><img src="https://flagcdn.com/w20/cr.png" alt="CR" class="w-5 h-auto rounded-sm shadow-sm" /> Costa Rica (USD)</a>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12 flex-grow w-full relative z-10">
    <div class="mb-12 text-center relative z-10">
      <h1 class="text-3xl md:text-4xl font-black tracking-tight text-lumiDark mb-6">Catálogo de Oportunidades</h1>
      <div class="max-w-xl mx-auto mb-6 relative z-20 group">
        <div class="bg-white/80 backdrop-blur-xl p-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-200 flex flex-col sm:flex-row items-center gap-2 transform transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgb(0,210,255,0.15)] ring-1 ring-black/5">
          <div class="pl-4 text-gray-400 hidden sm:block"><svg class="w-5 h-5 text-lumiCyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
          <form class="w-full flex flex-col sm:flex-row gap-2" onsubmit={handleSubmitNewsletter}>
            <input type="email" placeholder="Ingresa tu correo para recibir nuestra selección..." required class="w-full bg-transparent border-none focus:ring-0 text-lumiDark placeholder-gray-400 px-4 py-2 text-sm outline-none" bind:value={nlEmail} />
            <button type="submit" class="bg-lumiDark text-white hover:bg-black px-6 py-2.5 rounded-full font-bold transition-all shadow-md active:scale-95 text-sm whitespace-nowrap w-full sm:w-auto" disabled={nlEnviando}>{nlEnviando ? 'Guardando...' : 'Suscribirme Gratis'}</button>
          </form>
        </div>
        {#if nlEstado !== ''}
          <p class="text-center text-sm font-bold mt-4 {nlEstado === 'ok' ? 'text-emerald-500' : nlEstado === 'ya' ? 'text-lumiCyan' : 'text-red-500'}">{nlMensaje}</p>
        {/if}
      </div>
    </div>

    <div id="hook-deals" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20 relative z-10">
      {#if !data.deals || data.deals.length === 0}
        <div class="col-span-full text-center text-gray-400 py-20 font-medium">Aún no hay ofertas activas en la bóveda de {paisActual}.</div>
      {:else}
        {#each data.deals as deal (deal.id)}
          {@const imgOriginal = obtenerImagen(deal)}
          {@const imgFinal = urlEsValida(imgOriginal) ? imgOriginal : urlEsValida(deal.imagen_fallback) ? deal.imagen_fallback : fallbackPremium}
          {@const tiempoTranscurrido = calcularTiempoTranscurrido(deal.created_at)}
          {@const fechasCortas = `${formatearFechaCorta(deal.fecha_salida)} - ${formatearFechaCorta(deal.fecha_regreso)}`}
          {@const esVip = deal.tipo_vuelo === 'directo'}
          {@const monedaDeal = (deal.moneda || deal.currency || monedaActual).toUpperCase()}
          {@const origenSeguro = String(deal.origen_nombre || deal.origen || '').toUpperCase()}
          {@const destinoSeguro = String(deal.destino_nombre || deal.destino || '').toUpperCase()}

          <div 
            role="button" 
            tabindex="0" 
            aria-label="Ver detalles de la oferta {deal.titulo_gancho}"
            class="card-minimal flex flex-col group/card hover:shadow-2xl transition-all duration-300 h-full bg-white rounded-2xl overflow-hidden border border-gray-100 cursor-pointer {vuelosReportados.has(deal.id) ? 'opacity-40 grayscale' : ''}" 
            onclick={() => abrirModal(deal)}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirModal(deal); } }}
          >
            <div class="relative h-56 overflow-hidden bg-gray-100 shrink-0">
              <img src={imgFinal} alt={deal.titulo_gancho || 'Oferta Especial'} loading="lazy" class="w-full h-full object-cover transform group-hover/card:scale-105 transition-transform duration-700 ease-out" onerror={handleImageError} />
              <div class="absolute inset-0 bg-gradient-to-t from-lumiDark/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>

              <div class="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-lumiDark text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm tracking-wide border border-white/50 uppercase flex items-center gap-1">
                ⏱️ {tiempoTranscurrido}
              </div>

              {#if esVip}
                <div class="absolute top-4 right-4 badge-vip-glass text-white text-[10px] font-black px-3 py-1.5 rounded-full z-10 flex items-center gap-1.5 uppercase tracking-widest shadow-lg">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> Directo
                </div>
              {/if}

              <button type="button" onclick={(e) => { e.stopPropagation(); reportarCambioPrecio(deal.id, e); }} title="¿El precio subió? Repórtalo" class="absolute bottom-3 right-3 bg-white/80 hover:bg-red-50 text-gray-500 hover:text-red-500 backdrop-blur-sm p-2.5 rounded-full shadow-sm border border-white/50 transition-colors z-10 cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-1 6-1-1H11.5l-1-1H5v10m0 0h4"/></svg>
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
                {deal.titulo_gancho || 'Oferta Especial'}
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
                  <button type="button" onclick={(e) => { e.stopPropagation(); copiarUrlUnica(deal.id, e); }} title="Compartir enlace" class="text-gray-400 hover:text-lumiCyan hover:bg-lumiCyan/10 transition-colors p-2.5 rounded-full cursor-pointer">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                  </button>
                  
                  <div class="bg-lumiDark text-white group-hover/card:bg-lumiCyan group-hover/card:text-lumiDark px-5 py-2.5 rounded-full font-black text-[11px] sm:text-xs transition-all shadow-md group-hover/card:shadow-lg active:scale-95 cursor-pointer flex items-center gap-1.5 uppercase tracking-wider">
                    Ver Vuelo
                    <svg class="w-4 h-4 transition-transform group-hover/card:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>

    {#if data.totalPages > 1}
      <div class="flex justify-center items-center gap-3 mt-10 mb-20">
        <button type="button" onclick={() => irAPagina(data.page - 1)} disabled={data.page <= 1} class="px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold text-sm">← Anterior</button>
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full">
          {#each Array(data.totalPages) as _, i}
            {@const n = i + 1}
            {#if Math.abs(data.page - n) <= 2 || n === 1 || n === data.totalPages}
              <button type="button" onclick={() => irAPagina(n)} class="w-9 h-9 flex items-center justify-center shrink-0 rounded-full text-sm font-bold transition-all {data.page === n ? 'bg-lumiCyan text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}">{n}</button>
            {:else if Math.abs(data.page - n) === 3}
              <span class="text-gray-400 font-bold px-1">...</span>
            {/if}
          {/each}
        </div>
        <button type="button" onclick={() => irAPagina(data.page + 1)} disabled={data.page >= data.totalPages} class="px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold text-sm">Siguiente →</button>
      </div>
    {/if}

    <section class="max-w-3xl mx-auto mb-24">
      <div class="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <h2 class="text-2xl font-black text-lumiDark mb-4 text-center">Radar Personal</h2>
        <p class="text-gray-500 text-center mb-8 text-sm leading-relaxed">Cuéntanos qué vuelo buscas y te avisamos cuando aparezca una ganga real.</p>
        <form class="space-y-6" onsubmit={handleSubmitRadar}>
          <div>
            <label for="radar-nombre" class="block text-xs font-semibold text-gray-400 mb-1">Tu Nombre</label>
            <input id="radar-nombre" type="text" bind:value={leadNombre} required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-lumiCyan focus:border-lumiCyan outline-none text-sm" placeholder="Ej. Ana" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="radar-origen" class="block text-xs font-semibold text-gray-400 mb-1">Origen</label>
              <input id="radar-origen" type="text" bind:value={leadOrigen} required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-lumiCyan focus:border-lumiCyan outline-none text-sm" placeholder="Ej. MEX" />
            </div>
            <div>
              <label for="radar-destino" class="block text-xs font-semibold text-gray-400 mb-1">Destino</label>
              <input id="radar-destino" type="text" bind:value={leadDestino} required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-lumiCyan focus:border-lumiCyan outline-none text-sm" placeholder="Ej. JFK" />
            </div>
          </div>
          <div>
            <label for="radar-mes" class="block text-xs font-semibold text-gray-400 mb-1">Mes aproximado</label>
            <select id="radar-mes" bind:value={leadMes} required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-lumiCyan focus:border-lumiCyan outline-none text-sm bg-white">
              <option value="" disabled>Selecciona un mes</option>
              {#each mesesDisponibles as mes}
                <option value={mes}>{mes}</option>
              {/each}
            </select>
          </div>
          <div>
            <label for="radar-contacto" class="block text-xs font-semibold text-gray-400 mb-1">Correo Electrónico</label>
            <input id="radar-contacto" type="email" bind:value={leadContacto} required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-lumiCyan focus:border-lumiCyan outline-none text-sm" placeholder="ejemplo@correo.com" />
          </div>
          <button type="submit" class="w-full bg-lumiCyan text-white font-bold py-3 rounded-xl hover:bg-lumiDark transition-all active:scale-95 shadow-md" disabled={radarEnviando}>
            {radarEnviando ? 'Enviando...' : 'Activar Radar'}
          </button>
          {#if radarExito}
            <p class="text-center text-emerald-500 font-bold text-sm mt-4">¡Radar activado! Te avisaremos cuando aparezca una ganga.</p>
          {/if}
        </form>
      </div>
    </section>
  </main>

  <WhatsAppButton pais={paisActual} />
  <Footer />

  {#if modalAbierto && dealSeleccionado}
    <ModalOferta deal={dealSeleccionado} abierto={modalAbierto} cerrar={cerrarModal} />
  {/if}
</div>

<style>
  .card-minimal {
    background: #ffffff;
    border: 1px solid #f3f4f6;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .card-minimal:hover {
    transform: translateY(-4px);
    border: 1px solid #e5e7eb;
  }
  .badge-vip-glass {
    background: linear-gradient(135deg, rgba(194, 155, 87, 0.9) 0%, rgba(218, 186, 116, 0.95) 100%);
    backdrop-filter: blur(8px);
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.25s ease-out;
  }
</style>
