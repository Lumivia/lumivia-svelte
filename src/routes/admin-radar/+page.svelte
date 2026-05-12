<script>
    import { onMount } from 'svelte';

    let password = '';
    let isAuthenticated = false;
    let error = false;

    // 🔐 CONFIGURA TU CONTRASEÑA AQUÍ
    const ADMIN_PASSWORD = R4darLumivia#53; 

    function checkAccess() {
        if (password === ADMIN_PASSWORD) {
            isAuthenticated = true;
            error = false;
            // Pequeño delay para asegurar que el DOM cargó antes de inyectar el script
            setTimeout(injectMap, 100);
        } else {
            error = true;
        }
    }

    function injectMap() {
        const container = document.getElementById('map-target');
        if (!container) return;

        const script = document.createElement('script');
        script.async = true;
        script.src = "https://tpwidg.com/content?currency=mxn&trs=504500&shmarker=708095&lat=19.4270499&lng=-99.1275711&powered_by=true&search_host=vuelos.lumivia.app%2Fflights&locale=es&origin=MEX&value_min=0&value_max=1000000&round_trip=true&only_direct=false&radius=1&draggable=true&disable_zoom=false&show_logo=false&scrollwheel=false&primary=%23111827&secondary=%2300d2ff&light=%23ffffff&width=1200&height=600&zoom=2&promo_id=4054&campaign_id=100";
        script.charset = "utf-8";
        container.appendChild(script);
    }
</script>

<div class="admin-container">
    {#if !isAuthenticated}
        <div class="login-card">
            <h1>🛰️ Radar Lumivia</h1>
            <p>Acceso restringido al centro de mando.</p>
            <input 
                type="password" 
                bind:value={password} 
                placeholder="Ingresa la clave de acceso"
                on:keydown={(e) => e.key === 'Enter' && checkAccess()}
            />
            <button on:click={checkAccess}>Entrar al Radar</button>
            {#if error}
                <p class="error">Clave incorrecta. Intenta de nuevo.</p>
            {/if}
        </div>
    {:else}
        <div class="radar-view">
            <header>
                <h2>🛰️ Radar de Ofertas Activo</h2>
                <button on:click={() => location.reload()}>Cerrar Sesión</button>
            </header>
            
            <div id="map-target" class="map-wrapper">
                </div>
        </div>
    {/if}
</div>

<style>
    :global(body) {
        margin: 0;
        background-color: #0f172a;
        font-family: 'Inter', sans-serif;
    }

    .admin-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        color: white;
    }

    .login-card {
        background: #1e293b;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 10px 50px rgba(0,0,0,0.3);
        text-align: center;
        width: 100%;
        max-width: 400px;
    }

    input {
        width: 100%;
        padding: 12px;
        margin: 20px 0;
        border-radius: 8px;
        border: 1px solid #334155;
        background: #0f172a;
        color: white;
        box-sizing: border-box;
    }

    button {
        background: #00d2ff;
        color: #0f172a;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        width: 100%;
    }

    .error { color: #f87171; font-size: 14px; margin-top: 10px; }

    .radar-view {
        width: 95%;
        max-width: 1400px;
    }

    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .map-wrapper {
        background: white;
        border-radius: 15px;
        padding: 10px;
        min-height: 600px;
        overflow: hidden;
    }
</style>
