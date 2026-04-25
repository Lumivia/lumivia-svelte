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
    const paisGuardado = localStorage.getItem('lumivia_pais');
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
  <title>Lumivia | Aviso de Privacidad</title>
  <meta name="description" content="Aviso de privacidad y políticas de protección de datos de Lumivia." />
</svelte:head>

<div class="bg-gray-50 text-gray-600 antialiased selection:bg-lumiCyan selection:text-white relative min-h-screen flex flex-col">

  <div class="fixed top-0 left-0 w-full h-[800px] overflow-hidden -z-10 pointer-events-none">
    <div class="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-lumiCyan/10 blur-[100px]"></div>
    <div class="absolute top-[5%] -right-[10%] w-[40%] h-[40%] rounded-full bg-lumiGold/10 blur-[100px]"></div>
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/90 to-gray-50"></div>
  </div>

  <Header {paisUpper} {mercado} />

  <main class="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
    <div class="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-lumiCyan to-transparent opacity-50"></div>

      <div class="mb-10">
        <p class="text-lumiCyan text-xs font-bold uppercase tracking-[0.3em] mb-2">Documentación Oficial</p>
        <h1 class="text-4xl md:text-5xl font-black text-lumiDark tracking-tight leading-tight">
          Aviso de <br>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-lumiCyan to-blue-500">Privacidad</span>
        </h1>
        <p class="text-gray-500 mt-4 text-sm">Última actualización: 2 de abril de 2026</p>
      </div>

      <div class="space-y-8 text-sm md:text-base leading-relaxed text-gray-600 font-light">

        <p>
          Lumivia, en estricto cumplimiento con las leyes de protección de datos de México, Colombia, Chile y Costa Rica, asegura que la seguridad de su información es nuestra prioridad absoluta.
        </p>

        <section>
          <h3 class="text-lumiDark font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
            <span class="w-6 h-[1px] bg-lumiCyan inline-block"></span> 1. Datos Personales Recabados
          </h3>
          <p>
            Únicamente recabamos su <strong class="text-lumiDark font-medium">Nombre</strong> y <strong class="text-lumiDark font-medium">Correo Electrónico</strong> mediante consentimiento explícito (Double Opt-In). No procesamos datos financieros ni sensibles.
          </p>
        </section>

        <section>
          <h3 class="text-lumiDark font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
            <span class="w-6 h-[1px] bg-lumiCyan inline-block"></span> 2. Finalidad del Tratamiento
          </h3>
          <p>
            Sus datos serán utilizados exclusivamente para el envío de alertas de vuelos y contenido turístico. <strong class="text-lumiDark font-medium">Sus datos NO se utilizan para entrenar modelos de IA generativa de terceros.</strong>
          </p>
        </section>

        <section>
          <h3 class="text-lumiDark font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
            <span class="w-6 h-[1px] bg-lumiCyan inline-block"></span> 3. Cookies y Rastreo
          </h3>
          <p>
            Utilizamos cookies analíticas y enlaces de afiliados para asegurar la operación de la plataforma. Puede deshabilitarlas en su navegador, aunque esto podría afectar la experiencia de usuario.
          </p>
        </section>

        <section>
          <h3 class="text-lumiDark font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
            <span class="w-6 h-[1px] bg-lumiCyan inline-block"></span> 4. Derechos ARCO
          </h3>
          <p>
            Usted retiene el control absoluto. Puede ejercer sus derechos de Acceso, Rectificación, Cancelación u Oposición enviando una solicitud a <strong class="text-lumiDark font-medium">legal@lumivia.app</strong>.
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
