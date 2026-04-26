<script lang="ts">
  // 🔥 SVELTE 5 PURO
  const { esims = [], tours = [], hoteles = null, seguro = null } = $props();
</script>

<div class="grid grid-cols-2 gap-3">

  {#if esims && esims.length > 0}
    <a href={esims[0].url} target="_blank" rel="noopener noreferrer" class="flex flex-col p-3.5 border border-gray-100 rounded-2xl hover:border-lumiCyan hover:shadow-md transition-all bg-white group">
      <div class="flex items-start justify-between mb-2">
        <img src={esims[0].imagen} alt="eSIM" class="w-10 h-10 rounded-xl object-cover shadow-sm" />
        <span class="text-[9px] font-black uppercase tracking-wider text-lumiCyan bg-lumiCyan/10 px-1.5 py-0.5 rounded border border-lumiCyan/20">
          {esims[0].cupon}
        </span>
      </div>
      <p class="font-bold text-[13px] text-lumiDark line-clamp-1 group-hover:text-lumiCyan transition-colors leading-tight">Conectividad</p>
      <p class="text-[10px] text-gray-400 font-medium mt-1 tracking-wide">Datos sin roaming</p>
    </a>
  {/if}

  {#if tours && tours.length > 0}
    <a href={tours[0].url} target="_blank" rel="noopener noreferrer" class="flex flex-col p-3.5 border border-gray-100 rounded-2xl hover:border-lumiCyan hover:shadow-md transition-all bg-white group">
      <div class="flex items-start justify-between mb-2">
        {#if tours[0].imagen}
          <img src={tours[0].imagen} alt="Tours" class="w-10 h-10 rounded-xl object-cover shadow-sm" />
        {:else}
          <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg shadow-sm">🏛️</div>
        {/if}
        <span class="text-[9px] font-black uppercase tracking-wider text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Tours</span>
      </div>
      <p class="font-bold text-[13px] text-lumiDark line-clamp-1 group-hover:text-lumiCyan transition-colors leading-tight">Actividades</p>
      <p class="text-[10px] text-gray-400 font-medium mt-1 tracking-wide">Mejores precios</p>
    </a>
  {/if}

  {#if hoteles}
    <a href={hoteles.url} target="_blank" rel="noopener noreferrer" class="flex flex-col p-3.5 border border-gray-100 rounded-2xl hover:border-lumiCyan hover:shadow-md transition-all bg-white group">
      <div class="flex items-start justify-between mb-2">
        <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-lg shadow-sm">🏨</div>
        <span class="text-[9px] font-black uppercase tracking-wider text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Hotel</span>
      </div>
      <p class="font-bold text-[13px] text-lumiDark line-clamp-1 group-hover:text-lumiCyan transition-colors leading-tight">Hospedaje</p>
      <p class="text-[10px] text-gray-400 font-medium mt-1 tracking-wide">Zonas recomendadas</p>
    </a>
  {/if}

  {#if seguro}
    <a href={seguro.url} target="_blank" rel="noopener noreferrer" class="flex flex-col p-3.5 border border-gray-100 rounded-2xl hover:border-lumiCyan hover:shadow-md transition-all bg-white group">
      <div class="flex items-start justify-between mb-2">
        <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center text-lg shadow-sm">🏥</div>
        <span class="text-[9px] font-black uppercase tracking-wider text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Seguro</span>
      </div>
      <p class="font-bold text-[13px] text-lumiDark line-clamp-1 group-hover:text-lumiCyan transition-colors leading-tight">Asistencia</p>
      <p class="text-[10px] text-gray-400 font-medium mt-1 tracking-wide">Cobertura 24/7</p>
    </a>
  {/if}

</div>
