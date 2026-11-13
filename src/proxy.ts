import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Solo las páginas con sesión. La vitrina pública no pasa por aquí.
  matcher: ["/admin/:path*", "/guiones/app/:path*", "/login"],
};
