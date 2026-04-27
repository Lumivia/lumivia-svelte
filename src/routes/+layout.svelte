<script lang="ts">
  import "../app.css"; // Activa TailwindCSS globalmente
  
  // 🔥 SVELTE 5: Extraemos 'data' y el nuevo prop 'children'
  let { data, children } = $props();
</script>

<svelte:head>
  <script>
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-58WFMR24');
  </script>

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
  <meta property="og:description" content={data?.description || 'Descubre ofertas curadas de vuelos, hoteles y experiencias únicas. La bóveda secreta de viajes de Lumivia.'} />
  <meta property="og:image" content="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data?.title || 'Lumivia'} />
  <meta name="twitter:description" content={data?.description || 'La bóveda secreta de viajes de Lumivia.'} />

  <link rel="alternate" hreflang="es-mx" href="https://www.lumivia.app/masdestinos?pais=MX" />
  <link rel="alternate" hreflang="es-co" href="https://www.lumivia.app/masdestinos?pais=CO" />
  <link rel="alternate" hreflang="es-cl" href="https://www.lumivia.app/masdestinos?pais=CL" />
  <link rel="alternate" hreflang="es-cr" href="https://www.lumivia.app/masdestinos?pais=CR" />
  <link rel="alternate" hreflang="es" href="https://www.lumivia.app/masdestinos?pais=MX" />
  <link rel="alternate" hreflang="x-default" href="https://www.lumivia.app/masdestinos?pais=MX" />

  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="apple-touch-icon" href="/favicon.png" />

  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

  {#if data?.schemaAEO || data?.schemaJSON}
    {@html `<script type="application/ld+json">${data.schemaAEO || data.schemaJSON}</script>`}
  {/if}

  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      "name": "Lumivia",
      "url": "https://lumivia.app/",
      "logo": "https://lumivia.app/favicon.png",
      "description": "Plataforma inteligente de análisis de vuelos y ofertas curadas de viaje.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://vuelos.lumivia.app/?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  </script>
</svelte:head>

<noscript>
  <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-58WFMR24"
    height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe>
</noscript>

{@render children()}
