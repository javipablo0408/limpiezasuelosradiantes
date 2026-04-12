import { createClient } from '@supabase/supabase-js';

/**
 * Cliente para el navegador (login, sesión, consultas con RLS).
 * Deben existir NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.
 *
 * La clave "anon" no es un secreto: Supabase la diseña para ir en apps web;
 * la protección de datos es Row Level Security (RLS) en la base de datos.
 * Nunca uses aquí la service_role: esa solo en el servidor y sin NEXT_PUBLIC_.
 */
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env (puedes definirlas ahí; Next las carga en local). Son la URL del proyecto y la clave anon de Settings → API. Reinicia npm run dev.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
