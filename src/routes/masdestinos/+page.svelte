<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  import { createClient } from '@supabase/supabase-js';
  import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

  const { data } = $props<PageData>();
  const datos = $derived(data);

  const pais = $derived(datos.pais);
  const page = $derived(datos.page);
  const totalPages = $derived(datos.totalPages);
  const deals = $derived(datos.deals);
  const schemaJSON = $derived(datos.schemaJSON);

  const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

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

  let paisActual = $state(pais || 'MX');
  let monedaActual = $state(configMercado[paisActual]?.moneda ?? 'MXN');
  let banderaActual = $state(configMercado[paisActual]?.bandera ?? 'https://flagcdn.com/w20/mx.png');

  const nombresPais: Record<string, string> = {
    MX: 'México',
    CO: 'Colombia',
    CL: 'Chile',
    CR: 'Costa Rica'
  };

  let modalAbierto = $state(false);
  let dealSeleccionado = $state<any | null>(null);

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

  let mesesDisponibles = $state<string[]>([]);
  let vuelosReportados = new Set<number | string>();
  const alaProhibida = '1436491865332-7a61a109cc05';

  function handleSubmitNewsletter(e: Event) {
    e.preventDefault();
    enviarNewsletter();
  }

  function handleSubmitRadar(e: Event) {
    e.preventDefault();
    enviarRadar();
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
    goto(`/masdestinos?pais=${paisActual}&page=${n}`);
  }

  function volverAlPais() {
    const paisGuardado = typeof localStorage !== 'undefined' ? localStorage.getItem('lumivia_pais') : null;
    goto('/' + (paisGuardado?.toLowerCase() || 'mx'));
  }

  function seleccionarPais(codigoPais: string) {
    paisActual = codigoPais;
    const conf = configMercado[codigoPais] ?? configMercado['MX'];
    monedaActual = conf.moneda;
    banderaActual = conf.bandera;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lumivia_pais', paisActual);
    }
    goto(`/masdestinos?pais=${codigoPais}&page=1`);
  }

  const diccionarioInfalible: Record<string, string[]> = {
    CUN: ['1500530855456-1e2a1c1a1c1a', '1516483638261-f4dbaf036963'],
    MEX: ['1526402461234-4f3b5c2b9a1a', '1526481280695-3c687fd543c0'],
    GDL: ['1526481280695-3c687fd543c0', '1526402461234-4f3b5c2b9a1a']
    // ... tu diccionario real aquí
  };

  function obtenerImagenDestino(destino: string | null | undefined, url_imagen?: string | null) {
    let imgFinal = url_imagen || '';
    const destinoLimpio = (destino || '').trim().toUpperCase();

    if (!imgFinal || imgFinal.trim() === '' || imgFinal.includes(alaProhibida) || imgFinal === 'null') {
      if (diccionarioInfalible[destinoLimpio]) {
        const listaFotos = diccionarioInfalible[destinoLimpio];
        const fotoId = listaFotos[Math.floor(Math.random() * listaFotos.length)];
        imgFinal = `https://images.unsplash.com/photo-${fotoId}?auto=format&fit=crop&w=800&q=80&fm=webp`;
      } else {
        imgFinal =
          'https://images.unsplash.com/photo-1488085061387-422e15b40b18?auto=format&fit=crop&w=800&q=80&fm=webp';
      }
    } else if (!imgFinal.startsWith('http')) {
      imgFinal = `https://images.unsplash.com/photo-${imgFinal}?auto=format&fit=crop&w=800&q=80&fm=webp`;
    }
    return imgFinal;
  }

  function abrirModal(deal: any) {
    dealSeleccionado = deal;
    modalAbierto = true;
  }

  function cerrarModal() {
    modalAbierto = false;
    dealSeleccionado = null;
  }

  async function enviarNewsletter() {
    nlEnviando = true;
    nlMensaje = '';
    nlEstado = '';

    const { error } = await supabase
      .from('suscriptores_radar')
      .insert([{ email: nlEmail.toLowerCase(), pais: paisActual, nombre: 'Viajero' }]);

    nlEnviando = false;

    if (!error) {
      nlMensaje = '¡Listo! Te avisaremos de las mejores gangas.';
      nlEstado = 'ok';
      nlEmail = '';
    } else if ((error as any).code === '23505') {
      nlMensaje = '¡Ya estás en nuestra lista!';
      nlEstado = 'ya';
    } else {
      nlMensaje = 'Error de conexión. Intenta de nuevo.';
      nlEstado = 'error';
    }
  }

  async function enviarRadar() {
    radarEnviando = true;
    radarExito = false;

    const { error } = await supabase.from('radares_personales').insert([
      {
        nombre: leadNombre,
        origen: leadOrigen,
        destino: leadDestino,
        mes_esperado: leadMes,
        contacto: leadContacto,
        status: 'pendiente_verificacion'
      }
    ]);

    radarEnviando = false;

    if (!error) {
      radarExito = true;
      leadNombre = '';
      leadOrigen = '';
      leadDestino = '';
      leadMes = '';
      leadContacto = '';
    } else {
      alert('Hubo un error al guardar. Intenta de nuevo.');
      console.error(error);
    }
  }

  async function reportarCambioPrecio(id: number | string, e?: Event) {
    if (e) e.stopPropagation();
    if (vuelosReportados.has(id)) return;
    vuelosReportados.add(id);
    try {
      await supabase.from('reportes_precios').insert([{ deal_id: id }]);
    } catch (err) {
      console.error(err);
    }
  }

  async function copiarUrlUnica(id: number | string, e?: Event) {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}/r/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      alert('Enlace copiado al portapapeles');
    } catch (err) {
      console.error(err);
    }
  }

  onMount(() => {
    const fechaActual = new Date();
    const meses: string[] = [];
    for (let i = 0; i < 12; i++) {
      const fechaFutura = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + i, 1);
      const mesTexto = fechaFutura.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      const mesFormateado = mesTexto.charAt(0).toUpperCase() + mesTexto.slice(1);
      meses.push(mesFormateado);
    }
    mesesDisponibles = meses;

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
          })
          .catch(() => {
            localStorage.setItem('lumivia_pais', 'MX');
          });
      }
    }
  });
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

