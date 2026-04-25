<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import type { PageData } from './$types';
    import { createClient } from '@supabase/supabase-js';
    import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

    // Importaciones de datos estáticos
    import { diccionarioInfalible, diccionarioDestinos, urlBaseAiralo } from '$lib/data/destinos';

    // --------------------------------------------------------
    // RUNES: PROPS Y ESTADO DERIVADO (SVELTE 5 NATIVO)
    // --------------------------------------------------------
    const { data } = $props<{ data: PageData }>();

    // Estado derivado: Si data cambia (navegación SSR), esto se actualiza automáticamente
    const pais = $derived(data.pais);
    const page = $derived(data.page);
    const totalPages = $derived(data.totalPages);
    const deals = $derived(data.deals || []);
    const schemaJSON = $derived(data.schemaJSON);

    // --------------------------------------------------------
    // ESTADO LOCAL (MUTABLE)
    // --------------------------------------------------------
    let paisActual = $state(data.pais || 'MX');
    
    // Configuración estática
    const configMercado: Record<string, { moneda: string; bandera: string }> = {
        MX: { moneda: 'MXN', bandera: 'https://flagcdn.com/w20/mx.png' },
        CO: { moneda: 'COP', bandera: 'https://flagcdn.com/w20/co.png' },
        CL: { moneda: 'CLP', bandera: 'https://flagcdn.com/w20/cl.png' },
        CR: { moneda: 'USD', bandera: 'https://flagcdn.com/w20/cr.png' }
    };

    const destinosNacionales: Record<string, string[]> = {
        MX: ['CUN', 'MID', 'SJD', 'PVR', 'PXM', 'OAX', 'TRC', 'CUU', 'MEX', 'GDL', 'MTY', 'TIJ'],
        CO: ['CTG', 'SMR', 'ADZ', 'BGA', 'PEI', 'BOG', 'MDE', 'CLO'],
        CL: ['CJC', 'PUQ', 'PMC', 'IQQ', 'SCL', 'LSC', 'ZCO', 'BBA'],
        CR: ['SJO', 'LIR']
    };

    const nombresPais: Record<string, string> = {
        MX: 'México', CO: 'Colombia', CL: 'Chile', CR: 'Costa Rica'
    };

    // Estado derivado para la UI actual basado en el país seleccionado
    const monedaActual = $derived(configMercado[paisActual]?.moneda ?? 'MXN');
    const banderaActual = $derived(configMercado[paisActual]?.bandera ?? 'https://flagcdn.com/w20/mx.png');

    // UI States
    let dropdownAbierto = $state(false);
    let modalAbierto = $state(false);
    let dealSeleccionado = $state<any>(null);
    let vuelosReportados = $state(new Set<number | string>());
    let mesesDisponibles = $state<string[]>([]);

    // Forms States
    let leadNombre = $state('');
    let leadOrigen = $state('');
    let leadDestino = $state('');
    let leadMes = $state('');
    let leadContacto = $state('');
    let radarEnviando = $state(false);
    let radarExito = $state(false);

    let nlEmail = $state('');
    let nlMensaje = $state('');
    let nlEstado = $state<'ok' | 'ya' | 'error' | ''>('');
    let nlEnviando = $state(false);

    const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
    const alaProhibida = '1436491865332-7a61a109cc05';

    // --------------------------------------------------------
    // FUNCIONES Y HANDLERS
    // --------------------------------------------------------

    function toggleDropdown() {
        dropdownAbierto = !dropdownAbierto;
    }

    // Cerramos dropdown si hacen click fuera (Svelte Action / Window event)
    function handleClickOutside(e: MouseEvent) {
        const selector = document.getElementById('custom-country-selector');
        if (dropdownAbierto && selector && !selector.contains(e.target as Node)) {
            dropdownAbierto = false;
        }
    }

    function seleccionarPais(codigoPais: string) {
        paisActual = codigoPais;
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('lumivia_pais', paisActual);
        }
        dropdownAbierto = false;
        goto(`/masdestinos?pais=${codigoPais}&page=1`);
    }

    function irAPagina(n: number) {
        if (n < 1 || n > totalPages) return;
        goto(`/masdestinos?pais=${paisActual}&page=${n}`);
    }

    function volverAlPais() {
        const paisGuardado = typeof localStorage !== 'undefined' ? localStorage.getItem('lumivia_pais') : null;
        goto('/' + (paisGuardado?.toLowerCase() || 'mx'));
    }

    // Modal Control
    function abrirModal(deal: any) {
        dealSeleccionado = deal;
        modalAbierto = true;
    }

    function cerrarModal() {
        modalAbierto = false;
        dealSeleccionado = null;
    }

    // Acciones de tarjetas
    function copiarUrlUnica(id: number | string, e?: MouseEvent) {
        e?.stopPropagation();
        if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
        const urlCompleta = `${window.location.origin}/masdestinos?vuelo=${id}`;
        navigator.clipboard.writeText(urlCompleta).then(() => {
            window.alert('¡Enlace copiado! Ya puedes compartir esta oferta.');
        });
    }

    async function reportarCambioPrecio(idVuelo: number | string, e?: MouseEvent) {
        e?.stopPropagation();
        const confirmar = typeof window !== 'undefined' 
            ? window.confirm('¿El precio cambió? Gracias por avisar, lo verificaremos.') 
            : false;
            
        if (!confirmar) return;
        
        try {
            const { error } = await supabase.rpc('incrementar_reporte_vuelo', { vuelo_id_param: idVuelo });
            if (error) throw error;
            
            // Forzamos actualización del Set en Svelte 5
            vuelosReportados.add(idVuelo);
            vuelosReportados = new Set(vuelosReportados);
            
            window?.alert('¡Reporte enviado! Gracias por ayudar a la comunidad.');
        } catch (err) {
            console.error('Error enviando reporte:', err);
            window?.alert('Hubo un error al enviar el reporte. Intenta de nuevo.');
        }
    }

    // Helpers de formateo
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
        const [año, mes, dia] = [parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2])];
        const fechaObj = new Date(año, mes, dia);
        const opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
        return fechaObj.toLocaleDateString('es-ES', opciones).replace('.', '');
    }

    function obtenerImagenDestino(destino: string | null | undefined, url_imagen?: string | null) {
        let imgFinal = url_imagen || '';
        const destinoLimpio = (destino || '').trim().toUpperCase();

        if (!imgFinal || imgFinal.trim() === '' || imgFinal.includes(alaProhibida) || imgFinal === 'null') {
            if (diccionarioInfalible[destinoLimpio]) {
                const listaFotos = diccionarioInfalible[destinoLimpio];
                const fotoId = listaFotos[Math.floor(Math.random() * listaFotos.length)];
                imgFinal = `https://images.unsplash.com/photo-${fotoId}?auto=format&fit=crop&w=800&q=80&fm=webp`;
            } else {
                imgFinal = 'https://images.unsplash.com/photo-1488085061387-422e15b40b18?auto=format&fit=crop&w=800&q=80&fm=webp';
            }
        } else if (!imgFinal.startsWith('http')) {
            imgFinal = `https://images.unsplash.com/photo-${imgFinal}?auto=format&fit=crop&w=800&q=80&fm=webp`;
        }
        return imgFinal;
    }

    function esInternacionalDestino(destino: string | null | undefined) {
        const lista = destinosNacionales[paisActual] || [];
        return !lista.includes((destino || '').toUpperCase());
    }

    function obtenerLinksExtras(deal: any) {
        let linkHotelFinal: string | null = deal.url_hotel || null;
        if (linkHotelFinal && linkHotelFinal !== 'Sin hotel sugerido' && linkHotelFinal.includes('stay22.com')) {
            if (!linkHotelFinal.includes('checkin=')) {
                const separador = linkHotelFinal.includes('?') ? '&' : '?';
                linkHotelFinal += `${separador}checkin=${deal.fecha_salida}&checkout=${deal.fecha_regreso}`;
            }
        }

        const dataDestino = diccionarioDestinos[deal.destino] || { airalo: 'global', tour: 'global' };
        const urlDestinoAiralo = dataDestino.airalo === 'global'
            ? `${urlBaseAiralo}?u=${encodeURIComponent('https://www.airalo.com/es/')}`
            : `${urlBaseAiralo}?u=${encodeURIComponent('https://www.airalo.com/es/' + dataDestino.airalo + '-esim')}`;

        const urlDestinoTour = dataDestino.tour === 'global'
            ? 'https://www.civitatis.com/es/'
            : `https://www.civitatis.com/es/${dataDestino.tour}/?fromDate=${deal.fecha_salida}&toDate=${deal.fecha_regreso}`;

        return { linkHotelFinal, urlDestinoAiralo, urlDestinoTour };
    }

    // Forms Handlers
    async function enviarRadar(e: Event) {
        e.preventDefault();
        if (!leadNombre || !leadOrigen || !leadDestino || !leadMes || !leadContacto) return;
        radarEnviando = true;
        radarExito = false;
        try {
            const { error } = await supabase.from('radares_personales').insert([{
                nombre: leadNombre, origen: leadOrigen, destino: leadDestino,
                mes_esperado: leadMes, contacto: leadContacto, status: 'pendiente_verificacion'
            }]);
            if (!error) {
                radarExito = true;
                leadNombre = leadOrigen = leadDestino = leadMes = leadContacto = '';
            }
        } finally {
            radarEnviando = false;
        }
    }

    async function enviarNewsletter(e: Event) {
        e.preventDefault();
        if (!nlEmail) return;
        nlEnviando = true;
        nlEstado = '';
        nlMensaje = '';
        try {
            const { error } = await supabase.from('suscriptores_radar')
                .insert([{ email: nlEmail.trim().toLowerCase(), pais: paisActual, nombre: 'Viajero' }]);
            
            if (!error) {
                nlEstado = 'ok';
                nlMensaje = '¡Listo! Te avisaremos de las mejores gangas.';
                nlEmail = '';
            } else {
                if ((error as any).code === '23505') {
                    nlEstado = 'ya';
                    nlMensaje = '¡Ya estás en nuestra lista!';
                } else {
                    nlEstado = 'error';
                    nlMensaje = 'Error de conexión. Intenta de nuevo.';
                }
            }
        } finally {
            nlEnviando = false;
        }
    }

    // Lifecycle
    onMount(() => {
        // Generador de meses
        const fechaActual = new Date();
        const meses: string[] = [];
        for (let i = 0; i < 12; i++) {
            const fechaFutura = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + i, 1);
            const mesTexto = fechaFutura.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
            meses.push(mesTexto.charAt(0).toUpperCase() + mesTexto.slice(1));
        }
        mesesDisponibles = meses;

        // Edge case: Rescate de país por IP si no hay localstorage
        if (typeof localStorage !== 'undefined') {
            let paisLocal = localStorage.getItem('lumivia_pais');
            if (!paisLocal) {
                fetch('https://1.1.1.1/cdn-cgi/trace')
                    .then((res) => res.text())
                    .then((text) => {
                        const locLine = text.split('\n').find((line) => line.startsWith('loc='));
                        const countryCode = locLine ? locLine.split('=')[1] : 'MX';
                        const paisesAprobados = ['MX', 'CO', 'CL', 'CR'];
                        paisLocal = paisesAprobados.includes(countryCode) ? countryCode : 'MX';
                        localStorage.setItem('lumivia_pais', paisLocal!);
                        // Forzamos reactividad inicial
                        paisActual = paisLocal!;
                    })
                    .catch(() => {
                        localStorage.setItem('lumivia_pais', 'MX');
                    });
            } else {
                paisActual = paisLocal;
            }
        }
    });
