<script lang="ts">
  // 🔥 SVELTE 5: Props y Reactividad Purificada (Opción Nuclear)
  const { deal, paisActual } = $props();

  const vueloDirecto = $derived(deal?.tipo_vuelo === 'directo');
  const escalas = $derived(deal?.escalas ?? 0);
  const equipaje = $derived(deal?.equipaje ?? 'Mochila personal');
  const duracion = $derived(deal?.duracion ?? deal?.duration ?? '');
  const clase = $derived(deal?.clase ?? deal?.fare_class ?? '');
</script>

<div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-gray-500 font-semibold tracking-wide">

  {#if vueloDirecto}
    <div class="flex items-center gap-1.5 text-lumiCyan bg-lumiCyan/10 px-2 py-0.5 rounded border border-lumiCyan/20">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>
      Directo
    </div>
  {:else}
    <div class="flex items-center gap-1.5">
      <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
      </svg>
      {escalas} Escala{escalas === 1 ? '' : 's'}
    </div>
  {/if}

  <span class="hidden sm:inline text-gray-200 font-normal">|</span>

  <div class="flex items-center gap-1.5">
    <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
    </svg>
    <span class="truncate max-w-[120px]" title={equipaje}>{equipaje}</span>
  </div>

  {#if duracion}
    <div class="flex items-center gap-1.5">
      <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      {duracion}
    </div>
  {/if}

  {#if clase}
    <div class="flex items-center gap-1.5 text-gray-500">
      <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
      </svg>
      {clase}
    </div>
  {/if}

</div>
