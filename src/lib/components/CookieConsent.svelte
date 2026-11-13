<script lang="ts">
  import { onMount } from 'svelte';

  const COOKIE_NAME = 'lumivia_cookie_consent';
  let visible = $state(false);

  function leerConsentimiento(): string | null {
    const valor = document.cookie
      .split('; ')
      .find((item) => item.startsWith(`${COOKIE_NAME}=`));
    return valor ? valor.split('=')[1] : null;
  }

  function guardarConsentimiento(valor: 'accepted' | 'rejected') {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${COOKIE_NAME}=${valor}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
  }

  function cargarAnalitica() {
    if (document.querySelector('script[data-lumivia-gtm]')) return;

    const ventana = window as Window & { dataLayer?: Record<string, unknown>[] };
    ventana.dataLayer = ventana.dataLayer || [];
    ventana.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

    const script = document.createElement('script');
    script.async = true;
    script.dataset.lumiviaGtm = 'true';
    script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-58WFMR24';
    document.head.appendChild(script);
  }

  function aceptar() {
    guardarConsentimiento('accepted');
    visible = false;
    cargarAnalitica();
  }

  function rechazar() {
    guardarConsentimiento('rejected');
    visible = false;
  }

  onMount(() => {
    const consentimiento = leerConsentimiento();
    if (consentimiento === 'accepted') cargarAnalitica();
    else if (consentimiento !== 'rejected') visible = true;
  });
</script>

{#if visible}
  <aside class="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl sm:p-5" aria-label="Preferencias de cookies">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-sm leading-relaxed text-gray-600">
        Usamos cookies opcionales para medir el uso del sitio. Puedes rechazarlas y Lumivia seguirá funcionando.
        <a href="/privacidad" class="font-bold text-lumiDark underline decoration-lumiCyan underline-offset-2">Aviso de privacidad</a>.
      </p>
      <div class="flex shrink-0 gap-2">
        <button type="button" onclick={rechazar} class="rounded-xl border border-gray-300 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50">Rechazar</button>
        <button type="button" onclick={aceptar} class="rounded-xl bg-lumiDark px-4 py-2 text-sm font-black text-white hover:bg-lumiCyan hover:text-lumiDark">Aceptar</button>
      </div>
    </div>
  </aside>
{/if}
