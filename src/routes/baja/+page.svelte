<script lang="ts">
  import Footer from '$lib/components/Footer.svelte';
  let { data } = $props();
</script>

<svelte:head>
  <title>Darse de baja - Lumivia</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="bg-gray-50 text-lumiDark min-h-screen flex flex-col">
  <header class="bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-200/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
      <a href="/" class="text-2xl font-extrabold tracking-tighter text-lumiDark cursor-pointer transition-transform hover:scale-105">
        Lumivia
      </a>
    </div>
  </header>

  <main class="flex-grow flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-lg w-full text-center border border-gray-100 animate-fadeIn">
      
      {#if data.success}
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl shadow-inner">
          👋
        </div>
        <h1 class="text-2xl md:text-3xl font-black text-lumiDark mb-4">Suscripción cancelada</h1>
        <p class="text-gray-600 mb-6 leading-relaxed">
          Hemos eliminado a <strong class="text-lumiDark">{data.email}</strong> de nuestra lista principal. Ya no recibirás alertas de vuelos baratos.
        </p>
        <p class="text-xs text-gray-400 font-medium bg-gray-50 p-4 rounded-xl border border-gray-100">
          Si te diste de baja por error, puedes volver a registrarte en cualquier momento desde nuestra página principal.
        </p>
      {:else}
        <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h1 class="text-2xl font-black text-lumiDark mb-4">Mmm... algo salió mal</h1>
        <p class="text-gray-600 mb-6 font-medium">{data.message}</p>
      {/if}

      <div class="mt-8">
        <a href="/" class="inline-block bg-lumiDark text-white hover:bg-lumiCyan hover:text-lumiDark px-8 py-3.5 rounded-full font-bold transition-all shadow-md active:scale-95 text-sm uppercase tracking-wider">
          Volver al Inicio
        </a>
      </div>
    </div>
  </main>

  <Footer />
</div>

<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
</style>
