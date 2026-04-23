<script>
  // Se ejecuta solo en el navegador
  if (typeof window !== 'undefined') {
    const paisGuardado = localStorage.getItem('lumivia_pais');

    if (paisGuardado) {
      window.location.replace(`/paises/${paisGuardado.toLowerCase()}/`);
    } else {
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

        localStorage.setItem('lumivia_pais', pais.toUpperCase());
        window.location.replace(`/paises/${pais}/`);
      } catch (e) {
        localStorage.setItem('lumivia_pais', 'MX');
        window.location.replace('/paises/mx/');
      }
    }
  }
</script>

<!-- Loader visual -->
<div class="loader-container">
  <div class="loader"></div>
  <div class="text-lumi">Lumivia</div>
</div>

<style>
  body {
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
