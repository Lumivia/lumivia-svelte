<script>
  const { data } = $props();
</script>

<main>
  <slot />
</main>

<style>
  main {
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }
</style>