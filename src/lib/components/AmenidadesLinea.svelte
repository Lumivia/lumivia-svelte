<script lang="ts">
  // Runes props
  const { deal, paisActual } = $props();

  // Reactividad derivada (Runes)
  const vueloDirecto = $derived(deal?.tipo_vuelo === 'directo');
  const escalas = $derived(deal?.escalas ?? 0);
  const equipaje = $derived(deal?.equipaje ?? 'Sin equipaje');
  const aerolinea = $derived(deal?.aerolinea ?? deal?.airline ?? '');
  const duracion = $derived(deal?.duracion ?? deal?.duration ?? '');
  const clase = $derived(deal?.clase ?? deal?.fare_class ?? '');
</script>

<div class="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 font-medium">

  <!-- Tipo de vuelo -->
  {#if vueloDirecto}
    <div class="flex items-center gap-1">
      <svg class="w-3.5 h-3.5 text-lumiCyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M2.5 19l19-7-19-7v6l14 1-14 1v6z"></path>
      </svg>
      Directo
    </div>
  {:else}
    <div class="flex items-center gap-1">
      <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 8V4m0 0L8 8m4-4l4 4M4 12h16M4 16h16"></path>
      </svg>
      {escalas} escala{escalas === 1 ? '' : 's'}
    </div>
  {/if}

  <!-- Equipaje -->
  <div class="flex items-center gap-1">
    <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M8 21h8a2 2 0 002-2V7H6v12a2 2 0 002 2zM10 7V5a2 2 0 012-2h0a2 2 0 012 2v2"></path>
    </svg>
    {equipaje}
  </div>

  <!-- Aerolínea -->
  {#if aerolinea}
    <div class="flex items-center gap-1">
      <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M2.5 19l19-7-19-7v6l14 1-14 1v6z"></path>
      </svg>
      {aerolinea}
    </div>
  {/if}

  <!-- Duración -->
  {#if duracion}
    <div class="flex items-center gap-1">
      <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 6v6l4 2"></path>
      </svg>
      {duracion}
    </div>
  {/if}

  <!-- Clase -->
  {#if clase}
    <div class="flex items-center gap-1">
      <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M3 7h18M3 12h18M3 17h18"></path>
      </svg>
      {clase}
    </div>
  {/if}

</div>
