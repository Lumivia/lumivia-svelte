<script lang="ts">
  import { onMount } from 'svelte';
  import Header from '$lib/components/Header.svelte';
  import ModalOferta from '$lib/components/ModalOferta.svelte';
  import DealCard from '$lib/components/DealCard.svelte';
  import RadarItem from '$lib/components/RadarItem.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { supabase } from '$lib/supabaseClient';
  import { AVISO_OFERTA } from '$lib/utils/avisos';

  let { data }: { data: any } = $props();

  const title = $derived(`Vuelos baratos desde ${data.mercado?.nombre || 'tu país'} - Lumivia`);
  const description = $derived(`Compara vuelos vigentes desde ${data.mercado?.nombre || 'tu país'} y completa la reserva con la aerolínea o agencia.`);

  const ofertasHook = $derived(data.destacadas || []);
  const ofertasRadar = $derived(data.masDestinos || []);

  function handleSubmitRadar(e: Event) { e.preventDefault(); enviarRadar(); }

  let ofertaSeleccionada: any = $state(null);
  let modalAbierto = $state(false);
  let pausarCarrusel = $state(false);

  // 🔥 Variables sincronizadas correctamente para el build
  let radarNombre = $state('');
  let radarOrigen = $state('');
  let radarDestino = $state('');
  let radarMes = $state('');
  let radarContacto = $state('');
  let radarExito = $state(false);
  let radarError = $state(false);
  let radarCargando = $state(false);
  let meses = $state<string[]>([]);

  function carruselLogica(node: HTMLElement) {
    const intervalo = setInterval(() => {
      if (pausarCarrusel || node.children.length === 0) return;
      const maxScroll = node.scrollWidth - node.clientWidth;
      if (node.scrollLeft >= maxScroll - 10) node.scrollTo({ left: 0, behavior: 'smooth' });
      else {
        const primerHijo = node.children[0] as HTMLElement;
        const avance = (primerHijo?.clientWidth || 300) + 24;
        node.scrollBy({ left: avance, behavior: 'smooth' });
      }
    }, 5000);
    return { destroy() { clearInterval(intervalo); } };
  }

  function poblarMeses() {
    const fechaActual = new Date();
    meses = [];
    for (let i = 0; i < 12; i++) {
      const fechaFutura = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + i, 1);
      const mesTexto = fechaFutura.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      meses.push(mesTexto.charAt(0).toUpperCase() + mesTexto.slice(1));
    }
  }

  async function enviarRadar() {
    radarCargando = true; radarExito = false; radarError = false;
    const { error } = await supabase.from('radares_personales').insert([{ nombre: radarNombre, origen: radarOrigen, destino: radarDestino, mes_esperado: radarMes, contacto: radarContacto, status: 'pendiente_verificacion' }]);
    radarCargando = false;
    if (!error) { 
      radarExito = true; 
      radarNombre = radarOrigen = radarDestino = radarMes = radarContacto = ''; 
    } else { 
      radarError = true; console.error(error); 
    }
  }

  function abrirModal(oferta: any) { ofertaSeleccionada = oferta; modalAbierto = true; }
  function cerrarModal() { modalAbierto = false; setTimeout(() => { ofertaSeleccionada = null; }, 200); }

  onMount(() => { poblarMeses(); });
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
</svelte:head>

