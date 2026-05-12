<script>
    // 🔥 Usando Svelte 5 Runes para el estado
    let password = $state('');
    let isAuthenticated = $state(false);
    let error = $state(false);

    // 🔐 LLAVE DE ACCESO
    const CLAVE_MAESTRA = 'Radar2026'; 

    function handleLogin() {
        if (password === CLAVE_MAESTRA) {
            isAuthenticated = true;
            error = false;
        } else {
            error = true;
            password = '';
        }
    }
</script>

<svelte:head>
    <title>Radar Secreto | Lumivia</title>
</svelte:head>

<div class="admin-wrapper">
    {#if !isAuthenticated}
        <section class="login-box">
            <div class="logo">🛰️ <span>RADAR</span> LUMIVIA</div>
            <p>Acceso restringido al centro de mando.</p>
            
            <div class="input-group">
                <input 
                    type="password" 
                    bind:value={password} 
                    placeholder="Contraseña"
                    onkeydown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button onclick={handleLogin}>ACCEDER</button>
            </div>
            
            {#if error}
                <div class="error-msg">Clave incorrecta. Intento registrado.</div>
            {/if}
        </section>
    {:else}
        <section class="radar-dashboard">
            <header class="radar-header">
                <div class="status"><span class="dot"></span> RADAR ACTIVO (Bypass Estático)</div>
                <button class="logout" onclick={() => location.reload()}>CERRAR SESIÓN</button>
            </header>
            
            <div class="map-frame">
                <iframe 
                    src="/radar-widget.html" 
                    title="Radar Travelpayouts"
                    frameborder="0"
                    width="100%"
                    height="620px"
                    scrolling="no"
                ></iframe>
            </div>
        </section>
    {/if}
</div>

<style>
    :global(body) {
        background-color: #0b0f1a;
        margin: 0;
        font-family: 'Inter', sans-serif;
    }

    .admin-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 20px;
    }

    .login-box {
        background: #161b2b;
        padding: 40px;
        border-radius: 24px;
        border: 1px solid rgba(255,255,255,0.05);
        text-align: center;
        width: 100%;
        max-width: 380px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }

    .logo { color: white; font-weight: 900; font-size: 20px; margin-bottom: 10px; }
    .logo span { color: #00d2ff; }
    p { color: #6b7280; font-size: 14px; margin-bottom: 25px; }

    .input-group { display: flex; flex-direction: column; gap: 12px; }

    input {
        background: #0b0f1a;
        border: 1px solid #2d3748;
        padding: 14px;
        border-radius: 12px;
        color: white;
        text-align: center;
        font-size: 16px;
        outline: none;
    }

    input:focus { border-color: #00d2ff; }

    button {
        background: #00d2ff;
        color: #0b0f1a;
        border: none;
        padding: 14px;
        border-radius: 12px;
        font-weight: 800;
        cursor: pointer;
        transition: 0.2s;
    }

    button:hover { background: #3b82f6; color: white; }
    .error-msg { color: #f87171; font-size: 12px; margin-top: 15px; }

    .radar-dashboard { width: 100%; max-width: 1240px; }
    
    .radar-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
        color: white;
        font-weight: 700;
        font-size: 12px;
    }

    .dot {
        height: 8px; width: 8px;
        background: #10b981;
        border-radius: 50%;
        display: inline-block;
        margin-right: 8px;
        box-shadow: 0 0 10px #10b981;
    }

    .logout { background: transparent; color: #6b7280; border: 1px solid #2d3748; width: auto; padding: 5px 15px; cursor: pointer; border-radius: 6px; }
    .logout:hover { color: white; border-color: white; }

    .map-frame {
        background: white;
        border-radius: 24px;
        padding: 10px;
        box-shadow: 0 0 50px rgba(0, 210, 255, 0.1);
        overflow: hidden;
    }

    iframe { display: block; border: none; }
</style>
