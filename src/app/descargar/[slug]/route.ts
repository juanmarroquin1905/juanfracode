import { NextResponse, type NextRequest } from "next/server";
import { getSaasBySlug, track } from "@/lib/data";
import { vercelDeployUrl } from "@/lib/deploy";
import { LEAD_COOKIE } from "@/lib/lead";

// Cuenta la descarga y lleva a la persona al repo, al .zip o al deploy de Vercel.
export async function GET(request: NextRequest, { params }: RouteContext<"/descargar/[slug]">) {
  const { slug } = await params;
  const saas = await getSaasBySlug(slug);
  if (!saas) return NextResponse.redirect(new URL("/", request.url));

  const action = request.nextUrl.searchParams.get("a");
  // Sin datos del visitante, lo mandamos a la ficha para que llene el formulario.
  if (!request.cookies.has(LEAD_COOKIE)) {
    return NextResponse.redirect(new URL(`/saas/${slug}?descargar=${action ?? "repo"}`, request.url));
  }
  const target =
    action === "zip" ? saas.zip_url : action === "vercel" ? vercelDeployUrl(saas) : saas.repo_url;
  if (!target) return NextResponse.redirect(new URL(`/saas/${slug}`, request.url));

  await track(slug, "download");
  // Acepta enlaces completos o rutas de esta misma web (ej: /descargas/finanzas.zip).
  return NextResponse.redirect(new URL(target, request.url));
}
