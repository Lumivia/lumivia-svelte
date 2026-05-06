<script lang="ts">
  import { page } from '$app/stores';
  import { obtenerImagen } from '$lib/utils/imagenes';
  import { copiarUrlUnica } from '$lib/utils/clipboard';

  const { deal, monedaActual, onclick } = $props();

  let cargandoAdmin = $state(false);

  // 🕵️ MODO DIOS: Lee si la URL tiene ?admin=true
  const isAdminModo = $derived($page.url.searchParams.get('admin') === 'true');

  // 💀 Evalúa si la oferta está muerta (Manual o por fecha)
  const estaMuerta = $derived.by(() => {
    if (deal?.expirada_manualmente) return true;
    if (!deal?.fecha_salida) return false;
    try {
      const fechaStr = String(deal.fecha_salida).split('T')[0];
      const partes = fechaStr.split(/[-/]/);
      if (partes.length === 3) {
        let y, m, d;
        if (partes[0].length === 4) { y = partes[0]; m = partes[1]; d = partes[2]; }
        else if (partes[2].length === 4) { y = partes[2]; m = partes[1]; d = partes[0]; }
        else return false;
        
        const fechaSalida = new Date(Number(y), Number(m)-1, Number(d));
        const hoy = new Date();
        hoy.setHours(0,0,0,0);
        return fechaSalida < hoy;
      }
    } catch(e) {}
    return false;
  });

  const esVip = $derived(deal?.tipo_vuelo === 'directo' || deal?.escalas === 0);
  const imgFinal = $derived(obtenerImagen(deal, 150));

  function handleImageError(e: Event) {
    const img = e.target as HTMLImageElement;
    img.onerror = null;
    img.src = 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=150&q=80';
  }

  // 🔥 FIX: Formateo Premium que recorta el "T" y las horas basuras de Supabase
  function formatearFechasPremium(salida: string | null, regreso: string | null) {
    const format = (iso: string | null) => {
      if (!iso) return '';
      try {
        // Ignoramos todo después de la 'T' para evitar problemas de Timezone
        const fechaLimpia = iso.split('T')[0];
        const partes = fechaLimpia.split(/[-/]/);
        if (partes.length !== 3) return fechaLimpia;
        
        let y, m, d;
        if (partes[0].length === 4) { y = partes[0]; m = partes[1]; d = partes[2]; }
        else if (partes[2].length === 4) { y = partes[2]; m = partes[1]; d = partes[0]; }
        else return fechaLimpia;

        const dateObj = new Date(Number(y), Number(m)-1, Number(d));
        if (isNaN(dateObj.getTime())) return fechaLimpia;

        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = dateObj.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase().replace('.', '');
        return `${day} ${month}`;
      } catch { return ''; }
    };
    const s = format(salida);
    const r = format(regreso);
    return s && r ? `${s} - ${r}` : s;
  }

  const fechasCortas = $derived(formatearFechasPremium(deal.fecha_salida, deal.fecha_regreso));

  const precio = $derived(
    Number(deal.precio ?? deal.price ?? 0).toLocaleString('en-US')
  );

  const monedaDeal = $derived(
    (deal.moneda || deal.currency || monedaActual).toUpperCase()
  );

  const origenSeguro = $derived(String(deal.origen_nombre || deal.origen || '').toUpperCase());
  const destinoSeguro = $derived(String(deal.destino_nombre || deal.destino || '').toUpperCase());

  async function handleCopiar(e: Event) {
    e.stopPropagation();
    await copiarUrlUnica(deal.id);
  }

  // 💣 FUNCIÓN GOD MODE
  async function handleMatarOferta(e: Event) {
    e.stopPropagation();
    const password = prompt("Ingresa la contraseña de administrador para matar esta oferta:");
    if (!password) return;

    cargandoAdmin = true;
    try {
      const res = await fetch('/api/matar-oferta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deal.id, secret: password })
      });
      
      if (res.ok) {
        alert("💀 Oferta aniquilada.");
        window.location.reload(); 
      } else {
        alert("Contraseña incorrecta o error en el servidor.");
      }
    } catch (error) {
      alert("Error de conexión.");
    }
    cargandoAdmin = false;
  }