{#snippet dealCardSkeleton()}
  <div class="min-w-[300px] w-[300px] bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col gap-4 animate-pulse shrink-0">
    <div class="w-full h-40 bg-gray-200 rounded-2xl"></div>
    <div class="flex flex-col gap-3 mt-2">
      <div class="flex gap-2">
        <div class="h-5 w-16 bg-gray-200 rounded-md"></div>
        <div class="h-5 w-24 bg-gray-200 rounded-md"></div>
      </div>
      <div class="h-7 w-3/4 bg-gray-200 rounded-md"></div>
      <div class="h-8 w-1/2 bg-gray-300 rounded-md mt-2"></div>
      <div class="h-10 w-full bg-gray-100 rounded-xl mt-4"></div>
    </div>
  </div>
{/snippet}

{#snippet radarItemSkeleton()}
  <li class="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse border-b border-gray-50 last:border-0">
    <div class="flex items-center gap-4 w-full sm:w-2/3">
      <div class="w-12 h-12 bg-gray-200 rounded-full shrink-0"></div>
      <div class="flex flex-col gap-2 w-full">
        <div class="h-5 w-1/2 bg-gray-200 rounded-md"></div>
        <div class="h-4 w-1/3 bg-gray-100 rounded-md"></div>
      </div>
    </div>
    <div class="flex flex-col items-start sm:items-end gap-2 w-full sm:w-1/3">
      <div class="h-6 w-24 bg-gray-300 rounded-md"></div>
      <div class="h-8 w-full sm:w-32 bg-gray-200 rounded-lg"></div>
    </div>
  </li>
{/snippet}

<div class="bg-gradient-to-b from-[#eaf6f9] via-gray-50 to-gray-50 text-lumiDark min-h-screen flex flex-col relative w-full">
  
  <Header paisUpper={data.paisUpper} mercado={data.mercado || { moneda: 'MXN', bandera: 'https://flagcdn.com/w20/mx.png' }} />

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 flex-grow w-full relative">

    <div class="text-center max-w-4xl mx-auto mb-12 relative z-10 w-full">
      <h1 class="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-lumiDark leading-tight drop-shadow-sm mt-4">
        Viajes para tus recuerdos.<br>
        <span class="bg-clip-text text-transparent bg-gradient-to-r from-lumiCyan to-blue-500">
          Historias para toda la vida.
        </span>
      </h1>
      <p class="mx-auto max-w-2xl text-base text-gray-600 font-light leading-relaxed">
        Buscador gratuito de vuelos. Lumivia no vende boletos: comparamos opciones y te llevamos a la aerolínea o agencia donde completas la reserva.
      </p>

    </div>

    <div class="mb-6 flex items-center justify-between relative z-10 w-full">
      <h2 class="text-2xl font-bold tracking-tight">Oportunidades Destacadas</h2>
    </div>
    <p class="-mt-4 mb-6 text-xs leading-relaxed text-gray-500">{AVISO_OFERTA}</p>

    <div class="relative w-full mb-16 group z-10">
      <div role="region" aria-label="Ofertas destacadas" use:carruselLogica onmouseenter={() => pausarCarrusel = true} onmouseleave={() => pausarCarrusel = false} ontouchstart={() => pausarCarrusel = true} ontouchend={() => setTimeout(() => pausarCarrusel = false, 2000)} class="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 no-scrollbar scroll-smooth w-full">
        
        {#if !data || data.destacadas === undefined}
          {@render dealCardSkeleton()}
          {@render dealCardSkeleton()}
          {@render dealCardSkeleton()}
          {@render dealCardSkeleton()}
        
        {:else if ofertasHook.length > 0}
          {#each ofertasHook as deal (deal.id)}
            <DealCard {deal} monedaActual={data.mercado?.moneda} paisActual={data.paisUpper} onclick={() => abrirModal(deal)} />
          {/each}
        
        {:else}
          <div class="w-full flex justify-center items-center py-6 px-4">
            <div class="bg-white/60 backdrop-blur-md border border-gray-200 rounded-3xl p-8 text-center max-w-md shadow-sm w-full">
              <div class="text-4xl mb-3">📡</div>
              <h3 class="text-xl font-bold text-lumiDark mb-2">Afinando el radar global</h3>
              <p class="text-gray-500 text-sm">Nuestro algoritmo de IA está escaneando tarifas ocultas en este momento. Revisa la sección de "Más Destinos" aquí abajo.</p>
            </div>
          </div>
        {/if}

      </div>
    </div>

    <div class="mb-6 mt-4 relative z-10 w-full">
      <h2 class="text-2xl font-bold tracking-tight">Más Destinos</h2>
    </div>

    <div class="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6 relative z-10 w-full">
      <ul class="divide-y divide-gray-100/80 w-full">
        
        {#if !data || data.masDestinos === undefined}
          {@render radarItemSkeleton()}
          {@render radarItemSkeleton()}
          {@render radarItemSkeleton()}

        {:else if ofertasRadar.length > 0}
          {#each ofertasRadar as deal (deal.id)}
            <RadarItem {deal} monedaActual={data.mercado?.moneda} onclick={() => abrirModal(deal)} />
          {/each}

        {:else}
          <li class="p-10 flex flex-col items-center justify-center text-center">
            <div class="text-3xl mb-3">🔍</div>
            <h4 class="text-lg font-bold text-lumiDark">No hay destinos adicionales hoy</h4>
            <p class="text-gray-500 text-sm mt-1">Activa tu radar personalizado abajo y te avisaremos en cuanto detectemos bajadas de precio.</p>
          </li>
        {/if}

      </ul>
    </div>

    <div class="text-center mb-16 relative z-10 w-full">
      <a rel="external" href="/masdestinos?pais={data.paisUpper || 'MX'}" class="inline-flex items-center justify-center bg-white border border-gray-200 text-lumiDark hover:border-lumiCyan hover:text-lumiCyan px-8 py-3.5 rounded-full font-bold transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] hover:shadow-[0_6px_20px_rgba(0,210,255,0.15)] active:scale-95 text-sm group">
        Explorar más destinos
      </a>
    </div>

    <div class="bg-lumiDark text-white border border-gray-800 rounded-3xl px-8 py-10 shadow-2xl overflow-hidden relative flex flex-col md:flex-row items-center justify-between gap-8 mb-12 z-10 w-full">
      <div class="relative z-10 text-center md:text-left flex-grow">
        <h3 class="text-2xl font-black mb-2 tracking-tight">¿Tienes un viaje específico en mente?</h3>
        <p class="text-gray-400 text-sm font-medium">Busca opciones de distintas aerolíneas y agencias en un solo lugar.</p>
      </div>
      <div class="relative z-10 whitespace-nowrap w-full md:w-auto">
        <a href="https://vuelos.lumivia.app/" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center gap-2 bg-lumiCyan hover:bg-[#00b8e6] text-lumiDark px-8 py-3.5 rounded-2xl font-black transition-all shadow-[0_0_20px_rgba(0,210,255,0.3)] active:scale-95 text-sm uppercase tracking-widest w-full md:w-auto">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          Abrir Buscador
        </a>
      </div>
    </div>

    <div class="bg-lumiDark rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden relative flex flex-col md:flex-row items-center justify-between gap-10 border border-gray-800 z-10 w-full mb-20 mx-auto">
      <div class="relative z-10 md:w-5/12 text-center md:text-left">
        <h3 class="text-3xl font-black text-white mb-4 tracking-tight">¿No ves tu destino soñado?</h3>
        <p class="text-gray-400 font-medium leading-relaxed text-sm">Dinos desde dónde sales, a dónde quieres ir y en qué mes. Te avisaremos por correo cuando encontremos una opción que coincida con tu solicitud.</p>
      </div>
      <div class="relative z-10 md:w-7/12 w-full bg-white/5 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/10">
        <form class="space-y-5 w-full" onsubmit={handleSubmitRadar}>
          <div>
            <label for="pais-nombre" class="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Tu Nombre</label>
            <input id="pais-nombre" type="text" bind:value={radarNombre} required class="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lumiCyan focus:ring-1 focus:ring-lumiCyan transition-all text-sm" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label for="pais-origen" class="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Origen</label>
              <input id="pais-origen" type="text" bind:value={radarOrigen} required class="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lumiCyan focus:ring-1 focus:ring-lumiCyan transition-all text-sm" />
            </div>
            <div>
              <label for="pais-destino" class="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Destino</label>
              <input id="pais-destino" type="text" bind:value={radarDestino} required class="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lumiCyan focus:ring-1 focus:ring-lumiCyan transition-all text-sm" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label for="pais-mes" class="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Mes aproximado</label>
              <select id="pais-mes" bind:value={radarMes} required class="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lumiCyan focus:ring-1 focus:ring-lumiCyan transition-all text-sm appearance-none cursor-pointer">
                <option value="" disabled>Elige un mes...</option>
                {#each meses as m}
                  <option value={m} class="bg-lumiDark text-white">{m}</option>
                {/each}
              </select>
            </div>
            <div>
              <label for="pais-contacto" class="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Correo Electrónico</label>
              <input id="pais-contacto" type="email" bind:value={radarContacto} required class="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lumiCyan focus:ring-1 focus:ring-lumiCyan transition-all text-sm" />
            </div>
          </div>
          
          <button type="submit" class="w-full bg-lumiCyan hover:bg-[#00b8e6] text-lumiDark font-black py-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(0,210,255,0.2)] hover:shadow-[0_6px_20px_rgba(0,210,255,0.3)] mt-4 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-sm" disabled={radarCargando}>
            {radarCargando ? 'Activando...' : 'Activar mi Radar'}
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

  <Footer />

  {#if modalAbierto}
    <ModalOferta deal={ofertaSeleccionada} abierto={modalAbierto} cerrar={cerrarModal} />
  {/if}
</div>
