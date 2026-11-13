import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

// Refresca la sesión y protege /admin y /guiones/app.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const path = request.nextUrl.pathname;
  const protegida = path.startsWith("/admin") || path.startsWith("/guiones/app");
  if (!data?.claims && protegida) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = path.startsWith("/guiones/app") ? "?next=/guiones/app" : "";
    return NextResponse.redirect(url);
  }
  return response;
}
