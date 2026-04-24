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
            // Opcional: si quieres usar funciones de Cloudflare
            routes: {
                include: ['/*'],
                exclude: ['<all>']
            }
        })
    }
};

export default config;
