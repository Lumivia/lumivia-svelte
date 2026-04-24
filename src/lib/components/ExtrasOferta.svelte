<script lang="ts">
  // Runes: reemplazo de export let
  const { esims, tours, hoteles } = $props();
</script>

<div class="space-y-10">

  <!-- eSIMs -->
  {#if esims && esims.length > 0}
    <section>
      <h3 class="text-lg font-bold text-lumiDark mb-3 flex items-center gap-2">
        <svg class="w-5 h-5 text-lumiCyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 2a9.99 9.99 0 00-7.07 2.93A10 10 0 1012 2z"></path>
        </svg>
        eSIMs recomendadas
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {#each esims as e}
          <a
            href={e.url}
            target="_blank"
            class="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-md transition bg-white"
          >
            <img src={e.imagen} alt={e.nombre} class="w-14 h-14 rounded-lg object-cover" />

            <div class="flex flex-col">
              <p class="font-bold text-lumiDark">{e.nombre}</p>
              <p class="text-sm text-gray-500">{e.data} • {e.validez}</p>
              <p class="text-lumiCyan font-bold text-sm mt-1">{e.precio}</p>
            </div>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Tours -->
  {#if tours && tours.length > 0}
    <section>
      <h3 class="text-lg font-bold text-lumiDark mb-3 flex items-center gap-2">
        <svg class="w-5 h-5 text-lumiCyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 7h18M3 12h18M3 17h18"></path>
        </svg>
        Actividades recomendadas
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {#each tours as t}
          <a
            href={t.url}
            target="_blank"
            class="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-md transition bg-white"
          >
            <img src={t.imagen} alt={t.titulo} class="w-20 h-20 rounded-lg object-cover" />

            <div class="flex flex-col">
              <p class="font-bold text-lumiDark leading-tight">{t.titulo}</p>
              <p class="text-sm text-gray-500">{t.duracion}</p>
              <p class="text-lumiCyan font-bold text-sm mt-1">{t.precio}</p>
            </div>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Hoteles -->
  {#if hoteles}
    <section>
      <h3 class="text-lg font-bold text-lumiDark mb-3 flex items-center gap-2">
        <svg class="w-5 h-5 text-lumiCyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 7h18M3 12h18M3 17h18"></path>
        </svg>
        Hospedaje recomendado
      </h3>

      <a
        href={hoteles.url}
        target="_blank"
        class="block p-5 border border-gray-200 rounded-xl hover:shadow-md transition bg-white"
      >
        <p class="font-bold text-lumiDark text-base mb-1">{hoteles.titulo}</p>
        <p class="text-sm text-gray-500">{hoteles.descripcion}</p>

        <div class="mt-3 inline-flex items-center gap-2 text-lumiCyan font-bold text-sm">
          Ver hoteles
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
      </a>
    </section>
  {/if}

</div>
