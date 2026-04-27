<script lang="ts">
  const { esims = [], tours = [], hoteles = null, seguro = null } = $props();
</script>

<div class="grid grid-cols-2 gap-3 md:gap-4">

  {#if esims && esims.length > 0}
    <a href={esims[0].url} target="_blank" rel="noopener noreferrer" class="flex flex-col border border-gray-100 rounded-2xl hover:border-lumiCyan hover:shadow-md transition-all bg-white group overflow-hidden">
      <div class="relative h-20 w-full overflow-hidden bg-gray-100">
        <img src="https://images.unsplash.com/photo-1544396821-4dd40b938ad3?auto=format&fit=crop&w=300&q=80" alt="eSIM" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
        <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
        {#if esims[0].cupon}
          <span class="absolute top-2 right-2 text-[9px] font-black uppercase tracking-wider text-lumiDark bg-white/95 px-1.5 py-0.5 rounded shadow-sm backdrop-blur-sm">
            {esims[0].cupon}
          </span>
        {/if}
      </div>
      <div class="p-3">
        <p class="font-bold text-[13px] text-lumiDark line-clamp-1 group-hover:text-lumiCyan transition-colors leading-tight">Conectividad</p>
        <p class="text-[10px] text-gray-400 font-medium mt-0.5 tracking-wide">eSIM sin roaming</p>
      </div>
    </a>
  {/if}

  {#if tours && tours.length > 0}
    <a href={tours[0].url} target="_blank" rel="noopener noreferrer" class="flex flex-col border border-gray-100 rounded-2xl hover:border-lumiCyan hover:shadow-md transition-all bg-white group overflow-hidden">
      <div class="relative h-20 w-full overflow-hidden bg-gray-100">
        <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=300&q=80" alt="Tours" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
        <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
        <span class="absolute top-2 right-2 text-[9px] font-black uppercase tracking-wider text-lumiDark bg-white/95 px-1.5 py-0.5 rounded shadow-sm backdrop-blur-sm">
          Tours
        </span>
      </div>
      <div class="p-3">
        <p class="font-bold text-[13px] text-lumiDark line-clamp-1 group-hover:text-lumiCyan transition-colors leading-tight">Actividades</p>
        <p class="text-[10px] text-gray-400 font-medium mt-0.5 tracking-wide">Mejores precios</p>
      </div>
    </a>
  {/if}

  {#if hoteles}
    <a href={hoteles.url} target="_blank" rel="noopener noreferrer" class="flex flex-col border border-gray-100 rounded-2xl hover:border-lumiCyan hover:shadow-md transition-all bg-white group overflow-hidden">
      <div class="relative h-20 w-full overflow-hidden bg-gray-100">
        <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80" alt="Hotel" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
        <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
        <span class="absolute top-2 right-2 text-[9px] font-black uppercase tracking-wider text-lumiDark bg-white/95 px-1.5 py-0.5 rounded shadow-sm backdrop-blur-sm">
          Hotel
        </span>
      </div>
      <div class="p-3">
        <p class="font-bold text-[13px] text-lumiDark line-clamp-1 group-hover:text-lumiCyan transition-colors leading-tight">Hospedaje</p>
        <p class="text-[10px] text-gray-400 font-medium mt-0.5 tracking-wide">Zonas recomendadas</p>
      </div>
    </a>
  {/if}

  {#if seguro}
    <a href={seguro.url} target="_blank" rel="noopener noreferrer" class="flex flex-col border border-gray-100 rounded-2xl hover:border-lumiCyan hover:shadow-md transition-all bg-white group overflow-hidden">
      <div class="relative h-20 w-full overflow-hidden bg-gray-100">
        <img src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=300&q=80" alt="Seguro" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
        <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
        <span class="absolute top-2 right-2 text-[9px] font-black uppercase tracking-wider text-lumiDark bg-white/95 px-1.5 py-0.5 rounded shadow-sm backdrop-blur-sm">
          Seguro
        </span>
      </div>
      <div class="p-3">
        <p class="font-bold text-[13px] text-lumiDark line-clamp-1 group-hover:text-lumiCyan transition-colors leading-tight">Asistencia</p>
        <p class="text-[10px] text-gray-400 font-medium mt-0.5 tracking-wide">Cobertura 24/7</p>
      </div>
    </a>
  {=if}

</div>
