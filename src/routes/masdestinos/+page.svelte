<script lang="ts">
    import { goto } from '$app/navigation';
    import type { PageData } from './$types';

    export let data: PageData;

    const { pais, page, totalPages, deals, schemaJSON } = data;

    const configMercado: Record<string, { moneda: string; bandera: string }> = {
        MX: { moneda: 'MXN', bandera: 'https://flagcdn.com/w20/mx.png' },
        CO: { moneda: 'COP', bandera: 'https://flagcdn.com/w20/co.png' },
        CL: { moneda: 'CLP', bandera: 'https://flagcdn.com/w20/cl.png' },
        CR: { moneda: 'USD', bandera: 'https://flagcdn.com/w20/cr.png' }
    };

    const conf = configMercado[pais] ?? configMercado['MX'];
    let monedaActual = conf.moneda;
    let banderaActual = conf.bandera;

    function volverAlPais() {
        const paisGuardado = localStorage.getItem('lumivia_pais');
        if (paisGuardado) {
            goto('/' + paisGuardado.toLowerCase());
        } else {
            goto('/mx');
        }
    }

    function seleccionarPais(codigoPais: string) {
        const c = configMercado[codigoPais] ?? configMercado['MX'];
        monedaActual = c.moneda;
        banderaActual = c.bandera;
        // Reiniciamos a página 1 al cambiar de país
        goto(`/masdestinos?pais=${codigoPais}&page=1`);
    }

    function calcularTiempoTranscurrido(fechaISO: string | null) {
        if (!fechaISO) return 'Recientemente';
        const fechaCreacion = new Date(fechaISO);
        const ahora = new Date();
        const diferenciaSegundos = Math.floor((+ahora - +fechaCreacion) / 1000);
        if (diferenciaSegundos < 60) return `Hace ${diferenciaSegundos} seg`;
        const diferenciaMinutos = Math.floor(diferenciaSegundos / 60);
        if (diferenciaMinutos < 60) return `Hace ${diferenciaMinutos} min`;
        const diferenciaHoras = Math.floor(diferenciaMinutos / 60);
        if (diferenciaHoras < 24) return `Hace ${diferenciaHoras} horas`;
        const diferenciaDias = Math.floor(diferenciaHoras / 24);
        return `Hace ${diferenciaDias} días`;
    }

    function formatearFechaCorta(fechaCadena: string | null) {
        if (!fechaCadena) return '';
        if (!fechaCadena.includes('-')) return fechaCadena;
        const partes = fechaCadena.split('-');
        if (partes.length !== 3) return fechaCadena;

        const año = parseInt(partes[0]);
        const mes = parseInt(partes[1]) - 1;
        const dia = parseInt(partes[2]);
        const fechaObj = new Date(año, mes, dia);

        const opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
        let formateada = fechaObj.toLocaleDateString('es-ES', opciones);
        return formateada.replace('.', '');
    }

    function irAPagina(n: number) {
        if (n < 1 || n > totalPages) return;
        goto(`/masdestinos?pais=${pais}&page=${n}`);
    }
</script>

