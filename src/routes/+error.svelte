<script lang="ts">
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>Error {$page.status} | Lumivia</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-[75vh] flex flex-col items-center justify-center px-6 text-center bg-gray-50">
  <h1 class="text-[150px] leading-none font-black text-gray-200 tracking-tighter select-none">
    {$page.status}
  </h1>
  
  <h2 class="text-3xl font-extrabold text-lumiDark mt-4 tracking-tight">
    {#if $page.status === 404}
      Este vuelo ya despegó 🛫
    {:else}
      Turbulencia técnica detectada 🌩️
    {/if}
  </h2>
  
  <p class="text-gray-500 mt-4 max-w-md mx-auto text-lg leading-relaxed">
    {#if $page.status === 404}
      La oferta que buscas expiró o la URL es incorrecta. Pero no te preocupes, nuestro radar detecta nuevos vuelos cada hora.
    {:else}
      {$page.error?.message || 'Nuestros ingenieros ya están revisando los motores. Por favor, intenta de nuevo en unos minutos.'}
    {/if}
  </p>
  
  <a 
    href="/" 
    class="mt-10 bg-lumiDark hover:bg-lumiCyan hover:text-lumiDark text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-95 inline-flex items-center gap-2"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
    Volver al Radar
  </a>
</div>
