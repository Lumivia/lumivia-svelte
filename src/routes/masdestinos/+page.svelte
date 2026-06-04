<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores'; 
  import { afterNavigate } from '$app/navigation'; 
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

  const paisActual = $derived(String(data.pais || 'MX').split('?')[0].split('&')[0].toUpperCase());
  const monedaActual = $derived(configMercado[paisActual]?.moneda ?? 'MXN');
  const banderaActual = $derived(configMercado[paisActual]?.bandera ?? 'https://flagcdn.com/w20/mx.png');
  
  const urlCanonica = $derived(`https://www.lumivia.app${$page.url.pathname}`);
  
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
  let radarError = $state(false);

  let nlEmail = $state('');
  let nlMensaje = $state('');
  let nlEstado = $state<'ok' | 'ya' | 'error' | ''>('');
  let nlEnviando = $state(false);

  let mesesDisponibles = $state<string[]>([]);
  let vuelosReportados = $state(new Set<number | string>());

  const isAdminModo = $derived($page.url.searchParams.get('admin') === 'true');
  let cargandoAdmin = $state(false);

  const origenFiltroActual = $derived(data.origenFiltroActual);
  const origenesDisponibles = $derived(data.origenesDisponibles || []);

  afterNavigate(({ type }) => {
    if (type === 'popstate') {
      window.location.reload();
    }
  });

  function checarSiEstaMuerta(deal: any, reportados: Set<number | string>) {
    if (deal?.expirada_manualmente) return true;
    if (reportados.has(deal.id)) return true;
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
  }

  async function handleMatarOferta(id: number | string, e: Event) {
    e.stopPropagation();
    const password = prompt("Ingresa la contraseña de administrador para matar esta oferta:");
    if (!password) return;

    cargandoAdmin = true;
    try {
      const res = await fetch('/api/matar-oferta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, secret: password })
      });
      
      if (res.ok) {
        window.location.reload(); 
      } else {
        alert("Contraseña incorrecta o error en el servidor.");
      }
    } catch (error) {
      alert("Error de conexión.");
    }
    cargandoAdmin = false;
  }

  function handleImageError(e: Event) {
    const img = e.target as HTMLImageElement;
    img.onerror = null;
    img.src = 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=800&q=80';
  }

  function toggleDropdown() { dropdownAbierto = !dropdownAbierto; }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('#selector-pais-catalogo')) dropdownAbierto = false;
  }

  function seleccionarPais(codigoPais: string) {
    dropdownAbierto = false;
    localStorage.setItem('lumivia_pais', codigoPais);
    window.location.href = `/masdestinos?pais=${codigoPais.toUpperCase()}&page=1`;
  }

  function aplicarFiltro(origenIata: string | null) {
      const url = new URL(window.location.href);
      url.searchParams.set('page', '1'); 
      if (origenIata) {
          url.searchParams.set('origen', origenIata);
      } else {
          url.searchParams.delete('origen'); 
      }
      window.location.href = url.toString();
  }

  function irAPagina(n: number) {
    if (n < 1 || n > data.totalPages) return;
    const url = new URL(window.location.href);
    url.searchParams.set('page', n.toString());
    window.location.href = url.toString();
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
    try {
      const soloFecha = String(fechaCadena).split('T')[0];
      const partes = soloFecha.split('-');
      if (partes.length !== 3) return soloFecha;
      const año = parseInt(partes[0]);
      const mes = parseInt(partes[1]) - 1;
      const dia = parseInt(partes[2]);
      const fechaObj = new Date(año, mes, dia);
      return fechaObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '').toUpperCase();
    } catch {
      return String(fechaCadena);
    }
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
    radarEnviando = true; radarExito = false; radarError = false;
    const { error } = await supabase.from('radares_personales').insert([{ nombre: leadNombre, origen: leadOrigen, destino: leadDestino, mes_esperado: leadMes, contacto: leadContacto, status: 'pendiente_verificacion' }]);
    radarEnviando = false;
    if (!error) { radarExito = true; leadNombre = leadOrigen = leadDestino = leadMes = leadContacto = ''; } 
    else { radarError = true; console.error(error); }
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
    const url = `${window.location.origin}/oferta/${id}`; 
    try { await navigator.clipboard.writeText(url); alert('¡Enlace copiado! Listo para compartir.'); } catch (err) { console.error(err); }
  }

  function abrirModal(deal: any) { dealSeleccionado = deal; modalAbierto = true; }
  function cerrarModal() { modalAbierto = false; setTimeout(() => { dealSeleccionado = null; }, 200); }

  $effect(() => {
    if (paisActual) {
      localStorage.setItem('lumivia_pais', paisActual);
    }
  });

  onMount(() => {
    window.addEventListener('click', handleClickOutside);
    const fechaActual = new Date();
    const meses: string[] = [];
    for (let i = 0; i < 12; i++) {
      const fechaFutura = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + i, 1);
      const mesTexto = fechaFutura.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      meses.push(mesTexto.charAt(0).toUpperCase() + mesTexto.slice(1));
    }
    mesesDisponibles = meses;
    return () => { window.removeEventListener('click', handleClickOutside); };
  });
