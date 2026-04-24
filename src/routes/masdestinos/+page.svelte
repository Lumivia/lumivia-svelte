<script lang="ts">
    import type { PageData } from './$types';

    export let data: PageData;

    const { schemaAEO } = data;
</script>

<svelte:head>
    <title>Lumivia | Catálogo de Oportunidades</title>
    <meta
        name="description"
        content="Descubre oportunidades únicas de vuelos baratos. Catálogo completo de tarifas ocultas."
    />
    {#if schemaAEO}
        <script type="application/ld+json">
            {@html schemaAEO}
        </script>
    {/if}
</svelte:head>

<div class="bg-gray-50 text-lumiDark antialiased selection:bg-lumiCyan selection:text-white relative overflow-x-hidden">
    <noscript>
        <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-58WFMR24"
            height="0"
            width="0"
            style="display:none;visibility:hidden"
        ></iframe>
    </noscript>

    <!-- Botón flotante WhatsApp -->
    <div class="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-3 group">
        <div
            class="bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-2xl rounded-2xl p-4 text-xs font-medium text-gray-600 opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 w-max max-w-[260px] text-right origin-bottom-right"
        >
            <p
                id="wa-widget-text"
                class="text-lumiDark font-extrabold mb-1 text-sm leading-tight"
            >
                Únete a nuestro canal de Lumivia México de WhatsApp
            </p>
            <span class="block mt-1">
                Recibe <strong class="text-emerald-600">errores de tarifa</strong> gratis antes que nadie.
            </span>
        </div>
        <a
            href="https://chat.whatsapp.com/TU_ENLACE_AQUI"
            target="_blank"
            class="flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-emerald-400 to-emerald-500 rounded-full shadow-[0_8px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.5)] hover:scale-105 transition-all duration-300 relative focus:outline-none"
        >
            <div
                class="absolute inset-0 rounded-full border border-white/60 animate-ping opacity-75 duration-1000"
            ></div>
            <svg class="w-7 h-7 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
                <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"
                ></path>
            </svg>
        </a>
    </div>

    <!-- Fondo decorativo -->
    <div class="fixed top-0 left-0 w-full h-[800px] overflow-hidden -z-10 pointer-events-none">
        <div
            class="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-lumiCyan/10 blur-[100px]"
        ></div>
        <div
            class="absolute top-[5%] -right-[10%] w-[40%] h-[40%] rounded-full bg-lumiGold/10 blur-[100px]"
        ></div>
        <div class="absolute inset-0 bg-grid-pattern opacity-40"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/90 to-gray-50"></div>
    </div>

    <!-- Header (lo haremos interactivo después) -->
    <header
        class="bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-200/50"
    >
        <div
            class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
        >
            <div class="flex items-center gap-4">
                <button
                    class="text-gray-400 hover:text-lumiDark transition-colors cursor-pointer"
                    title="Volver al inicio"
                    type="button"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        ></path>
                    </svg>
                </button>
                <span class="text-2xl font-extrabold tracking-tighter text-lumiDark">
                    Lumivia <span class="text-lumiCyan font-light">| Catálogo</span>
                </span>
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
                        ></path>
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
                        ></path>
                    </svg>
                    Hoteles
                </a>
                <div class="h-4 w-px bg-gray-200 hidden sm:block"></div>

                <!-- Aquí luego montamos el selector de país real -->
                <div class="relative inline-block text-left">
                    <button
                        type="button"
                        class="inline-flex items-center justify-center w-full rounded-full border border-gray-200 shadow-sm px-4 py-1.5 bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 focus:outline-none focus:border-lumiCyan transition-colors gap-2 cursor-pointer"
                    >
                        <img
                            src="https://flagcdn.com/w20/mx.png"
                            alt="MX"
                            class="w-4 h-auto rounded-sm shadow-sm"
                        />
                        <span>MXN</span>
                        <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 9l-7 7-7-7"
                            ></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div class="mb-12 text-center relative z-10">
            <h1 class="text-3xl md:text-4xl font-black tracking-tight text-lumiDark mb-6">
                Catálogo de Oportunidades
            </h1>

            <!-- Newsletter (luego lo conectamos a Supabase) -->
            <div class="max-w-xl mx-auto mb-6 relative z-20 group">
                <div
                    class="bg-white/80 backdrop-blur-xl p-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/40 flex flex-col sm:flex-row items-center gap-2 transform transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgb(0,210,255,0.15)] ring-1 ring-black/5"
                >
                    <div class="pl-4 text-gray-400 hidden sm:block">
                        <svg class="w-5 h-5 text-lumiCyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            ></path>
                        </svg>
                    </div>
                    <form class="w-full flex flex-col sm:flex-row gap-2">
                        <input
                            type="email"
                            placeholder="Ingresa tu correo para recibir nuestra selección..."
                            required
                            class="w-full bg-transparent border-none focus:ring-0 text-lumiDark placeholder-gray-400 px-4 py-2 text-sm outline-none"
                        />
                        <button
                            type="submit"
                            class="bg-lumiDark text-white hover:bg-black px-6 py-2.5 rounded-full font-bold transition-all shadow-md active:scale-95 text-sm whitespace-nowrap w-full sm:w-auto"
                        >
                            Suscribirme Gratis
                        </button>
                    </form>
                </div>
                <p class="text-center text-sm font-bold mt-4 hidden">
                    <!-- mensaje dinámico luego -->
                </p>
            </div>
        </div>

        <!-- Grid de ofertas (por ahora placeholder) -->
        <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20"
        >
            <div
                class="col-span-full text-center text-gray-400 py-20 font-medium animate-pulse"
            >
                Conectando con la base de datos...
            </div>
        </div>

        <!-- Bloque Radar (formulario) -->
        <div
            class="bg-lumiDark rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden relative flex flex-col md:flex-row items-center justify-between gap-10 border border-gray-800 mb-10"
        >
            <div class="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
                <svg width="300" height="300" viewBox="0 0 24 24" fill="white">
                    <path
                        d="M12 2L1 21h22L12 2zm0 3.83L19.17 19H4.83L12 5.83zM11 16h2v2h-2v-2zm0-7h2v5h-2V9z"
                    ></path>
                </svg>
            </div>

            <div class="relative z-10 md:w-1/2 text-center md:text-left">
                <div
                    class="inline-flex items-center gap-1.5 text-lumiCyan text-xs font-bold uppercase tracking-widest mb-3"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        ></path>
                    </svg>
                    Alerta Personalizada
                </div>
                <h3 class="text-3xl font-bold text-white mb-4">
                    ¿No ves tu destino soñado?
                </h3>
                <p class="text-gray-400 font-light leading-relaxed">
                    Dinos desde dónde sales, a dónde quieres ir y en qué mes. Nuestro sistema rastreará los precios 24/7 y te avisaremos por correo en cuanto detectemos el momento perfecto.
                </p>
            </div>

            <div
                class="relative z-10 md:w-1/2 w-full bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10"
            >
                <form class="space-y-4">
                    <div>
                        <label class="block text-xs font-semibold text-gray-400 mb-1">Tu Nombre</label>
                        <input
                            type="text"
                            placeholder="Ej. Juan Pérez"
                            required
                            class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-lumiCyan transition"
                        />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-gray-400 mb-1">Origen</label>
                            <input
                                type="text"
                                placeholder="Ej. CDMX"
                                required
                                class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-lumiCyan transition"
                            />
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-400 mb-1">Destino</label>
                            <input
                                type="text"
                                placeholder="Ej. París"
                                required
                                class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-lumiCyan transition"
                            />
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="relative">
                            <label class="block text-xs font-semibold text-gray-400 mb-1">Mes aproximado</label>
                            <select
                                required
                                class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lumiCyan transition appearance-none cursor-pointer"
                            >
                                <option value="" disabled selected>Elige un mes...</option>
                            </select>
                            <div
                                class="pointer-events-none absolute bottom-0 right-0 flex items-center px-4 py-3 text-gray-400"
                            >
                                <svg
                                    class="fill-current h-4 w-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-400 mb-1"
                                >Correo Electrónico</label
                            >
                            <input
                                type="email"
                                placeholder="tucorreo@ejemplo.com"
                                required
                                class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-lumiCyan transition"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        class="w-full bg-lumiCyan hover:bg-lumiCyanDark text-lumiDark font-bold py-3 rounded-lg transition-colors shadow-lg mt-2"
                    >
                        Activar mi Radar 🎯
                    </button>
                    <p
                        class="hidden text-emerald-400 text-sm font-semibold text-center mt-2"
                    >
                        ¡Radar activado! Revisa tu correo pronto.
                    </p>
                </form>
            </div>
        </div>
    </main>

    <footer class="bg-white border-t border-gray-200 py-10">
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
                © 2026 Lumivia. Todos los derechos reservados. Lumivia es un motor de búsqueda independiente. Al usar este sitio, usted acepta que las transacciones ocurren en plataformas de terceros bajo sus propios términos legales.
            </p>
        </div>
    </footer>
</div>
