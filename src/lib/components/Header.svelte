<script lang="ts">
  import { onMount } from 'svelte';
  
  // Runes props
  const { paisUpper, mercado } = $props();

  // Estado reactivo (Runes)
  let dropdownAbierto = $state(false);

  const paises = [
    { codigo: 'mx', nombre: 'México', moneda: 'MXN', bandera: 'https://flagcdn.com/w20/mx.png' },
    { codigo: 'co', nombre: 'Colombia', moneda: 'COP', bandera: 'https://flagcdn.com/w20/co.png' },
    { codigo: 'cl', nombre: 'Chile', moneda: 'CLP', bandera: 'https://flagcdn.com/w20/cl.png' },
    { codigo: 'cr', nombre: 'Costa Rica', moneda: 'USD', bandera: 'https://flagcdn.com/w20/cr.png' }
  ];

  function toggleDropdown() {
    dropdownAbierto = !dropdownAbierto;
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('#selector-pais')) {
      dropdownAbierto = false;
    }
  }

  onMount(() => {
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<header class="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    
    <div class="flex items-center">
      <a href="/" class="text-2xl font-extrabold tracking-tighter text-lumiDark hover:text-lumiCyan transition-colors">Lumivia</a>
    </div>

    <div class="flex items-center gap-4 sm:gap-6">

      <a href="https://vuelos.lumivia.app/" target="_blank" rel="noopener noreferrer"
        class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-lumiCyan transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <span class="hidden sm:inline">Vuelos</span>
      </a>

      <a href="https://www.stay22.com/allez/roam?aid=lumivia" target="_blank" rel="noopener noreferrer"
        class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-lumiCyan transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
        </svg>
        <span class="hidden sm:inline">Hoteles</span>
      </a>

      <div class="h-5 w-px bg-gray-200 hidden sm:block"></div>

      <div id="selector-pais" class="relative inline-block text-left">
        
        <button
          type="button"
          onclick={toggleDropdown}
          class="inline-flex items-center justify-center rounded-full border border-gray-200 shadow-sm px-4 py-1.5 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-lumiCyan/50 transition-all gap-2 cursor-pointer"
          aria-expanded={dropdownAbierto}
          aria-haspopup="true"
        >
          <img src={mercado.bandera} alt={paisUpper} class="w-4 h-auto rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.1)]" />
          <span class="text-xs font-black text-lumiDark tracking-wide">{mercado.moneda}</span>
          <svg class="w-3.5 h-3.5 text-gray-400 transition-transform duration-200"
            style={`transform: rotate(${dropdownAbierto ? '180deg' : '0deg'})`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>

        {#if dropdownAbierto}
          <div
            class="origin-top-right absolute right-0 mt-2 w-48 rounded-2xl shadow-xl bg-white ring-1 ring-black/5 z-50 overflow-hidden border border-gray-100 animate-fadeIn"
            role="menu"
          >
            <div class="py-1">
              {#each paises as p}
                <a
                  href={`/paises/${p.codigo}`}
                  onclick={() => { dropdownAbierto = false; }}
                  data-sveltekit-preload-data="hover"
                  class="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-bold gap-3 transition-colors border-b border-gray-50 last:border-0"
                  role="menuitem"
                >
                  <img src={p.bandera} alt={p.codigo} class="w-5 h-auto rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.1)]" />
                  {p.nombre} <span class="text-gray-400 text-xs font-semibold ml-auto">{p.moneda}</span>
                </a>
              {/each}
            </div>
          </div>
        {/if}

      </div>
    </div>
  </div>
</header>

<style>
  .animate-fadeIn { animation: fadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1); }
  @keyframes fadeIn { from { opacity: 0; transform: scale(0.95) translateY(-5px); } to { opacity: 1; transform: scale(1) translateY(0); } }
</style>
