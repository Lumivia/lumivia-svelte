<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  // Runes: reemplazo de export let
  const { paisUpper, mercado } = $props();

  let dropdownAbierto = false;

  const paises = [
    { codigo: 'mx', nombre: 'México', moneda: 'MXN', bandera: 'https://flagcdn.com/w20/mx.png' },
    { codigo: 'co', nombre: 'Colombia', moneda: 'COP', bandera: 'https://flagcdn.com/w20/co.png' },
    { codigo: 'cl', nombre: 'Chile', moneda: 'CLP', bandera: 'https://flagcdn.com/w20/cl.png' },
    { codigo: 'cr', nombre: 'Costa Rica', moneda: 'USD', bandera: 'https://flagcdn.com/w20/cr.png' }
  ];

  function toggleDropdown() {
    dropdownAbierto = !dropdownAbierto;
  }

  function seleccionarPais(codigo: string) {
    dropdownAbierto = false;
    goto(`/paises/${codigo}`);
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('#selector-pais')) {
      dropdownAbierto = false;
    }
  }

  onMount(() => {
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  });
</script>

<header class="bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-200/50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    
    <!-- Logo -->
    <div class="flex items-center">
      <a href="/" class="text-2xl font-extrabold tracking-tighter text-lumiDark">Lumivia</a>
    </div>

    <!-- Navegación -->
    <div class="flex items-center gap-4">

      <!-- Vuelos -->
      <a href="https://vuelos.lumivia.app/" target="_blank"
        class="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-lumiDark transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <span class="hidden sm:inline">Vuelos</span>
      </a>

      <!-- Hoteles -->
      <a href="https://www.stay22.com/allez/roam?aid=lumivia" target="_blank"
        class="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-lumiCyan transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
        </svg>
        <span class="hidden sm:inline">Hoteles</span>
      </a>

      <div class="h-4 w-px bg-gray-200 hidden sm:block"></div>

      <!-- Selector de país -->
      <div id="selector-pais" class="relative inline-block text-left">
        
        <button
          on:click={toggleDropdown}
          class="inline-flex items-center justify-center rounded-full border border-gray-200 shadow-sm px-4 py-1.5 bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 focus:outline-none focus:border-lumiCyan transition-colors gap-2 cursor-pointer">

          <img src={mercado.bandera} alt={paisUpper} class="w-4 h-auto rounded-sm shadow-sm" />
          <span>{mercado.moneda}</span>

          <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>

        {#if dropdownAbierto}
          <div
            class="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden border border-gray-100">

            <div class="py-1">
              {#each paises as p}
                <button
                  on:click={() => seleccionarPais(p.codigo)}
                  class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors">
                  <img src={p.bandera} alt={p.codigo} class="w-5 h-auto rounded-sm shadow-sm" />
                  {p.nombre} ({p.moneda})
                </button>
              {/each}
            </div>

          </div>
        {/if}

      </div>
    </div>
  </div>
</header>
