<script lang="ts">
  import Header from '$lib/components/Header.svelte'; // Ajusta la ruta si es necesario
  import Footer from '$lib/components/Footer.svelte'; // Ajusta la ruta si es necesario

  // Recibimos los datos del servidor (page.server.ts)
  let { data } = $props();
  
  // Extraemos la lista de vuelos Wanderlust
  let ofertas = $derived(data.deals || []);
</script>

<svelte:head>
  <title>Wanderlust | Selección Lumivia</title>
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
          
          <article class="flex flex-col bg-[#111111] rounded-[32px] overflow-hidden shadow-2xl group transition-all duration-500 border border-white/5">
            
            <div class="relative h-60 w-full overflow-hidden">
              <img 
                src={deal.url_imagen || deal.imagen_fallback} 
                alt={deal.destino_nombre} 
                class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              
              <div class="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-black/40"></div>
              
              <div class="absolute top-4 left-4 right-4 flex justify-between items-start">
                <div class="flex flex-col gap-2">
                   <span class="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 w-fit">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                    DIRECTO
                  </span>
                  <span class="text-white/60 text-[9px] font-medium tracking-widest uppercase ml-1">Unsplash</span>
                </div>
                
                <div class="bg-[#00E5B5] text-black text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-[#00E5B5]/20">
                  SELECCIÓN AUDITADA
                </div>
              </div>
            </div>

            <div class="p-8 pt-4 flex flex-col flex-grow">
              <h2 class="text-3xl font-black text-white uppercase tracking-tight mb-1">
                {deal.destino_nombre} <span class="text-gray-500 font-bold text-lg">({deal.destino})</span>
              </h2>

              <div class="text-[#00E5B5] text-xs font-bold uppercase tracking-widest mb-6">
                {deal.titulo_gancho}
              </div>

              <div class="text-gray-400 text-sm leading-relaxed mb-8 flex-grow">
                {deal.cuerpo_post}
              </div>

              <div class="flex items-center justify-between border-t border-white/10 pt-6">
                <div class="flex flex-col">
                  <span class="text-gray-500 text-[10px] font-bold tracking-widest uppercase">Precio Ancla</span>
                  <div class="text-white text-3xl font-black">
                    ${deal.precio?.toLocaleString('en-US')} 
                    <span class="text-xs font-bold text-gray-500 uppercase">{deal.moneda || 'USD'}</span>
                  </div>
                  <span class="text-[9px] text-gray-600 font-bold">Desde {deal.origen_nombre}</span>
                </div>

                <a 
                  href={deal.link_compra} 
                  target="_blank"
                  class="bg-white/5 hover:bg-[#00E5B5] text-white hover:text-black border border-white/10 hover:border-[#00E5B5] px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300"
                >
                  Ver Oferta
                </a>
              </div>
            </div>
            
          </article>
        {/each}
      </div>
    {/if}
  </div>
</main>

<Footer />
