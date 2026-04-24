<script lang="ts">
  const { data } = $props();
</script>

<svelte:head>
  <!-- Google Tag Manager -->
  <script>
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-58WFMR24');
  </script>

  <!-- SEO dinámico -->
  <title>{data.title}</title>
  <meta name="description" content={data.description} />
  <link rel="canonical" href={data.canonicalURL} />

  {#if data.robots}
    <meta name="robots" content={data.robots} />
  {/if}

  <!-- OpenGraph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={data.canonicalURL} />
  <meta property="og:title" content={data.title} />
  <meta property="og:description" content={data.description} />
  <meta property="og:image" content="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data.title} />
  <meta name="twitter:description" content={data.description} />

  <!-- Hreflangs -->
  <link rel="alternate" hreflang="es-mx" href="https://lumivia.app/mx/" />
  <link rel="alternate" hreflang="es-co" href="https://lumivia.app/co/" />
  <link rel="alternate" hreflang="es-cl" href="https://lumivia.app/cl/" />
  <link rel="alternate" hreflang="es-cr" href="https://lumivia.app/cr/" />
  <link rel="alternate" hreflang="x-default" href="https://lumivia.app/mx/" />
  <link rel="alternate" hreflang="es" href="https://lumivia.app/mx/" />

  <!-- Icons -->
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="apple-touch-icon" href="/favicon.png" />

  <!-- Tailwind -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

  <!-- Supabase -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

  <!-- Schema AEO dinámico -->
  {#if data.schemaAEO}
    {@html `<script type="application/ld+json">${data.schemaAEO}</script>`}
  {/if}

  <!-- Schema TravelAgency -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      "name": "Lumivia",
      "url": "https://lumivia.app/",
      "logo": "https://lumivia.app/favicon.png",
      "description": "Plataforma inteligente de análisis de vuelos y alertas de viaje.",
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
    height="0" width="0" style="display:none;visibility:hidden"></iframe>
</noscript>

<slot />

<style global>
  .card-minimal {
    background: #ffffff;
    border: 1px solid #f3f4f6;
    border-radius: 24px;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 20px -10px rgba(0, 0, 0, 0.05);
    cursor: pointer;
  }

  .card-minimal:hover {
    transform: translateY(-4px);
    border: 1px solid #e5e7eb;
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.08);
  }

  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  .badge-vip-glass {
    background: linear-gradient(135deg, rgba(194, 155, 87, 0.9) 0%, rgba(218, 186, 116, 0.95) 100%);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 15px rgba(194, 155, 87, 0.4);
  }
</style>
