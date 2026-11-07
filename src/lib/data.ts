import "server-only";
import { DEMO_SAAS } from "./demo";
import { isSupabaseConfigured } from "./supabase/env";
import { createPublicClient } from "./supabase/public";
import { createClient } from "./supabase/server";
import type { Saas } from "./types";

export const isDemo = !isSupabaseConfigured;

const ORDER = { column: "sort_order", asc: true } as const;

// ---------- Vitrina pública ----------

export async function getPublishedSaas(): Promise<Saas[]> {
  if (isDemo) return DEMO_SAAS.filter((s) => s.published);
  const { data, error } = await createPublicClient()
    .from("saas")
    .select("*")
    .eq("published", true)
    .order(ORDER.column, { ascending: ORDER.asc })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Saas[];
}

export async function getSaasBySlug(slug: string): Promise<Saas | null> {
  if (isDemo) return DEMO_SAAS.find((s) => s.slug === slug && s.published) ?? null;
  const { data } = await createPublicClient().from("saas").select("*").eq("slug", slug).eq("published", true).maybeSingle();
  return (data as Saas | null) ?? null;
}

// Suma 1 a las visitas o descargas (función segura en la base de datos).
export async function track(slug: string, kind: "view" | "download") {
  if (isDemo) return;
  await createPublicClient().rpc("track_saas", { p_slug: slug, p_kind: kind });
}

// ---------- Panel /admin ----------

export async function getAdminUser() {
  if (isDemo) return { email: "demo@juanfracode.com", isAdmin: true };
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: isAdmin } = await supabase.rpc("is_admin");
  return { email: data.user.email ?? "", isAdmin: Boolean(isAdmin) };
}

export async function getAllSaas(): Promise<Saas[]> {
  if (isDemo) return DEMO_SAAS;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saas")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Saas[];
}

export async function getSaasById(id: string): Promise<Saas | null> {
  if (isDemo) return DEMO_SAAS.find((s) => s.id === id) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("saas").select("*").eq("id", id).maybeSingle();
  return (data as Saas | null) ?? null;
}

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  social: string;
  consent: boolean;
  apps: string[];
  created_at: string;
  last_download_at: string;
};

export async function getLeads(): Promise<Lead[]> {
  if (isDemo) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Lead[];
}