</script>

<svelte:head>
  <title>Lumivia | Catálogo de Oportunidades Premium</title>
  <meta name="description" content="Descubre oportunidades únicas de vuelos baratos. Catálogo completo de tarifas ocultas." />
  <link rel="canonical" href={urlCanonica} />
  {#if data.schemaJSON}
    {@html `<script type="application/ld+json">${data.schemaJSON}</script>`}
  {/if}
</svelte:head>

<div class="bg-gradient-to-b from-[#f8fafc] via-white to-white text-lumiDark min-h-screen flex flex-col relative overflow-x-hidden">
  
  <header class="bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100/80 shadow-sm">
    <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <a data-sveltekit-reload href={`/paises/${paisActual.toLowerCase()}`} class="text-gray-400 hover:text-lumiCyan transition-colors cursor-pointer" title="Volver a los destinos de {paisActual}">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </a>
        <span class="text-3xl font-black tracking-tighter text-lumiDark">Lumivia <span class="text-lumiCyan font-light">| Catálogo</span></span>
      </div>

      <div class="flex items-center gap-4 sm:gap-6">
        <a href="https://vuelos.lumivia.app/" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-lumiCyan transition-colors hidden sm:flex">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <span class="hidden sm:inline">Vuelos</span>
        </a>

        <a href="https://www.stay22.com/allez/roam?aid=lumivia" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-lumiCyan transition-colors hidden sm:flex">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          <span class="hidden sm:inline">Hoteles</span>
        </a>

        <div class="h-5 w-px bg-gray-200 hidden sm:block"></div>

        <div id="selector-pais-catalogo" class="relative inline-block text-left">
          <button type="button" onclick={toggleDropdown} aria-expanded={dropdownAbierto} class="inline-flex items-center justify-center w-full rounded-full border border-gray-200 px-4 py-1.5 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-lumiCyan/50 transition-all gap-2 cursor-pointer shadow-sm">
            <img src={banderaActual} alt={paisActual} class="w-4 h-auto rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.1)]" />
            <span class="text-xs font-black text-lumiDark tracking-wide">{monedaActual}</span>
            <svg class="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" style={`transform: rotate(${dropdownAbierto ? '180deg' : '0deg'})`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" /></svg>
          </button>

          {#if dropdownAbierto}
            <div class="origin-top-right absolute right-0 mt-2 w-48 rounded-2xl shadow-xl bg-white ring-1 ring-black/5 z-50 overflow-hidden border border-gray-100 animate-fadeIn" role="menu">
              <div class="py-1">
                <button type="button" onclick={() => seleccionarPais('MX')} class="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors text-left border-b border-gray-50"><img src="https://flagcdn.com/w20/mx.png" alt="MX" class="w-5 h-auto rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.1)]" /> México <span class="text-gray-400 text-xs font-semibold ml-auto">MXN</span></button>
                <button type="button" onclick={() => seleccionarPais('CO')} class="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors text-left border-b border-gray-50"><img src="https://flagcdn.com/w20/co.png" alt="CO" class="w-5 h-auto rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.1)]" /> Colombia <span class="text-gray-400 text-xs font-semibold ml-auto">COP</span></button>
                <button type="button" onclick={() => seleccionarPais('CL')} class="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors text-left border-b border-gray-50"><img src="https://flagcdn.com/w20/cl.png" alt="CL" class="w-5 h-auto rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.1)]" /> Chile <span class="text-gray-400 text-xs font-semibold ml-auto">CLP</span></button>
                <button type="button" onclick={() => seleccionarPais('CR')} class="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors text-left"><img src="https://flagcdn.com/w20/cr.png" alt="CR" class="w-5 h-auto rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.1)]" /> Costa Rica <span class="text-gray-400 text-xs font-semibold ml-auto">USD</span></button>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </header>

  <main class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12 flex-grow w-full relative z-10">
    
    <div class="mb-12 text-center relative z-10">
      <h1 class="text-3xl md:text-4xl font-black tracking-tight text-lumiDark mb-6 leading-tight">Catálogo de Oportunidades</h1>
      <div class="max-w-xl mx-auto mb-6 relative z-20 group">
        <div class="bg-white/80 backdrop-blur-xl p-2 rounded-full shadow-lg border border-gray-200 flex flex-col sm:flex-row items-center gap-2 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
          <form class="w-full flex flex-col sm:flex-row gap-2" onsubmit={handleSubmitNewsletter}>
            <input type="email" placeholder="Ingresa tu correo para recibir nuestra selección VIP..." required class="w-full bg-transparent border-none focus:ring-0 text-lumiDark placeholder-gray-400 px-5 py-2 text-sm outline-none" bind:value={nlEmail} />
            <button type="submit" class="bg-gradient-to-r from-[#00d2ff] to-[#0096ff] text-white px-8 py-3 rounded-full font-black transition-all hover:brightness-110 active:scale-95 text-sm whitespace-nowrap w-full sm:w-auto shadow-md" disabled={nlEnviando}>{nlEnviando ? 'Guardando...' : 'Suscribirme Gratis'}</button>
          </form>
        </div>
        {#if nlEstado !== ''}
          <p class="text-center text-sm font-bold mt-4 {nlEstado === 'ok' ? 'text-emerald-600' : nlEstado === 'ya' ? 'text-lumiCyan' : 'text-red-500'}">{nlMensaje}</p>
        {/if}
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
      
      <aside class="w-full lg:w-[250px] shrink-0 flex flex-col gap-6 lg:sticky lg:top-24 z-20">
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4">
          <div class="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-1">
             <h3 class="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Filtrar por Origen</h3>
          </div>
          
          <div class="flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            <button type="button" onclick={() => aplicarFiltro(null)} class="text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-2.5 {origenFiltroActual === null ? 'bg-[#00d2ff]/10 text-[#0096ff] font-black border border-[#00d2ff]/30 shadow-sm' : 'text-gray-600 hover:bg-gray-50 font-semibold'}">
              <span>Mostrar Todos</span>
            </button>
            
            {#each origenesDisponibles as origen}
              <button type="button" onclick={() => aplicarFiltro(origen.codigo)} class="text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-between {origenFiltroActual === origen.codigo ? 'bg-[#00d2ff]/10 text-[#0096ff] font-black border border-[#00d2ff]/30 shadow-sm' : 'text-gray-600 hover:bg-gray-50 font-semibold'}">
                <span class="truncate pr-2">{origen.nombre}</span>
                <span class="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded shadow-inner shrink-0 {origenFiltroActual === origen.codigo ? 'bg-[#0096ff] text-white' : 'bg-gray-100 text-gray-500 border border-gray-200'}">{origen.codigo}</span>
              </button>
            {/each}
          </div>
        </div>
      </aside>

      <div class="flex-grow w-full min-w-0 relative z-10">
        <div id="hook-deals" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20 relative z-10">
          {#if !data.deals || data.deals.length === 0}
            <div class="col-span-full text-center text-gray-400 py-32 font-medium bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center gap-4">
              <span>No hay ofertas activas desde este origen actualmente.<br/>Prueba seleccionando otro en el menú izquierdo.</span>
            </div>
          {:else}
            {#each data.deals as deal (deal.id)}
              {@const estaMuerta = checarSiEstaMuerta(deal, vuelosReportados)}
              {@const imgFinal = obtenerImagen(deal)}
              {@const tiempoTranscurrido = calcularTiempoTranscurrido(deal.created_at)}
              {@const fechasCortas = `${formatearFechaCorta(deal.fecha_salida)} - ${formatearFechaCorta(deal.fecha_regreso)}`}
              {@const esVip = deal.tipo_vuelo === 'directo' || deal.escalas === 0}
              {@const monedaDeal = (deal.moneda || deal.currency || monedaActual).toUpperCase()}
              {@const origenSeguro = String(deal.origen_nombre || deal.origen || '').toUpperCase()}
              {@const destinoSeguro = String(deal.destino_nombre || deal.destino || '').toUpperCase()}

              <div 
                role="button" 
                tabindex="0" 
                class="flex flex-col group/card bg-white rounded-[24px] overflow-hidden border border-gray-200 cursor-pointer shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-gray-300 {estaMuerta ? 'opacity-60 grayscale hover:grayscale-0' : ''}" 
                onclick={() => abrirModal(deal)}
                onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirModal(deal); } }}
              >
                <div class="relative h-60 overflow-hidden bg-gray-100 shrink-0">
                  <img src={imgFinal} loading="lazy" class="w-full h-full object-cover transform group-hover/card:scale-105 transition-transform duration-700 ease-out" onerror={handleImageError} />
                  
                  {#if isAdminModo && !estaMuerta}
                    <button type="button" onclick={(e) => handleMatarOferta(deal.id, e)} disabled={cargandoAdmin} class="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-full font-black text-[10px] shadow-lg z-30 uppercase">
                      {cargandoAdmin ? '...' : 'MATAR OFERTA'}
                    </button>
                  {/if}

                  {#if estaMuerta}
                    <div class="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                      <div class="bg-black/80 text-white font-black px-6 py-2.5 rounded-full uppercase tracking-widest text-[11px]">
                        Fechas Pasadas / Expirada
                      </div>
                    </div>
                  {/if}

                  {#if tiempoTranscurrido && !estaMuerta}
                    <div class="absolute top-4 left-4 bg-white/95 text-lumiDark text-[10px] font-bold px-3 py-2 rounded-xl shadow-md uppercase tracking-wide">
                      {tiempoTranscurrido}
                    </div>
                  {/if}

                  {#if esVip}
                    <div class="absolute top-4 right-4 bg-white/95 text-emerald-800 text-[10px] font-black px-3 py-2 rounded-xl z-10 uppercase tracking-widest shadow-md border border-emerald-100">
                      Directo
                    </div>
                  {:else if typeof deal?.escalas === 'number'}
                    <div class="absolute top-4 right-4 bg-white/95 text-gray-800 text-[10px] font-bold px-3 py-2 rounded-xl z-10 uppercase tracking-widest shadow-md border border-gray-100">
                      {deal.escalas} Escala{deal.escalas > 1 ? 's' : ''}
                    </div>
                  {/if}
                </div>

                <div class="p-6 flex flex-col flex-grow bg-white relative">
                  <div class="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                      <div class="flex flex-col items-center shrink-0">
                          <span class="text-2xl sm:text-3xl font-extrabold text-lumiDark tracking-tighter leading-none">{deal.origen}</span>
                          <span class="text-[10px] text-gray-400 font-semibold truncate max-w-[70px] uppercase mt-1 tracking-wider">{origenSeguro}</span>
                      </div>
                      <div class="flex-grow flex items-center gap-1.5 text-gray-300">
                          <div class="h-px flex-grow bg-gray-200"></div>
                          <svg class="w-5 h-5 shrink-0 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                          <div class="h-px flex-grow bg-gray-200"></div>
                      </div>
                      <div class="flex flex-col items-center shrink-0">
                          <span class="text-2xl sm:text-3xl font-extrabold text-lumiDark tracking-tighter leading-none">{deal.destino}</span>
                          <span class="text-[10px] text-gray-400 font-semibold truncate max-w-[70px] uppercase mt-1 tracking-wider">{destinoSeguro}</span>
                      </div>
                  </div>

                  <h3 class="text-lg font-extrabold mb-4 text-gray-900 group-hover/card:text-[#0096ff] transition-colors leading-tight line-clamp-2 h-11 flex items-center">
                    {deal.titulo_gancho || 'Oferta Especial'}
                  </h3>

                  <AmenidadesLinea {deal} {paisActual} />

                  <div class="mt-auto pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 sm:gap-0">
                    <div class="flex flex-col">
                      <p class="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold mb-1">{estaMuerta ? 'Precio Pasado' : 'Precio Id/Vt'}</p>
                      <p class="text-4xl font-black {estaMuerta ? 'text-gray-400 line-through' : 'text-lumiDark'} leading-none tracking-tighter flex items-start">
                        <span class="text-lg font-bold text-gray-400 mt-1.5 mr-1">$</span>
                        {Number(deal.precio ?? deal.price ?? 0).toLocaleString('en-US')} 
                        <span class="text-xs font-bold text-gray-400 align-baseline ml-1.5 self-end pb-0.5">{monedaDeal}</span>
                      </p>
                    </div>

                    <div class="flex items-center gap-2.5">
                      <button type="button" onclick={(e) => { e.stopPropagation(); copiarUrlUnica(deal.id, e); }} title="Compartir enlace" class="text-gray-400 hover:text-[#0096ff] transition-colors p-2.5 rounded-xl border border-gray-200 hover:border-[#0096ff]/30 hover:bg-[#0096ff]/5 cursor-pointer active:scale-95 shadow-sm">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                      </button>

                      <div class="{estaMuerta ? 'bg-gray-200 text-gray-500' : 'bg-gradient-to-r from-[#00d2ff] to-[#0096ff] text-white hover:brightness-110 shadow-md'} px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm transition-all duration-300 active:scale-95 flex items-center gap-2.5 uppercase tracking-widest">
                        {estaMuerta ? 'Ver Actuales' : 'Ver Vuelo'} 
                        <svg class="w-4 h-4 transition-transform duration-300 group-hover/card:translate-x-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          {/if}
        </div>

        {#if data.totalPages > 1}
          <div class="flex justify-center items-center gap-3 mb-20 relative z-10 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm w-fit mx-auto">
            <button type="button" onclick={() => irAPagina(data.page - 1)} disabled={data.page <= 1} class="px-5 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold text-xs uppercase tracking-wider">Anterior</button>
            <div class="flex items-center gap-2 max-w-[200px] sm:max-w-none overflow-x-auto custom-scrollbar-h pb-2 sm:pb-0">
              {#each Array(data.totalPages) as _, i}
                {@const n = i + 1}
                {#if Math.abs(data.page - n) <= 2 || n === 1 || n === data.totalPages}
                  <button type="button" onclick={() => irAPagina(n)} class="w-10 h-10 flex items-center justify-center shrink-0 rounded-full text-sm font-bold transition-all {data.page === n ? 'bg-gradient-to-r from-[#00d2ff] to-[#0096ff] text-white shadow-md' : 'bg-white hover:bg-gray-50 text-gray-600'}">{n}</button>
                {:else if Math.abs(data.page - n) === 3}
                  <span class="text-gray-400 font-bold px-1 self-center">...</span>
                {/if}
              {/each}
            </div>
            <button type="button" onclick={() => irAPagina(data.page + 1)} disabled={data.page >= data.totalPages} class="px-5 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold text-xs uppercase tracking-wider">Siguiente</button>
          </div>
        {/if}
      </div>
    </div>
  </main>

  <div class="w-full bg-[#f8fafc] pb-20">
      <div class="max-w-5xl mx-auto px-4 sm:px-6">
        <div class="bg-lumiDark rounded-3xl p-8 md:p-12 shadow-xl overflow-hidden relative flex flex-col md:flex-row items-center justify-between gap-10 border border-gray-800 z-10 w-full mt-10">
          <div class="relative z-10 md:w-5/12 text-center md:text-left">
            <h3 class="text-3xl font-black text-white mb-4 tracking-tight leading-tight">¿No Encuentras Tu Destino?</h3>
            <p class="text-gray-400 font-medium leading-relaxed text-sm">Dinos desde dónde sales, a dónde quieres ir y en qué mes. Nuestro sistema rastreará los precios 24/7 y te avisaremos por correo en cuanto detectemos una tarifa oculta para ti.</p>
          </div>
          <div class="relative z-10 md:w-7/12 w-full bg-white/5 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/10">
            <form class="space-y-5 w-full" onsubmit={handleSubmitRadar}>
              <div>
                <label class="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Tu Nombre Completo</label>
                <input type="text" bind:value={leadNombre} required class="w-full bg-[#1f2937]/70 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lumiCyan focus:ring-1 focus:ring-lumiCyan transition-all text-sm" />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Ciudad de Origen</label>
                  <input type="text" bind:value={leadOrigen} required class="w-full bg-[#1f2937]/70 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lumiCyan focus:ring-1 focus:ring-lumiCyan transition-all text-sm" />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Ciudad de Destino</label>
                  <input type="text" bind:value={leadDestino} required class="w-full bg-[#1f2937]/70 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lumiCyan focus:ring-1 focus:ring-lumiCyan transition-all text-sm" />
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Mes Aproximado</label>
                  <select bind:value={leadMes} required class="w-full bg-[#1f2937]/70 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lumiCyan focus:ring-1 focus:ring-lumiCyan transition-all text-sm appearance-none cursor-pointer">
                    <option value="" disabled>Selecciona un mes...</option>
                    {#each mesesDisponibles as m}
                      <option value={m} class="bg-lumiDark text-white">{m}</option>
                    {/each}
                  </select>
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Correo Electrónico</label>
                  <input type="email" bind:value={leadContacto} required class="w-full bg-[#1f2937]/70 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lumiCyan focus:ring-1 focus:ring-lumiCyan transition-all text-sm" />
                </div>
              </div>
              
              <button type="submit" class="w-full bg-gradient-to-r from-[#00d2ff] to-[#0096ff] hover:brightness-110 text-white font-black py-4 rounded-xl transition-all shadow-md mt-4 active:scale-95 flex items-center justify-center gap-2.5 uppercase tracking-widest text-sm" disabled={radarEnviando}>
                {radarEnviando ? 'Activando...' : 'Activar mi Radar'}
              </button>
              
              {#if radarExito}
                <p class="text-emerald-400 text-sm font-bold text-center mt-3 bg-emerald-400/10 py-2.5 rounded-lg border border-emerald-400/20">¡Radar activado con éxito! Revisa tu correo pronto.</p>
              {/if}
              {#if radarError}
                <p class="text-red-400 text-sm font-bold text-center mt-3 bg-red-400/10 py-2.5 rounded-lg border border-red-400/20">Hubo un error de conexión. Inténtalo de nuevo.</p>
              {/if}
            </form>
          </div>
        </div>
      </div>
  </div>

  <WhatsAppButton pais={paisActual} />
  <Footer />

  {#if modalAbierto && dealSeleccionado}
    <ModalOferta deal={dealSeleccionado} abierto={modalAbierto} cerrar={cerrarModal} />
  {/if}
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
  .custom-scrollbar-h::-webkit-scrollbar {
    height: 4px;
  }
  .custom-scrollbar-h::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 8px;
  }
  .custom-scrollbar-h::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 8px;
  }
</style>
