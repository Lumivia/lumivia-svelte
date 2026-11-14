<script lang="ts">
  import { onMount } from 'svelte';
  import { guardarPais, leerPaisGuardado } from '$lib/utils/preferencias';

  onMount(() => {
    const paisGuardado = leerPaisGuardado(null);

    if (paisGuardado) {
      window.location.replace(`/paises/${paisGuardado.toLowerCase()}`);
      return;
    }

    try {
      const zonaHoraria = Intl.DateTimeFormat().resolvedOptions().timeZone;
      let pais = 'mx';

      if (zonaHoraria.includes('Bogota') || zonaHoraria.includes('Colombia')) {
        pais = 'co';
      } else if (
        zonaHoraria.includes('Santiago') ||
        zonaHoraria.includes('Chile') ||
        zonaHoraria.includes('Punta_Arenas') ||
        zonaHoraria.includes('Easter')
      ) {
        pais = 'cl';
      } else if (zonaHoraria.includes('Costa_Rica')) {
        pais = 'cr';
      } else if (
        zonaHoraria.includes('Mexico') ||
        zonaHoraria.includes('Cancun') ||
        zonaHoraria.includes('Monterrey') ||
        zonaHoraria.includes('Tijuana') ||
        zonaHoraria.includes('Hermosillo') ||
        zonaHoraria.includes('Mazatlan') ||
        zonaHoraria.includes('Chihuahua') ||
        zonaHoraria.includes('Ojinaga') ||
        zonaHoraria.includes('Matamoros') ||
        zonaHoraria.includes('Merida') ||
        zonaHoraria.includes('Bahia_Banderas')
      ) {
        pais = 'mx';
      }

      guardarPais(pais);
      window.location.replace(`/paises/${pais}`);
    } catch {
      guardarPais('MX');
      window.location.replace('/paises/mx');
    }
  });
</script>

<noscript>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 p-6 text-center">
    <div class="max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
      <h1 class="mb-3 text-2xl font-black text-lumiDark">Explora Lumivia</h1>
      <p class="mb-6 text-sm leading-relaxed text-gray-600">Tu navegador tiene JavaScript desactivado. Puedes abrir directamente las ofertas disponibles para México.</p>
      <a href="/paises/mx" class="inline-flex rounded-full bg-lumiDark px-6 py-3 text-sm font-black text-white">Ver ofertas</a>
    </div>
  </div>
</noscript>

<!-- Loader visual -->
<div class="loader-container">
  <div class="loader"></div>
  <div class="text-lumi">Lumivia</div>
</div>

<style>
  :global(body) {
    background-color: #f9fafb;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    font-family: 'Inter', sans-serif;
  }

  .loader-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .loader {
    border: 4px solid rgba(0, 210, 255, 0.1);
    border-top: 4px solid #00d2ff;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    animation: spin 1s linear infinite;
  }

  .text-lumi {
    color: #111827;
    font-weight: 800;
    font-size: 14px;
    letter-spacing: 2px;
    text-transform: uppercase;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>
