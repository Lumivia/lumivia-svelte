<script lang="ts">
  import Footer from '$lib/components/Footer.svelte';
  let { data } = $props();
  const deal = data.deal;

  // Formateador de precio para que se vea premium
  const formattedPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: deal.moneda || 'MXN'
  }).format(deal.precio);
</script>

<svelte:head>
  <title>{deal.titulo_gancho} | Lumivia Selección</title>
  <meta name="description" content="Vuelo desde {deal.origenNombre} a {deal.destinoNombre} por solo {formattedPrice}" />
</svelte:head>

<div class="bg-white text-lumiDark min-h-screen font-sans">
  <header class="border-b border-gray-100 py-4 px-6 sticky top-0 bg-white/80 backdrop-blur-md z-50">
    <div class="max-w-5xl mx-auto flex justify-between items-center">
      <a href="/" class="text-xl font-black tracking-tighter hover:scale-105 transition-transform">LUMIVIA</a>
      <div class="hidden md:block text-xs font-bold text-gray-400 uppercase tracking-widest">Selección Exclusiva No. {deal.id}</div>
    </div>
  </header>

  <main class="max-w-5xl mx-auto px-4 py-8 md:py-12">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
      
      <div class="lg:col-span-2 space-y-8">
        
        <div class="inline-flex items-center gap-2 bg-lumiCyan/10 text-lumiCyan px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-lumiCyan opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-lumiCyan"></span>
          </span>
          Tarifa Detectada hace un momento
        </div>

        <div class="space-y-4">
          <h1 class="text-4xl md:text-6xl font-black leading-tight tracking-tighter">
            {deal.destinoNombre}
          </h1>
          <div class="flex items-center gap-4 text-xl md:text-2xl text-gray-500 font-medium">
            <span>{deal.origenNombre}</span>
            <span class="text-lumiCyan text-3xl">✈</span>
            <span>{deal.destinoNombre}</span>
          </div>
        </div>

        <div class="bg-gray-50 rounded-3xl p-8 border border-gray-100 space-y-6">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Precio Final por Persona</p>
              <div class="text-5xl font-black text-lumiDark">{formattedPrice}</div>
              <p class="text-xs text-gray-400 mt-2">Vuelo redondo • Tasas e impuestos incluidos</p>
            </div>
            <a 
              href={deal.link_compra} 
              target="_blank" 
              rel="noopener noreferrer"
              class="w-full md:w-auto bg-lumiDark text-white text-center px-10 py-5 rounded-2xl font-black text-lg hover:bg-lumiCyan hover:text-lumiDark transition-all shadow-xl shadow-lumiDark/10 active:scale-95"
            >
              RESERVAR VUELO
            </a>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200/50">
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase">Salida</p>
              <p class="text-sm font-bold">{deal.fecha_salida || 'Consultar'}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase">Regreso</p>
              <p class="text-sm font-bold">{deal.fecha_regreso || 'Consultar'}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase">Escalas</p>
              <p class="text-sm font-bold">Según selección</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase">Maleta</p>
              <p class="text-sm font-bold">Objeto Personal</p>
            </div>
          </div>
        </div>

        <div class="prose prose-lg text-gray-600 max-w-none">
          <h3 class="text-lumiDark font-bold">¿Por qué es una buena oferta?</h3>
          <p>{deal.titulo_gancho}. Hemos comparado este precio con el promedio histórico y representa un ahorro del 40% al 60%. Ideal para viajeros flexibles que buscan lujo a precio de hostal.</p>
        </div>
      </div>

      <div class="space-y-6">
        <div class="sticky top-24 space-y-6">
          
          <div class="bg-lumiDark text-white rounded-3xl p-6 overflow-hidden relative">
            <div class="relative z-10 space-y-4">
              <h3 class="font-bold text-lg leading-tight">Hospedaje en {deal.destinoNombre}</h3>
              <p class="text-gray-400 text-sm">Encuentra los hoteles con mejor puntuación para tus fechas.</p>
              <a href="https://www.booking.com/searchresults.html?ss={deal.destinoNombre}" target="_blank" class="block w-full bg-white text-lumiDark text-center py-3 rounded-xl font-bold text-sm hover:bg-lumiCyan transition-colors">
                Ver Hoteles Disponibles
              </a>
            </div>
            <div class="absolute -right-4 -bottom-4 text-white/5 text-8xl font-black">HTL</div>
          </div>

          <div class="bg-gray-100 rounded-3xl p-6 border border-gray-200">
            <h3 class="font-bold text-lg text-lumiDark mb-2">¿Qué hacer allá?</h3>
            <p class="text-gray-500 text-sm mb-4">Free tours, museos y experiencias locales curadas.</p>
            <a href="https://www.civitatis.com/es/buscar?q={deal.destinoNombre}" target="_blank" class="block w-full border-2 border-lumiDark text-lumiDark text-center py-3 rounded-xl font-bold text-sm hover:bg-lumiDark hover:text-white transition-all">
              Explorar Actividades
            </a>
          </div>

          <div class="bg-white rounded-3xl p-6 border border-gray-200 flex items-center gap-4">
            <div class="text-3xl">📱</div>
            <div>
              <h4 class="font-bold text-sm">Internet en el viaje</h4>
              <p class="text-xs text-gray-500 mb-2">Consigue tu eSIM para {deal.destinoNombre}.</p>
              <a href="#" class="text-xs font-bold text-lumiCyan underline">Ver planes de datos</a>
            </div>
          </div>

          <a href="/paises/mx" class="block text-center text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-lumiDark transition-colors">
            ← Volver a todas las ofertas
          </a>
        </div>
      </div>

    </div>
  </main>

  <Footer />
</div>
