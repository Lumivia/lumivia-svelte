<script lang="ts">
  import { onMount } from 'svelte';
  
  // ✅ COMPONENTES LIBERADOS (Prueba Fase 3):
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';

  // ⛔️ COMPONENTES AÚN EN CUARENTENA:
  // import ModalOferta from '$lib/components/ModalOferta.svelte';
  // import DealCard from '$lib/components/DealCard.svelte';
  // import RadarItem from '$lib/components/RadarItem.svelte';

  import { calcularTiempoTranscurrido } from '$lib/utils/fechas';
  import { supabase } from '$lib/supabaseClient';

  let { data } = $props();

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

  let ofertasHook = $state<any[]>([]);
  let ofertasRadar = $state<any[]>([]);
  let ofertaSeleccionada = $state<any | null>(null);
  let modalAbierto = $state(false);
  let scrollContainer = $state<HTMLElement | null>(null);

  let emailNewsletter = $state('');
  let newsletterMensaje = $state('');
  let newsletterClase = $state('');
  let newsletterCargando = $state(false);

  let radarNombre = $state('');
  let radarOrigen = $state('');
  let radarDestino = $state('');
  let radarMes = $state('');
  let radarContacto = $state('');
  let radarExito = $state(false);
  let radarCargando = $state(false);
  let meses = $state<string[]>([]);

  function procesarOfertasIniciales() {
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

  async function enviarNewsletter() {
    newsletterCargando = true;
    const { error } = await supabase.from('suscriptores_radar').insert([{ email: emailNewsletter.toLowerCase(), pais: data.paisUpper, nombre: 'Viajero' }]);
    newsletterCargando = false;
    if (!error) { newsletterMensaje = '¡Listo!'; newsletterClase = 'text-emerald-500'; emailNewsletter = ''; } 
    else { newsletterMensaje = 'Error al guardar.'; newsletterClase = 'text-red-500'; }
  }

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
    const { error } = await supabase.from('radares_personales').insert([{ nombre: radarNombre, origen: radarOrigen, destino: radarDestino, mes_esperado: radarMes, contacto: radarContacto, status: 'pendiente_verificacion' }]);
    radarCargando = false;
    if (!error) { radarExito = true; }
  }

  onMount(() => {
    procesarOfertasIniciales();
    poblarMeses();
  });
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
</svelte:head>

<div class="bg-gray-50 text-lumiDark min-h-screen flex flex-col">
  
  <Header paisUpper={data.paisUpper} mercado={data.mercado} />

  <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 w-full">
    <div class="text-center max-w-3xl mx-auto mb-10 relative z-10">
      <h1 class="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-lumiDark leading-tight drop-shadow-sm mt-4">
        Viajes desde {data.mercado?.nombre}
      </h1>
      <p class="text-base text-gray-600 mb-0 font-light leading-relaxed">
        El esqueleto de la página funciona. Las ofertas encontradas son: {ofertasHook.length} destacadas.
      </p>
    </div>

    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold tracking-tight">Oportunidades Destacadas (Tarjetas Apagadas)</h2>
    </div>

    <div class="mb-6 mt-4">
      <h2 class="text-2xl font-bold tracking-tight">Más Destinos (Radar Apagado)</h2>
    </div>

    </main>

  <Footer />
</div>
