<script lang="ts">
  import { onMount } from 'svelte';
  import Header from '$lib/components/Header.svelte';
  import ModalOferta from '$lib/components/ModalOferta.svelte';
  import DealCard from '$lib/components/DealCard.svelte';
  import RadarItem from '$lib/components/RadarItem.svelte';

  // Datos que vienen desde +page.server.ts y +page.ts
  export let data;

  const {
    pais,
    paisUpper,
    mercado,
    ofertas,
    schemaAEO,
    title,
    description
  } = data;

  // Estado global de la página
  let ofertasHook: any[] = [];
  let ofertasRadar: any[] = [];
  let ofertaSeleccionada: any = null;
  let modalAbierto = false;

  // Inicialización
  onMount(() => {
    // Aquí luego conectaremos:
    // - curarOfertas()
    // - poblar meses
    // - cargar deals
  });

  function abrirModal(oferta: any) {
    ofertaSeleccionada = oferta;
    modalAbierto = true;
  }

  function cerrarModal() {
    modalAbierto = false;
    ofertaSeleccionada = null;
  }

// Newsletter
let emailNewsletter = '';
let newsletterMensaje = '';
let newsletterClase = '';
let newsletterCargando = false;

async function enviarNewsletter() {
  newsletterCargando = true;
  newsletterMensaje = '';
  newsletterClase = '';

  const { error } = await supabase
    .from('suscriptores_radar')
    .insert([{ email: emailNewsletter.toLowerCase(), pais: paisUpper, nombre: 'Viajero' }]);

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


</script>

<!-- SEO dinámico -->
<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="robots" content="index, follow" />

  {#if schemaAEO}
    <script type="application/ld+json">
      {schemaAEO}
    </script>
  {/if}
</svelte:head>

<!-- Aquí irá TODO el contenido de la página -->
<div class="bg-gray-50 text-lumiDark min-h-screen">
  
  <!-- Header -->
  <Header {paisUpper} {mercado} />

  <!-- Aquí insertaremos: Hero, Newsletter, Deals, Radar, Buscador, Footer -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
    
    <!-- SECCIÓN HERO (la agregamos en el siguiente paso) -->
<!-- HERO -->
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


    <!-- SECCIÓN NEWSLETTER -->
<!-- NEWSLETTER -->
<div class="max-w-xl mx-auto mb-16 relative z-20 group" id="newsletter-section">
  <div class="bg-white/80 backdrop-blur-xl p-1.5 rounded-full shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center gap-2 transform transition-all duration-500 hover:shadow-md hover:border-gray-300">

    <div class="pl-4 text-gray-400 hidden sm:block">
      <svg class="w-5 h-5 text-lumiCyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
      </svg>
    </div>

    <form
      class="w-full flex flex-col sm:flex-row gap-2"
      on:submit|preventDefault={enviarNewsletter}
    >
      <input
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
  </div>

  {#if newsletterMensaje}
    <p class="text-center text-sm font-bold mt-3 {newsletterClase}">
      {newsletterMensaje}
    </p>
  {/if}
</div>


    <!-- SECCIÓN OPORTUNIDADES DESTACADAS -->

    <!-- SECCIÓN MÁS DESTINOS (RADAR) -->

    <!-- SECCIÓN BUSCADOR GLOBAL -->

    <!-- SECCIÓN RADAR PERSONALIZADO -->

  </main>

  <!-- Footer (lo agregamos al final) -->

  <!-- Modal -->
  {#if modalAbierto}
    <ModalOferta {ofertaSeleccionada} on:cerrar={cerrarModal} />
  {/if}
</div>
