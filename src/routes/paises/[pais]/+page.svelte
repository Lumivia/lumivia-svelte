<script lang="ts">
  import { onMount } from 'svelte';
  import Header from '$lib/components/Header.svelte';
  import ModalOferta from '$lib/components/ModalOferta.svelte';
  import DealCard from '$lib/components/DealCard.svelte';
  import RadarItem from '$lib/components/RadarItem.svelte';
  import Footer from '$lib/components/Footer.svelte';

  import { calcularTiempoTranscurrido } from '$lib/utils/fechas';
  import { supabase } from '$lib/supabaseClient';

  // 🔥 SVELTE 5: Recepción segura de los datos del servidor
  let { data } = $props();

  // 🔥 Reactividad Defensiva: Usamos '?.' por si el SSR tarda milisegundos en hidratar
  const title = $derived(`Vuelos baratos desde ${data.mercado?.nombre || 'tu país'} - Lumivia`);
  const description = $derived(`Ofertas destacadas y destinos populares desde ${data.mercado?.nombre || 'tu país'}.`);

  function handleSubmitNewsletter(e: Event) {
    e.preventDefault();
    enviarNewsletter();
  }

  function handleSubmitRadar(e: Event) {
    e.preventDefault();
    enviarRadar();
  }

  // -----------------------------
  // ESTADOS (RUNES)
  // -----------------------------
  let ofertasHook = $state<any[]>([]);
  let ofertasRadar = $state<any[]>([]);
  let ofertaSeleccionada = $state<any | null>(null);
  let modalAbierto = $state(false);

  let scrollContainer = $state<HTMLElement | null>(null);

  // Newsletter
  let emailNewsletter = $state('');
  let newsletterMensaje = $state('');
  let newsletterClase = $state('');
  let newsletterCargando = $state(false);

  // Radar personalizado
  let radarNombre = $state('');
  let radarOrigen = $state('');
  let radarDestino = $state('');
  let radarMes = $state('');
  let radarContacto = $state('');
  let radarExito = $state(false);
  let radarCargando = $state(false);
  let meses = $state<string[]>([]);

  // -----------------------------
  // PROCESAR OFERTAS
  // -----------------------------
  function procesarOfertasIniciales() {
    // Leemos 'destacadas' y 'masDestinos' extraídos directamente del load() del servidor
    if (data.destacadas) {
      ofertasHook = data.destacadas.map((d: any) => ({
        ...d,
        tiempoTranscurrido: calcularTiempoTranscurrido(d.created_at)
      }));
    }

    if (data.masDestinos) {
      ofertasRadar = data.masDestinos.map((d: any) => ({
        ...d,
        tiempoTranscurrido: calcularTiempoTranscurrido(d.created_at)
      }));
    }
  }

  // -----------------------------
  // CARRUSEL (BLINDADO)
  // -----------------------------
  function iniciarCarrusel() {
    if (!scrollContainer) return;

    const intervalo = setInterval(() => {
      // Prevención de errores si las ofertas aún no cargan en el DOM
      if (!scrollContainer || scrollContainer.children.length === 0) return;
      
      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;

      if (scrollContainer.scrollLeft >= maxScroll - 10) {
        scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Medimos el primer hijo de forma segura
        const primerHijo = scrollContainer.children[0] as HTMLElement;
        const avance = (primerHijo?.clientWidth || 300) + 24;
        scrollContainer.scrollBy({ left: avance, behavior: 'smooth' });
      }
    }, 5000);

    return () => clearInterval(intervalo);
  }

  // -----------------------------
  // NEWSLETTER
  // -----------------------------
  async function enviarNewsletter() {
    newsletterCargando = true;
    newsletterMensaje = '';
    newsletterClase = '';

    const { error } = await supabase
      .from('suscriptores_radar')
      .insert([{ email: emailNewsletter.toLowerCase(), pais: data.paisUpper, nombre: 'Viajero' }]);

    newsletterCargando = false;

    if (!error) {
      newsletterMensaje = '¡Listo! Te avisaremos de las mejores gangas.';
      newsletterClase = 'text-emerald-500';
      emailNewsletter = '';
    } else if (error.code === '23505') {
      newsletterMensaje = '¡Ya estás en nuestra lista!';
      newsletterClase = 'text-lumiCyan';
    } else {
      newsletterMensaje = 'Error de conexión. Intenta de nuevo.';
      newsletterClase = 'text-red-500';
    }
  }

  // -----------------------------
  // RADAR PERSONALIZADO
  // -----------------------------
  function poblarMeses() {
    const fechaActual = new Date();
    meses = [];

    for (let i = 0; i < 12; i++) {
      const fechaFutura = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + i, 1);
      const mesTexto = fechaFutura.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      meses.push(mesTexto.charAt(0).toUpperCase() + mesTexto.slice(1));
    }
  }

  async function enviarRadar() {
    radarCargando = true;
    radarExito = false;

    const { error } = await supabase
      .from('radares_personales')
      .insert([{
        nombre: radarNombre,
        origen: radarOrigen,
        destino: radarDestino,
        mes_esperado: radarMes,
        contacto: radarContacto,
        status: 'pendiente_verificacion'
      }]);

    radarCargando = false;

    if (!error) {
      radarExito = true;
      radarNombre = radarOrigen = radarDestino = radarMes = radarContacto = '';
    } else {
      alert("Hubo un error al guardar. Intenta de nuevo.");
      console.error(error);
    }
  }

  // -----------------------------
  // MODAL
  // -----------------------------
  function abrirModal(oferta: any) {
    ofertaSeleccionada = oferta;
    modalAbierto = true;
  }

  function cerrarModal() {
    modalAbierto = false;
    ofertaSeleccionada = null;
  }

  // -----------------------------
  // INICIALIZACIÓN
  // -----------------------------
  onMount(() => {
    procesarOfertasIniciales();
    poblarMeses();
    const stop = iniciarCarrusel();
    return stop; // Limpieza automática del intervalo al destruir el componente
  });
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="robots" content="index, follow" />

  {#if data.schemaAEO}
    {@html `<script type="application/ld+json">${data.schemaAEO}</script>`}
  {/if}
</svelte:head>

<div class="bg-gray-50 text-lumiDark min-h-screen">
  <Header paisUpper={data.paisUpper} mercado={data.mercado} />

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">

    <div class="text-center max-w-3xl mx-auto mb-10 relative z-10" id="hero-section">
      <h1 class="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-lumiDark leading-tight drop-shadow-sm mt-4">
        Viajes para tus recuerdos.<br>
        <span class="bg-clip-text text-transparent bg-gradient-to-r from-lumiCyan to-blue-500">
          Historias para toda la vida.
        </span>
      </h1>

      <p class="text-base text-gray-600 mb-0 font-light leading-relaxed">
        Auditamos miles de vuelos a diario.
        <strong class="text-lumiDark font-semibold">
          Dedícate a planear tu próxima gran historia; nosotros nos aseguramos de que el precio sea el mejor posible.
        </strong>
      </p>
    </div>

    <div class="max-w-xl mx-auto mb-16 relative z-20 group" id="newsletter-section">
      <div class="bg-white/80 backdrop-blur-xl p-1.5 rounded-full shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center gap-2">
        <form class="w-full flex flex-col sm:flex-row gap-2" onsubmit={handleSubmitNewsletter}>
          <input
            id="newsletter-email"
            type="email"
            bind:value={emailNewsletter}
            placeholder="Recibe nuestra selección del día..."
            required
            class="w-full bg-transparent border-none focus:ring-0 text-lumiDark placeholder-gray-400 px-4 py-2 text-sm outline-none"
          />

          <button
            type="submit"
            class="bg-lumiDark text-white hover:bg-black px-6 py-2 rounded-full font-bold transition-all active:scale-95 text-sm whitespace-nowrap w-full sm:w-auto"
            disabled={newsletterCargando}
          >
            {newsletterCargando ? 'Guardando...' : 'Suscribirme Gratis'}
          </button>
        </form>

        {#if newsletterMensaje}
          <p class="text-center text-sm font-bold mt-3 {newsletterClase}">
            {newsletterMensaje}
          </p>
        {/if}
      </div>
    </div>

    <div class="mb-6 flex items-center justify-between" id="titulo-hook">
      <h2 class="text-2xl font-bold tracking-tight">Oportunidades Destacadas</h2>
    </div>

    <div class="relative w-full mb-16 group">
      <div
        bind:this={scrollContainer}
        class="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 no-scrollbar scroll-smooth"
      >
        {#if ofertasHook.length === 0}
          <div class="w-full text-center text-gray-400 py-10 font-medium animate-pulse">
            Conectando con la base de datos...
          </div>
        {:else}
          {#each ofertasHook as deal}
            <DealCard
              {deal}
              monedaActual={data.mercado?.moneda}
              paisActual={data.paisUpper}
              onclick={(e) => abrirModal(e.detail)}
            />
          {/each}
        {/if}
      </div>
    </div>

    <div class="mb-6 mt-4" id="titulo-radar">
      <h2 class="text-2xl font-bold tracking-tight">Más Destinos</h2>
    </div>

    <div class="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6" id="contenedor-radar">
      <ul class="divide-y divide-gray-100/80">
        {#if ofertasRadar.length === 0}
          <li class="p-6 text-gray-400 text-center">No hay más destinos por ahora.</li>
        {:else}
          {#each ofertasRadar as deal}
            <RadarItem
              {deal}
              monedaActual={data.mercado?.moneda}
              onclick={(e) => abrirModal(e.detail)}
            />
          {/each}
        {/if}
      </ul>
    </div>

    <div class="text-center mb-16 relative z-10" id="btn-radar-completo">
      <a
        href="/masdestinos/"
        class="inline-flex items-center justify-center bg-white border border-gray-200 text-lumiDark hover:border-lumiCyan hover:text-lumiCyan px-8 py-3.5 rounded-full font-bold transition-all shadow-sm hover:shadow-md active:scale-95 text-sm group"
      >
        Explorar más destinos
      </a>
    </div>

    <div class="bg-lumiDark text-white border border-gray-800 rounded-3xl px-8 py-8 shadow-2xl overflow-hidden relative flex flex-col md:flex-row items-center justify-between gap-8 mb-20">
      <div class="relative z-10 text-center md:text-left flex-grow">
        <h3 class="text-2xl font-bold mb-2">¿Tienes un viaje específico en mente?</h3>
        <p class="text-gray-400 text-sm font-light">
          Explora nuestro buscador global y compara todas las aerolíneas en milisegundos.
        </p>
      </div>

      <div class="relative z-10 whitespace-nowrap">
        <a
          href="https://vuelos.lumivia.app/"
          target="_blank"
          class="inline-flex items-center justify-center bg-white text-lumiDark hover:bg-lumiCyan hover:text-white px-8 py-3 rounded-2xl font-extrabold transition-all shadow-[0_0_20px_rgba(0,210,255,0.3)] active:scale-95 text-sm uppercase tracking-wide"
        >
          Abrir Buscador
        </a>
      </div>
    </div>

    <div class="bg-lumiDark rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden relative flex flex-col md:flex-row items-center justify-between gap-10 border border-gray-800">
      <div class="relative z-10 md:w-1/2 text-center md:text-left">
        <h3 class="text-3xl font-bold text-white mb-4">¿No ves tu destino soñado?</h3>
        <p class="text-gray-400 font-light leading-relaxed">
          Dinos desde dónde sales, a dónde quieres ir y en qué mes. Nuestro sistema rastreará los precios 24/7 y te avisaremos por correo en cuanto detectemos el momento perfecto.
        </p>
      </div>

      <div class="relative z-10 md:w-1/2 w-full bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
        <form class="space-y-4" onsubmit={handleSubmitRadar}>
          <div>
            <label for="radar-nombre" class="block text-xs font-semibold text-gray-400 mb-1">Tu Nombre</label>
            <input
              id="radar-nombre"
              type="text"
              bind:value={radarNombre}
              required
              class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-lumiCyan transition"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="radar-origen" class="block text-xs font-semibold text-gray-400 mb-1">Origen</label>
              <input
                id="radar-origen"
                type="text"
                bind:value={radarOrigen}
                required
                class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-lumiCyan transition"
              />
            </div>

            <div>
              <label for="radar-destino" class="block text-xs font-semibold text-gray-400 mb-1">Destino</label>
              <input
                id="radar-destino"
                type="text"
                bind:value={radarDestino}
                required
                class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-lumiCyan transition"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="radar-mes" class="block text-xs font-semibold text-gray-400 mb-1">Mes aproximado</label>
              <select
                id="radar-mes"
                bind:value={radarMes}
                required
                class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lumiCyan transition"
              >
                <option value="" disabled>Elige un mes...</option>
                {#each meses as m}
                  <option value={m} class="bg-lumiDark text-white">{m}</option>
                {/each}
              </select>
            </div>

            <div>
              <label for="radar-contacto" class="block text-xs font-semibold text-gray-400 mb-1">Correo Electrónico</label>
              <input
                id="radar-contacto"
                type="email"
                bind:value={radarContacto}
                required
                class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-lumiCyan transition"
              />
            </div>
          </div>

          <button
            type="submit"
            class="w-full bg-lumiCyan hover:bg-lumiCyanDark text-lumiDark font-bold py-3 rounded-lg transition-colors shadow-lg mt-2"
            disabled={radarCargando}
          >
            {radarCargando ? 'Activando...' : 'Activar mi Radar 🎯'}
          </button>

          {#if radarExito}
            <p class="text-emerald-400 text-sm font-semibold text-center mt-2">
              ¡Radar activado! Revisa tu correo pronto.
            </p>
          {/if}
        </form>
      </div>
    </div>
  </main>

  <Footer />

  {#if modalAbierto}
    <ModalOferta deal={ofertaSeleccionada} abierto={modalAbierto} cerrar={cerrarModal} />
  {/if}
</div>
