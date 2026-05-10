<script lang="ts">
  // Recibimos los datos del servidor (page.server.ts)
  let { data } = $props();
  
  // Extraemos la lista de vuelos Wanderlust
  let ofertas = $derived(data.deals || []);
</script>

<svelte:head>
  <title>Wanderlust | Oportunidades Exclusivas</title>
  <meta name="description" content="Acceso a rutas aéreas exclusivas y optimizadas." />
</svelte:head>

<section class="min-h-screen bg-[#050505] py-16 px-4 sm:px-6 lg:px-8 font-sans">
  <div class="max-w-7xl mx-auto">
    
    <div class="mb-16 text-center sm:text-left">
      <h1 class="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-4">
        Wanderlust <span class="text-[#00E5B5]">Colección</span>
      </h1>
      <p class="text-gray-400 max-w-2xl text-sm md:text-base">
        Selección de itinerarios aéreos optimizados. Diseñados para maximizar tiempo y confort en los destinos más demandados.
      </p>
    </div>

    {#if ofertas.length === 0}
      <div class="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-12 text-center">
        <svg class="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <h3 class="text-xl font-bold text-white mb-2">No hay selecciones activas</h3>
        <p class="text-gray-500 text-sm">Nuestro sistema está auditando nuevas rutas. Vuelve más tarde.</p>
      </div>
    {:else}
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {#each ofertas as deal (deal.id)}
          
          <article class="relative flex flex-col bg-[#0A0A0A] rounded-[24px] overflow-hidden border border-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:-translate-y-2 hover:border-[#00E5B5]/50 transition-all duration-500 group">
            
            <div class="relative h-72 w-full bg-gray-900 overflow-hidden">
              <img 
                src={deal.url_imagen || deal.imagen_fallback || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000&auto=format&fit=crop'} 
                alt={deal.destino_nombre} 
                class="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700 mix-blend-lighten" 
                loading="lazy"
              />
              
              <div class="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent"></div>
              
              <div class="absolute top-5 left-5 bg-black/60 backdrop-blur-md border border-[#00E5B5]/30 px-3 py-1.5 rounded-full flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-[#00E5B5] shadow-[0_0_8px_#00E5B5] animate-pulse"></span>
                <span class="text-[#00E5B5] text-[10px] font-black tracking-widest uppercase">Selección Verificada</span>
              </div>
            </div>

            <div class="relative p-8 flex flex-col flex-grow z-10 -mt-16">
              
              <h2 class="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-md mb-2">
                {deal.destino_nombre}
              </h2>
              
              <h3 class="text-[#00E5B5] text-sm font-bold tracking-wide mb-6">
                {deal.titulo_gancho}
              </h3>

              <div class="text-gray-300 text-sm leading-relaxed mb-8 whitespace-pre-wrap font-medium">
                {deal.cuerpo_post}
              </div>

              <div class="mt-auto pt-6 border-t border-gray-800">
                <div class="flex items-end justify-between mb-6">
                  <div class="flex flex-col">
                    <span class="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-1">Tarifa Ancla</span>
                    <div class="text-white text-3xl font-black tracking-tight">
                      ${deal.precio?.toLocaleString('en-US') || deal.precio} 
                      <span class="text-sm font-bold text-gray-500 ml-1">{deal.moneda || data.pais === 'MX' ? 'MXN' : 'USD'}</span>
                    </div>
                  </div>
                </div>

                <a 
                  href={deal.link_compra || deal.link_reserva || '#'} 
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-full flex items-center justify-center bg-[#00E5B5] text-[#050505] font-black uppercase tracking-widest py-4 rounded-xl hover:bg-white transition-colors duration-300 shadow-[0_0_15px_rgba(0,229,181,0.2)]"
                >
                  Acceder a Reserva
                </a>
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
              class={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${data.page === i + 1 ? 'bg-[#00E5B5] text-black' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}
            >
              {i + 1}
            </a>
          {/each}
        </div>
      {/if}

    {/if}
  </div>
</section>
