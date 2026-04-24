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

    <!-- SECCIÓN NEWSLETTER -->

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
