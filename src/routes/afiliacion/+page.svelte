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

  // ✅ Fix 404: Ruta corregida a /paises/xx con memoria inteligente y segura para SSR
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
  <title>Lumivia | Divulgación de Afiliados</title>
  <meta
    name="description"
    content="Transparencia Lumivia. Conoce cómo funcionan nuestros enlaces de afiliados y cómo mantenemos nuestra plataforma gratuita."
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
        <p class="text-lumiCyan text-xs font-bold uppercase tracking-[0.3em] mb-2">Transparencia Lumivia</p>
        <h1 class="text-4xl md:text-5xl font-black text-lumiDark tracking-tight leading-tight">
          Divulgación de <br>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-lumiCyan to-blue-500">Afiliados</span>
        </h1>
        <p class="text-gray-500 mt-4 text-sm">Última actualización: 2 de abril de 2026</p>
      </div>

      <div class="space-y-8 text-sm md:text-base leading-relaxed text-gray-600 font-light">

        <p class="text-lg text-gray-800 font-medium">
          En Lumivia creemos en la transparencia total con nuestra comunidad de viajeros.
        </p>

        <p>
          Para mantener nuestro radar de ofertas gratuito y seguir innovando tecnológicamente, participamos en programas de marketing de afiliados con plataformas líderes en la industria turística.
        </p>

        <section>
          <h3 class="text-lumiDark font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
            <span class="w-6 h-[1px] bg-lumiCyan inline-block"></span> ¿Qué significa esto para ti?
          </h3>
          <p>
            Cuando haces clic en uno de nuestros enlaces sugeridos y reservas un vuelo, un hotel, un tour o compras una eSIM o seguro médico, Lumivia puede recibir una pequeña comisión por parte del proveedor tecnológico.
            <strong class="text-lumiCyan font-semibold">Esto NO aumenta en absoluto el precio final que tú pagas.</strong>
            Al contrario, en muchos casos estas alianzas nos permiten ofrecerte acceso a inventario especial o descuentos que no encontrarías de otra forma.
          </p>
        </section>

        <section>
          <h3 class="text-lumiDark font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
            <span class="w-6 h-[1px] bg-lumiCyan inline-block"></span> Independencia Editorial y Algorítmica
          </h3>
          <p>
            Nuestra curaduría, impulsada por análisis de datos e inteligencia artificial, tiene un único objetivo:
            <strong class="text-lumiDark font-medium">encontrar el precio más bajo y la mejor experiencia posible</strong>
            para ti, sin importar si la tarifa nos genera una comisión. Nuestro compromiso inquebrantable es ser tus aliados en el ahorro.
          </p>
        </section>

        <section>
          <h3 class="text-lumiDark font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
            <span class="w-6 h-[1px] bg-lumiCyan inline-block"></span> Límite de Responsabilidad sobre Terceros
          </h3>
          <p>
            Aunque sugerimos con mucho cuidado a nuestros socios comerciales para hospedaje, conectividad, asistencia médica y tours basándonos en estándares de calidad,
            <strong class="text-lumiDark font-medium">Lumivia no gestiona, cobra ni opera la prestación de dichos servicios</strong>.
            Cualquier consulta, ajuste, reclamo o solicitud de reembolso vinculada a estos productos o experiencias deberá ser gestionada directa y exclusivamente con el proveedor final.
            Nosotros te mostramos el camino; la ejecución del servicio es responsabilidad de ellos.
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
