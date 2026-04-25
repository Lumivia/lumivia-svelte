import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    compilerOptions: {
        // Forzamos runes excepto en node_modules
        runes: ({ filename }) =>
            filename.split(/[/\\]/).includes('node_modules') ? undefined : true
    },
    kit: {
        adapter: adapter({
            // Activamos compatibilidad Node.js para Supabase en Cloudflare Workers
            compatibilityFlags: ['nodejs_compat'],

            // Tus rutas personalizadas (las dejo tal cual)
            routes: {
                include: ['/*'],
                exclude: ['<all>']
            }
        })
    }
};

export default config;
