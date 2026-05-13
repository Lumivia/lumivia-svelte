<script lang="ts">
  import "../app.css"; 
  import { page } from '$app/stores'; // 🔥 Agregado: Importamos el store de la página
  
  // 🔥 SVELTE 5: Extracción limpia
  let { data, children } = $props();

  // 🔥 Sanitización de JSON-LD (Evita XSS y caídas de página)
  // Reemplazamos '<' con su código unicode para que el navegador no se confunda
  // si un texto de la base de datos contiene HTML o scripts rotos.
  const schemaDinamico = data?.schemaAEO || data?.schemaJSON;
  const safeSchema = schemaDinamico ? schemaDinamico.replace(/</g, '\\u003C') : null;
</script>

<svelte:head>
  <title>{data?.title || 'Lumivia | Tu Concierge de Viajes Premium'}</title>
  <meta name="description" content={data?.description || 'Descubre ofertas curadas de vuelos, hoteles y experiencias únicas. La bóveda secreta de viajes de Lumivia.'} />
  
  {#if data?.canonicalURL}
    <link rel="canonical" href={data.canonicalURL} />
  {/if}

  {#if data?.robots}
    <meta name="robots" content={data.robots} />
  {/if}

  <meta property="og:type" content="website" />
  <meta property="og:url" content={data?.canonicalURL || 'https://www.lumivia.app'} />
  <meta property="og:title" content={data?.title || 'Lumivia | Tu Concierge de Viajes Premium'} />
  <meta property="og:description" content={data?.description || 'Descubre ofertas curadas de vuelos, hoteles y experiencias únicas.'} />
  <meta property="og:image" content={data?.ogImage || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80'} />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data?.title || 'Lumivia'} />
  <meta name="twitter:description" content={data?.description || 'La bóveda secreta de viajes de Lumivia.'} />
  <meta name="twitter:image" content={data?.ogImage || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80'} />

  {#if safeSchema}
    <script type="application/ld+json">
      {@html safeSchema}
    </script>
  {/if}

  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      "name": "Lumivia",
      "url": "https://www.lumivia.app/",
      "logo": "https://www.lumivia.app/favicon.svg?v=2",
      "description": "Plataforma inteligente de análisis de vuelos y ofertas curadas de viaje.",
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

  <script>
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-58WFMR24');
  </script>
</svelte:head>

<noscript>
  <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-58WFMR24"
    height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe>
</noscript>

{#key $page.url.pathname}
  {@render children()}
{/key}