</script>

<svelte:window onclick={handleClickOutside} />

<svelte:head>
    <title>Lumivia | Catálogo de Oportunidades</title>
    <meta name="description" content="Descubre oportunidades únicas de vuelos baratos. Catálogo completo de tarifas ocultas." />
    {#if schemaJSON}
        <script type="application/ld+json">
            {@html schemaJSON}
        </script>
    {/if}
</svelte:head>

<div class="bg-gray-50 text-lumiDark antialiased selection:bg-lumiCyan selection:text-white relative overflow-x-hidden min-h-screen flex flex-col">
    
    <div class="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-3 group">
        <div class="bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-2xl rounded-2xl p-4 text-xs font-medium text-gray-600 opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 w-max max-w-[260px] text-right origin-bottom-right">
            <p class="text-lumiDark font-extrabold mb-1 text-sm leading-tight">
                Únete a nuestro canal de Lumivia {nombresPais[paisActual] || 'México'} de WhatsApp
            </p>
            <span class="block mt-1">
                Recibe <strong class="text-emerald-600">errores de tarifa</strong> gratis antes que nadie.
            </span>
        </div>
        <a href="https://chat.whatsapp.com/TU_ENLACE_AQUI" target="_blank" class="flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-emerald-400 to-emerald-500 rounded-full shadow-[0_8px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.5)] hover:scale-105 transition-all duration-300 relative focus:outline-none">
            <div class="absolute inset-0 rounded-full border border-white/60 animate-ping opacity-75 duration-1000"></div>
            <svg class="w-7 h-7 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
        </a>
    </div>

    <div class="fixed top-0 left-0 w-full h-[800px] overflow-hidden -z-10 pointer-events-none">
        <div class="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-lumiCyan/10 blur-[100px]"></div>
        <div class="absolute top-[5%] -right-[10%] w-[40%] h-[40%] rounded-full bg-lumiGold/10 blur-[100px]"></div>
        <div class="absolute inset-0 bg-grid-pattern opacity-40"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/90 to-gray-50"></div>
    </div>

    <header class="bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-200/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center gap-4">
                <button onclick={volverAlPais} class="text-gray-400 hover:text-lumiDark transition-colors cursor-pointer" title="Volver al inicio">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <span class="text-2xl font-extrabold tracking-tighter text-lumiDark">
                    Lumivia <span class="text-lumiCyan font-light">| Catálogo</span>
                </span>
            </div>

            <div class="flex items-center gap-4">
                <a href="https://vuelos.lumivia.app/" target="_blank" class="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-lumiDark transition-colors hidden sm:flex">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Vuelos
                </a>
                <a href="https://www.stay22.com/allez/roam?aid=lumivia" target="_blank" class="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-lumiCyan transition-colors hidden sm:flex">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Hoteles
                </a>
                <div class="h-4 w-px bg-gray-200 hidden sm:block"></div>

                <div class="relative inline-block text-left" id="custom-country-selector">
                    <button type="button" onclick={toggleDropdown} class="inline-flex items-center justify-center w-full rounded-full border border-gray-200 shadow-sm px-4 py-1.5 bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 focus:outline-none focus:border-lumiCyan transition-colors gap-2 cursor-pointer">
                        <img src={banderaActual} alt={paisActual} class="w-4 h-auto rounded-sm shadow-sm" />
                        <span>{monedaActual}</span>
                        <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {#if dropdownAbierto}
                    <div class="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden border border-gray-100">
                        <div class="py-1">
                            <button onclick={() => seleccionarPais('MX')} class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors">
                                <img src="https://flagcdn.com/w20/mx.png" alt="MX" class="w-5 h-auto rounded-sm shadow-sm" /> México (MXN)
                            </button>
                            <button onclick={() => seleccionarPais('CO')} class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors">
                                <img src="https://flagcdn.com/w20/co.png" alt="CO" class="w-5 h-auto rounded-sm shadow-sm" /> Colombia (COP)
                            </button>
                            <button onclick={() => seleccionarPais('CL')} class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors">
                                <img src="https://flagcdn.com/w20/cl.png" alt="CL" class="w-5 h-auto rounded-sm shadow-sm" /> Chile (CLP)
                            </button>
                            <button onclick={() => seleccionarPais('CR')} class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors">
                                <img src="https://flagcdn.com/w20/cr.png" alt="CR" class="w-5 h-auto rounded-sm shadow-sm" /> Costa Rica (USD)
                            </button>
                        </div>
                    </div>
                    {/if}
                </div>
            </div>
        </div>
    </header>
<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12 flex-1">
        <div class="mb-12 text-center relative z-10">
            <h1 class="text-3xl md:text-4xl font-black tracking-tight text-lumiDark mb-6">
                Catálogo de Oportunidades
            </h1>

            <div class="max-w-xl mx-auto mb-6 relative z-20 group">
                <div class="bg-white/80 backdrop-blur-xl p-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/40 flex flex-col sm:flex-row items-center gap-2 transform transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgb(0,210,255,0.15)] ring-1 ring-black/5">
                    <div class="pl-4 text-gray-400 hidden sm:block">
                        <svg class="w-5 h-5 text-lumiCyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>

                    <form class="w-full flex flex-col sm:flex-row gap-2" onsubmit={enviarNewsletter}>
                        <input
                            type="email"
                            placeholder="Ingresa tu correo para recibir nuestra selección..."
                            required
                            class="w-full bg-transparent border-none focus:ring-0 text-lumiDark placeholder-gray-400 px-4 py-2 text-sm outline-none"
                            bind:value={nlEmail}
                        />

                        <button
                            type="submit"
                            class="bg-lumiDark text-white hover:bg-black px-6 py-2.5 rounded-full font-bold transition-all shadow-md active:scale-95 text-sm whitespace-nowrap w-full sm:w-auto"
                            disabled={nlEnviando}
                        >
                            {nlEnviando ? 'Guardando...' : 'Suscribirme Gratis'}
                        </button>
                    </form>
                </div>

                {#if nlEstado !== ''}
                    <p id="nl-mensaje" class="text-center text-sm font-bold mt-4 {nlEstado === 'ok' ? 'text-emerald-500' : nlEstado === 'ya' ? 'text-lumiCyan' : 'text-red-500'}">
                        {nlMensaje}
                    </p>
                {/if}
            </div>
        </div>

        <div id="hook-deals" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20">
            {#if deals.length === 0}
                <div class="col-span-full text-center text-gray-400 py-20 font-medium">
                    Aún no hay ofertas activas en la bóveda de {nombresPais[paisActual] || paisActual}.
                </div>
            {:else}
                {#each deals as deal}
                    {@const imgFinal = obtenerImagenDestino(deal.destino, deal.url_imagen)}
                    {@const tiempoTranscurrido = calcularTiempoTranscurrido(deal.created_at)}
                    {@const fechasCortas = `${formatearFechaCorta(deal.fecha_salida)} - ${formatearFechaCorta(deal.fecha_regreso)}`}
                    {@const nacionales = destinosNacionales[paisActual] || []}
                    {@const esInternacional = !nacionales.includes((deal.destino || '').toUpperCase())}
                    {@const esVip = deal.tipo_vuelo === 'directo'}
                    {@const etiquetaHot = deal.calidad_oferta >= 9}
                    {@const monedaDeal = (deal.moneda || deal.currency || monedaActual).toUpperCase()}

                    <article
                        id={`vuelo-hook-${deal.id}`}
                        class="card-minimal flex flex-col group cursor-pointer hover:shadow-xl transition-shadow duration-300 h-full bg-white rounded-2xl overflow-hidden border border-gray-100 {vuelosReportados.has(deal.id) ? 'opacity-30' : ''}"
                        onclick={() => abrirModal(deal)}
                    >
                        <div class="relative h-56 overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                                src={imgFinal}
                                alt={deal.titulo_gancho || 'Oferta Especial'}
                                class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                            />

                            <div class="absolute inset-0 bg-gradient-to-t from-lumiDark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div class="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-lumiDark text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm tracking-wide border border-white/50 uppercase flex items-center gap-1">
                                ⏱️ {tiempoTranscurrido}
                            </div>

                            {#if esVip}
                                <div class="absolute top-4 right-4 badge-vip-glass text-white text-[10px] font-black px-3 py-1.5 rounded-full z-10 flex items-center gap-1.5 uppercase tracking-widest shadow-lg">
                                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                    Directo
                                </div>
                            {/if}

                            <button
                                onclick={(e) => reportarCambioPrecio(deal.id, e)}
                                title="¿El precio subió? Repórtalo"
                                class="absolute bottom-3 right-3 bg-white/80 hover:bg-red-50 text-gray-500 hover:text-red-500 backdrop-blur-sm p-2.5 rounded-full shadow-sm border border-white/50 transition-colors z-10"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-1 6-1-1H11.5l-1-1H5v10m0 0h4" />
                                </svg>
                            </button>
                        </div>

                        <div class="p-6 flex flex-col flex-grow bg-white relative">
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center gap-2">
                                    <div class="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">
                                        <span>{deal.origen || 'ORG'}</span>
                                        <span class="mx-0.5 font-normal text-gray-300">➔</span>
                                        <span>{deal.destino || 'DST'}</span>
                                    </div>

                                    {#if etiquetaHot}
                                        <span class="text-red-500 font-extrabold flex items-center gap-1 text-[10px] uppercase tracking-wider">
                                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd" />
                                            </svg>
                                            HOT
                                        </span>
                                    {/if}
                                </div>

                                <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {fechasCortas}
                                </div>
                            </div>

                            <h3 class="text-xl font-bold mb-4 text-lumiDark group-hover:text-lumiCyan transition-colors leading-snug line-clamp-2">
                                {deal.titulo_gancho || 'Oferta Especial'}
                            </h3>

                            <div class="flex items-center flex-wrap gap-2 text-[10px] font-semibold text-gray-500 mb-6 uppercase tracking-widest">
                                <span class="flex items-center gap-1">
                                    <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Hospedaje
                                </span>
                                <span class="text-gray-300">•</span>
                                <span class="flex items-center gap-1">
                                    <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.5 21a2.5 2.5 0 005-5V5a2 2 0 00-2-2h-3.5M10 21H5a2 2 0 01-2-2V5a2 2 0 012-2h5m4 18h-4" />
                                    </svg>
                                    Tours
                                </span>
                                {#if esInternacional}
                                    <span class="text-gray-300">•</span>
                                    <span class="flex items-center gap-1">
                                        <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 117.778 0M12 20h.01m-7.08-7.071a10 10 0 1114.142 0" />
                                        </svg>
                                        eSIM
                                    </span>
                                {/if}
                            </div>

                            <div class="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
                                <div>
                                    <p class="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">
                                        Vuelo Id/Vt
                                    </p>
                                    <p class="text-2xl font-black text-lumiDark leading-none tracking-tight">
                                        ${Number(deal.precio || 0).toLocaleString('en-US')}
                                        <span class="text-xs font-semibold text-gray-500">{monedaDeal}</span>
                                    </p>
                                </div>

                                <div class="flex items-center gap-3">
                                    <button
                                        onclick={(e) => copiarUrlUnica(deal.id, e)}
                                        title="Copiar enlace"
                                        class="text-gray-400 hover:text-lumiCyan transition-colors p-2"
                                    >
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                    </button>
                                    <span class="text-lumiCyan hover:text-lumiDark font-bold text-sm transition-colors cursor-pointer">
                                        Ver Oferta
                                    </span>
                                </div>
                            </div>
                        </div>
                    </article>
                {/each}
            {/if}
        </div>

        <div class="bg-lumiDark rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden relative flex flex-col md:flex-row items-center justify-between gap-10 border border-gray-800 mb-10">
            <div class="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
                <svg width="300" height="300" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2L1 21h22L12 2zm0 3.83L19.17 19H4.83L12 5.83zM11 16h2v2h-2v-2zm0-7h2v5h-2V9z" />
                </svg>
            </div>

            <div class="relative z-10 md:w-1/2 text-center md:text-left">
                <div class="inline-flex items-center gap-1.5 text-lumiCyan text-xs font-bold uppercase tracking-widest mb-3">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Alerta Personalizada
                </div>
                <h3 class="text-3xl font-bold text-white mb-4">¿No ves tu destino soñado?</h3>
                <p class="text-gray-400 font-light leading-relaxed">
                    Dinos desde dónde sales, a dónde quieres ir y en qué mes. Nuestro sistema rastreará los precios 24/7 y te avisaremos por correo en cuanto detectemos el momento perfecto.
                </p>
            </div>

            <div class="relative z-10 md:w-1/2 w-full bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                <form class="space-y-4" onsubmit={enviarRadar}>
                    <div>
                        <label class="block text-xs font-semibold text-gray-400 mb-1">Tu Nombre</label>
                        <input
                            type="text"
                            placeholder="Ej. Juan Pérez"
                            required
                            class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-lumiCyan transition"
                            bind:value={leadNombre}
                        />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-gray-400 mb-1">Origen</label>
                            <input
                                type="text"
                                placeholder={paisActual === 'CO' ? 'Ej. Bogotá' : paisActual === 'CL' ? 'Ej. Santiago' : paisActual === 'CR' ? 'Ej. San José' : 'Ej. CDMX'}
                                required
                                class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-lumiCyan transition"
                                bind:value={leadOrigen}
                            />
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-gray-400 mb-1">Destino</label>
                            <input
                                type="text"
                                placeholder="Ej. París"
                                required
                                class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-lumiCyan transition"
                                bind:value={leadDestino}
                            />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="relative">
                            <label class="block text-xs font-semibold text-gray-400 mb-1">Mes aproximado</label>
                            <select
                                required
                                class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lumiCyan transition appearance-none cursor-pointer"
                                bind:value={leadMes}
                            >
                                <option value="" disabled selected>Elige un mes...</option>
                                {#each mesesDisponibles as mes}
                                    <option value={mes} class="bg-lumiDark text-white">{mes}</option>
                                {/each}
                            </select>
                            <div class="pointer-events-none absolute bottom-0 right-0 flex items-center px-4 py-3 text-gray-400">
                                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-gray-400 mb-1">Correo Electrónico</label>
                            <input
                                type="email"
                                placeholder="tucorreo@ejemplo.com"
                                required
                                class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-lumiCyan transition"
                                bind:value={leadContacto}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        class="w-full bg-lumiCyan hover:bg-lumiCyanDark text-lumiDark font-bold py-3 rounded-lg transition-colors shadow-lg mt-2 disabled:opacity-60"
                        disabled={radarEnviando}
                    >
                        {radarEnviando ? 'Activando...' : 'Activar mi Radar 🎯'}
                    </button>

                    {#if radarExito}
                        <p id="form-exito" class="text-emerald-400 text-sm font-semibold text-center mt-2">
                            ¡Radar activado! Revisa tu correo pronto.
                        </p>
                    {/if}
                </form>
            </div>
        </div>

        {#if totalPages > 1}
            <nav class="flex items-center justify-center gap-2 mt-4">
                <button
                    class="px-3 py-1 text-xs rounded-full border border-gray-200 text-gray-600 disabled:opacity-40"
                    onclick={() => irAPagina(page - 1)}
                    disabled={page === 1}
                >
                    Anterior
                </button>

                {#each Array(totalPages) as _, i}
                    <button
                        class="px-3 py-1 text-xs rounded-full border {i + 1 === page ? 'bg-lumiCyan text-lumiDark border-lumiCyan' : 'border-gray-200 text-gray-600'}"
                        onclick={() => irAPagina(i + 1)}
                    >
                        {i + 1}
                    </button>
                {/each}

                <button
                    class="px-3 py-1 text-xs rounded-full border border-gray-200 text-gray-600 disabled:opacity-40"
                    onclick={() => irAPagina(page + 1)}
                    disabled={page === totalPages}
                >
                    Siguiente
                </button>
            </nav>
        {/if}
    </main>
{#if modalAbierto && dealSeleccionado}
            {@const imgModal = obtenerImagenDestino(dealSeleccionado.destino, dealSeleccionado.url_imagen)}
            {@const { linkHotelFinal, urlDestinoAiralo, urlDestinoTour } = obtenerLinksExtras(dealSeleccionado)}
            {@const esInternacional = esInternacionalDestino(dealSeleccionado.destino)}

            <div
                id="modal-paquete"
                class="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-black/60 backdrop-blur-sm"
            >
                <div
                    id="modal-content"
                    class="relative w-full h-full md:h-auto md:max-h-[90vh] max-w-4xl bg-white md:rounded-3xl shadow-2xl flex flex-col md:flex-row transform scale-100 overflow-y-auto md:overflow-hidden"
                >
                    <div class="w-full md:w-5/12 relative h-64 md:h-auto bg-gray-100 flex-shrink-0">
                        <img id="modal-img" src={imgModal} alt="Imagen destino" class="w-full h-full object-cover" />

                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                        <button
                            onclick={cerrarModal}
                            class="absolute top-4 right-4 md:hidden bg-black/30 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/50 transition-colors z-20"
                            aria-label="Cerrar modal"
                        >
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div class="absolute bottom-6 left-6 right-6">
                            <span
                                id="modal-route"
                                class="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/30 uppercase tracking-widest mb-2 inline-block"
                            >
                                {dealSeleccionado.origen || 'ORG'} → {dealSeleccionado.destino || 'DST'}
                            </span>

                            <h2 id="modal-title" class="text-3xl font-black text-white leading-tight">
                                {dealSeleccionado.titulo_gancho || 'Oferta Especial'}
                            </h2>
                        </div>
                    </div>

                    <div class="w-full md:w-7/12 flex flex-col bg-white relative">
                        <button
                            onclick={cerrarModal}
                            class="absolute top-6 right-6 hidden md:block text-gray-400 hover:text-black transition-colors z-10"
                            aria-label="Cerrar modal"
                        >
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div class="p-6 md:px-8 md:pt-6 md:pb-2 flex-grow md:overflow-y-auto no-scrollbar">
                            <div class="flex items-center gap-3 mb-6">
                                <span class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </span>

                                <h3 class="text-sm font-bold text-gray-900 uppercase tracking-widest">
                                    Análisis de Viaje
                                </h3>
                            </div>

                            <div id="modal-body" class="text-gray-600 text-sm leading-relaxed space-y-4 font-medium">
                                {@html (dealSeleccionado.cuerpo_post ||
                                    'Hemos detectado esta tarifa excepcional. Verifica disponibilidad rápida antes de que cambien los precios.')
                                    .replace(/(👇\s*Comenta[\s\S]*)/gi, '')
                                    .replace(/\n/g, '<br>')}
                            </div>

                            <div id="modal-extras" class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {#if linkHotelFinal && linkHotelFinal !== 'Sin hotel sugerido'}
                                    <a
                                        href={linkHotelFinal}
                                        target="_blank"
                                        class="relative overflow-hidden rounded-2xl h-[72px] group block shadow-sm border border-gray-100"
                                    >
                                        <img
                                            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80"
                                            alt="Hotel sugerido"
                                            class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20"></div>
                                        <div class="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                            <div>
                                                <p class="text-[9px] text-white/70 font-bold uppercase tracking-widest mb-0.5">
                                                    Hospedaje
                                                </p>
                                                <p class="text-sm font-bold text-white leading-tight">
                                                    Ver Hotel Sugerido
                                                </p>
                                            </div>
                                            <div class="bg-white/20 backdrop-blur-md p-1.5 rounded-full text-white">
                                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </a>
                                {/if}

                                <a
                                    href={urlDestinoTour}
                                    target="_blank"
                                    class="relative overflow-hidden rounded-2xl h-[72px] group block shadow-sm border border-gray-100"
                                >
                                    <img
                                        src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=400&q=80"
                                        alt="Tours sugeridos"
                                        class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20"></div>
                                    <div class="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                        <div>
                                            <p class="text-[9px] text-white/70 font-bold uppercase tracking-widest mb-0.5">
                                                Tours y Excursiones
                                            </p>
                                            <p class="text-sm font-bold text-white leading-tight">
                                                Ver Actividades Sugeridas
                                            </p>
                                        </div>
                                        <div class="bg-white/20 backdrop-blur-md p-1.5 rounded-full text-white">
                                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </a>

                                {#if esInternacional}
                                    <a
                                        href={urlDestinoAiralo}
                                        target="_blank"
                                        class="relative overflow-hidden rounded-2xl h-[72px] group block shadow-sm border border-gray-100"
                                    >
                                        <img
                                            src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80"
                                            alt="eSIM Airalo"
                                            class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20"></div>
                                        <div class="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                            <div>
                                                <p class="text-[9px] text-white/70 font-bold uppercase tracking-widest mb-0.5">
                                                    eSIM Airalo (-15% OFF)
                                                </p>
                                                <p class="text-sm font-bold text-white leading-tight flex items-center gap-1">
                                                    Cupón:
                                                    <span class="bg-white text-lumiDark px-1 rounded text-xs">
                                                        LUMIVIA
                                                    </span>
                                                </p>
                                            </div>
                                            <div class="bg-white/20 backdrop-blur-md p-1.5 rounded-full text-white">
                                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M8.111 16.404a5.5 5.5 0 117.778 0M12 20h.01m-7.08-7.071a10 10 0 1114.142 0"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </a>

                                    <a
                                        href="https://ektatraveling.tpo.li/5ArJqp2u"
                                        target="_blank"
                                        class="relative overflow-hidden rounded-2xl h-[72px] group block shadow-sm border border-gray-100"
                                    >
                                        <img
                                            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80"
                                            alt="Seguro de viaje Ekta"
                                            class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20"></div>
                                        <div class="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                            <div>
                                                <p class="text-[9px] text-white/70 font-bold uppercase tracking-widest mb-0.5">
                                                    Asistencia Médica
                                                </p>
                                                <p class="text-sm font-bold text-white leading-tight">
                                                    Seguro de Viaje Ekta
                                                </p>
                                            </div>
                                            <div class="bg-white/20 backdrop-blur-md p-1.5 rounded-full text-white">
                                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </a>
                                {/if}
                            </div>
                        </div>

                        <div class="p-6 md:px-8 md:py-5 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
                            <div class="flex items-end justify-between mb-6">
                                <div>
                                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                        Inversión Vuelo
                                    </p>

                                    <p id="modal-price" class="text-4xl font-black text-lumiDark">
                                        ${Number(dealSeleccionado.precio || 0).toLocaleString('en-US')}
                                        <span class="text-sm font-semibold text-gray-500">
                                            {(dealSeleccionado.moneda || dealSeleccionado.currency || monedaActual).toUpperCase()}
                                        </span>
                                    </p>
                                </div>

                                <div class="text-right">
                                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                        Fechas
                                    </p>

                                    <p id="modal-dates" class="text-sm font-semibold text-gray-700">
                                        {formatearFechaCorta(dealSeleccionado.fecha_salida)} -
                                        {formatearFechaCorta(dealSeleccionado.fecha_regreso)}
                                    </p>
                                </div>
                            </div>

                            <a
                                id="modal-link"
                                href={dealSeleccionado.link_compra || 'https://vuelos.lumivia.app/'}
                                target="_blank"
                                class="block w-full text-center bg-lumiDark text-white py-4 rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-lg active:scale-95 cursor-pointer border-none outline-none"
                            >
                                Reservar Vuelo
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        {/if}

    <footer class="bg-white border-t border-gray-200 py-10">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <p class="font-extrabold text-lumiDark mb-2 text-base">Lumivia</p>

            <div class="flex flex-wrap justify-center gap-4 sm:gap-8 text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-6">
                <a href="/terminos" class="hover:text-lumiCyan transition-colors">Términos de Uso</a>
                <a href="/privacidad" class="hover:text-lumiCyan transition-colors">Privacidad</a>
                <a href="/afiliacion" class="hover:text-lumiCyan transition-colors">Afiliados</a>
            </div>

            <p class="text-[9px] text-gray-500 max-w-xl mx-auto leading-relaxed">
                © 2026 Lumivia. Todos los derechos reservados. Lumivia es un motor de búsqueda independiente. Al usar
                este sitio, usted acepta que las transacciones ocurren en plataformas de terceros bajo sus propios
                términos legales.
            </p>
        </div>
    </footer>
</div>
