<script lang="ts">
  import Header from '$lib/components/Header.svelte'; 
  import Footer from '$lib/components/Footer.svelte'; 
  import ModalWanderlust from '$lib/components/ModalWanderlust.svelte';

  let { data } = $props();
  let ofertas = $derived(data.deals || []);

  // Controladores del Modal
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

<Header paisUpper={data.pais} />

<main class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
  <div class="max-w-7xl mx-auto">
    
    <div class="mb-12 text-center sm:text-left">
      <h1 class="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase mb-4 italic">
        WANDERLUST <span class="text-[#00E5B5] not-italic">COLECCIÓN</span>
      </h1>
      <p class="text-gray-600 max-w-2xl text-sm md:text-base font-medium">
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
          
          <article class="flex flex-col bg-[#0A0A0A] rounded-[24px] overflow-hidden shadow-2xl group transition-all duration-300 border border-white/5 hover:border-[#00E5B5]/30 hover:-translate-y-1">
            
            <div class="relative h-56 w-full overflow-hidden bg-gray-900 cursor-pointer" onclick={() => abrirModal(deal)} role="presentation">
              <img src={deal.url_imagen || deal.imagen_fallback} alt={deal.destino_nombre} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60"></div>
              
              <div class="absolute top-4 left-4 right-4 flex justify-between items-start">
                <div class="flex flex-col gap-1">
                   <span class="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 w-fit border border-white/10">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                    DIRECTO
                  </span>
                  <span class="text-white/80 text-[8px] font-medium tracking-widest uppercase ml-1">Unsplash</span>
                </div>
                <div class="bg-[#00E5B5] text-[#0A0A0A] text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg">SELECCIÓN AUDITADA</div>
              </div>
            </div>

            <div class="p-6 flex flex-col flex-grow bg-[#0A0A0A]">
              <h2 class="text-3xl font-black text-white uppercase tracking-tight mb-1">
                {deal.destino_nombre} <span class="text-gray-500 font-bold text-lg">({deal.destino})</span>
              </h2>

              <div class="text-[#00E5B5] text-xs font-bold uppercase tracking-widest mb-4">{deal.titulo_gancho}</div>

              <div class="text-gray-400 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">{deal.cuerpo_post}</div>

              <div class="flex items-end justify-between border-t border-white/10 pt-5 mt-auto">
                <div class="flex flex-col">
                  <span class="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-0.5">Precio Ancla</span>
                  <div class="text-white text-2xl font-black leading-none">
                    ${deal.precio?.toLocaleString('en-US')} 
                    <span class="text-[10px] font-bold text-gray-500 uppercase">{deal.moneda || data.pais === 'MX' ? 'MXN' : 'USD'}</span>
                  </div>
                  <span class="text-[9px] text-gray-600 font-bold mt-1">Desde {deal.origen_nombre}</span>
                </div>

                <button 
                  type="button"
                  onclick={() => abrirModal(deal)} 
                  class="bg-white/5 hover:bg-[#00E5B5] text-white hover:text-[#0A0A0A] border border-white/10 hover:border-[#00E5B5] px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer"
                >
                  Ver Oferta
                </button>
              </div>
            </div>
          </article>
        {/each}
      </div>

      {#if data.totalPages > 1}
        <div class="mt-16 flex justify-center gap-2">
          {#each Array(data.totalPages) as _, i}
            <a 
              href="?pais={data.pais}&page={i + 1}"
              class={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${data.page === i + 1 ? 'bg-[#0A0A0A] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              {i + 1}
            </a>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</main>

<Footer />

{#if modalAbierto && dealSeleccionado}
  <ModalWanderlust deal={dealSeleccionado} abierto={modalAbierto} cerrar={cerrarModal} />
{/if}
