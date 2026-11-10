import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Las claves salen de las variables de entorno. La integración de Supabase en
// Vercel las pone sola; en tu computadora van en .env.local (mira .env.example).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Si no hay claves, la app funciona en "modo local" (guarda en el navegador).
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;
