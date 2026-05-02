<script lang="ts">
    /**
     * Svelte 5 - Lumivia Influencer Storefront
     * Versión: 4.0 (Merge exacto con UI Lumivia Glassmorphism)
     */
    let { data } = $props();
    const { creator, flights } = data;

    // 1. Formateador de moneda (MXN)
    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-MX').format(price);
    };

    // 2. Inyector de Afiliado para las OFERTAS
    const buildAffiliateLink = (originalUrl) => {
        if (!originalUrl) return '#';
        try {
            const url = new URL(originalUrl);
            url.searchParams.set('marker', creator.affiliate_tag);
            return url.toString();
        } catch (e) {
            const connector = originalUrl.includes('?') ? '&' : '?';
            return `${originalUrl}${connector}marker=${creator.affiliate_tag}`;
        }
    };

    // 3. ENLACES UNIVERSALES (Inyectados para el menú superior)
    const linkBuscadorVuelos = `https://vuelos.lumivia.app/?marker=${creator.affiliate_tag}`;
    const linkBuscadorHoteles = `https://www.stay22.com/allez/roam?aid=lumivia&subid=${creator.affiliate_tag}`;
</script>

<svelte:head>
    <title>Radar de {creator.name} | Lumivia</title>
</svelte:head>

<div class="min-h-screen bg-[#F9FAFB] pb-16 font-sans">
    
    <header class="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <div class="flex items-center">
          <span class="text-2xl font-extrabold tracking-tighter text-gray-900">Lumivia</span>
        </div>

        <div class="flex items-center gap-4 sm:gap-6">
          <a href={linkBuscadorVuelos} target="_blank" rel="noopener noreferrer"
             class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <span class="hidden sm:inline">Vuelos</span>
          </a>

          <a href={linkBuscadorHoteles} target="_blank" rel="noopener noreferrer"
             class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            <span class="hidden sm:inline">Hoteles</span>
          </a>
        </div>

      </div>
    </header>

    <section class="pt-10 pb-6 px-4 text-center">
        <div class="relative inline-block mb-3">
            {#if creator.avatar_url && !creator.avatar_url.includes('ui-avatars')}
                <img src={creator.avatar_url} alt={creator.name} 
                     class="w-20 h-20 mx-auto rounded-full object-cover shadow-sm p-1 bg-white border"
                     style="border-color: {creator.theme_color};" />
            {:else}
                <div class="w-20 h-20 mx-auto rounded-full border-2 flex items-center justify-center text-xl font-black text-gray-800 bg-white shadow-sm"
                     style="border-color: {creator.theme_color};">
                    {creator.name.substring(0,2).toUpperCase()}
                </div>
            {/if}
        </div>
        
        <h1 class="text-xl font-black text-gray-900 uppercase tracking-tight">
            RADAR DE {creator.name}
        </h1>
        <p class="text-xs font-bold text-gray-400 mt-1 tracking-widest uppercase">
            Powered by Lumivia
        </p>
    </section>

    <main class="max-w-md mx-auto space-y-5 px-4 mt-2">
        
        <div class="flex items-center justify-between px-5 py-3.5 bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center gap-2">
                <span class="flex h-2.5 w-2.5 relative">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                </span>
                <span class="font-black text-gray-800 text-xs uppercase tracking-wider">Ofertas Activas</span>
            </div>
            <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Actualizado Ahora</span>
        </div>

        {#each flights as flight}
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <span class="px-2.5 py-1 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-md border border-red-100">
                            🔥 Error de Tarifa
                        </span>
                        <span class="text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded">10/10 Calidad</span>
                    </div>

                    <h2 class="font-black text-3xl text-gray-900 tracking-tighter uppercase mb-1">
                        {flight.destination}
                    </h2>
                    <p class="text-gray-500 font-bold text-xs uppercase tracking-widest mb-6">
                        Saliendo de {flight.origin}
                    </p>
                    
                    <div class="flex justify-between items-end mb-4">
                        <div>
                            <p class="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Precio Final Total</p>
                            <div class="flex items-baseline gap-1">
                                <span class="text-3xl font-black text-gray-900">${formatPrice(flight.price)}</span>
                                <span class="text-sm font-black text-gray-400">MXN</span>
                            </div>
                        </div>
                    </div>

                    <a 
                        href={buildAffiliateLink(flight.url)} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        class="block w-full text-center py-4 rounded-xl text-white font-black text-sm uppercase tracking-widest transition-opacity hover:opacity-90"
                        style="background-color: {creator.theme_color};"
                    >
                        Reservar Ahora
                    </a>
                </div>
            </div>
        {:else}
            <div class="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <p class="text-gray-400 font-bold uppercase text-xs tracking-widest">Buscando ofertas...</p>
            </div>
        {/each}

    </main>
</div>
