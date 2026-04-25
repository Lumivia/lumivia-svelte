import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public'; // La forma correcta en SvelteKit

// Cliente público para el navegador
export const supabase = createClient(
  env.PUBLIC_SUPABASE_URL || '',
  env.PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: false, // Vital para SSR / Edge
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);
