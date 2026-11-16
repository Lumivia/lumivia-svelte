<script lang="ts">
  const { deal, paisActual, mostrarRuta = false } = $props();

  const vueloDirecto = $derived(deal?.tipo_vuelo === 'directo');
  const escalas = $derived(deal?.escalas ?? 0);
  
  const aerolinea = $derived(String(deal?.aerolinea ?? '').trim());
  const equipaje = $derived(String(deal?.equipaje ?? '').trim());
  const duracion = $derived(deal?.duracion ?? deal?.duration ?? '');
  const clase = $derived(deal?.clase ?? deal?.fare_class ?? '');

  const origenCodigo = $derived(String(deal?.origen ?? '').trim().toUpperCase());
  const destinoCodigo = $derived(String(deal?.destino ?? '').trim().toUpperCase());
  const origenCiudad = $derived(String(deal?.origen_nombre ?? deal?.origenNombre ?? origenCodigo).trim());
  const destinoCiudad = $derived(String(deal?.destino_nombre ?? deal?.destinoNombre ?? destinoCodigo).trim());

  function ciudadConIata(ciudad: string, codigo: string): string {
    if (!codigo) return ciudad;
    if (!ciudad || ciudad.toUpperCase() === codigo) return codigo;
    return `${ciudad} (${codigo})`;
  }

  const rutaExacta = $derived(
    origenCodigo && destinoCodigo
      ? `${ciudadConIata(origenCiudad, origenCodigo)} → ${ciudadConIata(destinoCiudad, destinoCodigo)}`
      : ''
  );
  const hayDetallePrevio = $derived((!vueloDirecto && Number(escalas) > 0) || Boolean(aerolinea || equipaje || duracion || clase));
  const hayAntesDeImpuestos = $derived(hayDetallePrevio || Boolean(mostrarRuta && rutaExacta));
</script>

<div class="flex items-center flex-wrap gap-2 text-[10.5px] sm:text-[11px] font-bold text-gray-500 mb-5 uppercase tracking-widest leading-relaxed">

  {#if !vueloDirecto && escalas > 0}
    <span class="flex items-center gap-1.5">
      <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
      </svg>
      {escalas} Escala{escalas === 1 ? '' : 's'}
    </span>
    <span class="text-gray-300">•</span>
  {/if}

  {#if aerolinea}
    <span class="flex items-center gap-1.5">
      <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
      <span>{aerolinea}</span>
    </span>
  {/if}

  {#if equipaje}
    {#if aerolinea}<span class="text-gray-300">•</span>{/if}
    <span class="flex items-center gap-1.5" title={equipaje}>
      <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
      </svg>
      <span>{equipaje}</span>
    </span>
  {/if}

  {#if duracion}
    <span class="text-gray-300">•</span>
    <span class="flex items-center gap-1.5">
      <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      {duracion}
    </span>
  {/if}

  {#if clase}
    <span class="text-gray-300">•</span>
    <span class="flex items-center gap-1.5">
      <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
      </svg>
      {clase}
    </span>
  {/if}

  {#if mostrarRuta && rutaExacta}
    {#if hayDetallePrevio}<span class="text-gray-300">•</span>{/if}
    <span class="flex items-center gap-1.5 normal-case tracking-normal" title="Ruta exacta del vuelo">
      <svg class="w-3.5 h-3.5 shrink-0 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M13 6l6 6-6 6"></path>
      </svg>
      <span>{rutaExacta}</span>
    </span>
  {/if}

  {#if hayAntesDeImpuestos}<span class="text-gray-300">•</span>{/if}
  <span class="flex items-center gap-1.5">
    <svg class="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
    </svg>
    Impuestos incluidos
  </span>

</div>
