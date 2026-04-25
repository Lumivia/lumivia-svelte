<script lang="ts">
  // ⛔️ CUARENTENA: Cero importaciones. Cero Supabase. Solo Svelte puro.
  let { data } = $props();
</script>

<div style="background-color: #0f172a; color: white; padding: 50px; font-family: sans-serif; height: 100vh;">
  <h1>PRUEBA DE AISLAMIENTO - SVELTE 5 OK</h1>
  <p>País: {data?.paisUpper || 'No llegó el dato'}</p>
  <p>Mercado: {data?.mercado?.nombre || 'No llegó el dato'}</p>
</div>
