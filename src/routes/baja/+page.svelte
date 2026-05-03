<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  let { data } = $props();
</script>

<svelte:head>
  <title>Darse de baja - Lumivia</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="bg-gray-50 text-lumiDark min-h-screen flex flex-col">
  <Header />

  <main class="flex-grow flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-lg w-full text-center border border-gray-100">
      
      {#if data.success}
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
          👋
        </div>
        <h1 class="text-2xl md:text-3xl font-black text-lumiDark mb-4">Suscripción cancelada</h1>
        <p class="text-gray-600 mb-6 leading-relaxed">
          Hemos eliminado a <strong class="text-lumiDark">{data.email}</strong> de nuestra lista principal. Ya no recibirás alertas de vuelos baratos.
        </p>
        <p class="text-sm text-gray-400 font-medium bg-gray-50 p-4 rounded-xl">
          Si te diste de baja por error, puedes volver a registrarte en cualquier momento desde nuestra página principal.
        </p>
      {:else}
        <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h1 class="text-2xl font-black text-lumiDark mb-4">Mmm... algo salió mal</h1>
        <p class="text-gray-600 mb-6">{data.message}</p>
      {/if}

      <div class="mt-8">
        <a href="/" class="inline-block bg-lumiDark text-white hover:bg-black px-8 py-3 rounded-full font-bold transition-all active:scale-95 text-sm">
          Volver al Inicio
        </a>
      </div>
    </div>
  </main>

  <Footer />
</div>
