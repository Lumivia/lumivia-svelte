<script>
    /**
     * Svelte 5 - Lumivia Influencer Storefront
     * Versión: 3.0 (Clean UI + Universal Search Tracking)
     */
    let { data } = $props();
    const { creator, flights } = data;

    // 1. Formateador de moneda (MXN)
    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-MX').format(price);
    };

    // 2. Inyector de Afiliado para las OFERTAS (Skyscanner/Vuelos)
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

    // 3. ENLACES UNIVERSALES (El menú superior de Lumivia inyectado con el afiliado)
    // Buscador general de vuelos
    const linkBuscadorVuelos = `https://vuelos.lumivia.app/?marker=${creator.affiliate_tag}`;
    // Buscador general de hoteles (Stay22 usa 'subid' para sub-afiliados)
    const linkBuscadorHoteles = `https://www.stay22.com/allez/roam?aid=lumivia&subid=${creator.affiliate_tag}`;
</script>

<svelte:head>
    <title>Radar de {creator.name} | Lumivia</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
</svelte:head>

<div class="min-h-screen bg-[#F4F7F6] pb-16 font-sans">
    
    <nav class="absolute top-0 w-full z-50 px-4 py-4 flex justify-between items-center">
        <div class="text-white/80 font-black tracking-tighter text-lg flex items-center gap-1">
            <span>LUMIVIA</span>
        </div>

        <div class="flex items-center gap-4 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <a href={linkBuscadorVuelos} target="_blank" rel="noopener noreferrer"
               class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white hover:text-white/70 transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <span>Vuelos</span>
            </a>
            
            <div class="h-3 w-px bg-white/20"></div>
            
            <a href={linkBuscadorHoteles} target="_blank" rel="noopener noreferrer"
               class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white hover:text-white/70 transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                <span>Hoteles</span>
            </a>
        </div>
    </nav>

    <header class="relative pt-24 pb-16 px-6 text-center overflow-hidden shadow-sm" 
            style="background: linear-gradient(180deg, {creator.theme_color} 0%, {creator.theme_color}dd 100%);">
        
        <div class="relative z-10">
            <div class="relative inline-block mb-4">
                {#if creator.avatar_url && !creator.avatar_url.includes('ui-avatars')}
                    <img src={creator.avatar_url} alt={creator.name} 
                         class="w-20 h-20 mx-auto rounded-full border-2 border-white/50 shadow-lg object-cover" />
                {:else}
                    <div class="w-20 h-20 mx-auto rounded-full border-2 border-white/50 shadow-lg flex items-center justify-center text-2xl font-black text-white bg-white/10 backdrop-blur-sm">
                        {creator.name.substring(0,2).toUpperCase()}
                    </div>
                {/if}
            </div>
            
            <h1 class="text-2xl font-black text-white tracking-wide uppercase drop-shadow-sm">
                RADAR DE {creator.name}
            </h1>
            
            <div class="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-black/10 rounded-full text-white/90 text-[9px] font-bold tracking-[0.15em] uppercase backdrop-blur-md">
                <span>VERIFICADO POR LUMIVIA</span>
                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-4.5l8 2.5z"></path></svg>
            </div>
        </div>
    </header>

    <main class="max-w-md mx-auto space-y-5 mt-[-30px] relative z-20 px-4">
        
        <div class="flex items-center justify-between px-5 py-3.5 bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center gap-2">
                <span class="flex h-2.5 w-2.5 relative">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                </span>
                <span class="font-black text-gray-800 text-xs uppercase tracking-wider">En vivo: Ofertas MX</span>
            </div>
            <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Actualizado Ahora</span>
        </div>

        {#each flights as flight}
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <span class="px-2.5 py-1 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-md">
                            🔥 Error de Precio
                        </span>
                        <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">10/10 Calidad</span>
                    </div>

                    <h2 class="font-black text-4xl text-gray-900 tracking-tighter uppercase mb-1">
                        {flight.destination}
                    </h2>
                    <p class="text-gray-500 font-bold text-xs uppercase tracking-widest mb-6">
                        Saliendo de {flight.origin}
                    </p>
                    
                    <div class="flex justify-between items-end mb-4">
                        <div>
                            <p class="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Precio Final Todo Incluido</p>
                            <div class="flex items-baseline gap-1">
                                <span class="text-3xl font-black text-gray-900">${formatPrice(flight.price)}</span>
                                <span class="text-sm font-black text-gray-400">MXN</span>
                            </div>
                        </div>
                        <svg class="w-6 h-6 text-gray-200" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-4.5l8 2.5z"></path></svg>
                    </div>

                    <a 
                        href={buildAffiliateLink(flight.url)} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        class="block w-full text-center py-4 rounded-xl text-white font-black text-sm uppercase tracking-widest transition-transform active:scale-[0.98]"
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
