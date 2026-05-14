<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores'; 
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
        alert("💀 Oferta aniquilada. Recarga la página.");
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

  // 🔥 FIX NAVEGACIÓN SPA: window.location.href reemplaza a goto() para forzar recargas reales
  function seleccionarPais(codigoPais: string) {
    dropdownAbierto = false;
    localStorage.setItem('lumivia_pais', codigoPais);
    window.location.href = `/masdestinos?pais=${codigoPais.toUpperCase()}&page=1`;
  }

  function irAPagina(n: number) {
    if (n < 1 || n > data.totalPages) return;
    window.location.href = `/masdestinos?pais=${paisActual.toUpperCase()}&page=${n}`;
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
    const str = String(fechaCadena);
    if (!str.includes('-')) return str;
    const partes = str.split('-');
    if (partes.length !== 3) return str;
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
  <title>Lumivia | Catálogo de Oportunidades</title>
  <meta name="description" content="Descubre oportunidades únicas de vuelos baratos. Catálogo completo de tarifas ocultas." />
  
  <link rel="canonical" href={urlCanonica} />
  
  {#if data.schemaJSON}
    {@html `<script type="application/ld+json">${data.schemaJSON}</script>`}
  {/if}
</svelte:head>

<div class="bg-gradient-to-b from-[#eaf6f9] via-gray-50 to-gray-50 text-lumiDark min-h-screen flex flex-col relative overflow-x-hidden">
  
  <header class="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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

        <a href="/escapadas?pais={paisActual}" class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-lumiCyan transition-colors hidden lg:flex">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          <span class="hidden lg:inline">Escapadas</span>
        </a>

        <a href="/wanderlust?pais={paisActual}" class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-lumiCyan transition-colors hidden lg:flex">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
          <span class="hidden lg:inline">Wanderlust</span>
        </a>

        <div class="h-5 w-px bg-gray-200 hidden sm:block"></div>

        <div id="selector-pais-catalogo" class="relative inline-block text-left">
          <button type="button" onclick={toggleDropdown} aria-expanded={dropdownAbierto} class="inline-flex items-center justify-center w-full rounded-full border border-gray-200 shadow-sm px-4 py-1.5 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-lumiCyan/50 transition-all gap-2 cursor-pointer">
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

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12 flex-grow w-full relative z-10">
    <div class="mb-12 text-center relative z-10">
      <h1 class="text-3xl md:text-4xl font-black tracking-tight text-lumiDark mb-6">Catálogo de Oportunidades</h1>
      <div class="max-w-xl mx-auto mb-6 relative z-20 group">
        
        <div class="bg-white/80 backdrop-blur-xl p-2 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-200/60 flex flex-col sm:flex-row items-center gap-2 transform transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_8px_40px_rgba(0,210,255,0.12)]">
          <div class="pl-4 text-gray-400 hidden sm:block"><svg class="w-5 h-5 text-lumiCyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
          <form class="w-full flex flex-col sm:flex-row gap-2" onsubmit={handleSubmitNewsletter}>
            <input type="email" placeholder="Ingresa tu correo para recibir nuestra selección..." required class="w-full bg-transparent border-none focus:ring-0 text-lumiDark placeholder-gray-400 px-4 py-2 text-sm outline-none" bind:value={nlEmail} />
            <button type="submit" class="bg-lumiCyan hover:bg-[#00b8e6] text-lumiDark px-8 py-3 rounded-full font-black transition-all active:scale-95 text-sm whitespace-nowrap w-full sm:w-auto shadow-[0_4px_15px_rgba(0,210,255,0.25)]" disabled={nlEnviando}>{nlEnviando ? 'Guardando...' : 'Suscribirme Gratis'}</button>
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
            aria-label="Ver detalles de la oferta {deal.titulo_gancho}"
            class="card-minimal flex flex-col group/card hover:shadow-2xl transition-all duration-300 h-full bg-white rounded-2xl overflow-hidden border border-gray-100 cursor-pointer {estaMuerta ? 'opacity-50 grayscale hover:grayscale-0 focus:grayscale-0' : ''}" 
            onclick={() => abrirModal(deal)}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirModal(deal); } }}
          >
            <div class="relative h-56 overflow-hidden bg-gray-100 shrink-0">
              <img src={imgFinal} alt={deal.titulo_gancho || 'Oferta Especial'} loading="lazy" class="w-full h-full object-cover transform group-hover/card:scale-105 transition-transform duration-700 ease-out" onerror={handleImageError} />
              <div class="absolute inset-0 bg-gradient-to-t from-lumiDark/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>

              {#if isAdminModo && !estaMuerta}
                <button 
                  type="button" 
                  onclick={(e) => handleMatarOferta(deal.id, e)} 
                  disabled={cargandoAdmin}
                  class="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600/90 hover:bg-red-700 text-white backdrop-blur-md px-4 py-1.5 rounded-full font-black text-[10px] shadow-lg border border-red-400 z-30 uppercase tracking-widest flex items-center gap-1 transition-all"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  {cargandoAdmin ? '...' : 'MATAR OFERTA'}
                </button>
              {/if}

              {#if estaMuerta}
                <div class="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
                  <div class="bg-black/80 text-white font-black px-6 py-2 rounded-full uppercase tracking-widest text-[11px] shadow-2xl border border-white/20">
                    Fechas Pasadas / Expirada
                  </div>
                </div>
              {/if}

              {#if tiempoTranscurrido && !estaMuerta}
                <div class="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-lumiDark text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm tracking-wide border border-white/50 uppercase flex items-center gap-1">
                  ⏱️ {tiempoTranscurrido}
                </div>
              {/if}

              {#if esVip}
                <div class="absolute top-4 right-4 bg-white/95 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-full z-10 flex items-center gap-1.5 uppercase tracking-widest shadow-lg border border-emerald-200">
                  <svg class="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg> Directo
                </div>
              {:else if typeof deal?.escalas === 'number'}
                <div class="absolute top-4 right-4 bg-white/95 text-gray-700 text-[10px] font-bold px-3 py-1.5 rounded-full z-10 flex items-center gap-1.5 uppercase tracking-widest shadow-lg border border-gray-200">
                  {deal.escalas} Escala{deal.escalas > 1 ? 's' : ''}
                </div>
              {/if}

              {#if !estaMuerta}
                <button type="button" onclick={(e) => { e.stopPropagation(); reportarCambioPrecio(deal.id, e); }} title="¿El precio subió? Repórtalo" class="absolute bottom-3 right-3 bg-white/80 hover:bg-red-50 text-gray-500 hover:text-red-500 backdrop-blur-sm p-2.5 rounded-full shadow-sm border border-white/50 transition-colors z-10 cursor-pointer">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-1 6-1-1H11.5l-1-1H5v10m0 0h4"/></svg>
                </button>
              {/if}
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

              <div class="mt-auto pt-5 border-t border-gray-100 flex items-end justify-between">
                <div>
                  <p class="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">{estaMuerta ? 'Precio Histórico' : 'Vuelo Id/Vt'}</p>
                  <p class="text-3xl sm:text-4xl font-black {estaMuerta ? 'text-gray-400 line-through' : 'text-lumiDark'} leading-none tracking-tighter">
                    <span class="text-lg font-bold text-gray-400 align-top mr-0.5">$</span>{Number(deal.precio ?? deal.price ?? 0).toLocaleString('en-US')} <span class="text-sm font-bold text-gray-400 align-baseline ml-1">{monedaDeal}</span>
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <button type="button" onclick={(e) => { e.stopPropagation(); copiarUrlUnica(deal.id, e); }} title="Compartir enlace" class="text-gray-400 hover:text-lumiCyan transition-colors p-2 rounded-full cursor-pointer">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                  </button>
                  
                  <div class="{estaMuerta ? 'bg-gray-200 text-gray-500' : 'bg-lumiDark text-white group-hover/card:bg-lumiCyan group-hover/card:text-lumiDark'} px-6 py-3 rounded-xl font-black text-[12px] sm:text-[13px] transition-all duration-300 shadow-md group-hover/card:shadow-lg active:scale-95 cursor-pointer flex items-center gap-2 uppercase tracking-wider">
                    {estaMuerta ? 'Ver Actuales' : 'Ver Vuelo'} 
                    <svg class="w-4 h-4 transition-transform duration-300 group-hover/card:translate-x-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>

    {#if data.totalPages > 1}
      <div class="flex justify-center items-center gap-3 mt-10 mb-20 relative z-10">
        <button type="button" onclick={() => irAPagina(data.page - 1)} disabled={data.page <= 1} class="px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold text-sm">← Anterior</button>
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full">
          {#each Array(data.totalPages) as _, i}
            {@const n = i + 1}
            {#if Math.abs(data.page - n) <= 2 || n === 1 || n === data.totalPages}
              <button type="button" onclick={() => irAPagina(n)} class="w-9 h-9 flex items-center justify-center shrink-0 rounded-full text-sm font-bold transition-all {data.page === n ? 'bg-lumiCyan text-lumiDark shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}">{n}</button>
            {:else if Math.abs(data.page - n) === 3}
              <span class="text-gray-400 font-bold px-1">...</span>
            {/if}
          {/each}
        </div>
        <button type="button" onclick={() => irAPagina(data.page + 1)} disabled={data.page >= data.totalPages} class="px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold text-sm">Siguiente →</button>
      </div>
    {/if}

    <div class="bg-lumiDark rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden relative flex flex-col md:flex-row items-center justify-between gap-10 border border-gray-800 z-10 w-full mb-20 mx-auto">
      <div class="relative z-10 md:w-5/12 text-center md:text-left">
        <h3 class="text-3xl font-black text-white mb-4 tracking-tight">¿No ves tu destino soñado?</h3>
        <p class="text-gray-400 font-medium leading-relaxed text-sm">Dinos desde dónde sales, a dónde quieres ir y en qué mes. Nuestro sistema rastreará los precios 24/7 y te avisaremos por correo en cuanto detectemos el momento perfecto.</p>
      </div>
      <div class="relative z-10 md:w-7/12 w-full bg-white/5 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/10">
        <form class="space-y-5 w-full" onsubmit={handleSubmitRadar}>
          <div>
            <label class="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Tu Nombre</label>
            <input type="text" bind:value={leadNombre} required class="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lumiCyan focus:ring-1 focus:ring-lumiCyan transition-all text-sm" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Origen</label>
              <input type="text" bind:value={leadOrigen} required class="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lumiCyan focus:ring-1 focus:ring-lumiCyan transition-all text-sm" />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Destino</label>
              <input type="text" bind:value={leadDestino} required class="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lumiCyan focus:ring-1 focus:ring-lumiCyan transition-all text-sm" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Mes aproximado</label>
              <select bind:value={leadMes} required class="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lumiCyan focus:ring-1 focus:ring-lumiCyan transition-all text-sm appearance-none cursor-pointer">
                <option value="" disabled>Elige un mes...</option>
                {#each mesesDisponibles as m}
                  <option value={m} class="bg-lumiDark text-white">{m}</option>
                {/each}
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Correo Electrónico</label>
              <input type="email" bind:value={leadContacto} required class="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lumiCyan focus:ring-1 focus:ring-lumiCyan transition-all text-sm" />
            </div>
          </div>
          
          <button type="submit" class="w-full bg-lumiCyan hover:bg-[#00b8e6] text-lumiDark font-black py-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(0,210,255,0.2)] hover:shadow-[0_6px_20px_rgba(0,210,255,0.3)] mt-4 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-sm" disabled={radarEnviando}>
            {radarEnviando ? 'Activando...' : 'Activar mi Radar'}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          </button>
          
          {#if radarExito}
            <p class="text-emerald-400 text-sm font-bold text-center mt-3 bg-emerald-400/10 py-2 rounded-lg border border-emerald-400/20">¡Radar activado! Revisa tu correo pronto.</p>
          {/if}
          {#if radarError}
            <p class="text-red-400 text-sm font-bold text-center mt-3 bg-red-400/10 py-2 rounded-lg border border-red-400/20">Hubo un error de conexión. Inténtalo de nuevo.</p>
          {/if}
        </form>
      </div>
    </div>

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
