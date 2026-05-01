<script>
    // Svelte 5: Desestructuramos props usando Runes. Cero let reactivos viejos.
    let { data } = $props();
    const { creator, flights } = data;

    // EL HACK DEL DINERO: Esta función le pega el tag del afiliado a la URL original
    const buildAffiliateLink = (originalUrl) => {
        try {
            const url = new URL(originalUrl);
            // Si usamos Travelpayouts, normalmente el parámetro es ?marker= o ?sub_id=
            url.searchParams.set('marker', creator.affiliate_tag);
            return url.toString();
        } catch (e) {
            return originalUrl; // Fallback por si la URL de tu DB viene rota
        }
    };
</script>

<svelte:head>
    <title>Radar de {creator.name} | Vuelos Ocultos</title>
</svelte:head>

<div class="min-h-screen pb-12" style="background-color: {creator.theme_color}10;">
    
    <header class="p-8 text-center rounded-b-3xl shadow-lg" style="background-color: {creator.theme_color};">
        <img 
            src={creator.avatar_url} 
            alt={creator.name} 
            class="w-28 h-28 mx-auto rounded-full border-4 border-white shadow-xl object-cover" 
        />
        <h1 class="text-2xl font-black text-white mt-4 uppercase tracking-wide">
            Radar de {creator.name}
        </h1>
        <p class="text-white/80 text-sm mt-1 font-medium tracking-widest uppercase">
            powered by Lumivia
        </p>
    </header>

    <main class="p-4 max-w-md mx-auto space-y-6 mt-6">
        
        <div class="flex items-center justify-between px-2 mb-2">
            <span class="font-bold text-gray-800">Ofertas Activas</span>
            <span class="flex h-3 w-3 relative">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
        </div>

        {#each flights as flight}
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                <div class="p-5">
                    <div class="text-xs font-bold text-red-500 mb-1 flex items-center gap-1">
                        🔥 ERROR DE TARIFA
                    </div>
                    <h2 class="font-black text-2xl text-gray-900">{flight.destination}</h2>
                    <p class="text-gray-500 font-medium">Desde {flight.origin}</p>
                    
                    <div class="mt-4 flex items-end justify-between">
                        <div>
                            <p class="text-xs text-gray-400 line-through">Precio Normal</p>
                            <p class="text-3xl font-black" style="color: {creator.theme_color};">
                                ${flight.price} USD
                            </p>
                        </div>
                    </div>
                </div>

                <a 
                    href={buildAffiliateLink(flight.url)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="block text-center py-4 text-white font-black text-lg transition hover:opacity-90"
                    style="background-color: {creator.theme_color};"
                >
                    VER OFERTA AHORA
                </a>
            </div>
        {/each}

    </main>
</div>
