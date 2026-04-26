<script lang="ts">
  // 🔥 SVELTE 5 PURO: Props desestructurados
  const { esims = [], tours = [], hoteles = null } = $props();
</script>

<div class="space-y-10">

  {#if esims && esims.length > 0}
    <section>
      <h3 class="text-lg font-bold text-lumiDark mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-lumiCyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2a9.99 9.99 0 00-7.07 2.93A10 10 0 1012 2z"></path>
        </svg>
        eSIMs Recomendadas (Airalo)
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {#each esims as e}
          <a
            href={e.url}
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-lg hover:border-lumiCyan transition-all bg-white group cursor-pointer"
          >
            {#if e.imagen}
              <img src={e.imagen} alt={e.nombre} class="w-14 h-14 rounded-lg object-cover border border-gray-100" />
            {:else}
              <div class="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-xl">📱</div>
            {/if}

            <div class="flex flex-col">
              <p class="font-bold text-lumiDark group-hover:text-lumiCyan transition-colors">{e.nombre}</p>
              <p class="text-xs text-gray-500 font-medium">{e.data} • {e.validez}</p>
              <p class="text-lumiDark font-black text-sm mt-1">{e.precio}</p>
            </div>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  {#if tours && tours.length > 0}
    <section>
      <h3 class="text-lg font-bold text-lumiDark mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-lumiCyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18"></path>
        </svg>
        Tours y Actividades (Civitatis)
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {#each tours as t}
          <a
            href={t.url}
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-lg hover:border-lumiCyan transition-all bg-white group cursor-pointer"
          >
            {#if t.imagen}
              <img src={t.imagen} alt={t.titulo} class="w-20 h-20 rounded-lg object-cover border border-gray-100" />
            {:else}
              <div class="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">🏛️</div>
            {/if}

            <div class="flex flex-col flex-1">
              <p class="font-bold text-lumiDark leading-tight text-sm line-clamp-2 group-hover:text-lumiCyan transition-colors">{t.titulo}</p>
              <p class="text-xs text-gray-500 font-medium mt-1">{t.duracion}</p>
              <p class="text-lumiDark font-black text-sm mt-1">{t.precio}</p>
            </div>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  {#if hoteles}
    <section>
      <h3 class="text-lg font-bold text-lumiDark mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-lumiCyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
        </svg>
        Hospedaje Recomendado
      </h3>

      <a
        href={hoteles.url}
        target="_blank"
        rel="noopener noreferrer"
        class="block p-6 border border-gray-200 rounded-xl hover:shadow-lg hover:border-lumiCyan transition-all bg-white group cursor-pointer relative overflow-hidden"
      >
        <div class="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-lumiCyan/10 to-transparent pointer-events-none"></div>
        
        <p class="font-black text-lumiDark text-lg mb-2 group-hover:text-lumiCyan transition-colors">{hoteles.titulo}</p>
        <p class="text-sm text-gray-500 leading-relaxed max-w-xl">{hoteles.descripcion}</p>

        <div class="mt-4 inline-flex items-center gap-2 bg-gray-50 text-lumiDark px-4 py-2 rounded-lg font-bold text-sm group-hover:bg-lumiCyan group-hover:text-white transition-colors">
          Explorar Hoteles en Stay22
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
      </a>
    </section>
  {/if}

</div>
