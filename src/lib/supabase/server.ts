import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

export async function createClient() {
  const cookieStore = await cookies();
  if (!isSupabaseConfigured) {
    throw new Error(
      "Falta configurar Supabase: agrega NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY (ver README).",
    );
  }
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Llamado desde un Server Component: el proxy se encarga de refrescar la sesión.
        }
      },
    },
  });
}
