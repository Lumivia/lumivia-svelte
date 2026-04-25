import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    compilerOptions: {
        // Forzamos runes excepto en dependencias externas
        runes: ({ filename }) =>
            filename.split(/[/\\]/).includes('node_modules') ? undefined : true
    },
    kit: {
        adapter: adapter({
            // Activamos compatibilidad Node.js para Supabase en Edge
            compatibilityFlags: ['nodejs_compat']
        })
    }
};

export default config;