</script>

<li class="list-none border-b border-gray-50 last:border-0 relative">
  <div
    role="button"
    tabindex="0"
    onclick={onclick}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if(onclick) onclick(e); } }}
    class="w-full p-4 sm:px-6 sm:py-5 hover:bg-gray-100 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left cursor-pointer group/item {estaMuerta ? 'opacity-50 grayscale hover:grayscale-0 focus:grayscale-0' : ''}"
    aria-label={`Ver oferta de ${origenSeguro} a ${destinoSeguro}`}
  >
    <div class="flex items-center gap-4 flex-1 min-w-0">
      <div class="relative hidden sm:block shrink-0">
        <img
          src={imgFinal}
          loading="lazy"
          class="h-14 w-14 rounded-xl object-cover shadow-sm border border-gray-200 transform group-hover/item:scale-105 transition-transform duration-500 ease-out"
          alt={deal.titulo_gancho || destinoSeguro}
          onerror={handleImageError}
        />
        {#if estaMuerta}
          <div class="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
             <svg class="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
        {/if}
      </div>

      <div class="min-w-0 flex-1">
        <h4 class="font-bold text-gray-800 text-base group-hover/item:text-lumiDark transition-colors line-clamp-1">
          {deal.titulo_gancho || `Oferta a ${destinoSeguro}`}
        </h4>
        <div class="flex flex-wrap items-center text-xs mt-1.5 gap-2">
          <div class="flex items-center text-[10.5px] font-black text-lumiDark uppercase tracking-widest break-words leading-snug">
            {#if origenSeguro}
              <span>{origenSeguro}</span><span class="mx-1.5 text-[9px] font-bold text-gray-300 align-middle">➔</span>
            {/if}
            <span>{destinoSeguro}</span>
          </div>
          <span class="text-gray-200 font-normal hidden sm:inline">|</span>
          <div class="text-[9.5px] font-extrabold text-gray-400 uppercase tracking-widest mt-[1px]">{fechasCortas}</div>
          
          {#if esVip}
            <span class="text-[8px] bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-md font-black uppercase tracking-widest ml-1">Directo</span>
          {:else if typeof deal?.escalas === 'number'}
            <span class="text-[8px] bg-gray-100 text-gray-500 border border-gray-200 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest ml-1">{deal.escalas} Escala{deal.escalas > 1 ? 's' : ''}</span>
          {/if}

          {#if estaMuerta}
            <span class="text-[8px] bg-red-100 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-md font-black uppercase tracking-widest ml-1">Expirada</span>
          {/if}
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 shrink-0">
      <div class="text-left sm:text-right">
        <p class="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-0.5 sm:hidden">{estaMuerta ? 'Histórico' : 'Precio'}</p>
        <p class="text-xl font-black {estaMuerta ? 'text-gray-400 line-through' : 'text-lumiDark'} leading-none tracking-tight">
          ${precio} <span class="text-xs font-semibold text-gray-400 ml-0.5">{monedaDeal}</span>
        </p>
      </div>
      
      <div class="flex items-center gap-1.5">
        {#if isAdminModo && !estaMuerta}
          <button type="button" onclick={handleMatarOferta} disabled={cargandoAdmin} title="Matar Oferta (Admin)" class="text-red-400 hover:text-white hover:bg-red-600 p-2 rounded-full transition-colors cursor-pointer shrink-0 border border-red-200/50">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        {/if}

        <button type="button" onclick={handleCopiar} title="Compartir enlace" class="text-gray-400 hover:text-lumiCyan hover:bg-lumiCyan/10 p-2.5 rounded-full transition-colors cursor-pointer shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
        </button>

        <span class="{estaMuerta ? 'text-amber-500 group-hover/item:text-amber-600' : 'text-lumiDark group-hover/item:text-lumiCyan'} font-extrabold text-[11px] sm:text-xs flex items-center gap-1 transition-colors uppercase tracking-wider shrink-0 cursor-pointer">
          {estaMuerta ? 'Actuales' : 'Ver Vuelo'} <svg class="w-4 h-4 transition-transform group-hover/item:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </span>
      </div>
    </div>
  </div>
</li>
