<script lang="ts">
  import "../app.css";
  import type { Snippet } from 'svelte';
  import CookieConsent from '$lib/components/CookieConsent.svelte';

  type LayoutMetadata = {
    canonicalURL?: string;
    description?: string;
    ogImage?: string;
    robots?: string;
    schemaAEO?: string | null;
    schemaJSON?: string | null;
    title?: string;
  };
  
  // 🔥 SVELTE 5: Extracción limpia
  let { data, children }: { data: LayoutMetadata; children: Snippet } = $props();

  // 🔥 Sanitización de JSON-LD (Evita XSS y caídas de página)
  // Reemplazamos '<' con su código unicode para que el navegador no se confunda
  // si un texto de la base de datos contiene HTML o scripts rotos.
  const schemaDinamico = $derived(data?.schemaAEO || data?.schemaJSON);
  const safeSchema = $derived(schemaDinamico ? schemaDinamico.replace(/</g, '\\u003C') : null);
</script>

<svelte:head>
  <title>{data?.title || 'Lumivia | Buscador gratuito de vuelos'}</title>
  <meta name="description" content={data?.description || 'Compara vuelos con fechas y precios claros. Lumivia no vende boletos: te redirige a la aerolínea o agencia para reservar.'} />
  
  {#if data?.canonicalURL}
    <link rel="canonical" href={data.canonicalURL} />
  {/if}

  {#if data?.robots}
    <meta name="robots" content={data.robots} />
  {/if}

  <meta property="og:type" content="website" />
  <meta property="og:url" content={data?.canonicalURL || 'https://www.lumivia.app'} />
  <meta property="og:title" content={data?.title || 'Lumivia | Buscador gratuito de vuelos'} />
  <meta property="og:description" content={data?.description || 'Compara vuelos vigentes y reserva directamente con la aerolínea o agencia.'} />
  <meta property="og:image" content={data?.ogImage || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80'} />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data?.title || 'Lumivia'} />
  <meta name="twitter:description" content={data?.description || 'Compara vuelos vigentes y reserva directamente con el proveedor.'} />
  <meta name="twitter:image" content={data?.ogImage || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80'} />

  {#if safeSchema}
    <script type="application/ld+json">
      {@html safeSchema}
    </script>
  {/if}

  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Lumivia",
      "url": "https://www.lumivia.app/",
      "logo": "https://www.lumivia.app/favicon.svg?v=2",
      "description": "Buscador gratuito que compara vuelos y redirige a aerolíneas y agencias para completar la reserva.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://vuelos.lumivia.app/?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  </script>

  <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2" />
  <link rel="apple-touch-icon" href="/favicon.svg?v=2" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
</svelte:head>

{@render children()}
<CookieConsent />
