<script lang="ts">
  import Header from '$lib/components/Header.svelte'; 
  import Footer from '$lib/components/Footer.svelte'; 
  import ModalWanderlust from '$lib/components/ModalWanderlust.svelte';

  let { data } = $props();
  let ofertas = $derived(data.deals || []);

  let modalAbierto = $state(false);
  let dealSeleccionado = $state<any | null>(null);

  function abrirModal(deal: any) { 
    dealSeleccionado = deal; 
    modalAbierto = true; 
  }
  
  function cerrarModal() { 
    modalAbierto = false; 
    setTimeout(() => { dealSeleccionado = null; }, 200); 
  }
</script>

<svelte:head>
  <title>Wanderlust | Colección Lumivia</title>
  <meta name="description" content="Acceso a rutas aéreas exclusivas y optimizadas." />
</svelte:head>

<div class="bg-gray-50 min-h-screen flex flex-col relative overflow-x-hidden">
  
  <Header paisUpper={data.pais} />

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12 flex-grow w-full relative z-10">
    
    <div class="mb-12 text-center sm:text-left">
      <h1 class="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase mb-4 italic">
        WANDERLUST <span class="text-[#00E5B5] not-italic">COLECCIÓN</span>
      </h1>
      <p class="text-gray-500 max-w-2xl text-sm md:text-base font-medium">
        Selección de itinerarios aéreos optimizados. Diseñados para maximizar tiempo y confort en los destinos más demandados.
      </p>
    </div>

    {#if ofertas.length === 0}
      <div class="bg-white border border-gray-200 shadow-sm rounded-3xl p-20 text-center">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Buscando nuevas rutas...</h3>
        <p class="text-gray-500">Estamos verificando las mejores conexiones de este momento.</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each ofertas as deal (deal.id)}
          
          <article 
            class="flex flex-col bg-white rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_40px_rgba(0,229,181,0.15)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            onclick={() => abrirModal(deal)}
            role="presentation"
          >
            
            <div class="relative h-56 w-full overflow-hidden bg-gray-100">
              <img src={deal.url_imagen || deal.imagen_fallback} alt={deal.destino_nombre} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              
              <div class="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent"></div>
              
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
      </div>
    {/if}
  </main>

  <Footer />
</div>

{#if modalAbierto && dealSeleccionado}
  <ModalWanderlust deal={dealSeleccionado} abierto={modalAbierto} cerrar={cerrarModal} />
{/if}
