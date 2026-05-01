<script>
    // Svelte 5: interceptamos los hijos y evitamos cargar el menú de Lumivia
    let { children } = $props();
</script>

<div class="min-h-screen bg-gray-50 font-sans">
    {@render children()}
</div>