<header class="bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-200/50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    <div class="flex items-center gap-4">
      <button
        onclick={volverAlPais}
        class="text-gray-400 hover:text-lumiDark transition-colors cursor-pointer"
        title="Volver al inicio"
        type="button"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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

      <div class="h-4 w-px bg-gray-200 hidden sm:block"></div>

      <div class="relative inline-block text-left">
        <button
          type="button"
          class="inline-flex items-center justify-center w-full rounded-full border border-gray-200 shadow-sm px-4 py-1.5 bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 focus:outline-none focus:border-lumiCyan transition-colors gap-2 cursor-pointer"
        >
          <img src={banderaActual} alt={paisActual} class="w-4 h-auto rounded-sm shadow-sm" />
          <span>{monedaActual}</span>
          <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div
          class="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden border border-gray-100"
        >
          <div class="py-1">
            <button
              type="button"
              onclick={() => seleccionarPais('MX')}
              class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors"
            >
              <img src="https://flagcdn.com/w20/mx.png" alt="MX" class="w-5 h-auto rounded-sm shadow-sm" />
              México (MXN)
            </button>

            <button
              type="button"
              onclick={() => seleccionarPais('CO')}
              class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors"
            >
              <img src="https://flagcdn.com/w20/co.png" alt="CO" class="w-5 h-auto rounded-sm shadow-sm" />
              Colombia (COP)
            </button>

            <button
              type="button"
              onclick={() => seleccionarPais('CL')}
              class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors"
            >
              <img src="https://flagcdn.com/w20/cl.png" alt="CL" class="w-5 h-auto rounded-sm shadow-sm" />
              Chile (CLP)
            </button>

            <button
              type="button"
              onclick={() => seleccionarPais('CR')}
              class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors"
            >
              <img src="https://flagcdn.com/w20/cr.png" alt="CR" class="w-5 h-auto rounded-sm shadow-sm" />
              Costa Rica (USD)
            </button>
          </div>
        </div>
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
            />
          </svg>
        </div>

        <form class="w-full flex flex-col sm:flex-row gap-2" onsubmit={handleSubmitNewsletter}>
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
        <p
          id="nl-mensaje"
          class="text-center text-sm font-bold mt-4 {nlEstado === 'ok'
            ? 'text-emerald-500'
            : nlEstado === 'ya'
            ? 'text-lumiCyan'
            : 'text-red-500'}"
        >
          {nlMensaje}
        </p>
      {/if}
    </div>
  </div>

  <div id="hook-deals" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20">
    {#if deals.length === 0}
      <div class="col-span-full text-center text-gray-400 py-20 font-medium">
        Aún no hay ofertas activas en la bóveda de {paisActual}.
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
          class="card-minimal flex flex-col group hover:shadow-xl transition-shadow duration-300 h-full bg-white rounded-2xl overflow-hidden border border-gray-100 {vuelosReportados.has(deal.id) ? 'opacity-30' : ''}"
        >
          <div class="relative h-56 overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={imgFinal}
              alt={deal.titulo_gancho || 'Oferta Especial'}
              class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
            />

            <div
              class="absolute inset-0 bg-gradient-to-t from-lumiDark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></div>

            <div
              class="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-lumiDark text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm tracking-wide border border-white/50 uppercase flex items-center gap-1"
            >
              ⏱️ {tiempoTranscurrido}
            </div>

            {#if esVip}
              <div
                class="absolute top-4 right-4 badge-vip-glass text-white text-[10px] font-black px-3 py-1.5 rounded-full z-10 flex items-center gap-1.5 uppercase tracking-widest shadow-lg"
              >
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  />
                </svg>
                Directo
              </div>
            {/if}

            <button
              type="button"
              onclick={(e) => {
                e.stopPropagation();
                reportarCambioPrecio(deal.id, e);
              }}
              title="¿El precio subió? Repórtalo"
              class="absolute bottom-3 right-3 bg-white/80 hover:bg-red-50 text-gray-500 hover:text-red-500 backdrop-blur-sm p-2.5 rounded-full shadow-sm border border-white/50 transition-colors z-10"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-1 6-1-1H11.5l-1-1H5v10m0 0h4"
                />
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
                  <span
                    class="text-red-500 font-extrabold flex items-center gap-1 text-[10px] uppercase tracking-wider"
                  >
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    HOT
                  </span>
                {/if}
              </div>

              <div
                class="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                {fechasCortas}
              </div>
            </div>

            <h3
              class="text-xl font-bold mb-4 text-lumiDark group-hover:text-lumiCyan transition-colors leading-snug line-clamp-2"
            >
              {deal.titulo_gancho || 'Oferta Especial'}
            </h3>

            <div
              class="flex items-center flex-wrap gap-2 text-[10px] font-semibold text-gray-500 mb-6 uppercase tracking-widest"
            >
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Hospedaje
              </span>

              <span class="text-gray-300">•</span>

              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14.5 21a2.5 2.5 0 005-5V5a2 2 0 00-2-2h-3.5M10 21H5a2 2 0 01-2-2V5a2 2 0 012-2h5m4 18h-4"
                  />
                </svg>
                Tours
              </span>

              {#if esInternacional}
                <span class="text-gray-300">•</span>

                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8.111 16.404a5.5 5.5 0 117.778 0M12 20h.01m-7.08-7.071a10 10 0 1114.142 0"
                    />
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
                  <span class="text-xs font-semibold text-gray-400">{monedaDeal}</span>
                </p>
              </div>

              <div class="flex items-center gap-3">
                <button
                  type="button"
                  onclick={(e) => copiarUrlUnica(deal.id, e)}
                  title="Copiar enlace"
                  class="text-gray-400 hover:text-lumiCyan transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  onclick={() => abrirModal(deal)}
                  class="text-lumiCyan hover:text-lumiDark font-bold text-sm transition-colors cursor-pointer"
                >
                  Ver Oferta
                </button>
              </div>
            </div>
          </div>
        </article>
      {/each}
    {/if}
  </div>

  <section id="radar-personal" class="max-w-3xl mx-auto mb-24">
    <div class="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <h2 class="text-2xl font-black text-lumiDark mb-4 text-center">
        Radar Personal
      </h2>

      <p class="text-gray-500 text-center mb-8 text-sm leading-relaxed">
        Cuéntanos qué vuelo buscas y te avisamos cuando aparezca una ganga real.
      </p>

      <form class="space-y-6" onsubmit={handleSubmitRadar}>
        <div>
          <label for="radar-nombre" class="block text-xs font-semibold text-gray-400 mb-1">
            Tu Nombre
          </label>
          <input
            id="radar-nombre"
            type="text"
            bind:value={leadNombre}
            required
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-lumiCyan focus:border-lumiCyan outline-none text-sm"
            placeholder="Ej. Ana"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="radar-origen" class="block text-xs font-semibold text-gray-400 mb-1">
              Origen
            </label>
            <input
              id="radar-origen"
              type="text"
              bind:value={leadOrigen}
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-lumiCyan focus:border-lumiCyan outline-none text-sm"
              placeholder="Ej. MEX"
            />
          </div>

          <div>
            <label for="radar-destino" class="block text-xs font-semibold text-gray-400 mb-1">
              Destino
            </label>
            <input
              id="radar-destino"
              type="text"
              bind:value={leadDestino}
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-lumiCyan focus:border-lumiCyan outline-none text-sm"
              placeholder="Ej. JFK"
            />
          </div>
        </div>

        <div>
          <label for="radar-mes" class="block text-xs font-semibold text-gray-400 mb-1">
            Mes aproximado
          </label>
          <select
            id="radar-mes"
            bind:value={leadMes}
            required
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-lumiCyan focus:border-lumiCyan outline-none text-sm bg-white"
          >
            <option value="" disabled>Selecciona un mes</option>
            {#each mesesDisponibles as mes}
              <option value={mes}>{mes}</option>
            {/each}
          </select>
        </div>

        <div>
          <label for="radar-contacto" class="block text-xs font-semibold text-gray-400 mb-1">
            Correo Electrónico
          </label>
          <input
            id="radar-contacto"
            type="email"
            bind:value={leadContacto}
            required
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-lumiCyan focus:border-lumiCyan outline-none text-sm"
            placeholder="ejemplo@correo.com"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-lumiCyan text-white font-bold py-3 rounded-xl hover:bg-lumiDark transition-all active:scale-95 shadow-md"
          disabled={radarEnviando}
        >
          {radarEnviando ? 'Enviando...' : 'Activar Radar'}
        </button>

        {#if radarExito}
          <p class="text-center text-emerald-500 font-bold text-sm mt-4">
            ¡Radar activado! Te avisaremos cuando aparezca una ganga.
          </p>
        {/if}
      </form>
    </div>
  </section>

  {#if modalAbierto && dealSeleccionado}
    <div
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] transition-opacity"
      role="button"
      tabindex="0"
      onclick={cerrarModal}
      onkeydown={(e) => {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') cerrarModal();
      }}
    ></div>

    <div
      class="fixed inset-0 flex items-center justify-center z-[1000] px-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative animate-fadeIn"
        role="document"
        onmousedown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onclick={cerrarModal}
          class="absolute top-4 right-4 bg-white/80 hover:bg-gray-100 text-gray-600 p-2 rounded-full shadow border border-gray-200 transition-colors"
          title="Cerrar"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="h-64 w-full overflow-hidden rounded-t-3xl">
          <img
            src={obtenerImagenDestino(dealSeleccionado.destino, dealSeleccionado.url_imagen)}
            alt={dealSeleccionado.titulo_gancho || 'Oferta Especial'}
            class="w-full h-full object-cover"
          />
        </div>

        <div class="p-8">
          <h2 class="text-2xl font-black text-lumiDark mb-3">
            {dealSeleccionado.titulo_gancho}
          </h2>

          <p class="text-gray-500 text-sm mb-4">
            {dealSeleccionado.origen} ➜ {dealSeleccionado.destino}
          </p>

          <p class="text-gray-600 font-semibold mb-6">
            {formatearFechaCorta(dealSeleccionado.fecha_salida)}
            —
            {formatearFechaCorta(dealSeleccionado.fecha_regreso)}
          </p>

          <div class="mb-8">
            <p class="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">
              Precio Final
            </p>
            <p class="text-3xl font-black text-lumiDark">
              ${Number(dealSeleccionado.precio).toLocaleString('en-US')}
              <span class="text-sm text-gray-400 font-semibold">
                {(dealSeleccionado.moneda || monedaActual).toUpperCase()}
              </span>
            </p>
          </div>

          <a
            href={dealSeleccionado.url}
            target="_blank"
            class="block w-full text-center bg-lumiCyan hover:bg-lumiDark text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-md mb-6"
          >
            Ver Oferta
          </a>

          <button
            type="button"
            onclick={() => copiarUrlUnica(dealSeleccionado.id)}
            class="w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all active:scale-95 shadow border border-gray-200"
          >
            Copiar enlace único
          </button>
        </div>
      </div>
    </div>
  {/if}

  {#if totalPages > 1}
    <div class="flex justify-center items-center gap-3 mt-10 mb-20">
      <button
        type="button"
        onclick={() => irAPagina(page - 1)}
        disabled={page <= 1}
        class="px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold text-sm"
      >
        ← Anterior
      </button>

      <div class="flex items-center gap-2">
        {#each Array(totalPages) as _, i}
          {@const n = i + 1}
          <button
            type="button"
            onclick={() => irAPagina(n)}
            class="w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold transition-all {page === n
              ? 'bg-lumiCyan text-white shadow'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}"
          >
            {n}
          </button>
        {/each}
      </div>

      <button
        type="button"
        onclick={() => irAPagina(page + 1)}
        disabled={page >= totalPages}
        class="px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold text-sm"
      >
        Siguiente →
      </button>
    </div>
  {/if}
</main>

<footer class="py-16 border-t border-gray-100 mt-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
      <div>
        <h3 class="text-xl font-black text-lumiDark mb-4">Lumivia</h3>
        <p class="text-gray-500 text-sm leading-relaxed">
          Encontramos oportunidades reales de vuelos baratos y las compartimos contigo.
          Sin humo. Sin trucos. Solo gangas.
        </p>
      </div>

      <div>
        <h4 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
          Información
        </h4>

        <ul class="space-y-3 text-sm font-semibold text-gray-600">
          <li>
            <a href="/terminos" class="hover:text-lumiCyan transition-colors">
              Términos y Condiciones
            </a>
          </li>
          <li>
            <a href="/privacidad" class="hover:text-lumiCyan transition-colors">
              Aviso de Privacidad
            </a>
          </li>
          <li>
            <a href="/afiliacion" class="hover:text-lumiCyan transition-colors">
              Programa de Afiliación
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h4 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
          Tu País
        </h4>

        <div class="flex flex-col gap-3 text-sm font-semibold text-gray-600">
          <button
            type="button"
            onclick={() => seleccionarPais('MX')}
            class="flex items-center gap-2 hover:text-lumiCyan transition-colors"
          >
            <img src="https://flagcdn.com/w20/mx.png" alt="MX" class="w-5 h-auto rounded-sm shadow-sm" />
            México (MXN)
          </button>

          <button
            type="button"
            onclick={() => seleccionarPais('CO')}
            class="flex items-center gap-2 hover:text-lumiCyan transition-colors"
          >
            <img src="https://flagcdn.com/w20/co.png" alt="CO" class="w-5 h-auto rounded-sm shadow-sm" />
            Colombia (COP)
          </button>

          <button
            type="button"
            onclick={() => seleccionarPais('CL')}
            class="flex items-center gap-2 hover:text-lumiCyan transition-colors"
          >
            <img src="https://flagcdn.com/w20/cl.png" alt="CL" class="w-5 h-auto rounded-sm shadow-sm" />
            Chile (CLP)
          </button>

          <button
            type="button"
            onclick={() => seleccionarPais('CR')}
            class="flex items-center gap-2 hover:text-lumiCyan transition-colors"
          >
            <img src="https://flagcdn.com/w20/cr.png" alt="CR" class="w-5 h-auto rounded-sm shadow-sm" />
            Costa Rica (USD)
          </button>
        </div>
      </div>
    </div>

    <div class="mt-16 text-center text-gray-400 text-xs font-semibold tracking-wider">
      © {new Date().getFullYear()} Lumivia — Todos los derechos reservados.
    </div>
  </div>
</footer>

<style>
  .card-minimal {
    background: #ffffff;
    border: 1px solid #f3f4f6;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .card-minimal:hover {
    transform: translateY(-4px);
    border: 1px solid #e5e7eb;
  }

  .badge-vip-glass {
    background: linear-gradient(
      135deg,
      rgba(194, 155, 87, 0.9) 0%,
      rgba(218, 186, 116, 0.95) 100%
    );
    backdrop-filter: blur(8px);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.25s ease-out;
  }
</style>
