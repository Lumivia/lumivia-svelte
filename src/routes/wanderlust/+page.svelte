<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores'; 
  import type { PageData } from './$types';
  
  import { supabase } from '$lib/supabaseClient';
  import ModalWanderlust from '$lib/components/ModalWanderlust.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import WhatsAppButton from '$lib/components/WhatsAppButton.svelte'; 
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
  
  let dropdownAbierto = $state(false);
  let modalAbierto = $state(false);
  let dealSeleccionado = $state<any | null>(null);

  // Módulos de Captación (Newsletter / Radar)
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
  
  // Módulo Administrador
  const isAdminModo = $derived($page.url.searchParams.get('admin') === 'true');
  let cargandoAdmin = $state(false);

  function toggleDropdown() { dropdownAbierto = !dropdownAbierto; }
  
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('#selector-pais-catalogo')) dropdownAbierto = false;
  }

  function seleccionarPais(codigoPais: string) {
    dropdownAbierto = false;
    localStorage.setItem('lumivia_pais', codigoPais);
    goto(`/wanderlust?pais=${codigoPais.toUpperCase()}&page=1`);
  }

  function irAPagina(n: number) {
    if (n < 1 || n > data.totalPages) return;
    goto(`/wanderlust?pais=${paisActual.toUpperCase()}&page=${n}`);
  }

  // Lógicas de Base de Datos para Módulos
  function handleSubmitNewsletter(e: Event) { e.preventDefault(); enviarNewsletter(); }
  function handleSubmitRadar(e: Event) { e.preventDefault(); enviarRadar(); }

  async function enviarNewsletter() {
    nlEnviando = true; nlMensaje = ''; nlEstado = '';
    const { error } = await supabase.from('suscriptores_radar').insert([{ email: nlEmail.toLowerCase(), pais: paisActual, nombre: 'Viajero WL' }]);
    nlEnviando = false;
    if (!error) { nlMensaje = '¡Listo! Te avisaremos de las mejores gangas VIP.'; nlEstado = 'ok'; nlEmail = ''; } 
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

  async function handleMatarOferta(id: number | string, e: Event) {
    e.stopPropagation();
    const password = prompt("Ingresa la contraseña de administrador para matar esta oferta Wanderlust:");
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
  <title>Wanderlust | Selección Lumivia</title>
  <meta name="description" content="Descubre oportunidades únicas de vuelos VIP. Catálogo completo Wanderlust." />
</svelte:head>

<div class="bg-gray-50 text-lumiDark min-h-screen flex flex-col relative overflow-x-hidden">
  
  <header class="bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-200/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-4">
        
        <a href={`/paises/${paisActual.toLowerCase()}`} class="text-gray-400 hover:text-lumiDark transition-colors cursor-pointer" title="Volver a los destinos de {paisActual}">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </a>
        
        <span class="text-2xl font-extrabold tracking-tighter text-lumiDark">Lumivia <span class="text-[#00E5B5] font-light">| Wanderlust</span></span>
      </div>

      <div class="flex items-center gap-4">
        <a href="https://vuelos.lumivia.app/" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-lumiDark transition-colors hidden sm:flex">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> Vuelos
        </a>
        <a href="https://www.stay22.com/allez/roam?aid=lumivia" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#00E5B5] transition-colors hidden sm:flex">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> Hoteles
        </a>
        <div class="h-4 w-px bg-gray-200 hidden sm:block"></div>

        <div id="selector-pais-catalogo" class="relative inline-block text-left">
          <button type="button" onclick={toggleDropdown} aria-expanded={dropdownAbierto} class="inline-flex items-center justify-center w-full rounded-full border border-gray-200 shadow-sm px-4 py-1.5 bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 focus:outline-none focus:border-[#00E5B5] transition-colors gap-2 cursor-pointer">
            <img src={banderaActual} alt={paisActual} class="w-4 h-auto rounded-sm shadow-sm" />
            <span>{monedaActual}</span>
            <svg class="w-3 h-3 text-gray-400 transition-transform" style={`transform: rotate(${dropdownAbierto ? '180deg' : '0deg'})`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </button>

          {#if dropdownAbierto}
            <div class="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black/5 focus:outline-none z-50 overflow-hidden border border-gray-100 animate-fadeIn" role="menu">
              <div class="py-1">
                <button type="button" onclick={() => seleccionarPais('MX')} class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors text-left"><img src="https://flagcdn.com/w20/mx.png" alt="MX" class="w-5 h-auto rounded-sm shadow-sm" /> México (MXN)</button>
                <button type="button" onclick={() => seleccionarPais('CO')} class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors text-left"><img src="https://flagcdn.com/w20/co.png" alt="CO" class="w-5 h-auto rounded-sm shadow-sm" /> Colombia (COP)</button>
                <button type="button" onclick={() => seleccionarPais('CL')} class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors text-left"><img src="https://flagcdn.com/w20/cl.png" alt="CL" class="w-5 h-auto rounded-sm shadow-sm" /> Chile (CLP)</button>
                <button type="button" onclick={() => seleccionarPais('CR')} class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors text-left"><img src="https://flagcdn.com/w20/cr.png" alt="CR" class="w-5 h-auto rounded-sm shadow-sm" /> Costa Rica (USD)</button>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12 flex-grow w-full relative z-10">
    
    <div class="mb-12 text-center relative z-10">
      <h1 class="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase mb-4 italic">
        WANDERLUST <span class="text-[#00E5B5] not-italic">COLECCIÓN</span>
      </h1>
      <p class="text-gray-500 max-w-2xl mx-auto text-sm md:text-base font-medium mb-8">
        Selección de itinerarios aéreos optimizados. Diseñados para maximizar tiempo y confort en los destinos más demandados.
      </p>

      <div class="max-w-xl mx-auto mb-6 relative z-20 group">
        <div class="bg-white/80 backdrop-blur-xl p-2 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-200/60 flex flex-col sm:flex-row items-center gap-2 transform transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_8px_40px_rgba(0,229,181,0.15)]">
          <div class="pl-4 text-gray-400 hidden sm:block"><svg class="w-5 h-5 text-[#00E5B5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
          <form class="w-full flex flex-col sm:flex-row gap-2" onsubmit={handleSubmitNewsletter}>
            <input type="email" placeholder="Ingresa tu correo para recibir selección VIP..." required class="w-full bg-transparent border-none focus:ring-0 text-lumiDark placeholder-gray-400 px-4 py-2 text-sm outline-none" bind:value={nlEmail} />
            <button type="submit" class="bg-gray-900 text-white hover:bg-[#00E5B5] hover:text-gray-900 px-6 py-2.5 rounded-full font-bold transition-all shadow-md active:scale-95 text-sm whitespace-nowrap w-full sm:w-auto" disabled={nlEnviando}>{nlEnviando ? 'Guardando...' : 'Suscribirme Gratis'}</button>
          </form>
        </div>
        {#if nlEstado !== ''}
          <p class="text-center text-sm font-bold mt-4 {nlEstado === 'ok' ? 'text-emerald-500' : nlEstado === 'ya' ? 'text-[#00E5B5]' : 'text-red-500'}">{nlMensaje}</p>
        {/if}
      </div>
    </div>

    <div id="hook-deals" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20 relative z-10">
      {#if !data.deals || data.deals.length === 0}
        <div class="col-span-full text-center text-gray-400 py-20 font-medium">Nuestro sistema está auditando nuevas rutas VIP. Vuelve más tarde.</div>
      {:else}
        {#each data.deals as deal (deal.id)}
          
          <article 
            class="flex flex-col bg-white rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_40px_rgba(0,229,181,0.15)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative"
            onclick={() => abrirModal(deal)}
            role="presentation"
          >
            
            <div class="relative h-56 w-full overflow-hidden bg-gray-100">
              <img src={deal.url_imagen || deal.imagen_fallback || obtenerImagen(deal)} alt={deal.destino_nombre} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              
              <div class="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent"></div>
              
              {#if isAdminModo}
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

              <div class="absolute top-4 left-4 right-4 flex justify-between items-start">
                <div class="flex flex-col gap-1">
                   <span class="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 w-fit border border-white/20">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                    DIRECTO
                  </span>
                </div>
                <div class="bg-[#00E5B5] text-[#0A0A0A] text-[9px] font-black px-3 py-1.5 rounded-full shadow-md uppercase tracking-widest">
                  SELECCIÓN AUDITADA
                </div>
              </div>
            </div>

            <div class="p-6 flex flex-col flex-grow bg-white">
              <h2 class="text-2xl font-black text-gray-900 uppercase tracking-tight mb-1">
                {deal.destino_nombre} <span class="text-gray-400 font-bold text-base">({deal.destino})</span>
              </h2>

              <div class="text-[#00E5B5] text-xs font-bold uppercase tracking-widest mb-4">{deal.titulo_gancho}</div>

              <div class="text-gray-500 text-[14px] leading-relaxed mb-6 flex-grow line-clamp-3 font-medium">{deal.cuerpo_post}</div>

              <div class="flex items-end justify-between border-t border-gray-100 pt-5 mt-auto">
                <div class="flex flex-col">
                  <span class="text-gray-400 text-[10px] font-bold tracking-widest uppercase mb-0.5">Precio Ancla</span>
                  <div class="text-gray-900 text-2xl font-black leading-none">
                    ${deal.precio?.toLocaleString('en-US')} 
                    <span class="text-[10px] font-bold text-gray-400 uppercase">{deal.moneda || data.pais === 'MX' ? 'MXN' : 'USD'}</span>
                  </div>
                  <span class="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-wider">Desde {deal.origen_nombre}</span>
                </div>

                <button type="button" class="bg-gray-900 hover:bg-[#00E5B5] text-white hover:text-gray-900 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-md">
                  Ver Oferta
                </button>
              </div>
            </div>
          </article>
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
              <button type="button" onclick={() => irAPagina(n)} class="w-9 h-9 flex items-center justify-center shrink-0 rounded-full text-sm font-bold transition-all {data.page === n ? 'bg-[#00E5B5] text-gray-900 shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}">{n}</button>
            {:else if Math.abs(data.page - n) === 3}
              <span class="text-gray-400 font-bold px-1">...</span>
            {/if}
          {/each}
        </div>
        <button type="button" onclick={() => irAPagina(data.page + 1)} disabled={data.page >= data.totalPages} class="px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold text-sm">Siguiente →</button>
      </div>
    {/if}

    <section class="max-w-3xl mx-auto mb-24 relative z-10">
      <div class="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <h2 class="text-2xl font-black text-gray-900 mb-4 text-center">Radar Wanderlust</h2>
        <p class="text-gray-500 text-center mb-8 text-sm leading-relaxed">¿Buscas un destino VIP en específico? Cuéntanos y te avisamos cuando aparezca una tarifa excepcional.</p>
        <form class="space-y-6" onsubmit={handleSubmitRadar}>
          <div>
            <label for="radar-nombre" class="block text-xs font-semibold text-gray-400 mb-1">Tu Nombre</label>
            <input id="radar-nombre" type="text" bind:value={leadNombre} required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00E5B5] focus:border-[#00E5B5] outline-none text-sm" placeholder="Ej. Ana" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="radar-origen" class="block text-xs font-semibold text-gray-400 mb-1">Origen</label>
              <input id="radar-origen" type="text" bind:value={leadOrigen} required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00E5B5] focus:border-[#00E5B5] outline-none text-sm" placeholder="Ej. MEX" />
            </div>
            <div>
              <label for="radar-destino" class="block text-xs font-semibold text-gray-400 mb-1">Destino</label>
              <input id="radar-destino" type="text" bind:value={leadDestino} required class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-