<svelte:head>
    <title>Lumivia | Catálogo de Oportunidades</title>
    <meta
        name="description"
        content="Descubre oportunidades únicas de vuelos baratos. Catálogo completo de tarifas ocultas."
    />
    {#if schemaJSON}
        <script type="application/ld+json">
            {schemaJSON}
        </script>
    {/if}
</svelte:head>

<div class="bg-gray-50 text-lumiDark antialiased selection:bg-lumiCyan selection:text-white relative overflow-x-hidden min-h-screen flex flex-col">
    <!-- Fondo decorativo -->
    <div class="fixed top-0 left-0 w-full h-[800px] overflow-hidden -z-10 pointer-events-none">
        <div class="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-lumiCyan/10 blur-[100px]" />
        <div class="absolute top-[5%] -right-[10%] w-[40%] h-[40%] rounded-full bg-lumiGold/10 blur-[100px]" />
        <div class="absolute inset-0 bg-grid-pattern opacity-40" />
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/90 to-gray-50" />
    </div>

    <header class="bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-200/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center gap-4">
                <button
                    on:click={volverAlPais}
                    class="text-gray-400 hover:text-lumiDark transition-colors cursor-pointer"
                    title="Volver al inicio"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                </button>
                <span class="text-2xl font-extrabold tracking-tighter text-lumiDark"
                    >Lumivia <span class="text-lumiCyan font-light">| Catálogo</span></span
                >
            </div>

            <div class="flex items-center gap-4">
                <a
                    href="https://vuelos.lumivia.app/"
                    target="_blank"
                    class="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-lumiDark transition-colors hidden sm:flex"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    Vuelos
                </a>
                <a
                    href="https://www.stay22.com/allez/roam?aid=lumivia"
                    target="_blank"
                    class="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-lumiCyan transition-colors hidden sm:flex"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                    </svg>
                    Hoteles
                </a>

                <div class="h-4 w-px bg-gray-200 hidden sm:block" />

                <!-- Selector de país simplificado (usa SSR en vez de geolocalización JS) -->
                <div class="relative inline-block text-left">
                    <button
                        type="button"
                        class="inline-flex items-center justify-center w-full rounded-full border border-gray-200 shadow-sm px-4 py-1.5 bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 focus:outline-none focus:border-lumiCyan transition-colors gap-2 cursor-pointer"
                    >
                        <img src={banderaActual} alt={pais} class="w-4 h-auto rounded-sm shadow-sm" />
                        <span>{monedaActual}</span>
                    </button>
                    <div
                        class="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden border border-gray-100"
                    >
                        <button
                            on:click={() => seleccionarPais('MX')}
                            class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors"
                        >
                            <img
                                src="https://flagcdn.com/w20/mx.png"
                                alt="MX"
                                class="w-5 h-auto rounded-sm shadow-sm"
                            />
                            México (MXN)
                        </button>
                        <button
                            on:click={() => seleccionarPais('CO')}
                            class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors"
                        >
                            <img
                                src="https://flagcdn.com/w20/co.png"
                                alt="CO"
                                class="w-5 h-auto rounded-sm shadow-sm"
                            />
                            Colombia (COP)
                        </button>
                        <button
                            on:click={() => seleccionarPais('CL')}
                            class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors"
                        >
                            <img
                                src="https://flagcdn.com/w20/cl.png"
                                alt="CL"
                                class="w-5 h-auto rounded-sm shadow-sm"
                            />
                            Chile (CLP)
                        </button>
                        <button
                            on:click={() => seleccionarPais('CR')}
                            class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors"
                        >
                            <img
                                src="https://flagcdn.com/w20/cr.png"
                                alt="CR"
                                class="w-5 h-auto rounded-sm shadow-sm"
                            />
                            Costa Rica (USD)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12 flex-1">
        <div class="mb-12 text-center relative z-10">
            <h1 class="text-3xl md:text-4xl font-black tracking-tight text-lumiDark mb-4">
                Catálogo de Oportunidades
            </h1>
            <p class="text-gray-500 text-sm">
                Mostrando página {page} de {totalPages} — País: {pais}
            </p>
        </div>

        <!-- GRID DE OFERTAS -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-10">
            {#if deals.length === 0}
                <div class="col-span-full text-center text-gray-400 py-20 font-medium">
                    Aún no hay ofertas activas en la bóveda de {pais}.
                </div>
            {:else}
                {#each deals as deal}
                    <article
                        class="card-minimal flex flex-col group cursor-pointer hover:shadow-xl transition-shadow duration-300 h-full bg-white rounded-2xl overflow-hidden border border-gray-100"
                    >
                        <!-- Imagen -->
                        <div class="relative h-56 overflow-hidden bg-gray-100 flex-shrink-0">
                            <!-- Para no alargar, aquí usamos una sola imagen fallback.
                                 Si quieres, en el siguiente paso reinyectamos tu diccionario de Unsplash. -->
                            <img
                                src={deal.url_imagen ||
                                    'https://images.unsplash.com/photo-1488085061387-422e15b40b18?auto=format&fit=crop&w=600&q=70&fm=webp'}
                                alt={deal.titulo_gancho || 'Oferta Especial'}
                                class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                            <div
                                class="absolute inset-0 bg-gradient-to-t from-lumiDark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            />
                            <div
                                class="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-lumiDark text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm tracking-wide border border-white/50 uppercase flex items-center gap-1"
                            >
                                ⏱️ {calcularTiempoTranscurrido(deal.created_at)}
                            </div>
                        </div>

                        <!-- Contenido -->
                        <div class="p-6 flex flex-col flex-grow bg-white relative">
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center gap-2">
                                    <div class="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">
                                        <span>{deal.origen || 'ORG'}</span>
                                        <span class="mx-0.5 font-normal text-gray-300">➔</span>
                                        <span>{deal.destino || 'DST'}</span>
                                    </div>
                                </div>

                                <div
                                    class="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"
                                >
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                    {formatearFechaCorta(deal.fecha_salida)} - {formatearFechaCorta(deal.fecha_regreso)}
                                </div>
                            </div>

                            <h3
                                class="text-xl font-bold mb-4 text-lumiDark group-hover:text-lumiCyan transition-colors leading-snug line-clamp-2"
                            >
                                {deal.titulo_gancho || 'Oferta Especial'}
                            </h3>

                            <div class="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
                                <div>
                                    <p
                                        class="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-0.5"
                                    >
                                        Vuelo Id/Vt
                                    </p>
                                    <p
                                        class="text-2xl font-black text-lumiDark leading-none tracking-tight"
                                    >
                                        ${Number(deal.precio ?? 0).toLocaleString('en-US')}
                                        <span class="text-xs font-semibold text-gray-400">
                                            {(deal.moneda || deal.currency || monedaActual).toUpperCase()}
                                        </span>
                                    </p>
                                </div>

                                <div class="flex items-center gap-3">
                                    <a
                                        href={deal.link_compra || 'https://vuelos.lumivia.app/'}
                                        target="_blank"
                                        class="text-lumiCyan hover:text-lumiDark font-bold text-sm transition-colors cursor-pointer"
                                    >
                                        Ver Oferta
                                    </a>
                                </div>
                            </div>
                        </div>
                    </article>
                {/each}
            {/if}
        </div>

        <!-- PAGINACIÓN -->
        {#if totalPages > 1}
            <nav class="flex items-center justify-center gap-2 mt-4">
                <button
                    class="px-3 py-1 text-xs rounded-full border border-gray-200 text-gray-600 disabled:opacity-40"
                    on:click={() => irAPagina(page - 1)}
                    disabled={page === 1}
                >
                    Anterior
                </button>

                {#each Array(totalPages) as _, i}
                    {#if Math.abs(i + 1 - page) <= 2 || i === 0 || i + 1 === totalPages}
                        <button
                            class="px-3 py-1 text-xs rounded-full border {i + 1 === page
                                ? 'bg-lumiCyan text-lumiDark border-lumiCyan'
                                : 'border-gray-200 text-gray-600'}"
                            on:click={() => irAPagina(i + 1)}
                        >
                            {i + 1}
                        </button>
                    {:else if i + 1 === page - 3 || i + 1 === page + 3}
                        <span class="px-2 text-xs text-gray-400">…</span>
                    {/if}
                {/each}

                <button
                    class="px-3 py-1 text-xs rounded-full border border-gray-200 text-gray-600 disabled:opacity-40"
                    on:click={() => irAPagina(page + 1)}
                    disabled={page === totalPages}
                >
                    Siguiente
                </button>
            </nav>
        {/if}
    </main>

    <footer class="bg-white border-t border-gray-200 py-10 mt-auto">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <p class="font-extrabold text-lumiDark mb-2 text-base">Lumivia</p>
            <div
                class="flex flex-wrap justify-center gap-4 sm:gap-8 text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-6"
            >
                <a href="/terminos" class="hover:text-lumiCyan transition-colors">Términos de Uso</a>
                <a href="/privacidad" class="hover:text-lumiCyan transition-colors">Privacidad</a>
                <a href="/afiliacion" class="hover:text-lumiCyan transition-colors">Afiliados</a>
            </div>
            <p class="text-[9px] text-gray-500 max-w-xl mx-auto leading-relaxed">
                © 2026 Lumivia. Todos los derechos reservados. Lumivia es un motor de búsqueda independiente. Al
                usar este sitio, usted acepta que las transacciones ocurren en plataformas de terceros bajo sus
                propios términos legales.
            </p>
        </div>
    </footer>
</div>
