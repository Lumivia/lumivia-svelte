import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';
import { browser } from '$app/environment';

// 🔥 Bypass para el Edge SSR: 
// Evita que Supabase tire un error 500 fatal si las variables dinámicas tardan en cargar en el entorno global.
const supabaseUrl = env.PUBLIC_SUPABASE_URL || (browser ? '' : 'https://ssr-dummy.supabase.co');
const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY || (browser ? '' : 'dummy-key');

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});
