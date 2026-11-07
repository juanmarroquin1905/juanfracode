import type { Saas } from "./types";

// ID de la integración oficial de Supabase en Vercel: al desplegar, Vercel
// ofrece crear/conectar el proyecto de Supabase y rellena las claves solo.
const SUPABASE_INTEGRATION = "oac_VqOgBHqhEoFTPzGkPd7L0iH6";
const SUPABASE_FILLED = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"];

// Arma el enlace del botón "Deploy en Vercel" para un repo público de GitHub.
export function vercelDeployUrl(saas: Pick<Saas, "repo_url" | "slug" | "env_vars" | "stack">): string | null {
  if (!saas.repo_url || !/^https:\/\/github\.com\/[^/]+\/[^/]+/.test(saas.repo_url)) return null;
  const params = new URLSearchParams({ "repository-url": saas.repo_url, "project-name": saas.slug });
  const usesSupabase = saas.stack.some((s) => s.toLowerCase() === "supabase");
  if (usesSupabase) params.set("integration-ids", SUPABASE_INTEGRATION);
  // Las claves de Supabase las pone la integración; solo pedimos las demás.
  const env = saas.env_vars.filter((v) => v && !(usesSupabase && SUPABASE_FILLED.includes(v)));
  if (env.length) {
    params.set("env", env.join(","));
    params.set("envDescription", "Claves que necesita esta plantilla (mira el README del repo)");
  }
  return `https://vercel.com/new/clone?${params.toString()}`;
}
