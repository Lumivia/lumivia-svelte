<script lang="ts">
  import { page } from '$app/stores';
  import { obtenerImagen } from '$lib/utils/imagenes';
  import { copiarUrlUnica } from '$lib/utils/clipboard';
  import { reportarCambioPrecio } from '$lib/utils/reportes';
  import AmenidadesLinea from '$lib/components/AmenidadesLinea.svelte';

  const { deal, monedaActual, paisActual, onclick } = $props();

  let reportado = $state(false);
  let cargandoAdmin = $state(false);

  // 🕵️ MODO DIOS: Lee si la URL tiene ?admin=true
  const isAdminModo = $derived($page.url.searchParams.get('admin') === 'true');

  // Evalúa si la oferta está muerta (por ti o por la fecha)
  const estaMuerta = $derived.by(() => {
    if (deal?.expirada_manualmente) return true;
    if (reportado) return true;
    
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

  const imgFinal = $derived(obtenerImagen(deal));
  
  function handleImageError(e: Event) {
    const img = e.target as HTMLImageElement;
    img.onerror = null;
    img.src = 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=800&q=80';
  }

  // 🔥 FIX DEFINITIVO: Algoritmo de Fechas Premium (A prueba de timestamps basuras)
  function formatearFechasPremium(salida: string | null, regreso: string | null) {
    const format = (iso: string | null) => {
      if (!iso) return '';
      try {
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

  const fechasCortas = $derived(formatearFechasPremium(deal?.fecha_salida, deal?.fecha_regreso));

  const precio = $derived(
    Number(deal?.precio ?? deal?.price ?? 0).toLocaleString('en-US')
  );

  const monedaDeal = $derived(
    String(deal?.moneda || deal?.currency || monedaActual || 'MXN').toUpperCase()
  );

  const origenSeguro = $derived(String(deal?.origen_nombre || deal?.origen || '').toUpperCase());
  const destinoSeguro = $derived(String(deal?.destino_nombre || deal?.destino || '').toUpperCase());

  // El sistema anterior de VIP se queda, pero agregamos la validación de la base de datos
  const esVip = $derived(deal?.tipo_vuelo === 'directo' || deal?.escalas === 0);

  async function handleReportar(e: Event) {
    e.stopPropagation(); 
    if (reportado) return;
    reportado = true;
    try {
      if (deal?.id) await reportarCambioPrecio(deal.id);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCopiar(e: Event) {
    e.stopPropagation(); 
    if (deal?.id) await copiarUrlUnica(deal.id);
  }

  // 💣 FUNCIÓN GOD MODE (Dispara al backend)
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

<div
  role="button"
  tabindex="0"
  onclick={onclick} 
  onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if(onclick) onclick(e); } }}
  class="card-minimal flex-none w-[85vw] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-center flex flex-col group/card hover:shadow-2xl transition-all duration-300 bg-white rounded-2xl overflow-hidden text-left cursor-pointer border border-gray-100 {estaMuerta ? 'opacity-50 grayscale hover:grayscale-0 focus:grayscale-0' : ''}"
  aria-label={`Ver oferta de ${origenSeguro} a ${destinoSeguro}`}
>
  <div class="relative h-56 overflow-hidden bg-gray-100 shrink-0">
    <img
      src={imgFinal}
      alt={deal?.titulo_gancho || 'Oferta'}
      loading="lazy"
      class="w-full h-full object-cover transform group-hover/card:scale-105 transition-transform duration-700 ease-out"
      onerror={handleImageError}
    />
    <div class="absolute inset-0 bg-gradient-to-t from-lumiDark/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>

    {#if isAdminModo && !estaMuerta}
      <button 
        type="button" 
        onclick={handleMatarOferta} 
        disabled={cargandoAdmin}
        class="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600/90 hover:bg-red-700 text-white backdrop-blur-md px-4 py-1.5 rounded-full font-black text-[10px] shadow-lg border border-red-400 z-30 uppercase tracking-widest flex items-center gap-1 transition-all"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        {cargandoAdmin ? '...' : 'MATAR OFERTA'}
      </button>
    {/if}

    {#if estaMuerta}
      <div class="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
        <div class="bg-black/80 text-white font-black px-6 py-2 rounded-full uppercase tracking-widest text-[11px] shadow-2xl border border-white/20">
          Fechas Pasadas / Expirada
        </div>
      </div>
    {/if}

    {#if deal?.tiempoTranscurrido && !estaMuerta}
      <div class="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-lumiDark text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm tracking-wide border border-white/50 uppercase flex items-center gap-1">
        ⏱️ {deal.tiempoTranscurrido}
      </div>
    {/if}

    {#if esVip}
      <div class="absolute top-4 right-4 bg-white/95 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-full z-10 flex items-center gap-1.5 uppercase tracking-widest shadow-lg border border-emerald-200">
        <svg class="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg> Directo
      </div>
    {:else if typeof deal?.escalas === 'number'}
      <div class="absolute top-4 right-4 bg-white/95 text-gray-700 text-[10px] font-bold px-3 py-1.5 rounded-full z-10 flex items-center gap-1.5 uppercase tracking-widest shadow-lg border border-gray-200">
        {deal.escalas} Escala{deal.escalas > 1 ? 's' : ''}
      </div>
    {/if}

    {#if !estaMuerta}
      <button type="button" onclick={handleReportar} title="¿El precio subió? Repórtalo" class="absolute bottom-3 right-3 bg-white/80 hover:bg-red-50 text-gray-500 hover:text-red-500 backdrop-blur-sm p-2.5 rounded-full shadow-sm border border-white/50 transition-colors z-10 cursor-pointer">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-1 6-1-1H11.5l-1-1H5v10m0 0h4"></path></svg>
      </button>
    {/if}
  </div>

  <div class="p-6 flex flex-col flex-grow bg-white relative">
    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="text-[11px] sm:text-[12px] font-black text-lumiDark uppercase tracking-widest leading-snug break-words">
        {origenSeguro} <span class="text-gray-300 font-bold mx-1.5 text-[10px] align-middle">➔</span> {destinoSeguro}
      </div>
      <div class="shrink-0 text-[9.5px] font-extrabold text-gray-400 uppercase tracking-widest text-right mt-[2px]">
        {fechasCortas}
      </div>
    </div>

    <h3 class="text-xl font-bold mb-4 text-gray-800 group-hover/card:text-lumiDark transition-colors leading-snug line-clamp-2">
      {deal?.titulo_gancho || 'Vuelo Especial'}
    </h3>

    <AmenidadesLinea {deal} {paisActual} />

    <div class="mt-auto pt-5 border-t border-gray-100 flex items-end justify-between">
      <div>
        <p class="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">{estaMuerta ? 'Precio Histórico' : 'Vuelo Id/Vt'}</p>
        <p class="text-3xl sm:text-4xl font-black {estaMuerta ? 'text-gray-400 line-through' : 'text-lumiDark'} leading-none tracking-tighter">
          <span class="text-lg font-bold text-gray-400 align-top mr-0.5">$</span>{precio} <span class="text-sm font-bold text-gray-400 align-baseline ml-1">{monedaDeal}</span>
        </p>
      </div>
      
      <div class="flex items-center gap-2">
        <button type="button" onclick={handleCopiar} title="Compartir enlace" class="text-gray-400 hover:text-lumiCyan transition-colors p-2 rounded-full cursor-pointer">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
        </button>
        <div class="{estaMuerta ? 'bg-gray-200 text-gray-500' : 'bg-lumiDark text-white group-hover/card:bg-lumiCyan group-hover/card:text-lumiDark'} px-6 py-3 rounded-xl font-black text-[12px] sm:text-[13px] transition-all duration-300 shadow-md group-hover/card:shadow-lg active:scale-95 cursor-pointer flex items-center gap-2 uppercase tracking-wider">
          {estaMuerta ? 'Ver Actuales' : 'Ver Vuelo'} 
          <svg class="w-4 h-4 transition-transform duration-300 group-hover/card:translate-x-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </div>
      </div>
    </div>
  </div>
</div>
