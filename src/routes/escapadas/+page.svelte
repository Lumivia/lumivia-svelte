<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores'; 
  import type { PageData } from './$types';
  
  import { supabase } from '$lib/supabaseClient';
  import ModalOferta from '$lib/components/ModalOferta.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import WhatsAppButton from '$lib/components/WhatsAppButton.svelte'; 

  let { data }: { data: PageData } = $props();

  const configMercado: Record<string, { moneda: string; bandera: string }> = {
    MX: { moneda: 'MXN', bandera: 'https://flagcdn.com/w20/mx.png' },
    CO: { moneda: 'COP', bandera: 'https://flagcdn.com/w20/co.png' },
    CL: { moneda: 'CLP', bandera: 'https://flagcdn.com/w20/cl.png' },
    CR: { moneda: 'USD', bandera: 'https://flagcdn.com/w20/cr.png' }
  };

  const paisActual = $derived(String(data.pais || 'MX').split('?')[0].split('&')[0].toUpperCase());
  const mercadoActual = $derived(configMercado[paisActual] || configMercado['MX']);
  const monedaActual = $derived(mercadoActual.moneda);
  const banderaActual = $derived(mercadoActual.bandera);
  
  let dropdownAbierto = $state(false);
  let modalAbierto = $state(false);
  let dealSeleccionado: any = $state(null);

  const isAdminModo = $derived($page.url.searchParams.get('admin') === 'true');
  let cargandoAdmin = $state(false);
  let vuelosReportados: Set<number | string> = $state(new Set());

  // 🔥 ALGORITMO ANTI-CONSECUTIVOS
  function aplicarAntiConsecutivos(ofertas: any[]) {
    if (!ofertas || ofertas.length === 0) return [];
    const resultado = [];
    const pendientes = [...ofertas];

    while (pendientes.length > 0) {
      let index = 0;
      if (resultado.length > 0) {
        const ultimoDestino = resultado[resultado.length - 1].destino_nombre || resultado[resultado.length - 1].destino;
        const idx = pendientes.findIndex(o => (o.destino_nombre || o.destino) !== ultimoDestino);
        if (idx !== -1) index = idx;
      }
      resultado.push(pendientes.splice(index, 1)[0]);
    }
    return resultado;
  }

  const dealsFiltrados = $derived(aplicarAntiConsecutivos([...(data.deals || [])]));

  // 🔥 FECHAS LIMPIAS (Ej. 22 MAY - 26 MAY)
  function formatearFechasPremium(salida: string | null, regreso: string | null) {
    const format = (iso: string | null) => {
      if (!iso) return '';
      try {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return iso.split('T')[0];
        const day = d.getDate().toString().padStart(2, '0');
        const month = d.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase().replace('.', '');
        return `${day} ${month}`;
      } catch { return ''; }
    };
    const s = format(salida);
    const r = format(regreso);
    return s && r ? `${s} - ${r}` : s;
  }

  function handleImageError(e: Event) {
    const img = e.target as HTMLImageElement;
    img.onerror = null;
    img.src = 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=800&q=80';
  }

  function toggleDropdown() { dropdownAbierto = !dropdownAbierto; }
  
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('#selector-pais-escapadas')) dropdownAbierto = false;
  }

  function seleccionarPais(codigoPais: string) {
    dropdownAbierto = false;
    localStorage.setItem('lumivia_pais', codigoPais);
    goto(`/escapadas?pais=${codigoPais.toUpperCase()}&page=1`);
  }

  function irAPagina(n: number) {
    if (n < 1 || n > data.totalPages) return;
    goto(`/escapadas?pais=${paisActual.toUpperCase()}&page=${n}`);
  }

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
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, secret: password })
      });
      if (res.ok) { alert("💀 Oferta aniquilada. Recarga la página."); window.location.reload(); } 
      else { alert("Contraseña incorrecta o error en el servidor."); }
    } catch (error) { alert("Error de conexión."); }
    cargandoAdmin = false;
  }

  function abrirModal(deal: any) { dealSeleccionado = deal; modalAbierto = true; }
  function cerrarModal() { modalAbierto = false; setTimeout(() => { dealSeleccionado = null; }, 200); }

  $effect(() => { if (paisActual) localStorage.setItem('lumivia_pais', paisActual); });

  onMount(() => {
    window.addEventListener('click', handleClickOutside);
    return () => { window.removeEventListener('click', handleClickOutside); };
  });
