<script lang="ts">
  // 🔥 SVELTE 5 PURO: Añadimos 'seguro' a la desestructuración
  const { esims = [], tours = [], hoteles = null, seguro = null } = $props();
</script>

<div class="space-y-6">

  {#if esims && esims.length > 0}
    <section>
      <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Conectividad</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {#each esims as e}
          <a
            href={e.url}
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3 p-3 border border-gray-100 rounded-2xl hover:border-lumiCyan hover:shadow-md hover:bg-gray-50/50 transition-all bg-white group"
          >
            {#if e.imagen}
              <img src={e.imagen} alt={e.nombre} class="w-12 h-12 rounded-xl object-cover bg-gray-50" />
            {:else}
              <div class="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl">📱</div>
            {/if}

            <div class="flex-1 min-w-0">
              <p class="font-bold text-sm text-lumiDark truncate group-hover:text-lumiCyan transition-colors">{e.nombre}</p>
              {#if e.cupon}
                <p class="text-[10px] font-bold text-lumiCyan bg-lumiCyan/10 px-1.5 py-0.5 rounded inline-block mt-0.5 border border-lumiCyan/20">{e.cupon}</p>
              {:else}
                <p class="text-xs text-gray-500 truncate">{e.data} • {e.validez}</p>
              {/if}
            </div>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  {#if tours && tours.length > 0}
    <section>
      <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Actividades</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {#each tours as t}
          <a
            href={t.url}
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3 p-3 border border-gray-100 rounded-2xl hover:border-lumiCyan hover:shadow-md hover:bg-gray-50/50 transition-all bg-white group"
          >
            {#if t.imagen}
              <img src={t.imagen} alt={t.titulo} class="w-12 h-12 rounded-xl object-cover bg-gray-50" />
            {:else}
              <div class="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl">🏛️</div>
            {/if}

            <div class="flex-1 min-w-0">
              <p class="font-bold text-sm text-lumiDark line-clamp-1 group-hover:text-lumiCyan transition-colors">{t.titulo}</p>
              <p class="text-[11px] text-gray-500 truncate mt-0.5">{t.duracion} • {t.precio}</p>
            </div>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  {#if hoteles || seguro}
    <section>
      <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Esenciales de Viaje</h3>
      <div class="grid grid-cols-1 gap-3">
        
        {#if hoteles}
          <a
            href={hoteles.url}
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-lumiCyan hover:shadow-md hover:bg-gray-50/50 transition-all bg-white group"
          >
            <div class="pr-4">
              <p class="font-bold text-sm text-lumiDark group-hover:text-lumiCyan transition-colors">{hoteles.titulo}</p>
              <p class="text-xs text-gray-500 mt-0.5 line-clamp-1">{hoteles.descripcion}</p>
            </div>
            <span class="text-[11px] font-black uppercase tracking-wider text-lumiCyan bg-lumiCyan/10 px-3 py-1.5 rounded-lg whitespace-nowrap">Ver opciones</span>
          </a>
        {/if}

        {#if seguro}
          <a
            href={seguro.url}
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-lumiCyan hover:shadow-md hover:bg-gray-50/50 transition-all bg-white group"
          >
            <div class="pr-4">
              <p class="font-bold text-sm text-lumiDark group-hover:text-lumiCyan transition-colors">{seguro.titulo}</p>
              <p class="text-xs text-gray-500 mt-0.5 line-clamp-1">{seguro.descripcion}</p>
            </div>
            <span class="text-[11px] font-black uppercase tracking-wider text-lumiCyan bg-lumiCyan/10 px-3 py-1.5 rounded-lg whitespace-nowrap">Cotizar</span>
          </a>
        {/if}

      </div>
    </section>
  {/if}

</div>
