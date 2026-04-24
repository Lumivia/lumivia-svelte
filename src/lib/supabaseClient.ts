import { createClient } from '@supabase/supabase-js';

// Cliente Supabase para el navegador (público)
// Este cliente NO debe usarse en el servidor.
// Usa claves públicas (anon key) y está optimizado para Cloudflare Pages.

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false, // No guardamos sesiones en el navegador
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);