</script>

<svelte:head>
  <title>Escapadas de Fin de Semana | Lumivia</title>
</svelte:head>

<div class="bg-gradient-to-b from-[#eaf6f9] via-gray-50 to-gray-50 text-lumiDark min-h-screen flex flex-col relative w-full">
  
  <header class="bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-200/50 w-full">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between w-full">
      
      <div class="flex items-center gap-4">
        <a href={`/paises/${paisActual.toLowerCase()}`} data-sveltekit-reload class="text-gray-400 hover:text-lumiDark transition-colors cursor-pointer flex items-center" title="Volver a los destinos">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </a>
        <span class="text-2xl font-extrabold tracking-tighter text-lumiDark flex items-center">
          Lumivia <span class="text-lumiCyan font-light ml-1 hidden sm:inline">| Escapadas</span>
        </span>
      </div>

      <div class="flex items-center gap-4">
        <a href="https://vuelos.lumivia.app/" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-lumiDark transition-colors hidden sm:flex">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> Vuelos
        </a>
        <a href="https://www.stay22.com/allez/roam?aid=lumivia" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-lumiCyan transition-colors hidden sm:flex">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> Hoteles
        </a>
        <div class="h-4 w-px bg-gray-200 hidden sm:block"></div>

        <div id="selector-pais-escapadas" class="relative inline-block text-left">
          <button type="button" onclick={toggleDropdown} class="inline-flex items-center justify-center w-full rounded-full border border-gray-200 shadow-sm px-4 py-1.5 bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 focus:outline-none focus:border-lumiCyan transition-colors gap-2 cursor-pointer">
            <img src={banderaActual} alt={paisActual} class="w-4 h-auto rounded-sm shadow-sm" />
            <span>{monedaActual}</span>
            <svg class="w-3 h-3 text-gray-400 transition-transform" style={`transform: rotate(${dropdownAbierto ? '180deg' : '0deg'})`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </button>

          {#if dropdownAbierto}
            <div class="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black/5 focus:outline-none z-50 overflow-hidden border border-gray-100 animate-fadeIn">
              <div class="py-1">
                <button type="button" onclick={() => seleccionarPais('MX')} class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors text-left"><img src="https://flagcdn.com/w20/mx.png" class="w-5 h-auto rounded-sm shadow-sm" /> México</button>
                <button type="button" onclick={() => seleccionarPais('CO')} class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors text-left"><img src="https://flagcdn.com/w20/co.png" class="w-5 h-auto rounded-sm shadow-sm" /> Colombia</button>
                <button type="button" onclick={() => seleccionarPais('CL')} class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors text-left"><img src="https://flagcdn.com/w20/cl.png" class="w-5 h-auto rounded-sm shadow-sm" /> Chile</button>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12 flex-grow w-full relative z-10">
    
    <div class="mb-12 text-center relative z-10">
      <h1 class="text-3xl md:text-5xl font-black tracking-tight text-lumiDark mb-4">Escapadas de Fin de Semana</h1>
      <p class="text-base md:text-lg text-gray-500 font-light max-w-2xl mx-auto">
        Poco tiempo y sin gastar mucho. Vuelos seleccionados especialmente para que desconectes de la rutina el próximo fin de semana.
      </p>
    </div>

    <div id="escapadas-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20 relative z-10 w-full">
      {#if !dealsFiltrados || dealsFiltrados.length === 0}
        <div class="col-span-full text-center text-gray-400 py-20 font-medium w-full">Aún no hay escapadas activas en la bóveda de {paisActual}.</div>
      {:else}
        {#each dealsFiltrados as deal (deal.id)}
          {@const estaMuerta = checarSiEstaMuerta(deal, vuelosReportados)}
          {@const imgFinal = deal.imagen_url_verificada || deal.imagen_fallback || 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=800&q=80'}
          {@const esVip = deal.tipo_vuelo === 'directo' || deal.escalas === 0}
          {@const origenSeguro = String(deal.origen_nombre || deal.origen || '').toUpperCase()}
          {@const destinoSeguro = String(deal.destino_nombre || deal.destino || '').toUpperCase()}
          {@const fechasPremium = formatearFechasPremium(deal.fecha_salida, deal.fecha_regreso)}

          <div 
            role="button" tabindex="0" 
            class="flex flex-col h-full bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgba(0,210,255,0.12)] transition-all duration-300 hover:-translate-y-1 cursor-pointer relative group/card w-full {estaMuerta ? 'opacity-50 grayscale hover:grayscale-0' : ''}" 
            onclick={() => abrirModal(deal)}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirModal(deal); } }}
          >
            <div class="relative h-[220px] overflow-hidden bg-gray-200 shrink-0 w-full">
              <img src={imgFinal} alt={destinoSeguro} loading="lazy" class="w-full h-full object-cover transform group-hover/card:scale-105 transition-transform duration-700 ease-out" onerror={handleImageError} />
              
              {#if isAdminModo && !estaMuerta}
                <button type="button" onclick={(e) => handleMatarOferta(deal.id, e)} class="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600/90 text-white px-4 py-1.5 rounded-full font-black text-[10px] z-30 uppercase">MATAR</button>
              {/if}

              {#if estaMuerta}
                <div class="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
                  <div class="bg-black/80 text-white font-black px-6 py-2 rounded-full uppercase tracking-widest text-[11px] shadow-2xl border border-white/20">Fechas Pasadas</div>
                </div>
              {/if}

              <div class="absolute top-4 left-4 bg-white text-lumiDark text-[10px] font-black px-3 py-1.5 rounded-full z-20 shadow-sm flex items-center gap-1.5 uppercase tracking-wider">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> FINDE
              </div>

              <div class="absolute top-4 right-4 text-[10px] font-black px-3 py-1.5 rounded-full z-20 shadow-sm flex items-center gap-1 uppercase tracking-widest bg-[#1f2937] text-white">
                {#if esVip}
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> DIRECTO
                {:else}
                  1 ESCALA
                {/if}
              </div>
            </div>

            <div class="p-6 flex flex-col flex-grow bg-white w-full">
              
              <div class="flex items-start justify-between gap-3 mb-3 w-full">
                <div class="text-[11px] sm:text-[12px] font-black text-lumiDark uppercase tracking-widest leading-snug break-words flex-1 flex items-center flex-wrap">
                  {origenSeguro} <span class="text-gray-300 font-bold mx-1.5 text-[10px] align-middle">➔</span> {destinoSeguro}
                </div>
                {#if fechasPremium}
                  <div class="shrink-0 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest text-right mt-[2px]">
                    {fechasPremium}
                  </div>
                {/if}
              </div>

              <h3 class="font-bold text-lg leading-snug mb-3 text-lumiDark">✨ Escapada: {destinoSeguro} desde ${deal.precio} {monedaActual}.</h3>
              
              <div class="text-[10px] text-gray-400 font-bold flex items-center gap-2 mb-4 uppercase tracking-widest">
                <span>🎒 MOCHILA PERSONAL</span> <span class="text-gray-300">•</span> <span>🛡️ IMPUESTOS INC.</span>
              </div>

              <div class="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 w-full">
                <div>
                  <p class="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">Vuelo Ida/Vt</p>
                  <p class="text-2xl font-black text-lumiDark leading-none drop-shadow-sm">${deal.precio} <span class="text-xs font-bold text-gray-400">{monedaActual}</span></p>
                </div>
                <button class="bg-lumiDark group-hover/card:bg-lumiCyan group-hover/card:text-lumiDark text-white px-5 py-2.5 rounded-full text-[11px] font-black uppercase transition-colors flex items-center gap-1.5 shadow-md">
                  VER VUELO 
                  <svg class="w-3.5 h-3.5 transition-transform group-hover/card:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>

    {#if data.totalPages > 1}
      <div class="flex justify-center items-center gap-3 mt-10 mb-20 relative z-10 w-full">
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
  </main>

  <WhatsAppButton pais={paisActual} />
  <Footer />

  {#if modalAbierto && dealSeleccionado}
    <ModalOferta deal={dealSeleccionado} abierto={modalAbierto} cerrar={cerrarModal} />
  {/if}
</div>

<style>
  .animate-fadeIn { animation: fadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1); }
  @keyframes fadeIn { from { opacity: 0; transform: scale(0.95) translateY(-5px); } to { opacity: 1; transform: scale(1) translateY(0); } }
</style>
