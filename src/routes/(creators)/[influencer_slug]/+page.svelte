<script>
    /**
     * Svelte 5 - Lumivia Influencer Storefront
     * Versión: 2.0 (Premium & Tracking Enabled)
     */
    let { data } = $props();
    const { creator, flights } = data;

    // 1. Formateador de moneda local (MXN con comas y centavos si se requiere)
    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    // 2. Inyector de Afiliado - Maneja URLs con o sin parámetros previos
    const buildAffiliateLink = (originalUrl) => {
        if (!originalUrl) return '#';
        try {
            const url = new URL(originalUrl);
            // Inyectamos el marker del creador (ej: viajesx_ref_01)
            url.searchParams.set('marker', creator.affiliate_tag);
            return url.toString();
        } catch (e) {
            // Respaldo por si la URL en DB está mal formada
            const connector = originalUrl.includes('?') ? '&' : '?';
            return `${originalUrl}${connector}marker=${creator.affiliate_tag}`;
        }
    };
</script>

<svelte:head>
    <title>Radar de {creator.name} | Lumivia</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
</svelte:head>

<div class="min-h-screen bg-[#F9FAFB] pb-16 font-sans">
    
    <header class="relative pt-14 pb-12 px-6 text-center shadow-2xl overflow-hidden" 
            style="background: linear-gradient(135deg, #0F172A 0%, {creator.theme_color} 160%);">
        
        <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white"></path>
            </svg>
        </div>

        <div class="relative z-10">
            <div class="relative inline-block">
                {#if creator.avatar_url && !creator.avatar_url.includes('ui-avatars')}
                    <img src={creator.avatar_url} alt={creator.name} 
                         class="w-24 h-24 mx-auto rounded-full border-[3px] border-white/30 shadow-2xl object-cover" />
                {:else}
                    <div class="w-24 h-24 mx-auto rounded-full border-[3px] border-white/30 shadow-2xl flex items-center justify-center text-3xl font-black text-white bg-white/10 backdrop-blur-md">
                        {creator.name.substring(0,2).toUpperCase()}
                    </div>
                {/if}
                <div class="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-[#0F172A] shadow-lg"></div>
            </div>
            
            <h1 class="text-2xl font-black text-white mt-6 tracking-tight">
                RADAR DE {creator.name.toUpperCase()}
            </h1>
            
            <div class="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-black/40 rounded-full text-white/90 text-[10px] font-bold tracking-[0.2em] uppercase backdrop-blur-xl border border-white/10">
                <span>VERIFICADO POR</span>
                <span class="text-blue-400">LUMIVIA ✨</span> 
            </div>
        </div>
    </header>

    <main class="max-w-md mx-auto space-y-6 mt-[-25px] relative z-20 px-4">
        
        <div class="flex items-center justify-between px-5 py-4 bg-white rounded-2xl shadow-xl border border-gray-100">
            <div class="flex items-center gap-3">
                <div class="flex h-3 w-3 relative">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                </div>
                <span class="font-bold text-gray-800 text-xs uppercase tracking-widest">En vivo: Ofertas MX</span>
            </div>
            <span class="text-[10px] font-bold text-gray-400">ACTUALIZADO AHORA</span>
        </div>

        {#each flights as flight}
            <div class="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                <div class="p-7">
                    <div class="flex justify-between items-start mb-4">
                        <span class="px-3 py-1 bg-red-50 text-red-600 text
