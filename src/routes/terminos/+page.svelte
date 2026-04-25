<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';

  // 🔥 Diccionario de Mercados para el Header Global
  const configMercado: Record<string, { nombre: string; moneda: string; bandera: string }> = {
    MX: { nombre: 'México', moneda: 'MXN', bandera: 'https://flagcdn.com/w20/mx.png' },
    CO: { nombre: 'Colombia', moneda: 'COP', bandera: 'https://flagcdn.com/w20/co.png' },
    CL: { nombre: 'Chile', moneda: 'CLP', bandera: 'https://flagcdn.com/w20/cl.png' },
    CR: { nombre: 'Costa Rica', moneda: 'USD', bandera: 'https://flagcdn.com/w20/cr.png' }
  };

  // 🔥 Estados Reactivos (Runes)
  let paisUpper = $state('MX');
  let mercado = $state(configMercado['MX']);

  // ✅ Fix 404: Ruta corregida a /paises/xx
  function volverAlPais() {
    const paisGuardado = typeof window !== 'undefined' ? localStorage.getItem('lumivia_pais') : 'MX';
    const iso = paisGuardado ? paisGuardado.toUpperCase() : 'MX';
    goto(`/paises/${iso.toLowerCase()}`);
  }

  onMount(() => {
    // Recuperamos la preferencia del usuario para el Header
    const paisGuardado = localStorage.getItem('lumivia_pais');
    if (paisGuardado && configMercado[paisGuardado.toUpperCase()]) {
      paisUpper = paisGuardado.toUpperCase();
      mercado = configMercado[paisUpper];
    }
  });
</script>

<svelte:head>
  <title>Lumivia | Términos y Condiciones</title>
  <meta
    name="description"
    content="Términos de uso y condiciones de servicio de Lumivia. Información importante sobre nuestro buscador de vuelos."
  />
</svelte:head>

<div class="bg-gray-50 text-gray-600 antialiased selection:bg-lumiCyan selection:text-white relative min-h-screen flex flex-col">

  <div class="fixed top-0 left-0 w-full h-[800px] overflow-hidden -z-10 pointer-events-none">
    <div class="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-lumiCyan/10 blur-[100px]"></div>
    <div class="absolute top-[5%] -right-[10%] w-[40%] h-[40%] rounded-full bg-lumiGold/10 blur-[100px]"></div>
    <div class="absolute inset-0 bg-grid-pattern opacity-40"></div>
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/90 to-gray-50"></div>
  </div>

  <Header {paisUpper} {mercado} />

  <main class="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 md:pt-36 md:pb-20 relative z-10">
    <div class="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-lumiCyan to-transparent opacity-50"></div>

      <div class="mb-10">
        <p class="text-lumiCyan text-xs font-bold uppercase tracking-[0.3em] mb-2">Documentación Oficial</p>
        <h1 class="text-4xl md:text-5xl font-black text-lumiDark tracking-tight leading-tight">
          Términos de <br>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-lumiCyan to-blue-500">Servicio</span>
        </h1>
        <p class="text-gray-500 mt-4 text-sm">Última actualización: 27 de Marzo de 2026</p>
      </div>

      <div class="space-y-8 text-sm md:text-base leading-relaxed text-gray-600 font-light">

        <div class="bg-gray-50 text-gray-700 p-6 rounded-2xl border-l-4 border-lumiCyan relative overflow-hidden shadow-sm">
          <div class="absolute -right-2 -top-2 opacity-5">
            <svg class="w-20 h-20 text-lumiDark" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <p class="font-medium relative z-10">
            <strong class="text-lumiDark">NOTA OFICIAL:</strong> Lumivia NO es una agencia de viajes, NO procesa pagos y NO emite boletos de avión.
          </p>
        </div>

        <section>
          <h3 class="text-lumiDark font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
            <span class="w-6 h-[1px] bg-lumiCyan inline-block"></span> 1. Naturaleza del Servicio y Capacidad Legal
          </h3>
          <p>
            Lumivia funciona como un motor de búsqueda y agregador de ofertas automatizado. El servicio se limita a mostrar información de terceros para facilitar la toma de decisiones del usuario. El uso de Lumivia y la suscripción a nuestro Radar de Ofertas está restringido a personas
            <strong class="text-lumiDark font-medium">mayores de 18 años</strong>. Al utilizar este sitio, usted declara cumplir con este requisito.
          </p>
        </section>

        <section>
          <h3 class="text-lumiDark font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
            <span class="w-6 h-[1px] bg-lumiCyan inline-block"></span> 2. Limitación de Responsabilidad
          </h3>
          <p>
            Cualquier transacción ocurre directamente entre el Usuario y el Proveedor Final (Aerolínea o Agencia). Lumivia no se hace responsable por: (a) Cambios repentinos de precio, (b) Cancelaciones de vuelos, (c) Errores en la reserva del proveedor o (d) Reembolsos.
          </p>
        </section>

        <section>
          <h3 class="text-lumiDark font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
            <span class="w-6 h-[1px] bg-lumiCyan inline-block"></span> 3. Uso de Algoritmos e IA
          </h3>
          <p>
            Nuestras alertas son generadas por modelos predictivos y de inteligencia artificial. Aunque buscamos la máxima precisión, Lumivia no garantiza que la oferta siga disponible al momento del clic debido a la naturaleza altamente volátil del mercado aeronáutico.
          </p>
        </section>

        <section>
          <h3 class="text-lumiDark font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
            <span class="w-6 h-[1px] bg-lumiCyan inline-block"></span> 4. Propiedad Intelectual
          </h3>
          <p>
            El código, diseño gráfico, logotipos y algoritmos de "Radar" son propiedad exclusiva de Lumivia. Queda estrictamente prohibido el "scraping" o extracción automatizada de nuestros datos sin autorización expresa y por escrito.
          </p>
        </section>

        <section>
          <h3 class="text-lumiDark font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
            <span class="w-6 h-[1px] bg-lumiCyan inline-block"></span> 5. Jurisdicción y Ley Aplicable
          </h3>
          <p>
            Para la interpretación, cumplimiento y ejecución de los presentes Términos, las partes se someten expresamente a las leyes vigentes y a los tribunales competentes de la ciudad de
            <strong class="text-lumiDark font-medium">Guadalajara, Jalisco, México</strong>, renunciando a cualquier otra jurisdicción que pudiera corresponderles por razón de sus domicilios presentes o futuros.
          </p>
        </section>

      </div>

      <div class="mt-16 text-center border-t border-gray-100 pt-8">
        <button
          onclick={volverAlPais}
          class="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-lumiDark px-8 py-3 rounded-full font-bold transition-all border border-gray-200 cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Regresar al Buscador
        </button>
      </div>
    </div>
  </main>

  <Footer />
</div>

<style>
  main {
    animation: fadeIn 0.4s ease-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
